# Local quality

Use Node 24.18+ and the pinned Yarn release (`yarn`, via Corepack, or `node .yarn/releases/yarn-4.18.1.cjs`). Install with `yarn install --immutable`. Run `yarn prepare` once after cloning.

`yarn verify` runs formatting (oxfmt), lint (oxlint), the recursive design-system AST/usage inventory gate, strict TypeScript checking (including tests), Vitest and the production build. Pre-commit runs formatting/lint/typecheck; pre-push runs complete verification. No hosted workflows.

Use colocated `.test.ts` files with named `describe` and `test` imports from Vitest. One top-level suite per file. Arrange, exercise and assert observable behavior; use table cases for meaningful variants. Register cleanup immediately on resource acquisition via `onTestFinished`, or use explicit fixture/hook lifetimes. Await asynchronous work. `allowOnly: false` rejects focused suites. Do not test source spellings or introduce production seams solely for tests.

Canvas tests verify decoded GIF output, not browser presentation. Browser evidence must separately cover editing, preview, download, responsive layout and errors. Record failures and unrun checks honestly.
