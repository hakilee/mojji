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
      className="mb-4 flex gap-1 rounded-control bg-bg-neutral-weak p-1"
    >
      {options.map((option) => (
        <Radio.Root
          key={option.value}
          value={option.value}
          nativeButton
          render={<button type="button" />}
          className="flex min-h-9 min-w-0 flex-1 cursor-pointer items-center justify-center rounded-[7px] px-3 text-label text-fg-neutral-muted transition-colors data-checked:bg-bg-layer-default data-checked:font-semibold data-checked:text-fg-brand data-checked:shadow-sm focus-visible:outline-2 focus-visible:outline-stroke-focus focus-visible:outline-offset-2 motion-reduce:transition-none"
        >
          {option.label}
        </Radio.Root>
      ))}
    </RadioGroup>
  );
}
