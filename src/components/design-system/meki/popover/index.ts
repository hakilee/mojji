import { Anchor } from "@radix-ui/react-popover";
import { Close } from "@radix-ui/react-popover";
import {
  PopoverImpl,
  PopoverArrow,
  PopoverContent,
  PopoverProvider,
  PopoverTrigger,
} from "./parts";

export const Popover = /* @__PURE__ */ Object.assign(PopoverImpl, {
  Anchor,
  Close,
  Arrow: PopoverArrow,
  Content: PopoverContent,
  Provider: PopoverProvider,
  Trigger: PopoverTrigger,
});
