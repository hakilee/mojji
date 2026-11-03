import { Content, Link, Trigger, Viewport } from "@radix-ui/react-navigation-menu";
import type { ComponentPropsWithoutRef, ComponentRef, Ref } from "react";
import { forwardRef } from "react";

import { cn } from "../cn";

import styles from "./navigation-menu.module.css";

const renderNavigationMenuTrigger = (
  { className, ...props }: ComponentPropsWithoutRef<typeof Trigger>,
  ref: Ref<ComponentRef<typeof Trigger>>,
) => <Trigger className={cn(styles.trigger, className)} ref={ref} {...props} />;

export const NavigationMenuTrigger = forwardRef<
  ComponentRef<typeof Trigger>,
  ComponentPropsWithoutRef<typeof Trigger>
>(renderNavigationMenuTrigger);
NavigationMenuTrigger.displayName = Trigger.displayName;

const renderNavigationMenuLink = (
  { className, ...props }: ComponentPropsWithoutRef<typeof Link>,
  ref: Ref<ComponentRef<typeof Link>>,
) => <Link className={cn(styles.link, className)} ref={ref} {...props} />;

export const NavigationMenuLink = forwardRef<
  ComponentRef<typeof Link>,
  ComponentPropsWithoutRef<typeof Link>
>(renderNavigationMenuLink);
NavigationMenuLink.displayName = Link.displayName;

const renderNavigationMenuContent = (
  { className, ...props }: ComponentPropsWithoutRef<typeof Content>,
  ref: Ref<ComponentRef<typeof Content>>,
) => <Content className={cn(styles.content, className)} ref={ref} {...props} />;

export const NavigationMenuContent = forwardRef<
  ComponentRef<typeof Content>,
  ComponentPropsWithoutRef<typeof Content>
>(renderNavigationMenuContent);
NavigationMenuContent.displayName = Content.displayName;

const renderNavigationMenuViewport = (
  { className, ...props }: ComponentPropsWithoutRef<typeof Viewport>,
  ref: Ref<ComponentRef<typeof Viewport>>,
) => (
  <div className={styles.viewportPosition}>
    <Viewport className={cn(styles.viewport, className)} ref={ref} {...props} />
  </div>
);

export const NavigationMenuViewport = forwardRef<
  ComponentRef<typeof Viewport>,
  ComponentPropsWithoutRef<typeof Viewport>
>(renderNavigationMenuViewport);
NavigationMenuViewport.displayName = Viewport.displayName;
