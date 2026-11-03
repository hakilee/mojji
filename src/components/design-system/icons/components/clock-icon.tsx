import Icon from "../icon";
import type { IconProps } from "../types";

/**
 * Outline Clock Icon.
 *
 * @see https://raw.githubusercontent.com/tabler/tabler-icons/refs/heads/main/icons/outline/clock.svg
 */
export const ClockIcon = (props: IconProps) => (
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
      <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
      <path d="M12 7v5l3 3" />
    </svg>
  </Icon>
);

ClockIcon.displayName = "ClockIcon";
