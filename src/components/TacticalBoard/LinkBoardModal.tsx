'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { fetchMatches, fetchMatchById } from '@/lib/match/actions';
import { Project as MatchProject, BackendTag } from '@/types/match';
import { updateBoardAction } from '@/app/(dashboard)/board/actions';
import { encodeBoardName, decodeBoardName } from '@/lib/board-name';

interface LinkBoardModalProps {
  boardId: string;
  boardName: string;
  isOpen: boolean;
  onClose: () => void;
  onLinked: (projectId: string, tagId: string) => void;
}

export function LinkBoardModal({ boardId, boardName, isOpen, onClose, onLinked }: LinkBoardModalProps) {
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [projects, setProjects] = useState<MatchProject[]>([]);
  const [matchTags, setMatchTags] = useState<BackendTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const matches = await fetchMatches();
      setProjects(matches);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('Failed to load projects. Check your connection and try again.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedProject('');
      setSelectedTag('');
      setMatchTags([]);
      loadProjects();
    }
  }, [isOpen, loadProjects]);

  // Fetch match tags when project is selected
  useEffect(() => {
    if (!selectedProject) {
      setMatchTags([]);
      setSelectedTag('');
      return;
    }

    const loadMatchTags = async () => {
      setLoadingTags(true);
      setSelectedTag('');
      try {
        const match = await fetchMatchById(selectedProject);
        setMatchTags(match?.tags || []);
      } catch (err) {
        console.error('Failed to load match tags:', err);
        setMatchTags([]);
      }
      setLoadingTags(false);
    };

    loadMatchTags();
  }, [selectedProject]);

  const handleLink = async () => {
    if (!selectedProject || !selectedTag) return;

    try {
      const decoded = decodeBoardName(boardName);
      const displayName = decoded.displayName || boardName;
      const encodedName = encodeBoardName(selectedProject, selectedTag, displayName);

      await updateBoardAction(boardId, {
        name: encodedName,
        linkedMatchId: selectedProject,
        linkedTagId: selectedTag,
        updatedAt: Date.now(),
      } as any);

      const projectId = selectedProject;
      const tagId = selectedTag;
      setSelectedProject('');
      setSelectedTag('');
      setMatchTags([]);
      onLinked(projectId, tagId);
      onClose();
    } catch (err) {
      console.error('Failed to link board:', err);
    }
  };

  const canLink = !!selectedProject && !!selectedTag;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Link Board to Project</DialogTitle>
          <DialogDescription>
            Link &quot;{decodeBoardName(boardName).displayName || boardName}&quot; to a project tag. This will convert it to a linked board.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-destructive text-sm">
              <AlertCircle className="size-4 shrink-0" />
              <span className="flex-1">{error}</span>
              <Button variant="ghost" size="sm" onClick={loadProjects} className="h-7 shrink-0">
                <RefreshCw className="size-3.5 mr-1" />
                Retry
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <Label>Project *</Label>
            <Select
              value={selectedProject}
              onValueChange={setSelectedProject}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project..." />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Match Tag * <span className="text-red-500">Required</span></Label>
            <Select
              value={selectedTag}
              onValueChange={setSelectedTag}
              disabled={!selectedProject || loadingTags}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedProject ? "Select match tag..." : "Select project first"} />
              </SelectTrigger>
              <SelectContent>
                {matchTags.length === 0 && !loadingTags ? (
                  <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                    <p>No tags found for this match.</p>
                    <p className="mt-1">Add tags in the video editor first.</p>
                  </div>
                ) : (
                  matchTags.map((tag) => (
                    <SelectItem key={tag._id} value={tag._id || ''}>
                      {tag.event} {tag.startTime ? `(${Math.floor(tag.startTime / 60)}:${String(Math.floor(tag.startTime % 60)).padStart(2, '0')})` : ''}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {loadingTags && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <RefreshCw className="size-3 animate-spin" />
                Loading tags...
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleLink} disabled={!canLink || loading}>
            Link Board
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
