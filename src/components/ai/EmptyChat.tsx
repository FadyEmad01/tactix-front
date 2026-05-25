"use client";

import React from "react";
import { Compass, ShieldCheck, Sparkles, Target } from "lucide-react";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  {
    icon: Compass,
    title: "Build-up shapes",
    prompt:
      "Explain the difference between a 3-2 and a 2-3 build-up against a 4-4-2 mid-block.",
  },
  {
    icon: ShieldCheck,
    title: "Pressing scheme",
    prompt:
      "How should I structure a high press from a 4-3-3 against a back four that splits wide?",
  },
  {
    icon: Target,
    title: "Set-piece routine",
    prompt:
      "Suggest an attacking corner routine that exploits a zonal defence at the near post.",
  },
];

interface EmptyChatProps {
  onPickPrompt: (text: string) => void;
}

export default function EmptyChat({ onPickPrompt }: EmptyChatProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-12 lg:py-20">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="size-12 rounded-2xl border bg-card flex items-center justify-center mb-4 text-primary">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Tactical AI Assistant
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            Ask about formations, pressing schemes, set pieces, build-up patterns,
            or paste a play description for analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.title}
              onClick={() => onPickPrompt(s.prompt)}
              className={cn(
                "text-left rounded-xl border bg-card p-4 transition-all",
                "hover:border-primary/40 hover:shadow-sm hover:bg-accent/40",
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <s.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{s.title}</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-3">
                {s.prompt}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
