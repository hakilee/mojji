import Icon from "../icon";
import type { IconProps } from "../types";

/**
 * Outline Plus Icon.
 *
 * @see https://raw.githubusercontent.com/tabler/tabler-icons/refs/heads/main/icons/outline/plus.svg
 */
export const PlusIcon = (props: IconProps) => (
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
      <path d="M12 5l0 14" />
      <path d="M5 12l14 0" />
    </svg>
  </Icon>
);

PlusIcon.displayName = "PlusIcon";
