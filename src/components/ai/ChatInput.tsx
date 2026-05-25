"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowUp, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (text: string) => void;
  onStop?: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export default function ChatInput({
  onSend,
  onStop,
  isStreaming,
  disabled,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow up to a max
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }, [value]);

  const submit = () => {
    const text = value.trim();
    if (!text || isStreaming || disabled) return;
    onSend(text);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="px-4 pb-4 pt-2">
      <div className="mx-auto max-w-3xl">
        <div
          className={cn(
            "relative rounded-2xl border bg-card shadow-sm transition-shadow focus-within:shadow-md focus-within:border-primary/40",
          )}
        >
          <textarea
            ref={taRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Ask anything tactical — formations, pressing, set pieces…"
            disabled={disabled}
            className="w-full resize-none bg-transparent px-4 py-3.5 pr-14 text-sm leading-relaxed outline-none placeholder:text-muted-foreground/65 disabled:opacity-50"
          />
          <div className="absolute right-2 bottom-2">
            {isStreaming ? (
              <Button
                onClick={onStop}
                size="icon"
                variant="default"
                className="rounded-full size-9"
                aria-label="Stop generating"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </Button>
            ) : (
              <Button
                onClick={submit}
                disabled={!value.trim() || disabled}
                size="icon"
                variant="default"
                className="rounded-full size-9 disabled:opacity-40"
                aria-label="Send message"
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground/65">
          AI can make mistakes. Verify tactical advice before applying.
        </p>
      </div>
    </div>
  );
}
