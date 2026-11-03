import { Root } from "@radix-ui/react-navigation-menu";
import { Item } from "@radix-ui/react-navigation-menu";
import { List } from "@radix-ui/react-navigation-menu";
import {
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "./parts";

export const NavigationMenu = /* @__PURE__ */ Object.assign(Root, {
  Content: NavigationMenuContent,
  Item,
  Link: NavigationMenuLink,
  List,
  Trigger: NavigationMenuTrigger,
  Viewport: NavigationMenuViewport,
});
