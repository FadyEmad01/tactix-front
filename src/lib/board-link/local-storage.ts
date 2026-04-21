'use client';

import { BoardLink } from '@/types/board-link';

const STORAGE_KEY = 'tactix-board-links-v1';

export function getBoardLinks(): BoardLink[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return parsed.links || [];
  } catch {
    return [];
  }
}

export function saveBoardLink(boardId: string, projectId: string, tagId: string): void {
  const links = getBoardLinks();
  // Remove existing link for this board
  const filtered = links.filter(l => l.boardId !== boardId);
  // Add new link
  filtered.push({ 
    boardId, 
    projectId, 
    tagId, 
    linkedAt: Date.now() 
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ links: filtered }));
}

export function getBoardLink(boardId: string): BoardLink | null {
  return getBoardLinks().find(l => l.boardId === boardId) || null;
}

export function getBoardsByTag(projectId: string, tagId: string): string[] {
  return getBoardLinks()
    .filter(l => l.projectId === projectId && l.tagId === tagId)
    .map(l => l.boardId);
}

export function getBoardsByProject(projectId: string): string[] {
  return getBoardLinks()
    .filter(l => l.projectId === projectId)
    .map(l => l.boardId);
}

export function unlinkBoard(boardId: string): void {
  const links = getBoardLinks().filter(l => l.boardId !== boardId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ links }));
}

export function isBoardLinked(boardId: string): boolean {
  return getBoardLinks().some(l => l.boardId === boardId);
}

// Get board display info with link metadata
export function getBoardLinkInfo(boardId: string): BoardLink | null {
  return getBoardLink(boardId);
}
