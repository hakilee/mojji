# Slackmochi UI system

Use this reference to maintain the editor’s visual tokens, controls and font-loading behavior. It covers the original Slackmochi user interface (UI), built without a component library. Issues #23 and #25 own the implementation scope.

## Foundations

Use [color roles](colors.md) as the color layer. `src/style.css` defines the app's own 4/8/12/16/24/32 spacing scale, caption/body/heading typography, control/panel/pill radii and control height. Components consume these tokens, not independent copies of a third-party recipe.

## Components and states

Compose the following controls using semantic HTML:

- **Text editor**: font-aware textarea, persistent family/count footer, focus outline, invalid message. Native textarea editing/selection/undo are preserved; composed input is committed at composition end. Paste/typing is constrained to 9 graphemes and three lines, with a live limit announcement.
- **Font picker**: three bundled specimen cards, optional searchable Google Fonts panel with Korean filter, loading/disabled/error state. External fonts apply only after successful load; existing font remains on failure. Requests time out instead of leaving download disabled indefinitely.
- **Controls**: semantic selected buttons (`aria-pressed`), two-mode color segment, color wells, native checkbox/select and motion choices. Individual colors and gradient mode are mutually exclusive.
- **Preview**: compact channel/message, 22 px emoji reaction with a reversible 3↔4 count, 128 px inspection canvas. Same renderer feeds both canvases and export. No Slack assets or fonts copied. Reduced-motion preferences stop preview loops and UI transitions, without changing exported GIFs.
- **Action**: primary download button with busy/disabled states; functional status announcements only.

Desktop uses an asymmetric editor/sticky-preview grid. Mobile stacks the panels; every grid child can shrink. Keyboard focus, labels and selection state are retained without decorative metadata.

## Google Fonts source

`src/google-fonts.json` contains family names and Korean support flags from the [official public catalog](https://fonts.google.com/metadata/fonts), retrieved 2026-11-03. Opening Google Fonts loads this snapshot as a separate application chunk; search does not call Google. Refresh from `familyMetadataList` when updating the catalog. Font binary files are not redistributed or installed.

After explicit selection, a stylesheet is requested through the [Google Fonts CSS2 API](https://developers.google.com/fonts/docs/css2); no `text` parameter or editor contents are sent. Browser font loading uses the stylesheet's unicode ranges. No API key, backend or undocumented live search endpoint is required. Search lists at most 40 matches and prompts further filtering. The catalog's names are used as returned by Google (usually English family names). Fonts without Korean coverage may fall back for Korean glyphs; the default Korean filter avoids this.

## Effects

Available motions: static, scale, bounce, slide, shake, roll, orbit, swing, jelly. Orbit reserves 8 px translation clearance; swing reserves its 0.25 rad envelope; jelly scales both axes below 1. Horizontal/vertical gradients span measured glyph bounds and survive GIF palette quantization. Single-color and per-character rendering remain available. GIF dimensions, timings and size limit are unchanged.

Verification: `src/emoji.test.ts` covers grapheme constraints, decoded gradient output and every motion's export/clipping behavior; Aside covers font search/load, editing, reactions and responsive presentation. OS-level Korean input method editor (IME) and actual Slack upload still require manual acceptance.

## Font-panel transitions

React ViewTransition fades the font panel in and out and preserves result identity during deferred searches. The app has one route, no detail navigation and no Suspense boundary, so route, shared-element and Suspense transitions do not apply. The page root stays live to keep text editing and canvas previews interactive. Unsupported browsers skip these effects; reduced-motion styles disable them.
