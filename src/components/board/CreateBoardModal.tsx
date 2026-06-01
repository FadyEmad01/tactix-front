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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { fetchMatches, fetchMatchById } from '@/lib/match/actions';
import { Project as MatchProject, BackendTag } from '@/types/match';
import { BoardType } from '@/types/board-link';

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, boardType: BoardType, projectId?: string, tagId?: string) => void;
}

export function CreateBoardModal({ isOpen, onClose, onCreate }: CreateBoardModalProps) {
  const [name, setName] = useState('');
  const [boardType, setBoardType] = useState<BoardType>('individual');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [projects, setProjects] = useState<MatchProject[]>([]);
  const [matchTags, setMatchTags] = useState<BackendTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);

  useEffect(() => {
    if (isOpen && boardType === 'linked') {
      loadProjects();
    }
  }, [isOpen, boardType]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const matches = await fetchMatches();
      setProjects(matches);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
    setLoading(false);
  };

  // Fetch match tags when project is selected
  useEffect(() => {
    if (boardType !== 'linked' || !selectedProject) {
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
  }, [selectedProject, boardType]);

  const handleCreate = () => {
    if (!name.trim()) return;
    
    if (boardType === 'linked') {
      if (!selectedProject || !selectedTag) return;
      onCreate(name.trim(), 'linked', selectedProject, selectedTag);
    } else {
      onCreate(name.trim(), 'individual');
    }
    
    // Reset form
    setName('');
    setBoardType('individual');
    setSelectedProject('');
    setSelectedTag('');
    onClose();
  };

  const canCreate = () => {
    if (!name.trim()) return false;
    if (boardType === 'linked') {
      return !!selectedProject && !!selectedTag;
    }
    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Board</DialogTitle>
          <DialogDescription>
            Create a tactical board for match analysis.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Board Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Board Name</Label>
            <Input
              id="name"
              placeholder="Enter board name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Board Type Selection */}
          <div className="space-y-3">
            <Label>Board Type</Label>
            <RadioGroup
              value={boardType}
              onValueChange={(v) => setBoardType(v as BoardType)}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="individual" id="individual" />
                <Label htmlFor="individual" className="cursor-pointer">
                  <div className="font-medium">Individual</div>
                  <div className="text-xs text-muted-foreground">Standalone board</div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="linked" id="linked" />
                <Label htmlFor="linked" className="cursor-pointer">
                  <div className="font-medium">Linked</div>
                  <div className="text-xs text-muted-foreground">Connected to project</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Linked Board Options */}
          {boardType === 'linked' && (
            <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
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
                <Label>Match Tag * <span className="text-xs text-red-500">(Required)</span></Label>
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
                  <p className="text-xs text-muted-foreground animate-pulse">
                    Loading tags...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!canCreate()}>
            Create Board
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
