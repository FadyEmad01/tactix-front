"use client";

import React, { memo, useCallback, useState } from "react";
import { MessageSquare, Plus, Trash2, PanelLeft } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { AiConversation } from "@/types/ai";

interface Props {
  conversations: AiConversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  disabled?: boolean;
}

function groupByDate(conversations: AiConversation[]) {
  const today: AiConversation[] = [];
  const yesterday: AiConversation[] = [];
  const previous: AiConversation[] = [];
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;

  for (const c of conversations) {
    if (c.updatedAt >= startOfToday) today.push(c);
    else if (c.updatedAt >= startOfYesterday) yesterday.push(c);
    else previous.push(c);
  }
  return { today, yesterday, previous };
}

export default memo(function AiConversationsList({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const groups = groupByDate(conversations);

  const handleSelect = useCallback(
    (id: string) => {
      onSelect(id);
      setOpen(false);
    },
    [onSelect],
  );

  const handleNew = useCallback(() => {
    onNew();
    setOpen(false);
  }, [onNew]);

  const content = (
    <>
      <div className="p-3 border-b">
        <Button
          onClick={handleNew}
          disabled={disabled}
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 font-medium"
        >
          <Plus className="w-4 h-4" />
          New chat
        </Button>
      </div>

      <div className="min-h-0">
        <div className="p-2 space-y-4 w-full overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="text-center text-xs text-muted-foreground p-6">
              No conversations yet
            </div>
          ) : (
            <>
              {groups.today.length > 0 && (
                <Group
                  label="Today"
                  items={groups.today}
                  activeId={activeId}
                  onSelect={handleSelect}
                  onDelete={onDelete}
                />
              )}
              {groups.yesterday.length > 0 && (
                <Group
                  label="Yesterday"
                  items={groups.yesterday}
                  activeId={activeId}
                  onSelect={handleSelect}
                  onDelete={onDelete}
                />
              )}
              {groups.previous.length > 0 && (
                <Group
                  label="Previous"
                  items={groups.previous}
                  activeId={activeId}
                  onSelect={handleSelect}
                  onDelete={onDelete}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* <aside className="hidden md:flex flex-col h-full w-64 lg:w-72 shrink-0 border-r bg-card/40">
        {content}
      </aside> */}
      <aside className="hidden md:flex flex-col h-full border-r bg-card/40">
        {content}
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden absolute top-2 left-2 z-10 shadow-sm bg-background"
          >
            <PanelLeft className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-72 p-0 [&>button]:hidden flex flex-col"
        >
          {content}
        </SheetContent>
      </Sheet>
    </>
  );
});

function Group({
  label,
  items,
  activeId,
  onSelect,
  onDelete,
}: {
  label: string;
  items: AiConversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div>
      <div className="px-2 py-1 text-xs font-semibold text-muted-foreground/70">
        {label}
      </div>
      <ul className="space-y-0.5">
        {items.map((c) => {
          const isActive = c.id === activeId;
          return (
            <li key={c.id}>
              <button
                onClick={() => onSelect(c.id)}
                className={cn(
                  "group/item w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-left transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground font-medium"
                    : "hover:bg-accent/60 text-foreground/85",
                )}
              >
                <MessageSquare
                  className={cn(
                    "w-3.5 h-3.5 shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground/65",
                  )}
                />
                <span className="flex-1 truncate">{c.title}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(c.id);
                  }}
                  className="opacity-0 group-hover/item:opacity-100 max-md:opacity-100 hover:text-destructive transition-opacity shrink-0"
                  aria-label="Delete conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
