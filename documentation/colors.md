# UI color tokens

`src/styles/tailwind.css` owns the app theme. Tailwind utilities consume semantic `--color-{fg|bg|stroke}-*` roles rather than embedding color values in components.

## Roles

- Layers: white panels on a soft neutral page.
- Neutral: primary text, muted labels, controls and borders.
- Brand: purple actions, selected states and keyboard focus.
- Positive and critical: success and validation feedback.
- Disabled: muted foreground and neutral background.
- Checker: alternating neutral tiles for transparency previews.

This is a light theme. Keep readable foreground contrast and distinguish selected, focused and disabled states. Update theme metadata with the page background.

User-selected GIF colors and logo artwork are independent of the UI theme and must not change when UI tokens change.
