import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";

export function Checkbox({
  label,
  checked,
  onCheckedChange,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex min-h-control-size cursor-pointer items-center gap-control text-label text-fg-neutral-secondary has-data-disabled:cursor-not-allowed has-data-disabled:text-fg-disabled">
      <CheckboxPrimitive.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="flex size-5 shrink-0 items-center justify-center rounded-control-inset border border-stroke-neutral-strong bg-bg-layer-default text-fg-on-brand-solid transition-colors duration-150 hover:not-data-disabled:border-stroke-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focus data-checked:border-stroke-brand data-checked:bg-bg-brand-solid data-disabled:border-stroke-neutral data-disabled:bg-bg-disabled data-disabled:text-fg-disabled motion-reduce:transition-none"
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
            aria-hidden="true"
          >
            <path d="m5 12 4 4L19 6" />
          </svg>
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label}
    </label>
  );
}
