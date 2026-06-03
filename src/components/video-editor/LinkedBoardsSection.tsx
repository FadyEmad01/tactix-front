'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, LayoutGrid, ArrowUpRight } from 'lucide-react';
import { getBoardsAction } from '@/app/(dashboard)/board/actions';
import { Project as BoardProject } from '@/types/tactical-board';
import BoardPreview from '@/components/board/BoardPreview';
import { decodeBoardName, getBoardName, isBoardLinked as isBoardLinkedHelper } from '@/lib/board-name';

interface LinkedBoardsSectionProps {
  projectId: string;
  tagId: string;
}

export function LinkedBoardsSection({ projectId, tagId }: LinkedBoardsSectionProps) {
  const router = useRouter();
  const [linkedBoards, setLinkedBoards] = useState<BoardProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLinkedBoards();
  }, [projectId, tagId]);

  const loadLinkedBoards = async () => {
    setLoading(true);
    try {
      const allBoards = await getBoardsAction();
      const boards = allBoards.filter((b: BoardProject) => {
        const decoded = decodeBoardName(b.name ?? '');
        return (
          (b.linkedMatchId === projectId && b.linkedTagId === tagId) ||
          (decoded.matchId === projectId && decoded.tagId === tagId)
        );
      });
      setLinkedBoards(boards);
    } catch (error) {
      console.error('Failed to load linked boards:', error);
    }
    setLoading(false);
  };

  const handleCreateBoard = () => {
    router.push('/board');
  };

  const handleOpenBoard = (boardId: string) => {
    router.push(`/board/${boardId}`);
  };

  return (
    <div className="border rounded-lg bg-card p-3 mt-3 @container">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <LayoutGrid className="size-4 text-muted-foreground shrink-0" />
          <span className="font-medium text-sm hidden @[220px]:inline">Linked Boards</span>
          <span className="font-medium text-sm inline @[220px]:hidden">Boards</span>
          <Badge variant="secondary" className="text-xs px-1.5 py-0">
            {linkedBoards.length}
          </Badge>
        </div>
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-7 @[220px]:px-2 px-1 shrink-0"
          onClick={handleCreateBoard}
        >
          <Plus className="size-4 @[220px]:mr-1 mr-0" />
          <span className="hidden @[220px]:inline">New</span>
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-4 text-sm text-muted-foreground">
          Loading linked boards...
        </div>
      ) : linkedBoards.length === 0 ? (
        <div className="text-center py-4 text-sm text-muted-foreground">
          <p className="text-xs">No linked boards</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 text-xs"
            onClick={handleCreateBoard}
          >
            Create board
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 @[240px]:grid-cols-2 gap-2">
          {linkedBoards.map((board) => (
            <div
              key={board.id}
              onClick={() => handleOpenBoard(board.id)}
              className="cursor-pointer border rounded-md overflow-hidden hover:border-primary transition group"
            >
              <div className="h-16 bg-muted">
                <BoardPreview project={board} />
              </div>
              <div className="p-2">
                <p className="text-xs font-medium truncate">{getBoardName(board.name)}</p>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition">
                  <span>Open board</span>
                  <ArrowUpRight className="size-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
