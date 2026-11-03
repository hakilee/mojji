import Icon from "../icon";
import type { IconProps } from "../types";

/**
 * Outline X Icon.
 *
 * @see https://raw.githubusercontent.com/tabler/tabler-icons/refs/heads/main/icons/outline/x.svg
 */
export const CrossIcon = (props: IconProps) => (
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
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </svg>
  </Icon>
);

CrossIcon.displayName = "CrossIcon";
