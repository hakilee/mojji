import { Slot } from "@radix-ui/react-slot";
import type { ComponentProps } from "react";

import { cn } from "../cn";

interface CardRootProps extends ComponentProps<"div"> {
  asChild?: boolean;
}

export const CardRoot = ({ asChild, className, ...props }: CardRootProps) => {
  const Comp = asChild === true ? Slot : "div";
  return <Comp className={cn("glass-card flex flex-col p-4 lg:p-6", className)} {...props} />;
};

export const CardTitle = ({ className, children, ...props }: ComponentProps<"h2">) => (
  <h2 className={cn("font-semibold text-[17px] text-text-primary", className)} {...props}>
    {children}
  </h2>
);
