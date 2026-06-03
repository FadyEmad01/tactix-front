"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { NAVIGATION_DATA } from "@/constant/SIDEBAR_NAVIGATION_DATA";
import { SETTINGS_NAV_ITEMS } from "@/constant/SETTINGS";
import { fetchMatchById } from "@/lib/match/actions";

export default function BreadcrumbNav() {
  const pathname = usePathname();
  const [matchName, setMatchName] = useState<string | null>(null);

  const videoEditorMatch = pathname.match(/^\/video-editor\/([^/]+)$/);
  const boardMatch = pathname.match(/^\/board\/([^/]+)$/);
  const matchId = videoEditorMatch ? videoEditorMatch[1] : "";

  useEffect(() => {
    if (matchId) {
      fetchMatchById(matchId).then((match) => {
        setMatchName(match?.name ?? null);
      });
    }
  }, [matchId]);

  const breadcrumbItems: { title: string; url?: string }[] = [];

  // Always start with Home
  breadcrumbItems.push({ title: "Home", url: "/" });

  // ================================
  // 1) VIDEO EDITOR ROUTES (Dynamic)
  // ================================
  if (videoEditorMatch && matchId) {
    breadcrumbItems.push({ title: "Projects", url: "/projects" });
    if (matchName) {
      breadcrumbItems.push({ title: matchName });
    }
    breadcrumbItems.push({ title: "Video Tagging" });
  }

  // ================================
  // 2) BOARD ROUTES (Dynamic)
  // ================================
  else if (boardMatch) {
    breadcrumbItems.push({ title: "Tactical Boards" });
  }

  // ================================
  // 3) SETTINGS ROUTES
  // ================================
  else if (pathname.startsWith("/settings")) {
    if (pathname !== "/settings") {
      breadcrumbItems.push({ title: "Settings", url: "/settings" });
    }

    const currentSetting = SETTINGS_NAV_ITEMS.find(
      (item) => item.href === pathname
    );

    if (pathname === "/settings") {
      breadcrumbItems.push({ title: "Settings" });
      breadcrumbItems.push({ title: "Edit Profile" });
    } else if (currentSetting) {
      breadcrumbItems.push({ title: currentSetting.title });
    } else {
      breadcrumbItems.push({ title: "Unknown" });
    }
  }

  // ================================
  // 4) STATIC ROUTES FROM NAVIGATION_DATA
  // ================================
  else {
    const allItems = NAVIGATION_DATA.navMain.flatMap(
      (section) => section.items
    );

    const current = allItems.find((item) => pathname === item.url);

    if (current) {
      breadcrumbItems.push({ title: current.title });
    } else if (pathname === "/") {
      // Already has Home
    } else {
      breadcrumbItems.push({ title: "Unknown" });
    }
  }

  // ================================
  // RENDERING
  // ================================
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {item.url ? (
                <BreadcrumbLink asChild>
                  <Link href={item.url}>{item.title}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.title}</BreadcrumbPage>
              )}
            </BreadcrumbItem>

            {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
