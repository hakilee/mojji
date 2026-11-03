import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";

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
  return (
    <RadioGroup
      value={value}
      onValueChange={onChange}
      aria-label={label}
      className="relative isolate flex min-h-control-size gap-1 rounded-panel bg-bg-neutral-weak p-1 ring-1 ring-inset ring-stroke-neutral"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-1 left-1 rounded-control-inset border border-stroke-neutral bg-bg-layer-default shadow-control transition-transform duration-200 ease-out motion-reduce:transition-none"
        style={{
          width: `calc((100% - var(--spacing) * ${options.length + 1}) / ${options.length})`,
          transform: `translateX(calc(${options.findIndex((option) => option.value === value)} * (100% + var(--spacing))))`,
        }}
      />
      {options.map((option) => (
        <Radio.Root
          key={option.value}
          value={option.value}
          nativeButton
          render={<button type="button" />}
          className="relative z-10 flex min-h-8 min-w-0 flex-1 cursor-pointer items-center justify-center rounded-control-inset border border-transparent px-inset py-1 text-label font-medium text-fg-neutral-muted transition-colors duration-150 hover:bg-bg-neutral-weak-hover hover:text-fg-neutral data-checked:text-fg-neutral data-checked:hover:bg-transparent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-stroke-focus motion-reduce:transition-none"
        >
          {option.label}
        </Radio.Root>
      ))}
    </RadioGroup>
  );
}
