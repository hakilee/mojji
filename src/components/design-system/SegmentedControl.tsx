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
      className="flex min-h-control-size gap-1 rounded-control bg-bg-neutral-weak p-1 ring-1 ring-inset ring-stroke-neutral"
    >
      {options.map((option) => (
        <Radio.Root
          key={option.value}
          value={option.value}
          nativeButton
          render={<button type="button" />}
          className="flex min-h-8 min-w-0 flex-1 cursor-pointer items-center justify-center rounded-control-inset border border-transparent px-3 py-1 text-label font-semibold text-fg-neutral-muted transition-colors hover:bg-bg-neutral-weak-pressed hover:text-fg-neutral data-checked:border-stroke-neutral data-checked:bg-bg-layer-default data-checked:text-fg-neutral data-checked:shadow-xs focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-stroke-focus motion-reduce:transition-none"
        >
          {option.label}
        </Radio.Root>
      ))}
    </RadioGroup>
  );
}
