import { describe, expect, onTestFinished, test, vi } from "vitest";
import { loadFont } from "./font-loading";

describe("text font loading [E2d]", () => {
  test.each(["", "  \n "])("does not load an unused font for %j", async (text) => {
    const load = vi.fn().mockRejectedValue(new Error("unavailable"));
    vi.stubGlobal("document", { fonts: { load } });
    onTestFinished(() => {
      vi.unstubAllGlobals();
    });

    await expect(loadFont("Unavailable", text)).resolves.toEqual([]);
    expect(load).not.toHaveBeenCalled();
  });

  test("loads the requested family and permits uncovered glyph fallback", async () => {
    vi.useFakeTimers();
    onTestFinished(() => {
      vi.useRealTimers();
    });
    const load = vi.fn().mockResolvedValue([]);
    vi.stubGlobal("document", { fonts: { load } });
    onTestFinished(() => {
      vi.unstubAllGlobals();
    });

    await expect(loadFont("Latin Family", "확인")).resolves.toEqual([]);
    expect(load).toHaveBeenCalledWith('100px "Latin Family"', "확인");
    expect(vi.getTimerCount()).toBe(0);
  });

  test("reports a font failure with recovery guidance and its original cause", async () => {
    const cause = new Error("network unavailable");
    vi.stubGlobal("document", { fonts: { load: vi.fn().mockRejectedValue(cause) } });
    onTestFinished(() => {
      vi.unstubAllGlobals();
    });

    await expect(loadFont("Jua", "확인")).rejects.toMatchObject({
      message: "선택한 글꼴을 불러오지 못했어요. 연결을 확인하거나 다른 글꼴을 선택해 주세요.",
      cause,
    });
  });

  test("bounds a stalled browser font request to fifteen seconds", async () => {
    vi.useFakeTimers();
    onTestFinished(() => {
      vi.useRealTimers();
    });
    vi.stubGlobal("document", { fonts: { load: () => new Promise(() => {}) } });
    onTestFinished(() => {
      vi.unstubAllGlobals();
    });

    const rejected = expect(loadFont("Jua", "확인")).rejects.toThrow(
      "선택한 글꼴을 불러오지 못했어요.",
    );
    await vi.advanceTimersByTimeAsync(15000);
    await rejected;
    expect(vi.getTimerCount()).toBe(0);
  });
});
