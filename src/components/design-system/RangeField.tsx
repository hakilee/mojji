import { useId } from "react";

export function RangeField({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  const id = useId();
  return (
    <div className="space-y-control">
      <div className="flex items-center justify-between gap-control text-label">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id} className="text-caption text-fg-neutral-muted tabular-nums">
          {value}
          {suffix}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={`${value}${suffix}`}
        onChange={(event) => onChange(event.target.valueAsNumber)}
        className="block h-6 w-full cursor-pointer accent-fg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focus"
      />
    </div>
  );
}
