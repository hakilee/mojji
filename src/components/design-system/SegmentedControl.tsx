import { useId } from "react";

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const name = useId();
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="mb-4 flex gap-1 rounded-control bg-bg-neutral-weak p-1"
    >
      {options.map((option) => (
        <label key={option.value} className="min-w-0 flex-1 cursor-pointer">
          <input
            className="peer sr-only"
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <span className="flex min-h-9 items-center justify-center rounded-[7px] px-3 text-xs text-fg-neutral-muted transition-colors peer-checked:bg-bg-layer-default peer-checked:font-semibold peer-checked:text-fg-brand peer-checked:shadow-sm peer-focus-visible:outline-2 peer-focus-visible:outline-stroke-focus peer-focus-visible:outline-offset-2 motion-reduce:transition-none">
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
}
