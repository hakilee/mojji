import { Root } from "@radix-ui/react-dropdown-menu";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Portal } from "@radix-ui/react-dropdown-menu";
import { Trigger } from "@radix-ui/react-dropdown-menu";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "./parts";

export const Dropdown = /* @__PURE__ */ Object.assign(Root, {
  Content: DropdownMenuContent,
  Item: DropdownMenuItem,
  Label,
  Portal,
  Separator: DropdownMenuSeparator,
  Trigger,
});
