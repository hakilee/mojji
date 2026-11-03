import { useId } from "react";
import { Slider } from "./meki/slider";
import { FormField } from "./meki/form-field";
export function RangeField({
  id: providedId,
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  valueLabel = `${value}${suffix}`,
  disabled = false,
  onChange,
}: {
  id?: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  valueLabel?: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  const fallbackId = useId();
  const id = providedId ?? fallbackId;
  return (
    <FormField className="gap-2">
      <div className="flex items-center justify-between gap-2 text-sm text-text-secondary">
        <FormField.Label htmlFor={id}>{label}</FormField.Label>
        <output htmlFor={id} className="text-xs text-text-tertiary tabular-nums">
          {valueLabel}
        </output>
      </div>
      <Slider
        id={id}
        aria-label={label}
        aria-valuetext={valueLabel}
        min={min}
        max={max}
        step={step}
        value={[value]}
        disabled={disabled}
        onValueChange={(values) => onChange(values[0]!)}
      />
    </FormField>
  );
}
