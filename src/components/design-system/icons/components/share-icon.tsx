import Icon from "../icon";
import type { IconProps } from "../types";

/**
 * Outline Share Icon.
 *
 * @see https://raw.githubusercontent.com/tabler/tabler-icons/refs/heads/main/icons/outline/share.svg
 */
export const ShareIcon = (props: IconProps) => (
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
      <path d="M8 9h-1a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-8a2 2 0 0 0 -2 -2h-1" />
      <path d="M12 14v-11" />
      <path d="M9 6l3 -3l3 3" />
    </svg>
  </Icon>
);

ShareIcon.displayName = "ShareIcon";
