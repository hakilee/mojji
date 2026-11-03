"use client";

import { Content, List, Root, Trigger } from "@radix-ui/react-tabs";
import { motion, useReducedMotion } from "motion/react";
import type { ComponentPropsWithoutRef, ComponentRef, Ref } from "react";
import { createContext, forwardRef, useContext, useId, useMemo, useState } from "react";

import { cn } from "../cn";

interface TabsContextValue {
  layoutId: string;
  value: string;
}

const TabsContext = createContext<TabsContextValue>({
  layoutId: "",
  value: "",
});

export const TabsRootRender = (
  {
    className,
    defaultValue,
    value,
    onValueChange,
    ...props
  }: ComponentPropsWithoutRef<typeof Root>,
  ref: Ref<ComponentRef<typeof Root>>,
) => {
  const id = useId();
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const currentValue = value ?? internalValue;
  const handleValueChange = (newValue: string) => {
    setInternalValue(newValue);
    onValueChange?.(newValue);
  };
  const contextValue = useMemo<TabsContextValue>(
    () => ({ layoutId: `tabs-indicator-${id}`, value: currentValue }),
    [currentValue, id],
  );
  return (
    <TabsContext.Provider value={contextValue}>
      <Root
        className={cn("w-full", className)}
        onValueChange={handleValueChange}
        ref={ref}
        value={currentValue}
        {...props}
      />
    </TabsContext.Provider>
  );
};

export const TabsRoot = forwardRef<
  ComponentRef<typeof Root>,
  ComponentPropsWithoutRef<typeof Root>
>(TabsRootRender);
TabsRoot.displayName = Root.displayName;

export const TabsListRender = (
  { className, ...props }: ComponentPropsWithoutRef<typeof List>,
  ref: Ref<ComponentRef<typeof List>>,
) => (
  <List
    className={cn("flex gap-1 overflow-visible border-divider border-b", className)}
    ref={ref}
    {...props}
  />
);

export const TabsList = forwardRef<
  ComponentRef<typeof List>,
  ComponentPropsWithoutRef<typeof List>
>(TabsListRender);
TabsList.displayName = List.displayName;

export const TabsTriggerRender = (
  { className, children, value, ...props }: ComponentPropsWithoutRef<typeof Trigger>,
  ref: Ref<ComponentRef<typeof Trigger>>,
) => {
  const context = useContext(TabsContext);
  const isActive = context.value === value;
  const reducedMotion = useReducedMotion();
  return (
    <Trigger
      className={cn(
        "relative cursor-pointer px-3 py-2 font-medium text-sm text-text-secondary transition-colors",
        "hover:text-text-primary",
        isActive && "text-text-primary",
        className,
      )}
      ref={ref}
      value={value}
      {...props}
    >
      {children}
      {isActive && (
        <motion.div
          className="absolute right-0 bottom-0 left-0 h-0.5 bg-primary"
          layoutId={context.layoutId}
          transition={
            reducedMotion ? { duration: 0 } : { bounce: 0.15, duration: 0.3, type: "spring" }
          }
        />
      )}
    </Trigger>
  );
};

export const TabsTrigger = forwardRef<
  ComponentRef<typeof Trigger>,
  ComponentPropsWithoutRef<typeof Trigger>
>(TabsTriggerRender);
TabsTrigger.displayName = Trigger.displayName;

export const TabsContentRender = (
  { className, ...props }: ComponentPropsWithoutRef<typeof Content>,
  ref: Ref<ComponentRef<typeof Content>>,
) => <Content className={cn("mt-4", className)} ref={ref} {...props} />;

export const TabsContent = forwardRef<
  ComponentRef<typeof Content>,
  ComponentPropsWithoutRef<typeof Content>
>(TabsContentRender);
TabsContent.displayName = Content.displayName;
