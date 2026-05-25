"use client";

import { useCallback, useState } from "react";
import { Check, ChevronDown, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useThemePreset } from "@/provider/theme-preset-provider";
import type { ThemePreset } from "@/types/editor";

function ColorSwatches({ theme }: { theme: ThemePreset }) {
  const light = theme.styles.light;
  const colors = [
    light.primary,
    light.secondary,
    light.background,
    light.foreground,
    light.accent,
  ];

  return (
    <div className="flex items-center gap-0.5">
      {colors.map((color, i) => (
        <div
          key={i}
          className="w-4 h-4 rounded-sm border border-black/10"
          style={{ backgroundColor: color }}
          title={`${theme.name} color ${i + 1}`}
        />
      ))}
    </div>
  );
}

export function ThemePresetSelect() {
  const { themes, activeThemeId, setThemePreset, activeTheme } = useThemePreset();
  const [open, setOpen] = useState(false);

  const handleSelect = useCallback(
    (themeId: string) => {
      setThemePreset(themeId);
      setOpen(false);
    },
    [setThemePreset]
  );

  return (
    <div className="flex w-auto">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="justify-between h-auto"
          >
            <div className="flex items-center gap-3">
              <ColorSwatches theme={activeTheme} />
              <span className="text-sm font-medium">{activeTheme.name}</span>
            </div>
            <ChevronDown className="size-4 text-muted-foreground shrink-0" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[300px] p-1" align="start">
          <div className="space-y-0.5">
            {themes.map((theme) => {
              const isActive = activeThemeId === theme.id;

              return (
                <button
                  key={theme.id}
                  onClick={() => handleSelect(theme.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50"
                  )}
                >
                  <ColorSwatches theme={theme} />
                  <span className="text-sm font-medium flex-1">{theme.name}</span>
                  {isActive && (
                    <Check className="size-4 text-primary shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
