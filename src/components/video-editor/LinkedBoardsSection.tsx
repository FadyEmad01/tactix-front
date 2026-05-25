'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, LayoutGrid, ArrowUpRight } from 'lucide-react';
import { getBoardsByTag } from '@/lib/board-link/local-storage';
import { getBoardByIdAction } from '@/app/(dashboard)/board/actions';
import { Project as BoardProject } from '@/types/tactical-board';
import BoardPreview from '@/components/board/BoardPreview';

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
      const boardIds = getBoardsByTag(projectId, tagId);
      const boards = await Promise.all(
        boardIds.map(id => getBoardByIdAction(id))
      );
      setLinkedBoards(boards.filter(Boolean) as BoardProject[]);
    } catch (error) {
      console.error('Failed to load linked boards:', error);
    }
    setLoading(false);
  };

  const handleCreateBoard = () => {
    // Navigate to board creation with pre-filled link info
    sessionStorage.setItem('pendingBoardLink', JSON.stringify({
      projectId,
      tagId
    }));
    router.push('/board/new?linked=true');
  };

  const handleOpenBoard = (boardId: string) => {
    router.push(`/board/${boardId}`);
  };

  return (
    <div className="border rounded-lg bg-card p-3 mt-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <LayoutGrid className="size-4 text-muted-foreground" />
          <span className="font-medium text-sm">Linked Boards</span>
          <Badge variant="secondary" className="text-xs">
            {linkedBoards.length}
          </Badge>
        </div>
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-7 px-2"
          onClick={handleCreateBoard}
        >
          <Plus className="size-4 mr-1" />
          New
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-4 text-sm text-muted-foreground">
          Loading linked boards...
        </div>
      ) : linkedBoards.length === 0 ? (
        <div className="text-center py-4 text-sm text-muted-foreground">
          <p>No linked boards</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={handleCreateBoard}
          >
            Create linked board
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
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
                <p className="text-xs font-medium truncate">{board.name}</p>
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
