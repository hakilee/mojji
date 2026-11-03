import { Popover } from "@base-ui/react/popover";
import type { ReactNode } from "react";

export function HelpBubble({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Popover.Root>
      <Popover.Trigger
        type="button"
        aria-label={`${label} 도움말`}
        className="inline-flex size-6 shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-full text-fg-neutral-muted transition-colors duration-150 hover:bg-bg-brand-weak hover:text-fg-neutral data-popup-open:bg-bg-brand-weak data-popup-open:text-fg-neutral focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focus motion-reduce:transition-none [-webkit-tap-highlight-color:transparent]"
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
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner
          side="top"
          sideOffset={12}
          arrowPadding={14}
          collisionPadding={16}
          className="z-60"
        >
          <Popover.Popup
            initialFocus={false}
            className="w-70 max-w-[calc(100vw-32px)] origin-[var(--transform-origin)] rounded-panel bg-bg-brand-solid text-label text-fg-on-brand-solid outline-none transition-[opacity,scale] duration-150 data-starting-style:scale-90 data-starting-style:opacity-0 data-ending-style:opacity-0 motion-reduce:transition-none motion-reduce:data-starting-style:scale-100"
          >
            <Popover.Arrow className="pointer-events-none h-2 w-3 fill-bg-brand-solid data-[side=top]:-bottom-2 data-[side=top]:rotate-180 data-[side=bottom]:-top-2 data-[side=left]:-right-2 data-[side=left]:rotate-90 data-[side=right]:-left-2 data-[side=right]:-rotate-90">
              <svg viewBox="0 0 12 8" className="size-full">
                <path d="M0 8 4.6 1.8Q6 .1 7.4 1.8L12 8Z" />
              </svg>
            </Popover.Arrow>
            <div className="flex max-h-[var(--available-height)] overflow-y-auto overscroll-contain rounded-[inherit] px-inset py-2.5">
              <div className="flex min-w-0 flex-1 flex-col gap-0.5 break-keep wrap-anywhere">
                <Popover.Title render={<span />} className="font-semibold">
                  {label}
                </Popover.Title>
                <Popover.Description render={<div />} className="font-normal">
                  {children}
                </Popover.Description>
              </div>
              <Popover.Close
                aria-label={`${label} 도움말 닫기`}
                className="-my-2.5 -mr-3 -ml-2 inline-flex size-[38px] shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-panel transition-colors duration-150 hover:bg-fg-on-brand-solid/10 active:bg-fg-on-brand-solid/20 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-fg-on-brand-solid motion-reduce:transition-none [-webkit-tap-highlight-color:transparent]"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="size-3.5"
                >
                  <path d="m3 3 10 10M13 3 3 13" />
                </svg>
              </Popover.Close>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
