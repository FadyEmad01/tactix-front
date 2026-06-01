'use client';

import { fetchPanels } from '@/lib/panel/panel-actions';
import { fetchMatchById } from '@/lib/match/actions';
import { getBoardLink } from './local-storage';

// Cache for panel data
let panelsCache: { id: string; title: string; tags: string[] }[] | null = null;

export async function getTagDisplayName(projectId: string, tagId: string): Promise<string> {
  // Try panel lookup first (legacy links)
  if (!panelsCache) {
    panelsCache = await fetchPanels();
  }
  
  const panel = panelsCache.find(p => p.id === tagId);
  if (panel) return panel?.title || 'Unknown Tag';

  // Fallback: BackendTag lookup
  try {
    const match = await fetchMatchById(projectId);
    const backendTag = match?.tags?.find(t => t._id === tagId);
    if (backendTag) return backendTag.event;
  } catch {
    // ignore
  }

  return 'Unknown Tag';
}

export async function getProjectDisplayName(projectId: string): Promise<string> {
  try {
    const match = await fetchMatchById(projectId);
    return match?.name || 'Unknown Project';
  } catch {
    return 'Unknown Project';
  }
}

export async function getBoardLinkDisplay(boardId: string): Promise<{
  isLinked: boolean;
  projectName?: string;
  tagName?: string;
} | null> {
  const link = getBoardLink(boardId);
  if (!link) return { isLinked: false };
  
  const [projectName, tagName] = await Promise.all([
    getProjectDisplayName(link.projectId),
    getTagDisplayName(link.projectId, link.tagId)
  ]);
  
  return {
    isLinked: true,
    projectName,
    tagName
  };
}
