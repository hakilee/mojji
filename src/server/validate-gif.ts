import { decodeFrames } from "modern-gif";

// Bound every block and frame before invoking the pixel decoder on untrusted bytes.
export function validateGif(bytes: Uint8Array<ArrayBuffer>) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (
    bytes.length > 131072 ||
    bytes.length < 14 ||
    !["GIF87a", "GIF89a"].includes(new TextDecoder().decode(bytes.subarray(0, 6))) ||
    view.getUint16(6, true) !== 128 ||
    view.getUint16(8, true) !== 128
  )
    throw new Error("Invalid GIF header");
  let offset = 13;
  let frames = 0;
  const advance = (length: number) => {
    if (offset + length > bytes.length) throw new Error("Truncated GIF");
    offset += length;
  };
  const blocks = () => {
    while (true) {
      if (offset >= bytes.length) throw new Error("Missing block terminator");
      const length = bytes[offset++];
      if (!length) return;
      advance(length);
    }
  };
  if (bytes[10] & 128) advance(3 * 2 ** ((bytes[10] & 7) + 1));
  while (offset < bytes.length) {
    const marker = bytes[offset++];
    if (marker === 0x3b) {
      if (!frames || offset !== bytes.length) throw new Error("Invalid trailer");
      decodeFrames(bytes.buffer);
      return;
    }
    if (marker === 0x21) {
      const extension = bytes[offset++];
      if (extension === 0xf9) {
        if (bytes[offset] !== 4 || bytes[offset + 5] !== 0)
          throw new Error("Invalid control block");
        advance(6);
      } else if (extension === 0xff) {
        if (bytes[offset] !== 11) throw new Error("Invalid application block");
        advance(12);
        blocks();
      } else if (extension === 0xfe) blocks();
      else throw new Error("Unsupported extension");
      continue;
    }
    if (marker !== 0x2c || ++frames > 60) throw new Error("Invalid frame");
    const start = offset;
    advance(9);
    const width = view.getUint16(start + 4, true),
      height = view.getUint16(start + 6, true);
    if (
      !width ||
      !height ||
      view.getUint16(start, true) + width > 128 ||
      view.getUint16(start + 2, true) + height > 128
    )
      throw new Error("Invalid frame dimensions");
    const packed = bytes[start + 8];
    if (packed & 128) advance(3 * 2 ** ((packed & 7) + 1));
    const codeSize = bytes[offset++];
    if (codeSize < 2 || codeSize > 8) throw new Error("Invalid LZW code size");
    blocks();
  }
  throw new Error("Missing trailer");
}
