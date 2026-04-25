"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Project } from "@/types/tactical-board";
import type { AiConversation, AiMessage } from "@/types/ai";
import {
  deriveTitle,
  loadActiveConvId,
  loadBoardConversations,
  loadPanelCollapsed,
  newConversation,
  newMessage,
  saveActiveConvId,
  saveBoardConversations,
  savePanelCollapsed,
} from "@/lib/ai/storage";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import BoardConversationsList from "./BoardConversationsList";

interface BoardAiPanelProps {
  boardId: string;
  project: Project;
}

function buildInitialUserMessage(project: Project): string {
  const json = JSON.stringify(project, null, 2);
  return [
    "Here's the tactical board JSON I'm working on:",
    "",
    "```json",
    json,
    "```",
    "",
    "Please analyze this setup — formations, defensive/offensive shape, weaknesses, and tactical opportunities I should consider.",
  ].join("\n");
}

export default function BoardAiPanel({ boardId, project }: BoardAiPanelProps) {
  const [conversations, setConversations] = useState<AiConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const projectRef = useRef(project);
  projectRef.current = project;

  // Hydrate from storage on mount / boardId change
  useEffect(() => {
    const convs = loadBoardConversations(boardId);
    const stored = loadActiveConvId(boardId);
    setConversations(convs);
    setActiveId(stored && convs.some((c) => c.id === stored) ? stored : convs[0]?.id ?? null);
    setCollapsed(loadPanelCollapsed());
    setHydrated(true);
  }, [boardId]);

  // Persist conversations
  useEffect(() => {
    if (!hydrated) return;
    saveBoardConversations(boardId, conversations);
  }, [boardId, conversations, hydrated]);

  // Persist active conv id
  useEffect(() => {
    if (!hydrated) return;
    saveActiveConvId(boardId, activeId);
  }, [boardId, activeId, hydrated]);

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
          body: JSON.stringify({ messages: apiMessages }),
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

  const handleNewChat = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);

    const userMsg = newMessage(
      "user",
      buildInitialUserMessage(projectRef.current),
    );
    const assistantMsg = newMessage("assistant", "");
    const conv: AiConversation = {
      ...newConversation(),
      title: deriveTitle(`Tactical board — ${projectRef.current.name || "Untitled"}`),
      messages: [userMsg, assistantMsg],
      updatedAt: Date.now(),
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    runStream(conv.id, [userMsg, assistantMsg]);
  }, [runStream]);

  // If after hydration there are no conversations, auto-create the first one
  useEffect(() => {
    if (!hydrated) return;
    if (conversations.length > 0) return;
    handleNewChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

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
      if (!convId) {
        // safety net — create a new conv if none active
        const conv = newConversation();
        setConversations((prev) => [conv, ...prev]);
        setActiveId(conv.id);
        convId = conv.id;
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

      runStream(convId, nextHistory);
    },
    [activeId, isStreaming, runStream],
  );

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      savePanelCollapsed(next);
      return next;
    });
  };

  if (collapsed) {
    return (
      <div className="hidden md:flex w-12 flex-col items-center border-l border-gray-700 bg-gray-800 py-3 gap-2">
        <button
          onClick={toggleCollapsed}
          className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition"
          title="Open AI Assistant"
          aria-label="Open AI Assistant"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="size-8 rounded-md bg-primary/15 text-primary flex items-center justify-center">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>
    );
  }

  const active = conversations.find((c) => c.id === activeId) ?? null;

  return (
    <aside className="hidden md:flex w-[28rem] lg:w-[32rem] flex-shrink-0 flex-col border-l border-gray-700 bg-gray-900">
      <header className="flex items-center justify-between px-3 py-2.5 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-7 rounded-md bg-primary/15 text-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white leading-tight">
              AI Tactical Assistant
            </div>
            <div className="text-[11px] text-gray-400 leading-tight truncate">
              gemini-2.5-flash
            </div>
          </div>
        </div>
        <Button
          onClick={toggleCollapsed}
          variant="ghost"
          size="icon"
          className="size-7 text-gray-300 hover:text-white hover:bg-gray-700"
          title="Collapse panel"
          aria-label="Collapse panel"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </header>

      <div className="flex flex-1 min-h-0 bg-background text-foreground">
        <BoardConversationsList
          conversations={conversations}
          activeId={activeId}
          onSelect={handleSelect}
          onNew={handleNewChat}
          onDelete={handleDelete}
          disabled={isStreaming}
        />

        <div className={cn("flex-1 min-w-0 flex flex-col")}>
          <ChatMessages
            messages={active?.messages ?? []}
            streaming={isStreaming}
          />
          <ChatInput
            onSend={handleSend}
            onStop={handleStop}
            isStreaming={isStreaming}
          />
        </div>
      </div>
    </aside>
  );
}
