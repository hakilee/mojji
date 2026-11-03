import { Input as InputPrimitive } from "@base-ui/react/input";

export function Input({
  className = "",
  ...props
}: Omit<InputPrimitive.Props, "className"> & { className?: string }) {
  return (
    <InputPrimitive
      className={`block min-h-control-size w-full min-w-0 rounded-control border border-stroke-neutral bg-bg-layer-default px-inset py-control text-label text-fg-neutral shadow-control transition-colors duration-150 placeholder:text-fg-neutral-muted enabled:hover:border-stroke-neutral-strong focus:border-stroke-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focus aria-invalid:border-fg-critical aria-invalid:focus-visible:outline-fg-critical disabled:cursor-not-allowed disabled:bg-bg-disabled disabled:text-fg-disabled file:mr-control file:cursor-pointer file:rounded-control-inset file:border-0 file:bg-bg-neutral-weak-hover file:px-control file:py-1 file:text-caption file:font-medium file:text-fg-neutral-secondary disabled:file:cursor-not-allowed disabled:file:text-fg-disabled motion-reduce:transition-none ${className}`}
      {...props}
    />
  );
}
