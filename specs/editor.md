# GIF emoji editor

Owner: GitHub issue #1. Browser-only; input never leaves the device.

- E1: Accept up to 40 Unicode characters across at most 3 lines. Reject blank input and extra lines with a visible message; disable download. Fit the selected font inside a 128×128 canvas.
- E2: Provide locally bundled Noto Sans KR, Black Han Sans and Jua; foreground and background colors; transparent background toggle. GIF supports binary transparency only.
- E3: Static, scale, bounce, slide, shake and roll effects loop over 1.2 seconds. Preview and export share the renderer. Pause preview without changing export.
- E4: Download valid GIF89a at 128×128; 1 frame for static, 20 for motion; loop indefinitely, 60 ms per frame; clear previous transparent frames. Reject files over 128 KiB with an actionable error, never silently download oversized output.
- E5: Show large checkerboard preview and actual-size Slack-like message preview, explicit loading/error states, keyboard-labelled controls and responsive stacked layout. Respect reduced-motion preferences in preview.
- E6: No account, server upload, gallery or analytics. No copied third-party branding/assets. Korean fonts are bundled through Fontsource with their licenses.

Verification: renderer tests decode output for dimensions, frame count, timing, transparency and motion changes; Aside CLI covers browser controls and download behavior. Local `yarn verify` is the delivery gate.
