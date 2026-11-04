import { encode } from "modern-gif";
import { describe, expect, test } from "vitest";
import { validateGif } from "./validate-gif";

describe("public GIF validation [E6]", () => {
  test("accepts rendered GIFs but rejects truncated, trailing and oversized frame data", async () => {
    const bytes = new Uint8Array(
      await encode({
        width: 128,
        height: 128,
        frames: [{ data: new Uint8Array(128 * 128 * 4).fill(255), delay: 60 }],
        format: "arrayBuffer",
      }),
    );
    expect(() => validateGif(bytes)).not.toThrow();
    expect(() => validateGif(bytes.slice(0, -1))).toThrow();
    const trailing = new Uint8Array(bytes.length + 1);
    trailing.set(bytes);
    trailing[bytes.length] = 0x3b;
    expect(() => validateGif(trailing)).toThrow();
    const wrongSize = bytes.slice();
    wrongSize[6] = 127;
    expect(() => validateGif(wrongSize)).toThrow();
    for (let end = 0; end < bytes.length; end += 17)
      expect(() => validateGif(bytes.slice(0, end))).toThrow();
  });
});
