"use client";

import {
  Calendar as CalendarIcon,
  ChevronLeft,
  MoreHorizontal,
  ArrowDown01,
  Plus,
  Search,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { createMatch, deleteMatch, updateMatch } from "@/lib/match/actions";
import { Project } from "@/types/match";

interface MatchesDashboardProps {
  initialProjects?: Project[];
}

export default function MatchesDashboard({ initialProjects = [] }: MatchesDashboardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("createdAt-desc");

  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Keep local state in sync if server revalidates and passes new props
  useEffect(() => {
    if (initialProjects) {
      setProjects(initialProjects);
    }
  }, [initialProjects]);

  const handleCreateProject = async (projectData: Omit<Project, "id" | "createdAt">) => {
    try {
      const result = await createMatch({
        title: projectData.name,
        description: projectData.description,
        teamA: projectData.teamA,
        teamB: projectData.teamB,
        matchDate: projectData.matchDate,
        result: projectData.result,
      });

      if (!result || !result.success) {
        console.error("Failed to create match via server action");
        return;
      }

      // --- IMPROVED RESPONSE PARSING ---
      // This logic finds the actual match object whether it's directly returned,
      // wrapped in 'data', or inside an array.
      const rawResponse = result.data;
      let m: any = rawResponse;

      if (rawResponse) {
        if (Array.isArray(rawResponse)) {
          m = rawResponse[0];
        } else if (rawResponse.data) {
          m = rawResponse.data;
          // Handle double nesting { data: { data: ... } }
          if (m.data) m = m.data;
        } else if (rawResponse.match) {
          m = rawResponse.match;
        }
      }

      // Ensure we have a valid object before creating the project
      if (!m) {
        console.error("Could not extract match data from response:", rawResponse);
        return;
      }

      const newProject: Project = {
        id: m.id ?? m._id ?? String(Date.now()),
        name: m.title ?? projectData.name,
        description: m.description ?? projectData.description,
        teamA: m.teamA ?? projectData.teamA,
        teamB: m.teamB ?? projectData.teamB,
        result: m.result ?? projectData.result,
        matchDate: m.matchDate ?? projectData.matchDate,
        createdAt: m.createdAt ?? new Date().toISOString(),
      };

      setProjects((prev) => [newProject, ...prev]);
      router.refresh(); // Force Next.js to re-fetch server components to be safe
    } catch (error) {
      console.error("Failed to create match:", error);
    } finally {
      setIsCreateDialogOpen(false);
    }
  };

  const handleSelectProject = (projectId: string, checked: boolean) => {
    const newSelected = new Set(selectedProjects);
    if (checked) newSelected.add(projectId);
    else newSelected.delete(projectId);
    setSelectedProjects(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedProjects(new Set(filteredProjects.map((p) => p.id)));
    else setSelectedProjects(new Set());
  };

  const handleCancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedProjects(new Set());
  };

  const handleBulkDelete = async () => {
    setProjects(projects.filter((p) => !selectedProjects.has(p.id)));

    const idsToDelete = Array.from(selectedProjects);
    for (const id of idsToDelete) {
      await deleteMatch(id);
    }

    setSelectedProjects(new Set());
    setIsSelectionMode(false);
    setIsBulkDeleteDialogOpen(false);
  };

  const handleDeleteProject = async (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
    await deleteMatch(id);
  };

  // const handleUpdateProject = (id: string, updates: Partial<Project>) => {
  //   setProjects(projects.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  // };
  const handleUpdateProject = async (id: string, updates: Partial<Project>) => {
    try {
      // Optimistically update the UI first
      setProjects(projects.map((p) => (p.id === id ? { ...p, ...updates } : p)));

      // Prepare the payload for the backend
      const payload: Partial<{
        title: string;
        description?: string;
        teamA: string;
        teamB: string;
        matchDate?: string;
        result?: string;
      }> = {};

      // Map frontend field names to backend field names
      if (updates.name !== undefined) payload.title = updates.name;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.teamA !== undefined) payload.teamA = updates.teamA;
      if (updates.teamB !== undefined) payload.teamB = updates.teamB;
      if (updates.result !== undefined) payload.result = updates.result;
      if (updates.matchDate !== undefined) payload.matchDate = updates.matchDate;

      // Send to backend
      const result = await updateMatch(id, payload);

      if (!result.success) {
        console.error("Failed to update match:", result.error);
        // Optionally: revert the optimistic update or show an error message
        return;
      }

      router.refresh(); // Refresh server components
    } catch (error) {
      console.error("Error updating match:", error);
      // Optionally: revert the optimistic update or show an error message
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.teamA.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.teamB.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortOption === "createdAt-desc")
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortOption === "createdAt-asc")
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortOption === "name-asc") return a.name.localeCompare(b.name);
    if (sortOption === "name-desc") return b.name.localeCompare(a.name);
    return 0;
  });

  const allSelected = sortedProjects.length > 0 && selectedProjects.size === sortedProjects.length;
  const someSelected = selectedProjects.size > 0 && selectedProjects.size < sortedProjects.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="block md:hidden">
        {isSelectionMode ? (
          <div className="pt-6 px-6 flex items-center justify-between w-full h-16">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCancelSelection}>
                <X className="size-4" />
                Cancel
              </Button>

              {selectedProjects.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsBulkDeleteDialogOpen(true)}
                >
                  <Trash2 className="size-4" />
                  Delete ({selectedProjects.size})
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="pt-6 px-6 flex items-center justify-between w-full h-16">
              <div className="flex flex-wrap gap-2 md:hidden">
                <Button size="icon-sm" className="flex" onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="size-4" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsSelectionMode(true)}
                  disabled={projects.length === 0}
                >
                  Select Projects
                </Button>
              </div>
            </div>
          </>

        )}
      </div>



      <main className="max-w-7xl mx-auto px-6 pt-10 pb-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Match Analysis</h1>
            <p className="text-muted-foreground">
              {projects.length} {projects.length === 1 ? "match" : "matches"}
              {isSelectionMode && selectedProjects.size > 0 && (
                <span className="ml-2 text-primary">• {selectedProjects.size} selected</span>
              )}
            </p>
          </div>
          <div className="hidden md:block">
            {isSelectionMode ? (
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleCancelSelection}>
                  <X className="size-4" />
                  Cancel
                </Button>
                {selectedProjects.size > 0 && (
                  <Button
                    variant="destructive-outline"
                    onClick={() => setIsBulkDeleteDialogOpen(true)}
                  >
                    <Trash2 className="size-4" />
                    Delete Selected ({selectedProjects.size})
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsSelectionMode(true)}
                  disabled={projects.length === 0}
                >
                  Select Projects
                </Button>
                <CreateButton onClick={() => setIsCreateDialogOpen(true)} />
              </div>
            )}
          </div>
        </div>

        <div className="mb-12 flex items-center justify-between gap-4">
          <div className="flex-1 max-w-72">
            <Input
              spellCheck="false"
              placeholder="Search matches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-0">
            <TooltipProvider>
              <Tooltip>
                <DropdownMenu>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="secondary" className="w-9 h-9">
                        <ArrowDown01 strokeWidth={1.5} className="size-[1.05rem]" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSortOption("createdAt-desc")}>
                      Created {sortOption === "createdAt-desc" && "↓"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("createdAt-asc")}>
                      Created {sortOption === "createdAt-asc" && "↑"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("name-asc")}>
                      Name {sortOption === "name-asc" && "↑"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("name-desc")}>
                      Name {sortOption === "name-desc" && "↓"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <TooltipContent>
                  <p>Sort projects</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {isSelectionMode && sortedProjects.length > 0 && (
          <div
            onClick={() => handleSelectAll(!allSelected)}
            className="w-full hover:cursor-pointer gap-2 mb-6 p-4 bg-muted/30 rounded-lg border items-center flex"
          >
            <Checkbox
              checked={someSelected ? "indeterminate" : allSelected}
              onCheckedChange={(checked) => handleSelectAll(checked === true)}
            />
            <span className="text-sm font-medium">
              {allSelected ? "Deselect All" : "Select All"}
            </span>
            <span className="text-sm text-muted-foreground">
              ({selectedProjects.size} of {sortedProjects.length} selected)
            </span>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden bg-background border-none p-0">
                <Skeleton className="aspect-square w-full bg-muted/50" />
                <div className="px-0 pt-5 flex flex-col gap-1">
                  <Skeleton className="h-4 w-3/4 bg-muted/50" />
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-4 w-4 bg-muted/50" />
                    <Skeleton className="h-4 w-24 bg-muted/50" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <NoProjects onCreateProject={() => setIsCreateDialogOpen(true)} />
        ) : sortedProjects.length === 0 ? (
          <NoResults searchQuery={searchQuery} onClearSearch={() => setSearchQuery("")} />
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isSelectionMode={isSelectionMode}
                isSelected={selectedProjects.has(project.id)}
                onSelect={handleSelectProject}
                onDelete={handleDeleteProject}
                onUpdate={handleUpdateProject}
              />
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedProjects.size} projects?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected
              projects.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive-saturated border-none text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CreateProjectDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onConfirm={handleCreateProject}
      />
    </div>
  );
}

function ProjectCard({
  project,
  isSelectionMode = false,
  isSelected = false,
  onSelect,
  onDelete,
  onUpdate,
}: {
  project: Project;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelect?: (projectId: string, checked: boolean) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Project>) => void;
}) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return "No Date";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSelectionMode) {
      onSelect?.(project.id, !isSelected);
    } else {
      router.push(`/video-editor/${project.id}`);
    }
  };

  const cardContent = (
    <Card className={`shadow-none overflow-hidden  p-3 rounded-xl transition-all ${isSelectionMode && isSelected ? "p-1.5 rounded-[19px] ring-2 ring-primary" : ""
      }`}>
      <CardContent className="px-0 pt-0 flex flex-col gap-1">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm leading-snug group-hover:text-foreground/90 transition-colors line-clamp-1">
              {project.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 font-medium">
              {project.teamA} vs {project.teamB}
            </p>
            {project.result && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Result: {project.result}
              </p>
            )}
          </div>
          {!isSelectionMode && (
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`size-6 p-0 transition-all shrink-0 ml-2 ${isDropdownOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsEditDialogOpen(true);
                    setIsDropdownOpen(false);
                  }}
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDeleteDialogOpen(true);
                    setIsDropdownOpen(false);
                  }}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="space-y-1 mt-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarIcon className="size-3.5" />
            <span>{formatDate(project.matchDate || project.createdAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card >
  );

  return (
    <>
      {isSelectionMode ? (
        <div
          role="button"
          tabIndex={0}
          onClick={handleCardClick}
          onKeyDown={(e) =>
            e.key === "Enter" && isSelectionMode && onSelect?.(project.id, !isSelected)
          }
          className="block group cursor-pointer w-full text-left"
        >
          {cardContent}
        </div>
      ) : (
        <div className="block group cursor-pointer" onClick={handleCardClick}>
          {cardContent}
        </div>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete "{project.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(project.id);
                setIsDeleteDialogOpen(false);
              }}
              className="bg-destructive-saturated border-none text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditProjectDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        project={project}
        onConfirm={(updates) => {
          onUpdate(project.id, updates);
          setIsEditDialogOpen(false);
        }}
      />
    </>
  );
}

function CreateProjectDialog({
  isOpen,
  onOpenChange,
  onConfirm,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (projectData: Omit<Project, "id" | "createdAt">) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [result, setResult] = useState("");
  const [matchDate, setMatchDate] = useState<Date | undefined>(undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const send = () => {
      onConfirm({
        name: name.trim() || "Untitled Match",
        description: description.trim(),
        teamA: teamA.trim() || "Team A",
        teamB: teamB.trim() || "Team B",
        result: result.trim(),
        matchDate: matchDate ? matchDate.toISOString() : undefined,
      });
      // reset
      setName("");
      setDescription("");
      setTeamA("");
      setTeamB("");
      setResult("");
      setMatchDate(undefined);
    };
    send();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Match Analysis</DialogTitle>
          <DialogDescription>
            Enter the match details to start your analysis.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Title <span className="text-destructive-saturated">*</span>
              </Label>
              <Input
                spellCheck="false"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Champions League Final 2024"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                spellCheck="false"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add notes or context about this match..."
                className="min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-7 gap-4 items-baseline-last justify-items-center">
              <div className="space-y-2 col-span-3">
                <Label htmlFor="teamA">
                  Team A <span className="text-destructive-saturated">*</span>
                </Label>
                <Input
                  spellCheck="false"
                  id="teamA"
                  value={teamA}
                  onChange={(e) => setTeamA(e.target.value)}
                  placeholder="Home team"
                  required
                />
              </div>
              <span className="col-span-1 font-mono">VS</span>
              <div className="space-y-2 col-span-3">
                <Label htmlFor="teamB">
                  Team B <span className="text-destructive-saturated">*</span>
                </Label>
                <Input
                  spellCheck="false"
                  id="teamB"
                  value={teamB}
                  onChange={(e) => setTeamB(e.target.value)}
                  placeholder="Away team"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="result">Result</Label>
                <Input
                  spellCheck="false"
                  id="result"
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  placeholder="e.g., 2-1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Match Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      size="lg"
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${!matchDate ? "text-muted-foreground" : ""
                        }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {matchDate ? (
                        format(matchDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      disabled={{ after: new Date() }}
                      selected={matchDate}
                      onSelect={(d) => setMatchDate(d ?? undefined)}
                      initialFocus
                      required
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              size="sm"
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button size="sm" type="submit">
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditProjectDialog({
  isOpen,
  onOpenChange,
  project,
  onConfirm,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  onConfirm: (updates: Partial<Project>) => void;
}) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [teamA, setTeamA] = useState(project.teamA);
  const [teamB, setTeamB] = useState(project.teamB);
  const [result, setResult] = useState(project.result || "");
  const [matchDate, setMatchDate] = useState<Date | undefined>(
    project.matchDate ? new Date(project.matchDate) : undefined
  );

  useEffect(() => {
    setName(project.name);
    setDescription(project.description || "");
    setTeamA(project.teamA);
    setTeamB(project.teamB);
    setResult(project.result || "");
    setMatchDate(project.matchDate ? new Date(project.matchDate) : undefined);
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && teamA.trim() && teamB.trim()) {
      onConfirm({
        name: name.trim(),
        description: description.trim(),
        teamA: teamA.trim(),
        teamB: teamB.trim(),
        result: result.trim(),
        matchDate: matchDate ? matchDate.toISOString() : undefined,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Match Details</DialogTitle>
          <DialogDescription>Update the match information.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">
                Title <span className="text-destructive-saturated">*</span>
              </Label>
              <Input
                spellCheck="false"
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Match title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                spellCheck="false"
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add notes or context..."
                className="min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-7 gap-4 items-baseline-last justify-items-center">
              <div className="space-y-2 col-span-3">
                <Label htmlFor="edit-teamA">
                  Team A <span className="text-destructive-saturated">*</span>
                </Label>
                <Input
                  spellCheck="false"
                  id="edit-teamA"
                  value={teamA}
                  onChange={(e) => setTeamA(e.target.value)}
                  placeholder="Home team"
                  required
                />
              </div>
              <span className="col-span-1 font-mono">VS</span>
              <div className="space-y-2 col-span-3">
                <Label htmlFor="edit-teamB">
                  Team B <span className="text-destructive-saturated">*</span>
                </Label>
                <Input
                  spellCheck="false"
                  id="edit-teamB"
                  value={teamB}
                  onChange={(e) => setTeamB(e.target.value)}
                  placeholder="Away team"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-result">Result</Label>
                <Input
                  spellCheck="false"
                  id="edit-result"
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  placeholder="e.g., 2-1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Match Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      size="lg"
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${!matchDate ? "text-muted-foreground" : ""
                        }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {matchDate ? (
                        format(matchDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={matchDate}
                      onSelect={(d) => setMatchDate(d ?? undefined)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              size="sm"
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              type="submit"
              disabled={!name?.trim() || !teamA?.trim() || !teamB?.trim()}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CreateButton({ onClick }: { onClick?: () => void }) {
  return (
    <Button size="sm" className="flex" onClick={onClick}>
      <Plus className="size-4" />
      <span className="text-sm font-medium">New Match</span>
    </Button>
  );
}

function NoProjects({ onCreateProject }: { onCreateProject: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
        <Video className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">No matches yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Start analyzing your first football match. Import videos and create detailed analysis
        reports.
      </p>
      <Button size="default" className="gap-2" onClick={onCreateProject}>
        <Plus className="h-4 w-4" />
        Create Your First Match
      </Button>
    </div>
  );
}

function NoResults({
  searchQuery,
  onClearSearch,
}: {
  searchQuery: string;
  onClearSearch: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">No results found</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Your search for "{searchQuery}" did not return any results.
      </p>
      <Button size="default" onClick={onClearSearch} variant="outline">
        Clear Search
      </Button>
    </div>
  );
}
