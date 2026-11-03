export type InputSize = "x-small" | "small" | "medium";

export const sizes: Record<InputSize, string> = {
  medium: "h-9 px-3 rounded-[10px] text-md",
  small: "h-[34px] px-2.5 rounded-[7px] text-sm",
  "x-small": "h-7 px-2 rounded-lg text-[13px]",
};
