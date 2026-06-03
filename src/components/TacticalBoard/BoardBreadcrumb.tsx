'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Folder, Tag } from 'lucide-react';
import { fetchMatchById } from '@/lib/match/actions';
import { fetchPanels } from '@/lib/panel/panel-actions';
import { decodeBoardName, getBoardName } from '@/lib/board-name';

interface BoardBreadcrumbProps {
  boardId: string;
  boardName: string;
  linkedMatchId?: string;
  linkedTagId?: string;
}

export function BoardBreadcrumb({ boardName, linkedMatchId, linkedTagId }: BoardBreadcrumbProps) {
  const [linkInfo, setLinkInfo] = useState<{
    projectId: string;
    projectName: string;
    tagId: string;
    tagName: string;
  } | null>(null);

  const decodedName = decodeBoardName(boardName);
  const displayName = getBoardName(boardName);

  useEffect(() => {
    const matchId = linkedMatchId || decodedName.matchId;
    const tagId = linkedTagId || decodedName.tagId;
    if (!matchId || !tagId) {
      setLinkInfo(null);
      return;
    }

    (async () => {
      const match = await fetchMatchById(matchId);
      if (!match) return;

      const panels = await fetchPanels();
      const panel = panels.find(p => p.id === tagId);

      if (panel) {
        setLinkInfo({
          projectId: matchId,
          projectName: match.name,
          tagId,
          tagName: panel.title,
        });
      } else {
        const backendTag = match.tags?.find(t => t._id === tagId);
        if (backendTag) {
          setLinkInfo({
            projectId: matchId,
            projectName: match.name,
            tagId,
            tagName: backendTag.event,
          });
        }
      }
    })();
  }, [linkedMatchId, linkedTagId, decodedName.matchId, decodedName.tagId]);

  if (!linkInfo) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
          Individual Board
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400">
        Linked Board
      </span>
      <span className="text-muted-foreground mx-0.5">·</span>
      <Link 
        href="/projects" 
        className="text-muted-foreground hover:text-foreground hover:underline"
      >
        Projects
      </Link>
      <ChevronRight className="size-3.5 text-muted-foreground" />
      <span className="text-muted-foreground flex items-center gap-1">
        <Folder className="size-3.5" />
        {linkInfo.projectName}
      </span>
      <ChevronRight className="size-3.5 text-muted-foreground" />
      <span className="text-muted-foreground flex items-center gap-1">
        <Tag className="size-3.5" />
        {linkInfo.tagName}
      </span>
      <ChevronRight className="size-3.5 text-muted-foreground" />
      <span className="font-medium text-foreground truncate max-w-[200px]">
        {displayName}
      </span>
    </div>
  );
}
