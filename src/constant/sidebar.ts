import { NavigationData } from "@/types/sidebar";
import {
  Folders,
  Settings
} from "lucide-react";

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
        // {
        //   title: "Home",
        //   url: "/Home",
        //   icon: Gauge,
        // },
        {
          title: "Projects",
          url: "/projects",
          icon: Folders,
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
