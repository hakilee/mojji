# GIF emoji editor

Owner: GitHub issue #1. Browser-only; input never leaves the device.

- E1: Accept up to 40 Unicode characters across at most 3 lines. Reject blank input and extra lines with a visible message; disable download. Fit actual glyph bounds inside a 128×128 canvas with approximately 1 px edge padding, no arbitrary font-size cap, and only the extra clearance required by the selected motion. Center visible glyphs, including multiline text.
- E2: Provide locally bundled Noto Sans KR, Black Han Sans and Jua; foreground and background colors; transparent background toggle. GIF supports binary transparency only.
- E3: Static, scale, bounce, slide, shake and roll effects loop over 1.2 seconds. Preview and export share the renderer. Pause preview without changing export. Keep the full visible text inside the canvas throughout the motion cycle, including maximum scale, translation and rotation; verify with `아기고래` in all three fonts.
- E4: Download valid GIF89a at 128×128; 1 frame for static, 20 for motion; loop indefinitely, 60 ms per frame; clear previous transparent frames. Reject files over 128 KiB with an actionable error, never silently download oversized output.
- E5: Show large checkerboard preview and actual-size Slack-like message preview, explicit loading/error states, keyboard-labelled controls and responsive stacked layout. Respect reduced-motion preferences in preview.
- E6: No account, server upload, gallery or analytics. No copied third-party branding/assets. Korean fonts are bundled through Fontsource with their licenses.
- E7 (#7): Use the selected text-free mochi SVG as the app symbol in header/footer and browser favicon. Generate Apple touch (180×180) and Android manifest (192×192, 512×512, plus maskable 512×512) icons from the same source. Keep platform icon backgrounds opaque and the maskable artwork inside its central safe zone. Expose the brand name 슬랙모찌 accessibly without a visible wordmark.

Verification: renderer tests decode output for dimensions, frame count, timing, transparency and motion changes; Aside CLI covers browser controls and download behavior. Local `yarn verify` is the delivery gate.
