import { readFile, writeFile, stat, glob } from "node:fs/promises";
import path from "node:path";
import { parseSync } from "rolldown/utils";
import { format } from "oxfmt";

const system = "src/components/design-system/";
const reference = JSON.parse(await readFile("documentation/design-system-source.json", "utf8"));
const modules = new Map();
const failures = [];
const walk = (node, visit) => {
  if (!node || typeof node !== "object") return;
  visit(node);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach((item) => walk(item, visit));
    else if (value && typeof value === "object") walk(value, visit);
  }
};
async function resolve(file, specifier) {
  if (!specifier.startsWith(".") && !specifier.startsWith("~/")) return null;
  const base = specifier.startsWith("~/")
    ? `src/${specifier.slice(2)}`
    : path.posix.join(path.posix.dirname(file), specifier);
  if (base.includes("?") || base.endsWith(".json")) return null;
  for (const candidate of [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}/index.ts`,
    `${base}/index.tsx`,
  ]) {
    if (
      await stat(candidate)
        .then((entry) => entry.isFile())
        .catch(() => false)
    )
      return candidate;
  }
  failures.push(`${file}: unresolved local dependency ${specifier}`);
  return null;
}
for await (const file of glob("src/**/*.{ts,tsx}")) {
  if (file.endsWith(".test.ts") || file.endsWith(".test.tsx")) continue;
  const code = await readFile(file, "utf8");
  const parsed = parseSync(file, code, { lang: file.endsWith(".tsx") ? "tsx" : "ts" });
  if (parsed.errors.length)
    throw new Error(`Cannot parse ${file}: ${JSON.stringify(parsed.errors)}`);
  const entry = {
    file,
    imports: new Map(),
    exports: new Map(),
    stars: [],
    declarations: new Map(),
    jsx: [],
    components: [],
  };
  modules.set(file, entry);
  for (const node of parsed.program.body) {
    const declaration = node.declaration ?? node;
    if (declaration.type === "VariableDeclaration") {
      for (const variable of declaration.declarations)
        if (variable.id.name) entry.declarations.set(variable.id.name, variable.init);
    }
    if (node.source?.value) {
      const dependency = await resolve(file, node.source.value);
      if (
        !file.startsWith(system) &&
        /^(?:@radix-ui\/|@base-ui\/|motion(?:\/|$)|sonner$)/u.test(node.source.value)
      )
        failures.push(`${file}: headless/UI dependency must be owned by the design system`);
      if (
        !file.startsWith(system) &&
        dependency?.startsWith(system) &&
        node.source.value !== "~/components/design-system"
      )
        failures.push(`${file}: use the public design-system barrel`);
      for (const specifier of node.specifiers ?? [])
        if (specifier.local)
          entry.imports.set(specifier.local.name, {
            file: dependency,
            external: node.source.value,
            name:
              specifier.imported?.name ??
              (specifier.type === "ImportNamespaceSpecifier" ? "*" : "default"),
          });
    }
    if (node.type === "ExportAllDeclaration")
      entry.stars.push(await resolve(file, node.source.value));
    if (node.type === "ExportNamedDeclaration" && node.exportKind !== "type") {
      for (const specifier of node.specifiers)
        if (specifier.exportKind !== "type")
          entry.exports.set(specifier.exported.name ?? specifier.exported.value, {
            local: specifier.local.name,
            file: node.source ? await resolve(file, node.source.value) : file,
            external: node.source?.value,
          });
      if (declaration.type === "VariableDeclaration")
        for (const variable of declaration.declarations)
          entry.exports.set(variable.id.name, { local: variable.id.name, file });
      else if (declaration.id?.name && !declaration.type.startsWith("TS"))
        entry.exports.set(declaration.id.name, { local: declaration.id.name, file });
    }
  }
  walk(parsed.program, (node) => {
    if (node.type !== "JSXOpeningElement") return;
    const jsxName = (name) =>
      name.type === "JSXMemberExpression"
        ? `${jsxName(name.object)}.${jsxName(name.property)}`
        : name.name;
    const name = jsxName(node.name);
    const line = code.slice(0, node.start).split("\n").length;
    entry.jsx.push({ name, line });
    if (
      !file.startsWith(system) &&
      (/^(?:button|input|textarea|select|option|a|label|dialog|details|summary)$/u.test(name) ||
        (/^[a-z]/u.test(name) &&
          node.attributes.some((attribute) => attribute.name?.name === "onClick")))
    )
      failures.push(`${file}:${line}: native interactive ${name} bypasses the design system`);
  });
  for (const name of entry.exports.keys())
    if (/^[A-Z]/u.test(name) && !entry.exports.get(name).external && entry.jsx.length)
      entry.components.push(name);
}
function exportsOf(file, visited = new Set()) {
  if (!file || visited.has(file)) return new Map();
  const module = modules.get(file);
  if (!module) return new Map();
  const next = new Set([...visited, file]);
  const result = new Map();
  for (const star of module.stars)
    for (const [name, value] of exportsOf(star, next)) result.set(name, value);
  for (const [name, exported] of module.exports) {
    if (exported.file !== file) {
      result.set(
        name,
        exported.file
          ? exportsOf(exported.file, next).get(exported.local)
          : { file: `npm:${exported.external}`, parts: [] },
      );
      continue;
    }
    const imported = module.imports.get(exported.local);
    if (imported) {
      result.set(
        name,
        imported.file
          ? exportsOf(imported.file, next).get(imported.name)
          : { file: `npm:${imported.external}`, parts: [] },
      );
      continue;
    }
    const expression = module.declarations.get(exported.local);
    const object =
      expression?.type === "CallExpression" &&
      expression.callee.type === "MemberExpression" &&
      expression.callee.object.name === "Object" &&
      expression.callee.property.name === "assign"
        ? expression.arguments[1]
        : null;
    result.set(name, {
      file,
      parts:
        object?.type === "ObjectExpression"
          ? object.properties.map((property) => property.key.name ?? property.key.value)
          : [],
    });
  }
  return result;
}
const sourceFiles = new Map(reference.files.map((entry) => [entry.source, entry]));
function sourceExports(file, visited = new Set()) {
  if (visited.has(file)) return new Map();
  const entry = sourceFiles.get(file);
  if (!entry) throw new Error(`Missing reference file ${file}`);
  const result = new Map();
  for (const exported of entry.exports) {
    if (exported.from) {
      const dependency = entry.imports.find((item) => item.specifier === exported.from)?.source;
      if (!dependency) result.set(exported.name, { source: `npm:${exported.from}`, parts: [] });
      else {
        const nested = sourceExports(dependency, new Set([...visited, file]));
        if (exported.name === "*") for (const [name, value] of nested) result.set(name, value);
        else result.set(exported.name, nested.get(exported.local));
      }
    } else result.set(exported.name, { source: file, target: entry.target, parts: exported.parts });
  }
  return result;
}
const actual = exportsOf(`${system}index.ts`);
const original = new Map(reference.roots.flatMap((root) => [...sourceExports(root)]));
const usages = new Map();
const consumers = [];
for (const entry of [...modules.values()].sort((a, b) => a.file.localeCompare(b.file))) {
  const components = [];
  for (const jsx of entry.jsx) {
    const [local, ...parts] = jsx.name.split(".");
    const imported = entry.imports.get(local);
    if (!imported?.file?.startsWith(system)) continue;
    const name = [imported.name, ...parts].join(".");
    if (!usages.has(name)) usages.set(name, []);
    usages.get(name).push({ file: entry.file, line: jsx.line });
    components.push(name);
  }
  if (!entry.file.startsWith(system) && entry.components.length) {
    consumers.push({
      file: entry.file,
      components: entry.components,
      designSystem: [...new Set(components)].sort(),
      dependencies: [
        ...new Set([...entry.imports.values()].map((item) => item.file).filter(Boolean)),
      ].sort(),
    });
  }
}
const ports = [];
for (const [name, source] of [...original].sort(([a], [b]) => a.localeCompare(b))) {
  if (!source) throw new Error(`Unresolved source export ${name}`);
  const port = actual.get(name);
  if (!port) failures.push(`Missing public export ${name}`);
  for (const component of [name, ...source.parts.map((part) => `${name}.${part}`)]) {
    if (component !== name && !port?.parts.includes(component.slice(name.length + 1)))
      failures.push(`Missing compound part ${component}`);
    ports.push({
      component,
      source: source.source,
      target: port?.file ?? null,
      usages: usages.get(component) ?? [],
    });
  }
}
for (const entry of reference.files) {
  if (
    !(await stat(entry.target)
      .then((file) => file.isFile())
      .catch(() => false))
  )
    failures.push(`Missing port file ${entry.target}`);
  for (const dependency of entry.imports)
    if (dependency.source && !sourceFiles.has(dependency.source))
      failures.push(`Reference closure missing ${dependency.source}`);
}
const extensions = [];
for (const [name, entry] of actual) {
  for (const component of [name, ...(entry?.parts ?? []).map((part) => `${name}.${part}`)]) {
    if (
      original.has(name) &&
      (component === name || original.get(name).parts.includes(component.slice(name.length + 1)))
    )
      continue;
    extensions.push({ component, target: entry?.file, usages: usages.get(component) ?? [] });
  }
}

const implementation = [...modules.values()]
  .filter((entry) => entry.file.startsWith(system))
  .map((entry) => ({
    file: entry.file,
    components: entry.components,
    dependencies: [
      ...new Set([...entry.imports.values()].map((item) => item.file ?? `npm:${item.external}`)),
    ].sort(),
  }))
  .sort((a, b) => a.file.localeCompare(b.file));
const inventory = {
  source: { repository: reference.repository, commit: reference.commit },
  counts: {
    sourceFiles: reference.files.length,
    publicReferenceExports: original.size,
    referenceComponentsAndParts: ports.length,
    extensions: extensions.length,
    applicationComponents: consumers.flatMap((entry) => entry.components).length,
  },
  ports,
  extensions,
  consumers,
  implementation,
};
const rows = ports
  .map(
    (entry) =>
      `| ${entry.component} | ${entry.source} | ${entry.target} | ${entry.usages.length ? entry.usages.map((usage) => `${usage.file}:${usage.line}`).join("<br>") : "이 편집기에서 미사용 (이식 완료)"} |`,
  )
  .join("\n");
const markdown = `# 디자인 시스템 전체 컴포넌트 목록\n\n자동 생성: \`yarn design-system:inventory\`. 직접 수정하지 마세요. \`yarn design-system:check\`는 재귀 AST, 공개 export/복합 파트, 소비자 우회 및 목록 최신성을 검증합니다.\n\n원본: [${reference.repository}@${reference.commit}](https://github.com/${reference.repository}/tree/${reference.commit}) (소유자 승인). 원본 UI/icon barrel의 재귀 import/export 폐쇄: **${reference.files.length}개 파일**. 공개 export **${original.size}개**, 개별 복합 파트 포함 **${ports.length}개 항목**. 앱 전용 확장 **${extensions.length}개**. 데이터·백엔드·제품 페이지는 포함하지 않습니다. 원본 해시/의존성은 [source manifest](design-system-source.json), 현재 구현 AST 전체는 [inventory JSON](design-system-inventory.json)에 기록됩니다.\n\n## 원본 export와 하위 파트 — 하나씩\n\n| 컴포넌트/파트 | 원본 | 이식 위치 | JSX 사용처 |\n| --- | --- | --- | --- |\n${rows}\n\n## Slackmoji 확장 — 원본 컴포넌트와 같은 공개 진입점\n\n| 컴포넌트 | 구현 | 사용처 |\n| --- | --- | --- |\n${extensions.map((entry) => `| ${entry.component} | ${entry.target} | ${entry.usages.map((usage) => `${usage.file}:${usage.line}`).join("<br>") || "공개 파트"} |`).join("\n")}\n\n## 모든 애플리케이션 컴포넌트\n\n| 구현 | 컴포넌트 | 디자인 시스템 사용 |\n| --- | --- | --- |\n${consumers.map((entry) => `| ${entry.file} | ${entry.components.join(", ")} | ${entry.designSystem.join(", ") || "하위 컴포넌트를 통한 사용"} |`).join("\n")}\n\n## 재귀 의존 파일 — 원본 누락 검사 기준\n\n| 원본 | 이식 위치 | 변환 |\n| --- | --- | --- |\n${reference.files.map((entry) => `| ${entry.source} | ${entry.target} | ${entry.adaptation ?? "원본 구현 및 의존성 이식; 접근성/모션 보완은 디자인 시스템 문서 참조"} |`).join("\n")}\n\n유틸리티 cn/useIsClient/formatTime, Toaster/toast 외부 re-export와 브랜드 아이콘도 별도 누락 없이 포함합니다. 브랜드 아이콘은 슬랙모찌 로고를 대체하지 않습니다. 사용하지 않는 원본 컴포넌트는 번들에서 tree-shaking되지만 공개 API와 구현은 유지합니다. 의미 있는 HTML 레이아웃·제목·출력 canvas는 화면 소유이며, 입력·버튼·링크·label·선택·오버레이는 디자인 시스템 소유입니다.\n`;
if (failures.length) throw new Error(failures.join("\n"));
for (const [file, content] of [
  ["documentation/design-system-inventory.json", JSON.stringify(inventory, null, 2)],
  ["documentation/design-system-inventory.md", markdown],
]) {
  const formatted = await format(file, content);
  if (formatted.errors.length) throw new Error(`Cannot format ${file}`);
  if (process.argv.includes("--write")) await writeFile(file, formatted.code);
  else if ((await readFile(file, "utf8").catch(() => "")) !== formatted.code)
    throw new Error(`${file} is stale. Run yarn design-system:inventory.`);
}
console.log(
  `Design-system AST audit: ${original.size} reference exports, ${ports.length} exports/parts, ${extensions.length} extensions, ${reference.files.length} source files, ${consumers.length} app owners; no bypasses.`,
);
