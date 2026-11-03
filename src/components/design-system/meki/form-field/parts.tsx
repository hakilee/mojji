import type { ComponentProps, ReactNode } from "react";
import { forwardRef } from "react";

import { cn } from "../cn";
import { Flex } from "../flex";
import { Input } from "../input";

export const FormFieldRoot = ({ children, className }: ComponentProps<"div">) => (
  <Flex className={className} direction="column">
    {children}
  </Flex>
);

type FormFieldLabelProps = ComponentProps<"label"> & {
  htmlFor?: string;
};

export const FormFieldLabel = ({ className, children, htmlFor, ...props }: FormFieldLabelProps) => (
  <label
    className={cn("text-left font-medium text-[13px] text-text-secondary", className)}
    htmlFor={htmlFor}
    {...props}
  >
    {children}
  </label>
);

type FormFieldInputProps = Omit<ComponentProps<"input">, "size">;

const renderFormFieldInput = (
  { className, ...props }: FormFieldInputProps,
  ref: React.Ref<HTMLInputElement>,
) => <Input className={cn("mt-1.5", className)} ref={ref} {...props} />;

export const FormFieldInput = forwardRef<HTMLInputElement, FormFieldInputProps>(
  renderFormFieldInput,
);
FormFieldInput.displayName = "FormFieldInput";

interface FormFieldErrorProps extends ComponentProps<"p"> {
  children?: ReactNode;
}

export const FormFieldError = ({ className, children, ...props }: FormFieldErrorProps) => {
  if (
    children === null ||
    children === undefined ||
    children === false ||
    children === "" ||
    children === 0
  ) {
    return null;
  }

  return (
    <p className={cn("mt-1 font-medium text-red-500 text-xs", className)} {...props}>
      {children}
    </p>
  );
};
