import type { ComponentProps } from "react";
import { cn } from "./meki/cn";
export function Link({ className, ...props }: ComponentProps<"a">) {
  return (
    <a
      className={cn(
        "touch-manipulation rounded-md text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        className,
      )}
      {...props}
    />
  );
}
