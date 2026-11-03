# Slackmochi UI system

Use this reference to maintain the editor’s visual tokens, controls and font-loading behavior. It covers the app-owned visual system and its headless interaction primitives.

## Foundations

Use [color roles](colors.md) as the color layer. `src/styles/tailwind.css` contains only the Tailwind import and theme configuration (semantic colors, typography, radii and transition keyframes). Components use Tailwind utilities for layout and states, with the standard 4 px spacing scale. No handwritten component selectors or CSS modules remain.

UI text uses self-hosted Pretendard for UI glyphs. It uses `font-display: swap` and Unicode subsets. Font licenses ship under `public/licenses/`. The textarea, font specimens and GIF renderer keep their selected fonts independently.

## Control contract (#83)

Use the public exports at `~/components/design-system` instead of copying control classes into consumers:

| Component      | Use                                                   | Owned behavior and appearance                                                                                                                    |
| -------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Button`       | Export, editor actions, presets and popover dismissal | Native button props/ref, `type="button"` default, black/white/neutral variants; medium/small/x-small sizes, disabled and busy attributes         |
| `ChoiceButton` | Font specimens/results, layer list and motions        | Required boolean `selected` maps to `aria-pressed`; shared selection, hover, pressed, keyboard and disabled states; consumers own content layout |
| `Input`        | Search, HEX and local file upload                     | Base UI input props/ref and change events; shared border, focus, invalid and disabled states, native file-selector styling                       |
| `Select`       | Gradient direction and motion speed                   | Native select props/ref, platform keyboard behavior and the same field geometry/states                                                           |
| `HelpBubble`   | Optional canvas, image/layer and remote-font guidance | Labelled 40px native help button, headless tooltip, hover/focus/click/tap, Escape/outside dismissal and viewport constraints                     |

Buttons use medium (40px, 24px horizontal inset, 12px radius, semibold), small (34px, 12px inset, 7px radius, medium) and x-small (28px, 8px inset, 8px radius, 13px medium text) sizes. Medium and small labels are 14px. Input/select fields use 36px height, 12px horizontal inset and 10px radius. Choice cards use 12px all-round padding. Keep layout-only classes at call sites; variant/state styling belongs to the component. Do not replace canvas hit areas or the Slack-like reaction with generic controls: those have independent interaction and geometry contracts.

The theme owns three neutral foreground levels (primary, secondary and muted), cool page/white workspace surfaces, neutral action states, control elevation and floating elevation. All interactive color transitions take 150ms and stop for reduced motion. Keyboard outlines are 2px with 2px offset; rounded whole-editor focus and pink canvas selection remain specialized. Selection and focus stay distinguishable. Invalid fields use critical borders/foreground, and disabled controls never gain hover/pressed feedback.

Desktop keeps equal editing/settings/preview columns and the sticky preview; small viewports stack them without horizontal overflow. Workspace/surface radii remain 16/12px; action, field and inset geometry use their own named tokens. The 26px reaction pills and 16px emoji are not resized by the control system. Theme-color and manifest backgrounds track the page surface.

## Components and states

Compose the following controls using semantic HTML and headless primitives:

- **Composition editor**: square work canvas with text/image layer selection, pointer dragging, arrow-key nudging (Shift for 10 px), Escape deselection and selected-layer Backspace/Delete. A compact native textarea below provides text entry with a persistent family/count footer, focus outline and invalid message. Native textarea editing/selection/undo are preserved; composed input is committed at composition end. Paste/typing is constrained to 9 graphemes and three lines, with a live limit announcement.
- **Font picker**: three bundled specimen cards, optional searchable Google Fonts modal with Korean filter, loading/disabled/error state. External fonts apply only after successful load; existing font remains on failure. Requests time out instead of leaving download disabled indefinitely.
- **Controls**: labelled radio segments, composed color pickers, shared checkboxes, native select and motion choices. Individual colors and gradient mode are mutually exclusive.
- **Preview**: compact author/message, 16 px emoji reaction initially unselected with one existing reaction and a reversible 1↔2 count, 128 px inspection canvas. Same renderer feeds both canvases and export. No Slack assets or fonts copied. Reduced-motion preferences stop preview loops and UI transitions, without changing exported GIFs.
- **Action**: primary download button with busy/disabled states; functional status announcements only.

Desktop uses one white workspace with editing, settings and vertically stacked, independently centered previews with download below them. The logo and 슬랙모찌 title sit above editing. Mobile stacks editing and preview; every grid child can shrink. Workspace radius is 16px, nested surfaces use 12px, actions use their size-specific radii and fields use 10px. Keyboard focus, labels and selection state are retained without decorative metadata.

## Google Fonts source

`src/data/google-fonts.json` contains family names and Korean support flags from the [official public catalog](https://fonts.google.com/metadata/fonts), retrieved 2026-11-03. Opening Google Fonts loads this snapshot as a separate application chunk; search does not call Google. Refresh from `familyMetadataList` when updating the catalog. Font binary files are not redistributed or installed.

After explicit selection, a stylesheet is requested through the [Google Fonts CSS2 API](https://developers.google.com/fonts/docs/css2); no `text` parameter or editor contents are sent. Browser font loading uses the stylesheet's unicode ranges. No API key, backend or undocumented live search endpoint is required. Search lists at most 40 matches and prompts further filtering. The catalog's names are used as returned by Google (usually English family names). Fonts without Korean coverage may fall back for Korean glyphs; the default Korean filter avoids this.

## Effects

Available motions: static, scale, bounce, slide, shake, roll, orbit, swing, jelly. Every effect shares the static tight glyph fit; no extra translation/rotation clearance shrinks the text. Transformed glyphs can intentionally clip at the canvas edge. Jelly scales both axes below 1. Horizontal/vertical gradients span measured glyph bounds and survive GIF palette quantization. Single-color and per-character rendering remain available. GIF dimensions, timings and size limit are unchanged.

Verification: `src/lib/emoji.test.ts` covers grapheme constraints, decoded gradient output and every motion's export and full-size fitting behavior; Aside covers font search/load, editing, reactions and responsive presentation. OS-level Korean input method editor (IME) and actual Slack upload still require manual acceptance.

## Google Fonts modal and interaction (#83)

`FontPicker` uses the installed Base UI Dialog instead of an inline font-search disclosure. The modal shares action/input/choice/help controls, neutral surfaces, workspace corners and a semantic overlay. Its opacity transition respects reduced motion; superseded font-panel ViewTransition code and animation tokens are removed. Deferred search and keyed results keep typing immediate without document-wide snapshots.

The catalog loads only on first open, and search/Korean-filter state survives dismissal and accordion collapse. Fetch its bundled JSON asset with a 15-second deadline so a failed module import cannot permanently cache a temporary catalog outage; the modal provides an in-place retry. Desktop opening focuses search; touch opening keeps the primitive's keyboard-avoiding behavior. Base UI traps Tab/Shift+Tab, locks page scrolling, dismisses on Escape/outside/close, and restores trigger focus. The current font, result counts, loading, empty and retryable error states remain accessible inside the modal. A constrained flex layout scrolls results within narrow/short viewports.

Successful font selection applies the loaded family and closes the modal. Failure preserves the prior selection and permits another attempt. Closing during a request aborts its selection and removes its pending stylesheet; completion checks its lifetime before changing font, error or loading state. Local upload keeps its separate feedback and existing face lifetime. Aside verifies these paths together with segmented color/image switching, disclosure focus and actual GIF output.

## Loading indicator (#31)

`src/components/design-system/Spinner.tsx` renders a radial SVG indicator with inherited color, compact sizes and accessible loading labels. It uses Tailwind rotation and stops for reduced motion. A label exposes a standalone status; omit it beside existing loading text to keep the graphic decorative. GIF export, font catalog loading and selected-font loading use it.

## Icon grid

Motion icons use a 24×24 viewBox, 2px optical inset, 2px rounded strokes and currentColor. Keep stroked bounds inside the grid, compensate curved shapes optically, and avoid font glyphs as UI icons. [Construction grid](icons/grid.svg) shows the 1px grid, 20px safe area, center lines and circular keyline. Controls retain labels and expose icons as decorative; standalone icon buttons need at least a 40px touch target.

UI text uses at most semibold (600). Settings use divider-separated headless accordion triggers/panels with semantic fieldsets; effects start expanded. Disclosures support keyboard interaction and retain their controls and values while collapsed. The textarea's containing editor draws one rounded focus border/ring instead of an inset rectangle. Color mode is a labelled headless radio group: arrow keys change selection and keyboard focus remains visible.

## Module boundary (#48)

Shared components live in `src/components/design-system/`. Import their public exports with `import { Accordion, Spinner } from "~/components/design-system"`. The `~` alias maps to `src` in TypeScript, Vite and Vitest. Keep editor-specific components in `src/components/editor/`; the old `components/ui` path is removed.

## Headless controls (#50)

`Accordion` exposes the primitive root and `AccordionItem` composes the app-styled header, trigger and panel. The editor supplies `multiple`, `keepMounted` and controlled disclosure state starting at `["motion"]`, so the image-add action can reveal its upload field. Panels preserve font-search state when closed but their contents are not focusable. `SegmentedControl` delegates radio semantics and keyboard selection to primitives; its selected value remains owned by the editor.

Accordion panels use the primitive's measured height and transition-state attributes for a reversible 200 ms collapse transition. Chevrons rotate with the same timing. Both transitions are disabled by the user's reduced-motion preference; panel padding stays on the inner fieldset so the collapsed height is zero.

The effects panel uses a labelled native select for speed and a native range input for repeat delay, with a seconds output and spoken value. Static effects disable these controls without resetting them. The font panel accepts local font files through the browser font API; its latest uploaded-font slot can be reselected and survives disclosure. Each successful upload has a unique internal family and a friendly file label, so same-name replacements remain distinct during undo/redo. Keep faces referenced by history or the latest-upload slot, release unreferenced replacements and remove all uploaded faces on unmount. Failed uploads preserve the current selection. Neither control adds a runtime dependency.

Library imports use individual component subpaths. The small app-owned public export module remains available at `~/components/design-system`. Spinner and motion artwork have no interactive behavior to replace. Native textarea and select retain platform behavior. The color picker retains a native full-color input alongside its presets and HEX field.

## Help and render recovery (#83)

`HelpBubble` puts optional guidance beside its heading or control, instead of permanently showing helper paragraphs. The tooltip retains neutral surfaces, 6px corners, 12px medium text, 12/6px insets and a 4px anchor offset. Base UI owns positioning, focus/hover behavior and dismissal; explicit activation opens it for touch users as well. Bubbles stay inside the viewport and respect reduced motion. Error messages, progress, result counts and selected-font state are not optional help and remain visible.

`src/lib/font-loading.ts` shares a 15-second font-load deadline between the work canvas, animated previews, GIF export and remote-font selection. Whitespace-only/image-only compositions skip unused font loading. Font failures retain their cause for diagnosis but show localized guidance; no automatic font substitution changes the composition. Work-canvas errors distinguish font loading from drawing, provide a redraw action for both canvases and a direct font-settings action when relevant, and disappear after a successful render. The renderer and high-resolution editor restore saved canvas state even when painting throws, so a retry cannot compound transforms. Renderer tests compare recovered output pixels and Aside verifies visible failure/recovery and download.

## Three-column workspace (#52)

Desktop separates editing, settings and preview into three equal columns; widths at or below 1000px stack. Primary UI actions use neutral charcoal, with pale gray selected surfaces. Content colors and logo artwork remain independent. Shared Tailwind tokens define control gaps (8px), text gaps (6px), panel/section spacing (24px), page gutter (32px), and caption/label/body/title type pairs (12/16, 14/20, 15/24, 20/28px).

## Selection controls (#63)

`Checkbox` delegates checked state, keyboard interaction and hidden form input semantics to its headless primitive. The transparency setting and Korean-font filter use the same labelled 20px indicator in a minimum 40px row.

`ColorPicker` composes popover, radio-group and input primitives. Every color setting, including per-character overrides, offers twelve presets, a native full-color chooser and six-digit HEX input. Incomplete HEX is local draft state, never renderer input; blur or dismissal restores the last valid value. The primitive owns dismissal and focus restoration. Transparent backgrounds disable the background trigger without discarding its color. The popup fits the available viewport and scrolls vertically when needed.

`SegmentedControl` has no external layout margin. It uses neutral surfaces, an inset selected border/shadow, 12px outer and 8px inner radii, and the shared minimum control height. Selection and keyboard focus are distinct; radio arrow-key behavior remains primitive-owned. Control height (40px) and inset radius (8px) are shared theme tokens. All three controls keep reduced-motion support.

## Spacing and surface hierarchy (#67)

Use 16px workspace and 12px panel/editor-surface radii. Medium actions use 12px, small actions 7px, x-small actions 8px, fields 10px and segmented insets 8px. Reaction pills retain their independent geometry. Spacing roles are control 8px, inset 12px, group 16px, section/panel 24px and page 32px. Compact page/workspace insets are 16px. Accordion headers and bodies share group insets; title slots share a 40px height with the settings offset. Font options use two columns and caption labels for comfortable readable cards. No component state or rendering behavior changes.

Preview chrome (#69): no decorative header, inter-preview or download dividers. Both example reactions start neutral; only user activation adds the blue selected state to the generated reaction. Structural borders on editing and settings controls remain.

## Image composition and layout (#71)

`LayerEditor` owns transient upload/error state; the page owns images, text layout and selected layer. The list reflects front-to-back composition, including the text layer. Images keep aspect ratio or center-crop to a square; background fill is a preset, not a separate implementation. Sibling stacking applies within the chosen text front/behind plane. Uploads never select a hidden panel's layer automatically.

`RangeField` provides labelled native keyboard-operable position/size/rotation controls using shared tokens. The left work canvas renders the composition in a static editing pose; the right inspection canvas continues animating and is read-only. Layers are selected directly on the work canvas or in the layer list, with contextual floating controls available on selection. Pointer capture supports dragging; text double-click focuses the native text field. Selection outlines are DOM-only and never exported. Magnetic alignment guides use the pink stroke-guide token, with a thin pink layer selection outline and a subtler hover outline; keyboard focus uses a stronger 2px pink treatment. No dark hover fill obscures artwork. Pointer dragging starts after 3 CSS pixels to avoid accidental movement on clicks. Layer selection is independent of accordion disclosure. Contextual layer controls open automatically in a viewport-constrained Base UI FloatingPanel beneath the selected canvas text/image, without a separate edit trigger. The actual layer hit area is the positioning anchor, so the panel follows drag and keyboard movement. Opening does not steal canvas or textarea focus; keyboard activation can enter the panel. Escape/close restore the layer focus, while outside clicks keep focus on the clicked control. Dismissal clears the current selection; switching layers must retain the newly selected layer. Layer settings/list interactions do not count as outside dismissal, so collapsing that accordion preserves selection and clicking a selected list item still toggles it off. The panel can flip only when needed to stay within the viewport and its content scrolls vertically. The upload/layer list stays in settings; position/size/rotation/order controls are not duplicated there. Desktop preview stays sticky during long settings edits; mobile remains stacked.

Files decode locally to bounded canvas sources and temporary bitmaps close after decoding; no object URLs or network uploads are retained. GIF input is deliberately a static first-frame image, disclosed beside the upload. The selected motion applies to text and every image about its own placement center, preserving the image’s rotation and text-front/behind plane. Image-only compositions animate too. Editing remains static; reduced-motion previews remain still. Preview and export share the same image/text composition, and image-only export is allowed. Existing output dimensions and 128KiB limit remain.

## Document history and keyboard editing (#83)

The workspace header exposes labelled 40px undo/redo icon buttons with disabled states and shortcut metadata. Cmd/Ctrl+Z undoes a document action; Cmd/Ctrl+Shift+Z and Ctrl+Y redo it. Canvas help includes these shortcuts and layer deletion. Text, search, HEX and contenteditable fields keep native deletion/undo. Document shortcuts do not pass through modal dialogs, IME composition or pending font selection.

Backspace/Delete removes the selected text or image while focus is on the work canvas, layer list or non-input layer controls. The same delete action powers both contextual delete buttons. Removing text clears its textarea, list entry, placement and per-character colors. The empty canvas remains focusable for undo; restoring an action focuses its valid selected layer, or the canvas if none is selected. Selection/disclosure/search are UI state, not document edits. Old panel dismissal must not clear a newer selection, and history toolbar interaction must not dismiss selection before applying an action.

`src/lib/editor-history.ts` owns a bounded, immutable history of the latest 100 document actions. It records content, image order/transforms, fonts, colors and motion together. Pointer dragging, range gestures, held arrow keys and text-field focus sessions are single actions; release, cancellation and blur end the appropriate transaction. No-op changes do not consume history or clear redo. Returning a gesture to its starting settings leaves no empty checkpoint and preserves the oldest action even at capacity. A new document edit after undo clears redo. Snapshots retain image-source references without copying pixels; the font picker retains uploaded faces while any snapshot still needs them. Nothing is persisted or uploaded.

Colocated reducer tests verify deletion/restoration, grouping, branching, selection, history bounds and exact recovered image pixels. Aside checks native shortcuts and focus, real drag/range grouping, same-name uploaded-font restoration, modal/input isolation, narrow-screen controls and decoded GIF output separately from the unit tests.
