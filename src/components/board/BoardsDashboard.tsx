"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, MoreHorizontal, CalendarIcon, Link2, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Project } from "@/types/tactical-board";
import { BoardType } from "@/types/board-link";
import BoardPreview from "./BoardPreview";
import { CreateBoardModal } from "./CreateBoardModal";
import { deleteBoardAction, createBoardAction } from "@/app/(dashboard)/board/actions";
import { fetchMatchById } from "@/lib/match/actions";
import { fetchPanels } from "@/lib/panel/panel-actions";
import { saveBoardLink, getBoardLink, getBoardLinks } from "@/lib/board-link/local-storage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export default function BoardsDashboard({ initialProjects = [] }: { initialProjects: Project[] }) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'all' | 'individual' | 'linked'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (initialProjects) setProjects(initialProjects);
  }, [initialProjects]);

  const handleCreateBoard = async (
    name: string,
    boardType: BoardType,
    projectId?: string,
    tagId?: string
  ) => {
    try {
      const newBoard = await createBoardAction({
        id: "",
        name: name || "Untitled Board",
        fieldType: "full",
        fieldRotation: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        homeTeam: {
          name: "Home Team",
          primaryColor: "#ef4444",
          secondaryColor: "#ffffff",
          textColor: "#ffffff",
        },
        awayTeam: {
          name: "Away Team",
          primaryColor: "#3b82f6",
          secondaryColor: "#ffffff",
          textColor: "#ffffff",
        },
        scenes: [
          {
            id: "",
            name: "Scene 1",
            players: [],
            balls: [],
            drawings: [],
            arrows: [],
            timestamp: Date.now(),
          },
        ],
      });

      const newId = newBoard?.data?._id || newBoard?.data?.id || newBoard?._id || newBoard?.id;

      if (newId) {
        // Save link if it's a linked board
        if (boardType === 'linked' && projectId && tagId) {
          saveBoardLink(newId, projectId, tagId);
        }
        router.push(`/board/${newId}`);
      } else {
        console.error("Backend did not return an ID:", newBoard);
      }
    } catch (error) {
      console.error("Error creating board:", error);
    }
  };

  const handleCreateNew = () => {
    setIsCreateModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setProjects((prev) => prev.filter((p) => p.id !== id && (p as any)._id !== id));
      await deleteBoardAction(id);
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredProjects = useMemo(() => {
    let filtered = projects;
    
    // Filter by tab
    if (activeTab === 'individual') {
      const links = getBoardLinks();
      const linkedIds = new Set(links.map(l => l.boardId));
      filtered = projects.filter(p => !linkedIds.has(p.id) && !linkedIds.has((p as any)._id));
    } else if (activeTab === 'linked') {
      const links = getBoardLinks();
      const linkedIds = new Set(links.map(l => l.boardId));
      filtered = projects.filter(p => linkedIds.has(p.id) || linkedIds.has((p as any)._id));
    }
    
    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [projects, activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-6 pt-10 pb-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Tactical Boards</h1>
            <p className="text-muted-foreground">
              {filteredProjects.length} {filteredProjects.length === 1 ? "board" : "boards"}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Button onClick={handleCreateNew} size="sm">
              <Plus className="size-4 mr-2" />
              New Board
            </Button>
          </div>
        </div>

        <div className="mb-6 space-y-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList>
              <TabsTrigger value="all">All Boards</TabsTrigger>
              <TabsTrigger value="individual">Individual</TabsTrigger>
              <TabsTrigger value="linked">Linked</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-72">
              <Input
                placeholder="Search boards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed text-muted-foreground mt-8 h-64">
            <p className="text-lg">No tactical boards yet.</p>
            <Button variant="outline" className="mt-4" onClick={handleCreateNew}>Create your first board</Button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center p-12 text-muted-foreground">No matches found for "{searchQuery}"</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map((project) => (
              <BoardCard
                key={(project as any)._id || project.id}
                project={project}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateBoard}
      />
    </div>
  );
}

interface LinkDisplay {
  projectName: string;
  tagName: string;
}

function BoardCard({ project, onDelete }: { project: Project; onDelete: (id: string) => void }) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [linkDisplay, setLinkDisplay] = useState<LinkDisplay | null>(null);
  
  const identifier = (project as any)._id || project.id;
  const createdAt = new Date(project.createdAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  useEffect(() => {
    const link = getBoardLink(identifier);
    if (link) {
      Promise.all([
        fetchMatchById(link.projectId),
        fetchPanels().then(panels => panels.find(p => p.id === link.tagId))
      ]).then(([match, panel]) => {
        if (match && panel) {
          setLinkDisplay({
            projectName: match.name,
            tagName: panel.title
          });
        }
      });
    }
  }, [identifier]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/board/${identifier}`);
  };

  return (
    <>
      <div onClick={handleClick} className="block h-full cursor-pointer outline-none rounded-xl group relative overflow-hidden flex flex-col transition-all duration-300 border border-border/50 bg-card hover:border-border hover:shadow-lg">
        {/* Link Badge */}
        {linkDisplay && (
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
            <Badge className="bg-blue-500 text-white text-xs">
              <Link2 className="size-3 mr-1" />
              Linked
            </Badge>
            <Badge variant="secondary" className="text-xs max-w-[150px] truncate">
              <Folder className="size-3 mr-1" />
              {linkDisplay.projectName}
            </Badge>
          </div>
        )}
        
        {/* Preview Image / SVG */}
        <div className="w-full h-40 bg-muted border-b border-border/50 overflow-hidden flex items-center justify-center">
          <BoardPreview project={project} />
        </div>

        <CardContent className="flex flex-col flex-1 p-4 gap-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground/90 line-clamp-1 truncate pr-2">{project.name || "Untitled Board"}</h3>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/board/${identifier}`); }}>
                  Open Editor
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={(e) => { e.stopPropagation(); setIsDeleteDialogOpen(true); }}>
                  Delete Board
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarIcon className="size-3" />
            <span>{createdAt}</span>
          </div>
        </CardContent>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Board?</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to permanently delete "{project.name}"?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(identifier)} className="bg-destructive hover:bg-destructive/90 text-white border-none">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
