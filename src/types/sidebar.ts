import { LucideIcon } from "lucide-react";
import { RemixiconComponentType } from "@remixicon/react";

export type User = {
  name: string;
  email: string;
  avatar: string;
};

export type NavigationItem = {
  title: string;
  url: string;
  icon: LucideIcon | RemixiconComponentType;
  isActive?: boolean;
};

export type NavigationSection = {
  title: string;
  items: NavigationItem[];
};

export type NavigationData = {
  user: User;
  navMain: NavigationSection[];
};
