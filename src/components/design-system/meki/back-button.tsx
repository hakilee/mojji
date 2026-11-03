import { ChevronLeftIcon } from "~/components/design-system/icons";
import type { ComponentProps } from "react";

import { cn } from "./cn";

interface BackButtonProps extends ComponentProps<"button"> {
  title?: string;
}

export const BackButton = ({ title = "Back", className, onClick, ...props }: BackButtonProps) => (
  <button
    className={cn(
      "flex w-fit cursor-pointer items-center gap-1 font-medium text-sm text-text-tertiary transition duration-150",
      "hover:text-text-secondary",
      className,
    )}
    onClick={onClick}
    type="button"
    {...props}
  >
    <ChevronLeftIcon size={14} />
    {title}
  </button>
);
