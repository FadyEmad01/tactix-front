import { NavigationData } from "@/types/sidebar";
import {
  Gauge,
  HandCoins,
  MessageCircleMore,
  Settings
} from "lucide-react";
import { RiCalendarEventLine } from "@remixicon/react"

export const NAVIGATION_DATA: NavigationData = {
  user: {
    name: "Fady Emad",
    email: "Fady@example.com",
    avatar:
      "https://i.pinimg.com/736x/e3/e7/02/e3e702a98c0fe9e30f3dc8512cad71e1.jpg",
  },
  navMain: [
    {
      title: "Home",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: Gauge,
        },
        {
          title: "Projects",
          url: "/projects",
          icon: HandCoins,
        },
        {
          title: "Chat",
          url: "/chat",
          icon: MessageCircleMore,
        },
        {
          title: "Calendar",
          url: "/calendar",
          icon: RiCalendarEventLine,
        },
        {
          title: "Settings",
          url: "/settings",
          icon: Settings,
        },
      ],
    },
  ],
};
