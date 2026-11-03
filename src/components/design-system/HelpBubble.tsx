import { Tooltip } from "@base-ui/react/tooltip";
import { useId, useState } from "react";
import type { ReactNode } from "react";

export function HelpBubble({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <Tooltip.Root open={open} triggerId={id} onOpenChange={(value) => setOpen(value)}>
      <Tooltip.Trigger
        id={id}
        type="button"
        aria-label={`${label} 도움말`}
        aria-describedby={open ? `${id}-content` : undefined}
        delay={200}
        closeOnClick={false}
        onClick={() => setOpen(true)}
        className="inline-flex size-control-size shrink-0 cursor-help touch-manipulation items-center justify-center rounded-full text-fg-neutral-muted transition-colors duration-150 hover:bg-bg-brand-weak hover:text-fg-neutral focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focus motion-reduce:transition-none"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="size-4"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4M12 16h.01" />
        </svg>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner side="bottom" sideOffset={4} collisionPadding={12} className="z-50">
          <Tooltip.Popup
            id={`${id}-content`}
            role="tooltip"
            className="w-72 max-w-[calc(100vw-24px)] max-h-[var(--available-height)] overflow-y-auto overscroll-contain rounded-md border border-stroke-neutral bg-bg-layer-default px-inset py-1.5 text-caption font-medium text-fg-neutral shadow-floating transition-opacity duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0 motion-reduce:transition-none"
          >
            {children}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
