'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Folder, Tag } from 'lucide-react';
import { getBoardLink } from '@/lib/board-link/local-storage';
import { fetchMatchById } from '@/lib/match/actions';
import { fetchPanels } from '@/lib/panel/panel-actions';

interface BoardBreadcrumbProps {
  boardId: string;
  boardName: string;
}

export function BoardBreadcrumb({ boardId, boardName }: BoardBreadcrumbProps) {
  const [linkInfo, setLinkInfo] = useState<{
    projectId: string;
    projectName: string;
    tagId: string;
    tagName: string;
  } | null>(null);

  useEffect(() => {
    const link = getBoardLink(boardId);
    if (link) {
      Promise.all([
        fetchMatchById(link.projectId),
        fetchPanels().then(panels => panels.find(p => p.id === link.tagId))
      ]).then(([match, panel]) => {
        if (match && panel) {
          setLinkInfo({
            projectId: link.projectId,
            projectName: match.name,
            tagId: link.tagId,
            tagName: panel.title
          });
        }
      });
    }
  }, [boardId]);

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
        {boardName}
      </span>
    </div>
  );
}
