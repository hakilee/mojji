import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const merge = extendTailwindMerge({
  extend: {
    theme: {
      spacing: [
        "control",
        "inset",
        "group",
        "heading-slot",
        "control-size",
        "control-small",
        "control-mini",
        "field-size",
        "text",
        "section",
        "panel",
        "page",
      ],
      radius: [
        "control",
        "action",
        "action-small",
        "action-mini",
        "control-inset",
        "panel",
        "workspace",
      ],
      shadow: ["control", "floating"],
    },
    classGroups: {
      "font-size": [{ text: ["md", "caption", "label", "compact", "body", "title"] }],
    },
  },
});

export const cn = (...inputs: ClassValue[]) => merge(clsx(inputs));
