import { describe, expect, test } from "vitest";
import { formatTime } from "./format-time";

describe("meki date formatting contract", () => {
  test.each([
    { input: "2026-11-04T12:34:00", options: {}, expected: "2026.11.04." },
    {
      input: new Date(2026, 10, 4, 12, 34),
      options: { format: "YYYY-MM-DD HH:mm" },
      expected: "2026-11-04 12:34",
    },
    { input: "", options: {}, expected: "-" },
    { input: "", options: { fallback: "Not scheduled" }, expected: "Not scheduled" },
    { input: "not a date", options: {}, expected: "Invalid Date" },
    { input: "not a date", options: { fallback: "Unknown date" }, expected: "Unknown date" },
  ])("formats $input as $expected", ({ input, options, expected }) => {
    expect(formatTime(input, options)).toBe(expected);
  });
});
