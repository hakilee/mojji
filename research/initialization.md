# Initialization research

## Evidence (2026-11-02)

- Reference: https://emoji.babywhale.io/ko-KR — text editor, font choices, foreground/background color, six motion choices, preview, download. Build an original interface, not a copy of assets or library content.
- https://tanstack.com/router/latest/docs/quick-start — code-based routes supported; use this for the initial single-page app.
- https://tailwindcss.com/docs/installation/using-vite — use the official Vite plugin.
- npm registry stable tags: React 19.3.1, TanStack Router 1.170.46, Tailwind CSS 4.3.3; @yarnpkg/cli-dist 4.18.1. The `yarn` package latest tag is Classic, not modern Yarn.
- https://github.com/storeforminecraft/seokchon/issues/660 and local documentation/testing.md: TypeScript `.test.ts`, Vitest named suites, explicit setup/exercise/assertion, immediate cleanup registration, no focused tests, type-check test sources. Reuse standard runner behavior rather than copying its mobile-specific harness.
- seokchon documentation/quality.md and issue-workflow.md: issue-owned acceptance, specs before implementation, local complete verification, squash delivery, honest evidence and gaps. Do not import backend synchronization or native-device policies into this browser-only product.

## Proposed scope

Client-only generation: no upload, account, gallery, analytics or server. Bundle Korean font assets locally. A shared canvas rendering path must own preview and GIF frames. Support text, font, foreground, opaque or transparent background, motion, pause and download. GIF transparency is binary, not partial alpha. Test decoded output, dimensions, multiple frames and transparent pixels rather than only checking a file extension.

## GitHub prerequisite

Directory is empty and not a repository. `git init -b main` completed locally. No repository at `hakilee/slackmoji` or `happy-haki/slackmoji` was visible via the current `happy-haki` authentication. Account and visibility selection is pending before remote creation. No product implementation or remote writes performed yet.
