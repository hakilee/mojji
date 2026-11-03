import { Content, Item, Portal, Separator } from "@radix-ui/react-dropdown-menu";
import type { ComponentPropsWithoutRef, ComponentRef, Ref } from "react";
import { forwardRef } from "react";

import { cn } from "../cn";

import styles from "./dropdown.module.css";

const renderDropdownMenuContent = (
  { className, sideOffset = 4, children, ...props }: ComponentPropsWithoutRef<typeof Content>,
  ref: Ref<ComponentRef<typeof Content>>,
) => (
  <Portal>
    <Content
      className={cn(
        styles.content,
        "min-w-24 rounded-xl border border-neutral-100 bg-neutral-50 p-1",
        className,
      )}
      ref={ref}
      sideOffset={sideOffset}
      {...props}
    >
      <div className="w-full rounded-lg border border-neutral-100 bg-white p-1">{children}</div>
    </Content>
  </Portal>
);

export const DropdownMenuContent = forwardRef<
  ComponentRef<typeof Content>,
  ComponentPropsWithoutRef<typeof Content>
>(renderDropdownMenuContent);
DropdownMenuContent.displayName = Content.displayName;

const renderDropdownMenuItem = (
  { className, ...props }: ComponentPropsWithoutRef<typeof Item>,
  ref: Ref<ComponentRef<typeof Item>>,
) => (
  <Item
    className={cn(
      "flex cursor-pointer select-none items-center justify-center rounded-lg p-1 text-sm text-text-primary leading-none outline-none transition duration-150",
      "hover:bg-[rgba(0,0,0,0.05)]",
      className,
    )}
    ref={ref}
    {...props}
  />
);

export const DropdownMenuItem = forwardRef<
  ComponentRef<typeof Item>,
  ComponentPropsWithoutRef<typeof Item>
>(renderDropdownMenuItem);
DropdownMenuItem.displayName = Item.displayName;

const renderDropdownMenuSeparator = (
  { className, ...props }: ComponentPropsWithoutRef<typeof Separator>,
  ref: Ref<ComponentRef<typeof Separator>>,
) => (
  <Separator className={cn("h-px w-full border-none bg-divider", className)} ref={ref} {...props} />
);

export const DropdownMenuSeparator = forwardRef<
  ComponentRef<typeof Separator>,
  ComponentPropsWithoutRef<typeof Separator>
>(renderDropdownMenuSeparator);
DropdownMenuSeparator.displayName = Separator.displayName;
