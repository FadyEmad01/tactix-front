"use client";

import React, { memo } from "react";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
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

export default memo(function BoardConversationsList({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  disabled,
}: Props) {
  return (
    <aside className="flex flex-col w-44 shrink-0 border-r border-gray-700 bg-gray-900/40">
      <div className="p-2 border-b border-gray-700">
        <Button
          onClick={onNew}
          disabled={disabled}
          variant="outline"
          size="sm"
          className="w-full justify-start gap-1.5 h-8 text-xs bg-transparent border-gray-700 text-gray-200 hover:bg-gray-800 hover:text-white"
        >
          <Plus className="w-3.5 h-3.5" />
          New chat
        </Button>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-1.5">
          {conversations.length === 0 ? (
            <div className="text-center text-[11px] text-gray-500 px-2 py-6">
              No conversations
            </div>
          ) : (
            <ul className="space-y-0.5">
              {conversations.map((c) => {
                const isActive = c.id === activeId;
                return (
                  <li key={c.id} className="group/item">
                    <button
                      onClick={() => onSelect(c.id)}
                      className={cn(
                        "w-full flex items-start gap-1.5 rounded-md px-1.5 py-1.5 text-left transition-colors",
                        isActive
                          ? "bg-primary/15 text-white"
                          : "text-gray-300 hover:bg-gray-800",
                      )}
                    >
                      <MessageSquare
                        className={cn(
                          "w-3 h-3 mt-0.5 shrink-0",
                          isActive ? "text-primary" : "text-gray-500",
                        )}
                      />
                      <span className="flex-1 min-w-0 text-[11px] leading-tight line-clamp-2">
                        {c.title}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(c.id);
                        }}
                        className="opacity-0 group-hover/item:opacity-100 hover:text-destructive transition-opacity shrink-0"
                        aria-label="Delete chat"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
});
