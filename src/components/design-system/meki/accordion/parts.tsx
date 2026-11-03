"use client";

import { Content, Header, Item, Trigger } from "@radix-ui/react-accordion";
import type { ComponentPropsWithoutRef, ComponentRef, Ref } from "react";
import { forwardRef } from "react";

import { cn } from "../cn";

import styles from "./accordion.module.css";

const renderAccordionItem = (
  { className, ...props }: ComponentPropsWithoutRef<typeof Item>,
  ref: Ref<ComponentRef<typeof Item>>,
) => (
  <Item className={cn("border-divider border-b last:border-b-0", className)} ref={ref} {...props} />
);

export const AccordionItem = forwardRef<
  ComponentRef<typeof Item>,
  ComponentPropsWithoutRef<typeof Item>
>(renderAccordionItem);
AccordionItem.displayName = Item.displayName;

const renderAccordionTrigger = (
  { className, children, ...props }: ComponentPropsWithoutRef<typeof Trigger>,
  ref: Ref<ComponentRef<typeof Trigger>>,
) => (
  <Header className="flex">
    <Trigger
      className={cn(
        "flex flex-1 cursor-pointer items-center justify-between py-3 font-medium text-sm transition-colors",
        "text-text-secondary hover:text-text-primary",
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
    </Trigger>
  </Header>
);

export const AccordionTrigger = forwardRef<
  ComponentRef<typeof Trigger>,
  ComponentPropsWithoutRef<typeof Trigger>
>(renderAccordionTrigger);
AccordionTrigger.displayName = Trigger.displayName;

const renderAccordionContent = (
  { className, children, ...props }: ComponentPropsWithoutRef<typeof Content>,
  ref: Ref<ComponentRef<typeof Content>>,
) => (
  <Content className={cn(styles.content, className)} ref={ref} {...props}>
    <div className="pb-3">{children}</div>
  </Content>
);

export const AccordionContent = forwardRef<
  ComponentRef<typeof Content>,
  ComponentPropsWithoutRef<typeof Content>
>(renderAccordionContent);
AccordionContent.displayName = Content.displayName;
