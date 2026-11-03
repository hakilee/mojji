import Icon from "../icon";
import type { IconProps } from "../types";

/**
 * Outline Chevron Down Icon.
 *
 * @see https://raw.githubusercontent.com/tabler/tabler-icons/refs/heads/main/icons/outline/chevron-down.svg
 */
export const ChevronDownIcon = (props: IconProps) => (
  <Icon {...props}>
    <svg
      aria-hidden="true"
      fill="none"
      height="24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0 0h24v24H0z" fill="none" stroke="none" />
      <path d="M6 9l6 6l6 -6" />
    </svg>
  </Icon>
);

ChevronDownIcon.displayName = "ChevronDownIcon";
