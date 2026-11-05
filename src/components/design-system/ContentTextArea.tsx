import type { ComponentProps } from "react";
import { cn } from "./meki/cn";
export function ContentTextArea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "block min-h-24 w-full resize-none overflow-auto border-0 bg-transparent p-3 text-center text-xl outline-none",
        className,
      )}
      {...props}
    />
  );
}
