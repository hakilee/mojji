# Initialization research

## Evidence (2026-11-02)

- https://tanstack.com/router/latest/docs/quick-start — code-based routes supported; use this for the initial single-page app.
- https://tailwindcss.com/docs/installation/using-vite — use the official Vite plugin.
- npm registry stable tags: React 19.3.1, TanStack Router 1.170.46, Tailwind CSS 4.3.3; @yarnpkg/cli-dist 4.18.1. The `yarn` package latest tag is Classic, not modern Yarn.

## Proposed scope

Client-only generation: no upload, account, gallery, analytics or server. Bundle Korean font assets locally. A shared canvas rendering path must own preview and GIF frames. Support text, font, foreground, opaque or transparent background, motion, pause and download. GIF transparency is binary, not partial alpha. Test decoded output, dimensions, multiple frames and transparent pixels rather than only checking a file extension.

## Decisions

- Use modern-gif 2.1.0 for its typed encode/decode API, transparent frames and standard ArrayBuffer output. Source: https://github.com/qq15725/modern-gif. No custom GIF codec.
- Issue #3 replaces ESLint/Prettier with oxlint 1.90.0/oxfmt 0.75.0 and upgrades TypeScript to 7.0.2. The compatibility-only TypeScript pin and superseded toolchain are removed. Oxc references: https://oxc.rs/docs/guide/usage/linter/config and https://oxc.rs/docs/guide/usage/formatter.
- Repo initialization and settings were completed before feature delivery. Initial main commit predates protection; subsequent changes go through PRs.

## Brand icon padding (#7, 2026-11-02)

- Selected concept: C 수다모찌. The source SVG has a tight rectangular viewBox; generated icons preserve its aspect ratio instead of stretching it into a square. The SVG favicon has separate square bounds.
- Apple Web Clip guidance specifies PNG and a 180px iPhone icon, not a mandatory content-padding percentage: https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html . The 2% extra inset on the regular Apple/Android exports is our optical choice, not an Apple rule. Backgrounds are opaque and corner masks are left to the platform.
- Android uses web-manifest maskable artwork here, not a native adaptive-icon layer package. Its essential artwork must fit the central circle of radius 40%: https://www.w3.org/TR/appmanifest/#icon-masks . A separate maskable export keeps the mochi including its speech tail inside that zone; do not apply regular-icon padding to it.
- Google Search favicon guidance requires a square asset and recommends larger than 48px; it does not prescribe internal padding: https://developers.google.com/search/docs/appearance/favicon-in-search . Supply a 96px PNG plus the square SVG and small browser PNGs.
