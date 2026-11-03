import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

/** Options for formatting a date and time value. */
export interface FormatTimeOptions {
  fallback?: string;
  format?: string;
  locale?: string;
}

/**
 * Formats a date and time value for display.
 *
 * @param input - The date and time value to format.
 * @param options - Formatting and fallback options.
 * @returns The formatted date and time value.
 */
export const formatTime = (input: string | Date, options: FormatTimeOptions = {}): string => {
  const { format = "YYYY.MM.DD.", locale = "ko", fallback } = options;

  if (input === "") {
    return fallback ?? "-";
  }

  const date = dayjs(input);

  if (!date.isValid()) {
    return fallback ?? "Invalid Date";
  }

  return date.locale(locale).format(format);
};
