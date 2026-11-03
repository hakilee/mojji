import { Slot } from "@radix-ui/react-slot";
import type { ComponentProps } from "react";

import { cn } from "./cn";

interface TableRootProps extends ComponentProps<"div"> {
  asChild?: boolean;
}

export const TableRoot = ({ asChild, className, children, ...props }: TableRootProps) => {
  const Comp = asChild === true ? Slot : "div";
  return (
    <Comp className={cn("w-full overflow-x-auto overflow-y-visible", className)} {...props}>
      <table className="w-full">{children}</table>
    </Comp>
  );
};
TableRoot.displayName = "TableRoot";

interface TableHeaderProps extends ComponentProps<"thead"> {
  asChild?: boolean;
}

export const TableHeader = ({ asChild, ...props }: TableHeaderProps) => {
  const Comp = asChild === true ? Slot : "thead";
  return <Comp {...props} />;
};
TableHeader.displayName = "TableHeader";

interface TableBodyProps extends ComponentProps<"tbody"> {
  asChild?: boolean;
}

export const TableBody = ({ asChild, className, ...props }: TableBodyProps) => {
  const Comp = asChild === true ? Slot : "tbody";
  return (
    <Comp
      className={cn(
        "before:block before:h-2 before:content-['']",
        "[&>tr]:relative",
        "[&>tr:nth-child(odd)>td]:bg-neutral-50",
        "[&>tr]:after:pointer-events-none [&>tr]:after:absolute [&>tr]:after:inset-0 [&>tr]:after:rounded-lg [&>tr]:after:bg-black/5 [&>tr]:after:opacity-0 [&>tr]:after:transition-opacity [&>tr]:after:content-[''] [&>tr]:hover:after:opacity-100",
        className,
      )}
      {...props}
    />
  );
};
TableBody.displayName = "TableBody";

interface TableRowProps extends ComponentProps<"tr"> {
  asChild?: boolean;
}

export const TableRow = ({ asChild, className, ...props }: TableRowProps) => {
  const Comp = asChild === true ? Slot : "tr";
  return (
    <Comp
      className={cn("relative px-3", className)}
      style={{ transform: "translateZ(0)" }}
      {...props}
    />
  );
};
TableRow.displayName = "TableRow";

interface TableHeadProps extends ComponentProps<"th"> {
  asChild?: boolean;
}

export const TableHead = ({ asChild, className, ...props }: TableHeadProps) => {
  const Comp = asChild === true ? Slot : "th";
  return (
    <Comp
      className={cn("px-3 text-left font-medium text-text-tertiary text-xs", className)}
      {...props}
    />
  );
};
TableHead.displayName = "TableHead";

interface TableCellProps extends ComponentProps<"td"> {
  asChild?: boolean;
}

export const TableCell = ({ asChild, className, children, ...props }: TableCellProps) => {
  const Comp = asChild === true ? Slot : "td";
  return (
    <Comp
      className={cn(
        "px-3 py-2 font-medium text-sm text-text-primary first:rounded-l-lg last:rounded-r-lg",
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
};
TableCell.displayName = "TableCell";
