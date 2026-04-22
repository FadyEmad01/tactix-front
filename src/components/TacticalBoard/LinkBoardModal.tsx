'use client';

import { useState, useEffect } from 'react';
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
import { fetchMatches } from '@/lib/match/actions';
import { fetchPanels } from '@/lib/panel/panel-actions';
import { Project as MatchProject } from '@/types/match';
import { Panel } from '@/lib/panel/panel-actions';
import { saveBoardLink } from '@/lib/board-link/local-storage';

interface LinkBoardModalProps {
  boardId: string;
  boardName: string;
  isOpen: boolean;
  onClose: () => void;
  onLinked: () => void;
}

export function LinkBoardModal({ boardId, boardName, isOpen, onClose, onLinked }: LinkBoardModalProps) {
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [projects, setProjects] = useState<MatchProject[]>([]);
  const [panels, setPanels] = useState<Panel[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [matches, fetchedPanels] = await Promise.all([
        fetchMatches(),
        fetchPanels()
      ]);
      setProjects(matches);
      setPanels(fetchedPanels);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
    setLoading(false);
  };

  const handleLink = () => {
    if (!selectedProject || !selectedTag) return;
    
    // Save to localStorage
    saveBoardLink(boardId, selectedProject, selectedTag);
    
    // Reset and close
    setSelectedProject('');
    setSelectedTag('');
    onLinked();
    onClose();
  };

  const canLink = !!selectedProject && !!selectedTag;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Link Board to Project</DialogTitle>
          <DialogDescription>
            Link &quot;{boardName}&quot; to a project tag. This will convert it to a linked board.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
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
            <Label>Tag * <span className="text-red-500">Required</span></Label>
            <Select
              value={selectedTag}
              onValueChange={setSelectedTag}
              disabled={!selectedProject || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedProject ? "Select tag..." : "Select project first"} />
              </SelectTrigger>
              <SelectContent>
                {panels.map((panel) => (
                  <SelectItem key={panel.id} value={panel.id}>
                    {panel.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
