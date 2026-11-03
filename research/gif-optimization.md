# GIF size strategy (#75)

2026-11-03. Sources: [modern-gif](https://github.com/qq15725/modern-gif), [Gifski](https://gif.ski/), [Gifski license](https://gif.ski/license.html).

GIF export already renders at 128×128 with indexed-color quantization and LZW encoding. Editor backing resolution is independent: 768×768 makes text/shapes sharper while editing without increasing export dimensions. Uploaded image detail remains bounded by the uploaded source.

Palette reduction is supported by the installed modern-gif encoder (`maxColors`). Keep default encoding for files within 128KiB; only oversize files retry 128, 64 and 32 colors, retaining smaller candidates. Preserve all frames, timing, disposal, transparency and dimensions. This may band gradients or simplify uploaded-image colors on oversized exports; it does not reduce motion frame rate. Reject if all candidates remain oversized.

Cross-frame palettes, temporal dithering and lossy LZW can improve photographic GIFs (Gifski), but replacing the client encoder with a native/WASM pipeline introduces payload, runtime and licensing considerations. Not added. Frame cropping/differencing requires disposal-aware reconstruction to avoid transparent trails, so it is not applied speculatively.

The browser renderer works in 128-unit coordinates at both resolutions. No server upload, new dependency or build-time processing.

## Measured palette tradeoff

Deterministic seeded RGB-noise image (80px), text and 20 animation frames: 255 colors 157,817 bytes; 128 colors 148,361; 64 colors 124,825; 32 colors 98,961. The adaptive path stops at 64 colors (20.9% smaller), the first result below 128KiB. A 64px fixture is already 114,087 bytes at default quality and is not reduced. Synthetic results are not a promise of savings for every upload.
