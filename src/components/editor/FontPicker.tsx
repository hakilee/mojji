import { Checkbox, Spinner } from "~/components/design-system";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
  ViewTransition,
} from "react";
import { fonts } from "../../lib/emoji";

export function FontPicker({
  font,
  onChange,
  onLoading,
}: {
  font: string;
  onChange: (font: string) => void;
  onLoading: (loading: boolean) => void;
}) {
  const [catalog, setCatalog] = useState<{ family: string; korean: boolean }[] | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [koreanOnly, setKoreanOnly] = useState(true);
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [uploadedFamily, setUploadedFamily] = useState("");
  const uploadedFace = useRef<FontFace | null>(null);
  const mounted = useRef(true);
  const search = useDeferredValue(query.trim().toLowerCase());
  const results = (catalog ?? []).filter(
    (item) => (!koreanOnly || item.korean) && item.family.toLowerCase().includes(search),
  );

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (uploadedFace.current) document.fonts.delete(uploadedFace.current);
    };
  }, []);

  async function selectFont(family: string) {
    setLoading(family);
    setError("");
    onLoading(true);
    const link = document.createElement("link");
    try {
      if (!fonts.includes(family)) {
        link.rel = "stylesheet";
        link.href = `https://fonts.googleapis.com/css2?${new URLSearchParams({ family, display: "swap" })}`;
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            link.remove();
            reject(new Error("timeout"));
          }, 15000);
          link.onload = () => {
            clearTimeout(timeout);
            resolve();
          };
          link.onerror = () => {
            clearTimeout(timeout);
            reject(new Error("network"));
          };
          document.head.append(link);
        });
      }
      let fontTimeout: ReturnType<typeof setTimeout> | undefined;
      const loaded = await Promise.race([
        document.fonts.load(`40px "${family}"`, "가나다Aa"),
        new Promise<never>((_, reject) => {
          fontTimeout = setTimeout(() => reject(new Error("timeout")), 15000);
        }),
      ]).finally(() => clearTimeout(fontTimeout));
      if (!loaded.length) throw new Error("font unavailable");
      onChange(family);
    } catch {
      link.remove();
      setError("글꼴을 불러오지 못했어요. 연결을 확인하거나 기본 글꼴을 선택해 주세요.");
    } finally {
      setLoading("");
      onLoading(false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-control">
        {fonts.map((family) => (
          <button
            className="focus-visible:outline-3 focus-visible:outline-stroke-focus focus-visible:outline-offset-3 [-webkit-tap-highlight-color:transparent] cursor-pointer touch-manipulation disabled:cursor-not-allowed disabled:bg-bg-disabled disabled:text-fg-disabled aria-pressed:border-stroke-brand aria-pressed:bg-bg-brand-weak aria-pressed:text-fg-brand enabled:active:bg-bg-brand-weak-pressed flex flex-col items-start gap-1 overflow-hidden rounded-control border border-stroke-neutral bg-bg-layer-default p-inset text-left enabled:hover:border-stroke-brand [&_small]:text-caption [&_small]:text-fg-neutral-muted [&_small]:wrap-anywhere"
            key={family}
            type="button"
            disabled={!!loading}
            aria-pressed={font === family}
            onClick={() => {
              setError("");
              onChange(family);
            }}
          >
            <span
              className="mb-2 text-[22px] whitespace-nowrap max-[760px]:text-lg"
              style={{ fontFamily: family }}
            >
              가나다 Aa
            </span>
            <small>{family}</small>
          </button>
        ))}
      </div>
      <div className="mt-inset space-y-control">
        <label htmlFor="font-upload" className="block text-label font-semibold">
          폰트 파일 업로드
        </label>
        <input
          id="font-upload"
          type="file"
          accept=".otf,.ttf,.woff,.woff2"
          disabled={!!loading}
          className="block w-full min-w-0 rounded-control border border-stroke-neutral bg-bg-layer-default p-2 text-caption text-fg-neutral-muted file:mr-2 file:cursor-pointer file:rounded-control file:border-0 file:bg-bg-neutral-weak file:px-3 file:py-2 file:text-caption file:font-semibold file:text-fg-neutral focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focus disabled:opacity-50"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            setLoading("upload");
            setError("");
            onLoading(true);
            try {
              if (!/\.(?:otf|ttf|woff2?)$/i.test(file.name)) throw new Error("format");
              const family = `${file.name.replace(/["\\\r\n]/g, "")} (업로드)`;
              const face = await new FontFace(`"${family}"`, await file.arrayBuffer()).load();
              if (!mounted.current) return;
              document.fonts.add(face);
              if (uploadedFace.current) document.fonts.delete(uploadedFace.current);
              uploadedFace.current = face;
              setUploadedFamily(family);
              onChange(family);
            } catch {
              if (mounted.current)
                setError(
                  "폰트를 불러오지 못했어요. 올바른 OTF, TTF, WOFF 또는 WOFF2 파일을 선택해 주세요.",
                );
            } finally {
              if (mounted.current) {
                setLoading("");
                onLoading(false);
              }
            }
          }}
        />
        {loading === "upload" && (
          <p
            role="status"
            className="flex items-center gap-control text-caption text-fg-neutral-muted"
          >
            <Spinner /> 폰트 불러오는 중…
          </p>
        )}
        {uploadedFamily && (
          <button
            type="button"
            disabled={!!loading}
            aria-pressed={font === uploadedFamily}
            className="w-full cursor-pointer rounded-control border border-stroke-neutral p-3 text-left text-label wrap-anywhere aria-pressed:border-stroke-brand aria-pressed:bg-bg-brand-weak focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focus disabled:opacity-50"
            onClick={() => {
              setError("");
              onChange(uploadedFamily);
            }}
          >
            {uploadedFamily}
          </button>
        )}
      </div>
      <button
        type="button"
        className="focus-visible:outline-3 focus-visible:outline-stroke-focus focus-visible:outline-offset-3 [-webkit-tap-highlight-color:transparent] cursor-pointer touch-manipulation disabled:cursor-not-allowed disabled:bg-bg-disabled disabled:text-fg-disabled aria-pressed:border-stroke-brand aria-pressed:bg-bg-brand-weak aria-pressed:text-fg-brand enabled:active:bg-bg-brand-weak-pressed mt-inset flex min-h-[42px] w-full items-center justify-between rounded-control border border-stroke-neutral bg-bg-neutral-weak px-4 py-2 font-semibold hover:border-stroke-brand"
        aria-expanded={expanded}
        aria-controls="font-search-panel"
        onClick={async () => {
          startTransition(() => setExpanded((value) => !value));
          if (catalog || catalogLoading || expanded) return;
          setCatalogLoading(true);
          setError("");
          try {
            const { default: families } = await import("../../data/google-fonts.json");
            startTransition(() => setCatalog(families));
          } catch {
            setError("글꼴 목록을 불러오지 못했어요. Google Fonts를 닫았다가 다시 열어 주세요.");
          } finally {
            setCatalogLoading(false);
          }
        }}
      >
        Google Fonts <span aria-hidden="true">{expanded ? "−" : "+"}</span>
      </button>
      {expanded && (
        <ViewTransition default="none" enter="font-reveal" exit="font-hide">
          <div className="mt-inset" id="font-search-panel" aria-busy={catalogLoading}>
            <label className="sr-only" htmlFor="font-search">
              Google Fonts 검색
            </label>
            <input
              className="focus-visible:outline-3 focus-visible:outline-stroke-focus focus-visible:outline-offset-3 [-webkit-tap-highlight-color:transparent] touch-manipulation disabled:cursor-not-allowed disabled:opacity-40 min-h-[42px] w-full rounded-control border border-stroke-neutral-strong bg-bg-layer-default px-3 py-2"
              id="font-search"
              type="search"
              name="font-search"
              autoComplete="off"
              spellCheck={false}
              placeholder="예: Gaegu…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className="mt-inset">
              <Checkbox
                label="한글 지원"
                checked={koreanOnly}
                onCheckedChange={(checked) => startTransition(() => setKoreanOnly(checked))}
              />
            </div>
            <p className="mt-2 text-xs text-fg-neutral-muted">
              선택한 글꼴만 Google에서 불러옵니다.
            </p>
            <div
              className="mt-inset max-h-60 overflow-y-auto overscroll-contain rounded-control border border-stroke-neutral [&>button]:flex [&>button]:min-h-[42px] [&>button]:w-full [&>button]:items-center [&>button]:justify-between [&>button]:gap-inset [&>button]:border [&>button]:border-transparent [&>button]:bg-bg-layer-default [&>button]:p-3 [&>button]:text-left [&>button]:wrap-anywhere [&>button]:enabled:hover:border-stroke-brand [&>button]:aria-pressed:border-stroke-brand [&>button]:aria-pressed:bg-bg-brand-weak [&>button>span]:text-xs"
              aria-label="검색 결과"
            >
              {results.slice(0, 40).map(({ family }) => (
                <button
                  className="focus-visible:outline-3 focus-visible:outline-stroke-focus focus-visible:outline-offset-3 [-webkit-tap-highlight-color:transparent] cursor-pointer touch-manipulation disabled:cursor-not-allowed disabled:bg-bg-disabled disabled:text-fg-disabled aria-pressed:border-stroke-brand aria-pressed:bg-bg-brand-weak aria-pressed:text-fg-brand enabled:active:bg-bg-brand-weak-pressed"
                  key={family}
                  type="button"
                  disabled={!!loading}
                  aria-pressed={font === family}
                  onClick={() => void selectFont(family)}
                >
                  <ViewTransition default="none" update="auto">
                    <span>{family}</span>
                  </ViewTransition>
                  <span className="inline-flex shrink-0 items-center gap-2">
                    {loading === family && <Spinner />}
                    {loading === family ? "불러오는 중…" : font === family ? "선택됨" : "+"}
                  </span>
                </button>
              ))}
              {catalog && !results.length && (
                <p className="mt-2 text-xs text-fg-neutral-muted">일치하는 글꼴이 없어요.</p>
              )}
            </div>
            <p className="mt-2 flex items-center gap-2 text-xs text-fg-neutral-muted" role="status">
              {catalogLoading && <Spinner />}
              {catalogLoading
                ? "글꼴 목록 불러오는 중…"
                : !catalog
                  ? ""
                  : results.length > 40
                    ? `${results.length}개 중 40개 표시 · 검색어를 더 입력해 주세요.`
                    : `${results.length}개 글꼴`}
            </p>
          </div>
        </ViewTransition>
      )}
      {!fonts.includes(font) && (
        <p className="mt-2 text-xs text-fg-neutral-muted">선택한 글꼴 · {font}</p>
      )}
      {error && (
        <p role="alert" className="mt-2 text-xs text-fg-critical">
          {error}
        </p>
      )}
    </>
  );
}
