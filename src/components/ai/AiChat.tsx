"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  deriveTitle,
  loadStandaloneActiveId,
  loadStandaloneConversations,
  newConversation,
  newMessage,
  saveStandaloneActiveId,
  saveStandaloneConversations,
} from "@/lib/ai/storage";
import type { AiConversation, AiMessage } from "@/types/ai";
import AiConversationsList from "./AiConversationsList";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import EmptyChat from "./EmptyChat";

export default function AiChat() {
  const [conversations, setConversations] = useState<AiConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const convs = loadStandaloneConversations();
    const stored = loadStandaloneActiveId();
    setConversations(convs);
    setActiveId(
      stored && convs.some((c) => c.id === stored) ? stored : convs[0]?.id ?? null,
    );
    setHydrated(true);
  }, []);

  // Persist conversations
  useEffect(() => {
    if (!hydrated) return;
    saveStandaloneConversations(conversations);
  }, [conversations, hydrated]);

  // Persist active id
  useEffect(() => {
    if (!hydrated) return;
    saveStandaloneActiveId(activeId);
  }, [activeId, hydrated]);

  // Cancel stream on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const updateConv = useCallback(
    (convId: string, updater: (c: AiConversation) => AiConversation) => {
      setConversations((prev) =>
        prev
          .map((c) => (c.id === convId ? updater(c) : c))
          .sort((a, b) => b.updatedAt - a.updatedAt),
      );
    },
    [],
  );

  const runStream = useCallback(
    async (convId: string, history: AiMessage[]) => {
      const controller = new AbortController();
      abortRef.current = controller;
      setIsStreaming(true);

      try {
        const apiMessages = history
          .filter((m) => m.content.trim().length > 0)
          .map((m) => ({ role: m.role, content: m.content }));

        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages, mode: "general" }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          let errMsg = `AI request failed (${res.status})`;
          try {
            const j = await res.json();
            if (j?.error) errMsg = String(j.error);
          } catch {}
          throw new Error(errMsg);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let acc = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let nl: number;
          while ((nl = buffer.indexOf("\n")) !== -1) {
            const line = buffer.slice(0, nl).trim();
            buffer = buffer.slice(nl + 1);
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            try {
              const json = JSON.parse(data);
              const delta: string | undefined =
                json?.choices?.[0]?.delta?.content;
              if (delta) {
                acc += delta;
                updateConv(convId, (c) => {
                  const msgs = [...c.messages];
                  const last = msgs[msgs.length - 1];
                  if (last && last.role === "assistant") {
                    msgs[msgs.length - 1] = { ...last, content: acc };
                  }
                  return { ...c, messages: msgs, updatedAt: Date.now() };
                });
              }
            } catch {
              // ignore malformed chunk
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        console.error("AI stream error:", err);
        const message =
          err instanceof Error ? err.message : "AI request failed";
        updateConv(convId, (c) => {
          const msgs = [...c.messages];
          const last = msgs[msgs.length - 1];
          if (last && last.role === "assistant" && !last.content) {
            msgs[msgs.length - 1] = { ...last, content: `⚠ ${message}` };
          } else {
            msgs.push(newMessage("assistant", `⚠ ${message}`));
          }
          return { ...c, messages: msgs, updatedAt: Date.now() };
        });
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [updateConv],
  );

  const handleNew = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
    const conv = newConversation();
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
  }, []);

  const handleSelect = useCallback(
    (id: string) => {
      if (id === activeId) return;
      abortRef.current?.abort();
      abortRef.current = null;
      setIsStreaming(false);
      setActiveId(id);
    },
    [activeId],
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (id === activeId) {
        abortRef.current?.abort();
        abortRef.current = null;
        setIsStreaming(false);
      }
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id);
        if (id === activeId) setActiveId(next[0]?.id ?? null);
        return next;
      });
    },
    [activeId],
  );

  const handleSend = useCallback(
    (text: string) => {
      if (isStreaming) return;
      let convId = activeId;
      let isNewConv = false;

      if (!convId) {
        const conv = newConversation();
        convId = conv.id;
        isNewConv = true;
        setConversations((prev) => [conv, ...prev]);
        setActiveId(conv.id);
      }

      const userMsg = newMessage("user", text);
      const assistantMsg = newMessage("assistant", "");

      let nextHistory: AiMessage[] = [];
      setConversations((prev) =>
        prev
          .map((c) => {
            if (c.id !== convId) return c;
            const titleNeedsUpdate =
              c.messages.length === 0 || c.title === "New chat";
            const next = {
              ...c,
              title: titleNeedsUpdate ? deriveTitle(text) : c.title,
              messages: [...c.messages, userMsg, assistantMsg],
              updatedAt: Date.now(),
            };
            nextHistory = next.messages;
            return next;
          })
          .sort((a, b) => b.updatedAt - a.updatedAt),
      );

      // If we just created a new conv but the setConversations above doesn't
      // see it yet (state batching), fall back to constructing the history manually.
      if (isNewConv && nextHistory.length === 0) {
        nextHistory = [userMsg, assistantMsg];
      }

      runStream(convId, nextHistory);
    },
    [activeId, isStreaming, runStream],
  );

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  }, []);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  return (
    <div className="flex h-[calc(100dvh-5rem)] w-full overflow-hidden rounded-2xl border bg-background">
      <AiConversationsList
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelect}
        onNew={handleNew}
        onDelete={handleDelete}
        disabled={isStreaming}
      />

      <main className="flex-1 flex flex-col min-w-0">
        {active && active.messages.length > 0 ? (
          <ChatMessages messages={active.messages} streaming={isStreaming} />
        ) : (
          <EmptyChat onPickPrompt={handleSend} />
        )}

        <ChatInput
          onSend={handleSend}
          onStop={handleStop}
          isStreaming={isStreaming}
        />
      </main>
    </div>
  );
}
