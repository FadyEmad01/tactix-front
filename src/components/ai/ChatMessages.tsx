"use client";

import React, { useEffect, useRef } from "react";
import { Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AiMessage } from "@/types/ai";

interface ChatMessagesProps {
  messages: AiMessage[];
  streaming: boolean;
  /** When streaming, the last message is the assistant's in-progress text */
}

export default function ChatMessages({ messages, streaming }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages or streaming chunks
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, streaming]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        {messages.map((m, i) => {
          const isLast = i === messages.length - 1;
          const isStreamingThis = streaming && isLast && m.role === "assistant";
          return (
            <MessageBubble
              key={m.id}
              message={m}
              isStreaming={isStreamingThis}
            />
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  isStreaming,
}: {
  message: AiMessage;
  isStreaming: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "shrink-0 flex items-center justify-center size-8 rounded-full border",
          isUser
            ? "bg-primary text-primary-foreground border-transparent"
            : "bg-card text-primary",
        )}
        aria-hidden="true"
      >
        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      </div>

      <div
        className={cn(
          "min-w-0 max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-muted/60 text-foreground rounded-tl-sm",
        )}
      >
        {message.content ? (
          <div className="whitespace-pre-wrap break-words">
            {message.content}
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 ml-0.5 align-middle bg-current opacity-70 animate-pulse" />
            )}
          </div>
        ) : isStreaming ? (
          <TypingIndicator />
        ) : null}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <span className="inline-flex gap-1 py-1">
      <span className="size-1.5 rounded-full bg-current/60 animate-bounce [animation-delay:-0.3s]" />
      <span className="size-1.5 rounded-full bg-current/60 animate-bounce [animation-delay:-0.15s]" />
      <span className="size-1.5 rounded-full bg-current/60 animate-bounce" />
    </span>
  );
}
