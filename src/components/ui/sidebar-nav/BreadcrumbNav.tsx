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
import React, { useState } from "react";
import Link from "next/link";
import { NAVIGATION_DATA } from "@/constant/SIDEBAR_NAVIGATION_DATA";
import { SETTINGS_NAV_ITEMS } from "@/constant/SETTINGS"; // <-- import your settings items

export default function BreadcrumbNav() {
  const pathname = usePathname();

  const videoEditorMatch = pathname.match(/^\/video-editor\/([^/]+)$/);
  const matchId = videoEditorMatch ? videoEditorMatch[1] : "";

  const breadcrumbItems: { title: string; url?: string }[] = [];



  // Always start with Home
  breadcrumbItems.push({ title: "Home", url: "/" });

 // ================================
  // 1) VIDEO EDITOR ROUTES (Dynamic)
  // ================================
  if (videoEditorMatch && matchId) {
    breadcrumbItems.push({
      title: "Projects",
      url: "/projects",
    });
    breadcrumbItems.push({
      title: "Video Tagging",
    });
  }

  // ================================
  // 2) SETTINGS ROUTES
  // ================================
  else if (pathname.startsWith("/settings")) {
    // If NOT on /settings → add parent
    if (pathname !== "/settings") {
      breadcrumbItems.push({
        title: "Settings",
        url: "/settings",
      });
    }

    // Try to match this page
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
  // 3) STATIC ROUTES FROM NAVIGATION_DATA
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
      // Anything else → fallback
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
