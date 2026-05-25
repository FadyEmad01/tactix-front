import type { AiConversation, AiMessage } from "@/types/ai";

const CONVS_KEY = (boardId: string) => `tactix-board-ai-conv-${boardId}`;
const ACTIVE_KEY = (boardId: string) => `tactix-board-ai-active-${boardId}`;
const COLLAPSED_KEY = "tactix-board-ai-panel-collapsed";

// Standalone /ai page storage (global, not per-board)
const STANDALONE_CONVS_KEY = "tactix-ai-conversations";
const STANDALONE_ACTIVE_KEY = "tactix-ai-active";

function makeId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function newMessage(
  role: AiMessage["role"],
  content: string,
): AiMessage {
  return {
    id: makeId("msg"),
    role,
    content,
    createdAt: Date.now(),
  };
}

export function newConversation(): AiConversation {
  const now = Date.now();
  return {
    id: makeId("conv"),
    title: "New chat",
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function loadBoardConversations(boardId: string): AiConversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CONVS_KEY(boardId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return (parsed as AiConversation[]).sort(
      (a, b) => b.updatedAt - a.updatedAt,
    );
  } catch {
    return [];
  }
}

export function saveBoardConversations(
  boardId: string,
  conversations: AiConversation[],
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CONVS_KEY(boardId), JSON.stringify(conversations));
  } catch (err) {
    console.error("Failed to save board conversations", err);
  }
}

export function loadActiveConvId(boardId: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_KEY(boardId));
}

export function saveActiveConvId(boardId: string, id: string | null): void {
  if (typeof window === "undefined") return;
  if (id) localStorage.setItem(ACTIVE_KEY(boardId), id);
  else localStorage.removeItem(ACTIVE_KEY(boardId));
}

export function deriveTitle(firstMessage: string): string {
  // Strip markdown JSON blocks for cleaner titles
  const stripped = firstMessage
    .replace(/```[\s\S]*?```/g, "")
    .trim()
    .replace(/\s+/g, " ");
  if (stripped.length <= 40) return stripped || "New chat";
  return stripped.slice(0, 40) + "…";
}

// --- Standalone /ai page (global) ---

export function loadStandaloneConversations(): AiConversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STANDALONE_CONVS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return (parsed as AiConversation[]).sort(
      (a, b) => b.updatedAt - a.updatedAt,
    );
  } catch {
    return [];
  }
}

export function saveStandaloneConversations(
  conversations: AiConversation[],
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STANDALONE_CONVS_KEY, JSON.stringify(conversations));
  } catch (err) {
    console.error("Failed to save AI conversations", err);
  }
}

export function loadStandaloneActiveId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STANDALONE_ACTIVE_KEY);
}

export function saveStandaloneActiveId(id: string | null): void {
  if (typeof window === "undefined") return;
  if (id) localStorage.setItem(STANDALONE_ACTIVE_KEY, id);
  else localStorage.removeItem(STANDALONE_ACTIVE_KEY);
}

export function loadPanelCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(COLLAPSED_KEY) === "1";
}

export function savePanelCollapsed(collapsed: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(COLLAPSED_KEY, collapsed ? "1" : "0");
}
