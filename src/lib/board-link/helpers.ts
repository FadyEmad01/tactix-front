'use client';

import { fetchPanels } from '@/lib/panel/panel-actions';
import { fetchMatchById } from '@/lib/match/actions';
import { getBoardLink } from './local-storage';

// Cache for panel data
let panelsCache: { id: string; title: string; tags: string[] }[] | null = null;

export async function getTagDisplayName(projectId: string, tagId: string): Promise<string> {
  // tagId in this context is actually the panel ID
  // We need to find which panel contains this tag
  if (!panelsCache) {
    panelsCache = await fetchPanels();
  }
  
  const panel = panelsCache.find(p => p.id === tagId);
  return panel?.title || 'Unknown Tag';
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
