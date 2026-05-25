"use client";

import type { ReactNode } from "react";

/**
 * LandingThemeWrapper forces Phosphor light theme CSS variables
 * locally for the landing page, overriding any globally applied
 * user-selected theme from the dashboard.
 */
export function LandingThemeWrapper({ children }: { children: ReactNode }) {
  const phosphorVars: React.CSSProperties = {
    "--background": "#fbfcf8",
    "--foreground": "#0f172a",
    "--card": "#ffffff",
    "--card-foreground": "#0f172a",
    "--popover": "#ffffff",
    "--popover-foreground": "#0f172a",
    "--primary": "#aff33e",
    "--primary-foreground": "#000000",
    "--secondary": "#334155",
    "--secondary-foreground": "#f8fafc",
    "--muted": "#f1f5f9",
    "--muted-foreground": "#64748b",
    "--accent": "#f0fdf4",
    "--accent-foreground": "#166534",
    "--destructive": "#ef4444",
    "--destructive-foreground": "#ffffff",
    "--border": "#e2e8f0",
    "--input": "#e2e8f0",
    "--ring": "#aff33e",
    "--chart-1": "#aff33e",
    "--chart-2": "#334155",
    "--chart-3": "#22c55e",
    "--chart-4": "#64748b",
    "--chart-5": "#94a3b8",
    "--sidebar": "#ffffff",
    "--sidebar-foreground": "#0f172a",
    "--sidebar-primary": "#aff33e",
    "--sidebar-primary-foreground": "#000000",
    "--sidebar-accent": "#f8fafc",
    "--sidebar-accent-foreground": "#0f172a",
    "--sidebar-border": "#f1f5f9",
    "--sidebar-ring": "#aff33e",
    "--phosphor": "#aff33e",
    "--radius": "0.625rem",
  } as React.CSSProperties;

  return (
    <div style={phosphorVars} className="bg-[#fbfcf8] text-[#0f172a]">
      {children}
    </div>
  );
}
