import { Input } from "@base-ui/react/input";
import { Popover } from "@base-ui/react/popover";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { useId, useState } from "react";

const colors = [
  { value: "#1a1c20", label: "차콜" },
  { value: "#ffffff", label: "흰색" },
  { value: "#ef4444", label: "빨강" },
  { value: "#f97316", label: "주황" },
  { value: "#eab308", label: "노랑" },
  { value: "#22c55e", label: "초록" },
  { value: "#14b8a6", label: "청록" },
  { value: "#0ea5e9", label: "하늘" },
  { value: "#3b82f6", label: "파랑" },
  { value: "#7555e8", label: "보라" },
  { value: "#ec4899", label: "분홍" },
  { value: "#8b5e3c", label: "갈색" },
];

export function ColorPicker({
  label,
  displayLabel = label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  displayLabel?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const invalid = draft !== null && !/^#?[\da-f]{6}$/i.test(draft);

  return (
    <Popover.Root
      onOpenChange={(open) => {
        if (!open) setDraft(null);
      }}
    >
      <Popover.Trigger
        disabled={disabled}
        aria-label={`${label} 선택`}
        className="flex min-h-control-size min-w-0 cursor-pointer items-center justify-between gap-control rounded-control border border-stroke-neutral bg-bg-layer-default px-3 text-label transition-colors hover:border-stroke-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focus data-popup-open:border-stroke-brand disabled:cursor-not-allowed disabled:bg-bg-disabled disabled:text-fg-disabled motion-reduce:transition-none"
      >
        <span>{displayLabel}</span>
        <span
          aria-hidden="true"
          className="size-5 shrink-0 rounded-control-inset border border-stroke-neutral-strong"
          style={{ backgroundColor: value }}
        />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8} collisionPadding={12} align="start" className="z-50">
          <Popover.Popup className="max-h-[var(--available-height)] overflow-y-auto overscroll-contain w-64 max-w-[calc(100vw-24px)] space-y-3 rounded-panel border border-stroke-neutral bg-bg-layer-default p-3 text-fg-neutral shadow-lg outline-none transition-opacity duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0 motion-reduce:transition-none">
            <div className="flex items-center justify-between gap-control">
              <Popover.Title className="text-label font-semibold">{label}</Popover.Title>
              <Popover.Close
                aria-label="색상 선택 닫기"
                className="flex size-control-size shrink-0 cursor-pointer items-center justify-center rounded-control text-fg-neutral-muted hover:bg-bg-neutral-weak focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focus"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="size-4"
                  aria-hidden="true"
                >
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </Popover.Close>
            </div>
            <RadioGroup
              aria-label={`${label} 팔레트`}
              value={value.toLowerCase()}
              onValueChange={(color) => {
                setDraft(null);
                onChange(color);
              }}
              className="grid grid-cols-4 gap-control"
            >
              {colors.map((color) => (
                <Radio.Root
                  key={color.value}
                  value={color.value}
                  aria-label={`${color.label} ${color.value}`}
                  nativeButton
                  render={<button type="button" />}
                  className="flex min-h-control-size cursor-pointer items-center justify-center rounded-control-inset border border-transparent p-0.5 hover:border-stroke-neutral-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focus data-checked:border-stroke-brand"
                >
                  <span
                    className="flex size-8 items-center justify-center rounded-control-inset border border-stroke-neutral-strong"
                    style={{ backgroundColor: color.value }}
                  >
                    <Radio.Indicator className="size-3 rounded-full border-2 border-white bg-bg-brand-solid shadow-sm" />
                  </span>
                </Radio.Root>
              ))}
            </RadioGroup>
            <div className="space-y-control">
              <label htmlFor={id} className="block text-caption text-fg-neutral-muted">
                HEX
              </label>
              <div className="flex gap-control">
                <Input
                  type="color"
                  aria-label={`${label} 직접 선택`}
                  value={value}
                  onValueChange={(color) => {
                    setDraft(null);
                    onChange(color);
                  }}
                  className="size-control-size shrink-0 cursor-pointer rounded-control border border-stroke-neutral bg-bg-layer-default p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focus"
                />
                <Input
                  id={id}
                  aria-label={`${label} HEX`}
                  aria-invalid={invalid}
                  aria-describedby={invalid ? `${id}-error` : undefined}
                  value={draft ?? value}
                  spellCheck={false}
                  autoComplete="off"
                  maxLength={7}
                  onValueChange={(text) => {
                    setDraft(text);
                    if (/^#?[\da-f]{6}$/i.test(text))
                      onChange(`#${text.replace(/^#/, "").toLowerCase()}`);
                  }}
                  onBlur={() => setDraft(null)}
                  className="min-h-control-size min-w-0 flex-1 rounded-control border border-stroke-neutral-strong bg-bg-layer-default px-3 text-label tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focus aria-invalid:border-fg-critical"
                />
              </div>
              {invalid && (
                <p id={`${id}-error`} className="text-caption text-fg-critical">
                  6자리 HEX 색상을 입력해 주세요.
                </p>
              )}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
