import { Popover } from "@base-ui/react/popover";
import { useRef } from "react";
import type { ReactNode, RefObject } from "react";
import { Button } from "./Button";

export function FloatingPanel({
  id,
  label,
  anchor,
  onClose,
  children,
}: {
  id: string;
  label: string;
  anchor: RefObject<HTMLElement | null>;
  onClose: (details: Popover.Root.ChangeEventDetails) => void;
  children: ReactNode;
}) {
  const restoreFocus = useRef(true);
  return (
    <Popover.Root
      open
      onOpenChange={(open, details) => {
        if (open || details.reason === "focus-out") return;
        if (
          details.event.target instanceof Node &&
          anchor.current?.contains(details.event.target)
        ) {
          details.cancel();
          return;
        }
        restoreFocus.current = details.reason !== "outside-press";
        onClose(details);
      }}
    >
      <Popover.Portal>
        <Popover.Positioner
          anchor={anchor}
          side="bottom"
          align="center"
          sideOffset={8}
          collisionPadding={12}
          collisionAvoidance={{ side: "flip", align: "shift", fallbackAxisSide: "none" }}
          positionMethod="fixed"
          className="z-50"
        >
          <Popover.Popup
            id={id}
            initialFocus={false}
            finalFocus={() =>
              restoreFocus.current && anchor.current?.isConnected ? anchor.current : false
            }
            className="w-80 max-w-[calc(100vw-24px)] max-h-[min(70dvh,var(--available-height))] overflow-y-auto overscroll-contain rounded-panel border border-stroke-neutral bg-bg-layer-default p-inset text-fg-neutral shadow-floating outline-none transition-opacity duration-150 data-starting-style:opacity-0 motion-reduce:transition-none"
          >
            <div className="mb-inset flex items-center justify-between gap-control">
              <Popover.Title className="text-label font-medium">{label}</Popover.Title>
              <Popover.Close
                aria-label="레이어 편집 닫기"
                render={<Button variant="neutral" size="x-small" />}
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
