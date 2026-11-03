# UI color tokens

`src/styles/tailwind.css` owns the app theme. Tailwind utilities consume semantic `--color-{fg|bg|stroke}-*` roles rather than embedding color values in components.

## Roles

- Layers: white workspace/panels on the cool `#f6f7f9` page.
- Neutral foreground: `fg-neutral` for primary text, `fg-neutral-secondary` for supporting labels, `fg-neutral-muted` for captions. Muted text remains readable on white and neutral surfaces.
- Neutral surfaces: `bg-neutral-weak` and its hover/pressed roles support secondary controls. `stroke-neutral` defines structure; `stroke-neutral-strong` clarifies field boundaries and hover.
- Brand: charcoal primary actions, pale neutral selected surfaces and dark keyboard focus. Solid and weak actions have separate hover/pressed roles; disabled controls do not react to pointer states.
- Positive and critical: success and validation feedback; destructive action labels use the critical foreground on the white button variant.
- Disabled: muted foreground and neutral background.
- Checker: alternating neutral tiles for transparency previews.
- Guide: pink is reserved for canvas layer selection, hover, alignment and contextual focus.
- Reaction: blue selected feedback is reserved for the Slack-like generated reaction.

This is a light theme. Keep readable foreground contrast and distinguish selected, focused and disabled states. Update theme metadata with the page background.

User-selected GIF colors and logo artwork are independent of the UI theme and must not change when UI tokens change.
