export function formatDownloadFilename(value: string, format: "png" | "gif"): string {
  const name = value
    .split("")
    .map((character) =>
      character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127 ? " " : character,
    )
    .join("")
    .replace(/[<>:"/\\|?*]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[. ]+|[. ]+$/g, "");
  return `${Array.from(name).slice(0, 80).join("") || "slackmoji"}.${format}`;
}
