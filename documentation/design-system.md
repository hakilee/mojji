# Slackmochi UI system

Use this reference to maintain the editor’s visual tokens, controls and font-loading behavior. It covers the app-owned visual system and its headless interaction primitives.

## Foundations

Use [color roles](colors.md) as the color layer. `src/styles/tailwind.css` contains only the Tailwind import and theme configuration (semantic colors, typography, radii and transition keyframes). Components use Tailwind utilities for layout and states, with the standard 4 px spacing scale. No handwritten component selectors or CSS modules remain.

UI text uses self-hosted Pretendard for UI glyphs. It uses `font-display: swap` and Unicode subsets. Font licenses ship under `public/licenses/`. The textarea, font specimens and GIF renderer keep their selected fonts independently.

## Components and states

Compose the following controls using semantic HTML and headless primitives:

- **Text editor**: square font-aware textarea surface with a centered editable line block, persistent family/count footer, focus outline, invalid message. Native textarea editing/selection/undo are preserved; composed input is committed at composition end. Paste/typing is constrained to 9 graphemes and three lines, with a live limit announcement.
- **Font picker**: three bundled specimen cards, optional searchable Google Fonts panel with Korean filter, loading/disabled/error state. External fonts apply only after successful load; existing font remains on failure. Requests time out instead of leaving download disabled indefinitely.
- **Controls**: labelled radio segments, composed color pickers, shared checkboxes, native select and motion choices. Individual colors and gradient mode are mutually exclusive.
- **Preview**: compact author/message, 16 px emoji reaction initially unselected with one existing reaction and a reversible 1↔2 count, 128 px inspection canvas. Same renderer feeds both canvases and export. No Slack assets or fonts copied. Reduced-motion preferences stop preview loops and UI transitions, without changing exported GIFs.
- **Action**: primary download button with busy/disabled states; functional status announcements only.

Desktop uses one white workspace with editing, settings and vertically stacked, independently centered previews with download below them. The logo and 슬랙모찌 title sit above editing. Mobile stacks editing and preview; every grid child can shrink. Workspace radius is 16px, nested surfaces use 12px and controls use 8px. Keyboard focus, labels and selection state are retained without decorative metadata.

## Google Fonts source

`src/data/google-fonts.json` contains family names and Korean support flags from the [official public catalog](https://fonts.google.com/metadata/fonts), retrieved 2026-11-03. Opening Google Fonts loads this snapshot as a separate application chunk; search does not call Google. Refresh from `familyMetadataList` when updating the catalog. Font binary files are not redistributed or installed.

After explicit selection, a stylesheet is requested through the [Google Fonts CSS2 API](https://developers.google.com/fonts/docs/css2); no `text` parameter or editor contents are sent. Browser font loading uses the stylesheet's unicode ranges. No API key, backend or undocumented live search endpoint is required. Search lists at most 40 matches and prompts further filtering. The catalog's names are used as returned by Google (usually English family names). Fonts without Korean coverage may fall back for Korean glyphs; the default Korean filter avoids this.

## Effects

Available motions: static, scale, bounce, slide, shake, roll, orbit, swing, jelly. Every effect shares the static tight glyph fit; no extra translation/rotation clearance shrinks the text. Transformed glyphs can intentionally clip at the canvas edge. Jelly scales both axes below 1. Horizontal/vertical gradients span measured glyph bounds and survive GIF palette quantization. Single-color and per-character rendering remain available. GIF dimensions, timings and size limit are unchanged.

Verification: `src/lib/emoji.test.ts` covers grapheme constraints, decoded gradient output and every motion's export and full-size fitting behavior; Aside covers font search/load, editing, reactions and responsive presentation. OS-level Korean input method editor (IME) and actual Slack upload still require manual acceptance.

## Font-panel transitions

React ViewTransition fades the font panel in and out and preserves result identity during deferred searches. The app has one route, no detail navigation and no Suspense boundary, so route, shared-element and Suspense transitions do not apply. The page root stays live to keep text editing and canvas previews interactive. Unsupported browsers skip these effects; reduced-motion styles disable them.

## Loading indicator (#31)

`src/components/design-system/Spinner.tsx` renders a radial SVG indicator with inherited color, compact sizes and accessible loading labels. It uses Tailwind rotation and stops for reduced motion. A label exposes a standalone status; omit it beside existing loading text to keep the graphic decorative. GIF export, font catalog loading and selected-font loading use it.

## Icon grid

Motion icons use a 24×24 viewBox, 2px optical inset, 2px rounded strokes and currentColor. Keep stroked bounds inside the grid, compensate curved shapes optically, and avoid font glyphs as UI icons. [Construction grid](icons/grid.svg) shows the 1px grid, 20px safe area, center lines and circular keyline. Controls retain labels and expose icons as decorative; standalone icon buttons need at least a 40px touch target.

UI text uses at most semibold (600). Settings use headless accordion triggers/panels with semantic fieldsets; effects start expanded. Disclosures support keyboard interaction and retain their controls and values while collapsed. The textarea's containing editor draws one rounded focus border/ring instead of an inset rectangle. Color mode is a labelled headless radio group: arrow keys change selection and keyboard focus remains visible.

## Module boundary (#48)

Shared components live in `src/components/design-system/`. Import their public exports with `import { Accordion, Spinner } from "~/components/design-system"`. The `~` alias maps to `src` in TypeScript, Vite and Vitest. Keep editor-specific components in `src/components/editor/`; the old `components/ui` path is removed.

## Headless controls (#50)

`Accordion` exposes the primitive root and `AccordionItem` composes the app-styled header, trigger and panel. The editor supplies `multiple`, `keepMounted` and `defaultValue={["motion"]}`; no duplicate React disclosure state is maintained. Panels preserve font-search state when closed but their contents are not focusable. `SegmentedControl` delegates radio semantics and keyboard selection to primitives; its selected value remains owned by the editor.

Accordion panels use the primitive's measured height and transition-state attributes for a reversible 200 ms collapse transition. Chevrons rotate with the same timing. Both transitions are disabled by the user's reduced-motion preference; panel padding stays on the inner fieldset so the collapsed height is zero.

The effects panel uses a labelled native select for speed and a native range input for repeat delay, with a seconds output and spoken value. Static effects disable these controls without resetting them. The font panel accepts local font files through the browser font API; its single uploaded-font slot can be reselected, survives disclosure and releases replaced or unmounted faces. Failed uploads preserve the current selection. Neither control adds a runtime dependency.

Library imports use individual component subpaths. The small app-owned public export module remains available at `~/components/design-system`. Spinner and motion artwork have no interactive behavior to replace. Native textarea and select retain platform behavior. The color picker retains a native full-color input alongside its presets and HEX field.

## Three-column workspace (#52)

Desktop separates editing, settings and preview into three equal columns; widths at or below 1000px stack. Primary UI actions use neutral charcoal, with pale gray selected surfaces. Content colors and logo artwork remain independent. Shared Tailwind tokens define control gaps (8px), text gaps (6px), panel/section spacing (24px), page gutter (32px), and caption/label/body/title type pairs (12/16, 14/19, 16/22, 20/27px).

## Selection controls (#63)

`Checkbox` delegates checked state, keyboard interaction and hidden form input semantics to its headless primitive. The transparency setting and Korean-font filter use the same labelled 20px indicator in a minimum 40px row.

`ColorPicker` composes popover, radio-group and input primitives. Every color setting, including per-character overrides, offers twelve presets, a native full-color chooser and six-digit HEX input. Incomplete HEX is local draft state, never renderer input; blur or dismissal restores the last valid value. The primitive owns dismissal and focus restoration. Transparent backgrounds disable the background trigger without discarding its color. The popup fits the available viewport and scrolls vertically when needed.

`SegmentedControl` has no external layout margin. It uses neutral surfaces, an inset selected border/shadow, 8px outer and 4px inner radii, and the shared minimum control height. Selection and keyboard focus are distinct; radio arrow-key behavior remains primitive-owned. Control height (40px) and inset radius (4px) are shared theme tokens. All three controls keep reduced-motion support.

## Spacing and surface hierarchy (#67)

Use 16px workspace, 12px panel/editor-surface, 8px control and 4px inset radii. Reaction pills retain their independent geometry. Spacing roles are control 8px, inset 12px, group 16px, section/panel 24px and page 32px. Compact page/workspace insets are 16px. Accordion headers and bodies share group insets; title slots share a 40px height with the settings offset. Font options use two columns and caption labels for comfortable readable cards. No component state or rendering behavior changes.

Preview chrome (#69): no decorative header, inter-preview or download dividers. Both example reactions start neutral; only user activation adds the blue selected state to the generated reaction. Structural borders on editing and settings controls remain.

## Image composition and layout (#71)

`LayerEditor` owns transient upload/error state; the page owns images, text layout and selected layer. The list reflects front-to-back composition, including the text layer. Images keep aspect ratio or center-crop to a square; background fill is a preset, not a separate implementation. Sibling stacking applies within the chosen text front/behind plane. Uploads never select a hidden panel's layer automatically.

`RangeField` provides labelled native keyboard-operable position/size/rotation controls using shared tokens. The selected layer can also be dragged on the inspection canvas via pointer capture; these selection affordances are DOM-only and never exported. Closing the layout panel clears selection. Desktop preview stays sticky during long settings edits; mobile remains stacked.

Files decode locally to bounded canvas sources and temporary bitmaps close after decoding; no object URLs or network uploads are retained. GIF input is deliberately a static first-frame image, disclosed beside the upload. Existing animation effects apply to text, not uploaded images. Preview and export share the same image/text composition, and image-only export is allowed. Existing output dimensions and 128KiB limit remain.
