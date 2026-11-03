import { Popover } from "@base-ui/react/popover";
import type { ReactNode } from "react";

export function FloatingPanel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Popover.Root>
      <Popover.Trigger
        aria-label={label}
        className="inline-flex min-h-control-size cursor-pointer items-center gap-control rounded-full border border-stroke-neutral bg-bg-layer-default px-group text-label shadow-sm hover:bg-bg-neutral-weak focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-guide data-popup-open:border-stroke-guide"
      >
        {label}
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="size-4"
        >
          <path d="m7 14 5-5 5 5" />
        </svg>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner
          side="right"
          align="start"
          sideOffset={12}
          collisionPadding={12}
          className="z-50"
        >
          <Popover.Popup className="w-80 max-w-[calc(100vw-24px)] max-h-[min(70dvh,var(--available-height))] overflow-y-auto overscroll-contain rounded-panel border border-stroke-neutral bg-bg-layer-default p-group text-fg-neutral shadow-lg outline-none transition-opacity duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0 motion-reduce:transition-none">
            <div className="mb-group flex items-center justify-between gap-control">
              <Popover.Title className="text-label font-semibold">{label}</Popover.Title>
              <Popover.Close
                aria-label="레이어 편집 닫기"
                className="size-control-size shrink-0 cursor-pointer rounded-control text-label hover:bg-bg-neutral-weak focus-visible:outline-2 focus-visible:outline-stroke-guide"
              >
                닫기
              </Popover.Close>
            </div>
            {children}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
