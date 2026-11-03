"use client";

import type { ComponentProps } from "react";
import { forwardRef } from "react";

import { cn } from "../cn";
import type { InputSize } from "../input-sizes";
import { sizes } from "../input-sizes";

type FormattedNumberInputProps = Omit<
  ComponentProps<"input">,
  "type" | "value" | "onChange" | "size"
> & {
  value: string;
  onChange: (value: string) => void;
  size?: InputSize;
};

const NUMBER_VALIDATION_REGEX = /^-?\d*\.?\d*$/u;

const formatWithCommas = (value: string): string => {
  if (!value) {
    return "";
  }

  const isNegative = value.startsWith("-");
  const numStr = isNegative ? value.slice(1) : value;

  const [integerPart = "", decimalPart] = numStr.split(".");

  const formattedInteger = integerPart.replaceAll(/\B(?=(?<thousands>\d{3})+(?!\d))/gu, ",");

  let result = formattedInteger;
  if (decimalPart !== undefined) {
    result += `.${decimalPart || ""}`;
  }

  return isNegative ? `-${result}` : result;
};

const removeCommas = (value: string): string => value.replaceAll(",", "");

const isValidNumberInput = (value: string): boolean => {
  if (value === "") {
    return true;
  }
  return NUMBER_VALIDATION_REGEX.test(value);
};

const renderFormattedNumberInput = (
  { value, onChange, className, size = "medium", ...props }: FormattedNumberInputProps,
  ref: React.Ref<HTMLInputElement>,
) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const rawValue = removeCommas(inputValue);

    if (!isValidNumberInput(rawValue)) {
      return;
    }

    onChange(rawValue);
  };

  return (
    <input
      className={cn(
        "border border-neutral-200 text-text-primary",
        "hover:border-neutral-300 focus:border-primary focus:outline-none",
        sizes[size],
        "mt-1.5",
        className,
      )}
      inputMode="decimal"
      onChange={handleChange}
      ref={ref}
      type="text"
      value={formatWithCommas(value)}
      {...props}
    />
  );
};

export const FormattedNumberInput = forwardRef<HTMLInputElement, FormattedNumberInputProps>(
  renderFormattedNumberInput,
);

FormattedNumberInput.displayName = "FormattedNumberInput";
