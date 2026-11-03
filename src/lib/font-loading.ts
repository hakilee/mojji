export async function loadFont(font: string, text: string): Promise<FontFace[]> {
  if (!text.trim()) return [];
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      document.fonts.load(`100px "${font}"`, text),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error("font load timeout")), 15000);
      }),
    ]);
  } catch (cause) {
    throw new Error(
      "선택한 글꼴을 불러오지 못했어요. 연결을 확인하거나 다른 글꼴을 선택해 주세요.",
      { cause },
    );
  } finally {
    clearTimeout(timeout);
  }
}
