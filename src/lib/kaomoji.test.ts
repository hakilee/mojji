import { describe, expect, test } from "vitest";
import { constrainText, textCharacters, validateText } from "./emoji";
import { kaomojiCategories, kaomojiOptions } from "./kaomoji";

describe("kaomoji catalog [E5ak]", () => {
  test("keeps every preset intact through text editing, including long expressions", () => {
    const categories = new Set(kaomojiCategories.map((category) => category.value));

    expect(new Set(kaomojiOptions.map((option) => option.text)).size).toBe(kaomojiOptions.length);
    expect(kaomojiOptions.some((option) => textCharacters(option.text).length > 9)).toBe(true);
    for (const option of kaomojiOptions) {
      expect(categories.has(option.category)).toBe(true);
      expect(validateText(option.text)).toBeNull();
      expect(constrainText(option.text)).toBe(option.text);
    }
  });

  test.each([
    ["(╯°□°)╯︵ ┻━┻", "angry", "화남", "table flip"],
    ["ʕ•ᴥ•ʔ", "animals", "곰", "bear"],
    ["(・ω・)ノ", "greeting", "안녕", "hello"],
  ])("labels %s with its mood and Korean/English search terms", (text, category, ko, en) => {
    const option = kaomojiOptions.find((entry) => entry.text === text);

    expect(option?.category).toBe(category);
    expect(option?.search).toContain(ko);
    expect(option?.search).toContain(en);
  });
});
