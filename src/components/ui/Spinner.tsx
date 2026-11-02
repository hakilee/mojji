/** Radial loading indicator. Omit label when adjacent text already announces progress. */
export function Spinner({
  label,
  size = "medium",
}: {
  label?: string;
  size?: "small" | "medium" | "large";
}) {
  return (
    <span
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`inline-flex shrink-0 animate-spin align-middle motion-reduce:animate-none ${size === "small" ? "size-3" : size === "large" ? "size-5" : "size-4"}`}
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-full">
        {Array.from({ length: 8 }, (_, index) => (
          <path
            key={index}
            d="M12 3v4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            transform={`rotate(${index * 45} 12 12)`}
            opacity={(index + 1) / 8}
          />
        ))}
      </svg>
    </span>
  );
}
