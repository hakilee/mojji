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
      className="relative isolate flex min-h-control-size gap-1 rounded-xl bg-neutral-50 p-1 ring-1 ring-inset ring-neutral-200"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-1 left-1 rounded-lg border border-neutral-200 bg-white shadow-control transition-transform duration-200 ease-out motion-reduce:transition-none"
        style={{
          width: `calc((100% - var(--spacing) * ${options.length + 1}) / ${options.length})`,
          transform: `translateX(calc(${options.findIndex((option) => option.value === value)} * (100% + var(--spacing))))`,
        }}
      />
      {options.map((option) => (
        <label
          key={option.value}
          className="relative z-10 flex min-h-8 min-w-0 flex-1 cursor-pointer items-center justify-center rounded-lg border border-transparent px-inset py-1 text-sm font-medium text-text-tertiary transition-colors hover:text-text-primary has-checked:text-text-primary has-focus-visible:outline-2 has-focus-visible:-outline-offset-2 has-focus-visible:outline-primary motion-reduce:transition-none"
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="sr-only"
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}
