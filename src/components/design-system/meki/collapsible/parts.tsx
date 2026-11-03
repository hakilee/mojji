"use client";

import { Content } from "@radix-ui/react-collapsible";
import type { ComponentPropsWithoutRef, ComponentRef, Ref } from "react";
import { forwardRef } from "react";

import { cn } from "../cn";

import styles from "./collapsible.module.css";

const renderCollapsibleContent = function renderCollapsibleContent(
  { className, children, ...props }: ComponentPropsWithoutRef<typeof Content>,
  ref: Ref<ComponentRef<typeof Content>>,
) {
  return (
    <Content className={cn(styles.content, className)} ref={ref} {...props}>
      {children}
    </Content>
  );
};

export const CollapsibleContent = forwardRef<
  ComponentRef<typeof Content>,
  ComponentPropsWithoutRef<typeof Content>
>(renderCollapsibleContent);
CollapsibleContent.displayName = Content.displayName;
