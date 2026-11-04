import type { CompactEmoji, ShortcodesDataset } from "emojibase";
import emojisUrl from "emojibase-data/ko/compact.json?url";
import messages from "emojibase-data/ko/messages.json";
import shortcodesUrl from "emojibase-data/en/shortcodes/emojibase.json?url";

export type EmojiOption = {
  text: string;
  label: string;
  category: string;
  search: string;
};

export const emojiCategories = messages.groups
  .filter((group) => group.key !== "component")
  .map((group) => ({ value: String(group.order), label: group.message }));

export async function loadEmojiCatalog(): Promise<EmojiOption[]> {
  const signal = AbortSignal.timeout(15000);
  const [emojiResponse, shortcodesResponse] = await Promise.all(
    [emojisUrl, shortcodesUrl].map(async (url) => {
      const response = await fetch(url, { signal });
      if (!response.ok) throw new Error(`Emoji catalog request failed: ${response.status}`);
      return response;
    }),
  );
  const [emojis, shortcodes]: [CompactEmoji[], ShortcodesDataset] = await Promise.all([
    emojiResponse.json(),
    shortcodesResponse.json(),
  ]);
  return emojis
    .filter((emoji) => emoji.group !== undefined && emoji.group !== 2)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .flatMap((emoji) =>
      [emoji, ...(emoji.skins ?? [])].map((variant) => ({
        text: variant.unicode,
        label: variant.label,
        category: String(emoji.group),
        search: [
          variant.unicode,
          variant.label,
          ...(emoji.tags ?? []),
          ...[shortcodes[emoji.hexcode], shortcodes[variant.hexcode]].flat(),
        ]
          .join(" ")
          .normalize("NFKC")
          .toLowerCase()
          .replace(/[_:]+/gu, " "),
      })),
    );
}
