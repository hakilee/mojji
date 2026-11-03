# Help bubble reference and implementation decision

Issue: #87. Reference inspected at SEED Design commit `b2bafa982c0d758ec6b2b629155c6fdd9e9ad713` (2026-11-04 KST).

## Sources

- [Component guidelines](https://github.com/daangn/seed-design/blob/b2bafa982c0d758ec6b2b629155c6fdd9e9ad713/docs/content/components/help-bubble.mdx): title/description/close/arrow anatomy, 280px maximum width, 38px close target, 4px trigger clearance and collision correction.
- [React behavior](https://github.com/daangn/seed-design/blob/b2bafa982c0d758ec6b2b629155c6fdd9e9ad713/docs/content/react/components/help-bubble.mdx): click-toggle dialog trigger, outside dismissal and no automatic focus movement by default.
- [CSS recipe](https://github.com/daangn/seed-design/blob/b2bafa982c0d758ec6b2b629155c6fdd9e9ad713/packages/css/recipes/help-bubble.css): dark solid surface, compact padding, separate title/description, arrow, close target compensation and opacity/scale entrance.
- [React implementation](https://github.com/daangn/seed-design/blob/b2bafa982c0d758ec6b2b629155c6fdd9e9ad713/packages/react/src/components/HelpBubble/HelpBubble.tsx): 14px arrow padding, 16px overflow inset, top placement and non-heading title markup.

## Decision

Use the existing Base UI Popover instead of a controlled Tooltip. Base UI owns click-toggle, dialog relationships, outside/Escape dismissal, focus handling, portal placement and arrow anchoring. Keep the small `HelpBubble({ label, children })` interface for its three actual callers. Do not add a SEED runtime dependency, copy the package implementation or introduce a parallel tooltip mode.

Apply the reference's anatomy and dimensions using app-owned semantic colors, typography and radii. Keep UI title weight at 600 to preserve the app's typography contract. Put scrolling inside the popup so the arrow is not clipped. Opening does not move focus; close remains reachable with Tab.

Reduce the trigger from 40px to 24px while retaining its 16px icon. Reduce heading-to-trigger layout gap from 6px to 4px. The resulting heading-to-SVG-box distance is 8px instead of 18px; the 24px native button remains independently focusable and does not overlap adjacent controls.

## Verification ownership

Focus, dismissal, arrow alignment/collision, modal nesting and pointer geometry are browser behavior. Verify those against the real editor rather than adding source-spelling assertions or a DOM test framework. Existing renderer tests cover unchanged GIF output; issue/PR records own results and delivery evidence.
