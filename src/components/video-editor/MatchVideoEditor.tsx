"use client";

import React, { useEffect, useRef, useState } from "react";
import Container from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircleIcon,
  Calendar as CalendarIcon,
  Check,
  Edit,
  ImageUpIcon,
  Play,
  StopCircle,
  Trash2,
  X,
} from "lucide-react";

import { Categories } from "@/constant/EVENTS";
import { formatTime } from "@/lib/video-utils";
import { createTag, deleteTag, updateTag, } from "@/lib/match/actions";
import type { Tag } from "@/types/video-editor";
import { BackendTag } from "@/types/match";

const generateId = () => `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const mapBackendTagToTag = (backend: BackendTag) => ({
  id: backend._id ?? generateId(),
  tagId: backend._id,
  categoryName:
    Categories.find((category) => category.events.includes(backend.event))?.name ??
    "Imported",
  eventName: backend.event,
  startTime: backend.startTime ?? 0,
  endTime: backend.endTime ?? null,
  notes: backend.notes,
  createdAt: backend.createdAt ? new Date(backend.createdAt).getTime() : Date.now(),
});

interface MatchVideoEditorProps {
  matchId: string;
  initialVideoUrl: string | null;
  initialTags: BackendTag[];
}

export default function MatchVideoEditor({
  matchId,
  initialVideoUrl,
  initialTags,
}: MatchVideoEditorProps) {
  const initialTagModels = initialTags.map(mapBackendTagToTag);

  const [tags, setTags] = useState<Tag[]>(initialTagModels);
  const [activeTag, setActiveTag] = useState<Tag | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tagHistory, setTagHistory] = useState<Tag[][]>(initialTagModels.length ? [initialTagModels] : []);
  const [historyIndex, setHistoryIndex] = useState(initialTagModels.length ? 0 : -1);
  const [videoUrl, setVideoUrl] = useState<string | null>(initialVideoUrl);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync current time with video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    video.addEventListener("timeupdate", updateTime);
    return () => video.removeEventListener("timeupdate", updateTime);
  }, []);

  // Fullscreen listeners
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // History helpers
  const addToHistory = (newTags: Tag[]) => {
    const newHistory = tagHistory.slice(0, historyIndex + 1);
    newHistory.push([...newTags]);
    setTagHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Start a new tag
  const startTag = (categoryName: string, eventName: string) => {
    if (activeTag) {
      // End the current active tag first
      void endActiveTag();
    }

    const video = videoRef.current;

    const newTag: Tag = {
      id: generateId(),
      categoryName,
      eventName,
      startTime: video ? video.currentTime : currentTime,
      endTime: null,
      createdAt: Date.now(),
    };

    setActiveTag(newTag);
  };

  // End the active tag and persist via server action
  const endActiveTag = async () => {
    if (!activeTag) return;

    const finalEndTime = videoRef.current?.currentTime ?? currentTime;

    const completedTag: Tag = {
      ...activeTag,
      endTime: finalEndTime,
    };

    // Optimistic UI update
    const nextTags = [...tags, completedTag].sort((a, b) => a.startTime - b.startTime);
    setTags(nextTags);
    setActiveTag(null);
    addToHistory(nextTags);

    const payload = {
      startTime: completedTag.startTime.toFixed(3),
      endTime: completedTag.endTime!.toFixed(3),
      event: completedTag.eventName,
      notes: completedTag.notes,
    };

    try {
      const result = await createTag(matchId, payload);
      if (!result.success) {
        console.error("Failed to create tag via server action:", result.error);
      }
    } catch (err) {
      console.error("Failed to create tag:", err);
    }
  };

  // Play clip from tag
  const playClip = (tag: Tag) => {
    if (!videoRef.current) return;

    videoRef.current.currentTime = tag.startTime;
    void videoRef.current.play();

    if (tag.endTime) {
      const checkTime = () => {
        if (videoRef.current && videoRef.current.currentTime >= tag.endTime!) {
          videoRef.current.pause();
          videoRef.current.removeEventListener("timeupdate", checkTime);
        }
      };
      videoRef.current.addEventListener("timeupdate", checkTime);
    }
  };

  // Delete tag via server action
  const deleteTagHandler = async (tagId: string) => {
    const tagToDelete = tags.find((t) => t.id === tagId);

    const newTags = tags.filter((t) => t.id !== tagId);
    setTags(newTags);
    addToHistory(newTags);

    if (tagToDelete?.tagId) {
      try {
        const result = await deleteTag(tagId);
        if (!result.success) {
          console.error("Failed to delete tag on backend. The UI is updated locally.");
        }
      } catch (err) {
        console.error("Error deleting tag:", err);
      }
    }
  };

  // Update tag (currently local-only; can be wired to backend later)
  // const updateTagFunc = async (updatedTag: Tag) => {
  //   const payload = {
  //     event: updatedTag.eventName,
  //     startTime: String(updatedTag.startTime),
  //     endTime: updatedTag.endTime !== null ? String(updatedTag.endTime) : "",
  //     notes: updatedTag.notes,
  //   };
  
  //   const res = await updateTag(updatedTag.id, payload);
  
  //   if (!res.success) {
  //     console.error("Update failed:", res.error);
  //     return;
  //   }
  
  //   // Backend returns updated tag as BackendTag, map it to Tag
  //   const backendTag = res.data as BackendTag;
  //   const mappedTag = mapBackendTagToTag(backendTag);

  //   console.log(mappedTag)
  
  //   // Update front-end
  //   const newTags = tags
  //     .map((t) => (t.id === mappedTag.id ? mappedTag : t))
  //     .sort((a, b) => a.startTime - b.startTime);
  
  //   setTags(newTags);
  //   addToHistory(newTags);
  //   setEditingTag(null); // close dialog
  // };
  const updateTagFunc = async (updatedTag: Tag) => {
    const payload = {
      event: updatedTag.eventName,
      startTime: String(updatedTag.startTime),
      endTime: updatedTag.endTime !== null ? String(updatedTag.endTime) : "",
      notes: updatedTag.notes,
    };

    const res = await updateTag(updatedTag.id, payload);

    if (!res.success) {
      console.error("Update failed:", res.error);
      return;
    }

    let backendTag = res.data;
    let mappedTag = backendTag && backendTag._id && backendTag.event
      ? mapBackendTagToTag(backendTag)
      : { ...updatedTag };

    // For a true refresh (if your backend does update all fields), use backendTag; otherwise fallback to edited content.
    const newTags = tags.map((t) =>
      (t.tagId && mappedTag.tagId && t.tagId === mappedTag.tagId) ||
      (!t.tagId && !mappedTag.tagId && t.id === mappedTag.id)
        ? { ...t, ...mappedTag }
        : t
    );

    setTags([...newTags]); // Force new reference for React
    addToHistory([...newTags]);
    setEditingTag(null); // close dialog
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setTags(tagHistory[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < tagHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setTags(tagHistory[historyIndex + 1]);
    }
  };

  const enterFullscreen = () => {
    if (containerRef.current) {
      void containerRef.current.requestFullscreen();
    }
  };

  if (!videoUrl) {
    return (
      <Container className="py-20">
        <VideoUploadComponent onVideoSelected={(url) => setVideoUrl(url)} />
      </Container>
    );
  }

  return (
    <main className="h-svh overflow-hidden py-10">
      <Container className="max-w-full h-full !px-0" ref={containerRef}>
        <ResizablePanelGroup direction="horizontal" className="w-full h-full gap-2">
          <ResizablePanel className="space-y-4" minSize={40} defaultSize={70}>
            <ResizablePanelGroup className="gap-2" direction="vertical">
              <ResizablePanel defaultSize={80} minSize={40}>
                <VideoPanel
                  videoRef={videoRef}
                  currentTime={currentTime}
                  activeTag={activeTag}
                  onEndTag={endActiveTag}
                  videoUrl={videoUrl}
                />
              </ResizablePanel>

              <ResizableHandle className="bg-transparent opacity-0 hover:opacity-100 duration-200" withHandle />

              <ResizablePanel defaultSize={20} minSize={20}>
                <TagsPanel
                  tags={tags}
                  activeTag={activeTag}
                  onPlayClip={playClip}
                  onDeleteTag={deleteTagHandler}
                  onEditTag={setEditingTag}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle className="bg-transparent opacity-0 hover:opacity-100 duration-200" withHandle />

          <ResizablePanel defaultSize={30}>
            <EventPanel activeTag={activeTag} onStartTag={startTag} onEndTag={endActiveTag} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </Container>

      {editingTag && (
        <EditTagDialog tag={editingTag} onSave={updateTagFunc} onCancel={() => setEditingTag(null)} />
      )}
    </main>
  );
}

// --- Subcomponents ---

function VideoPanel({
  videoRef,
  currentTime,
  activeTag,
  onEndTag,
  videoUrl,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  currentTime: number;
  activeTag: Tag | null;
  onEndTag: () => void;
  videoUrl: string | null;
}) {
  return (
    <div className="w-full h-full rounded-3xl bg-card border overflow-hidden shadow-sm relative">
      <video
        ref={videoRef}
        className="object-contain w-full h-full mx-auto"
        autoPlay
        muted
        controls
        preload="metadata"
      >
        <source src={videoUrl!} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

function EventPanel({
  activeTag,
  onStartTag,
  onEndTag,
}: {
  activeTag: Tag | null;
  onStartTag: (category: string, event: string) => void;
  onEndTag: () => void;
}) {
  return (
    <div className="bg-card h-full flex flex-col rounded-3xl border overflow-hidden shadow-sm">
      <Tabs className="w-full h-full flex flex-col overflow-hidden" defaultValue="tagging-events">
        <ScrollArea className="w-full">
          <TabsList className="justify-start mb-3 h-auto gap-2 rounded-none border-b bg-transparent p-4 pb-3 text-foreground w-full">
            <TabsTrigger
              value="tagging-events"
              className="flex-0 cursor-pointer !text-muted-foreground hover:!text-foreground data-[state=active]:!text-foreground data-[state=active]:hover:!text-foreground data-[state=active]:bg-muted data-[state=active]:shadow-none"
            >
              Event Categories
            </TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" className="opacity-0" />
        </ScrollArea>

        <div className="flex-1 overflow-hidden min-h-0">
          <TabsContent value="tagging-events" className="p-4 flex flex-col h-full overflow-hidden min-h-0">
            {activeTag && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-red-900 dark:text-red-100">
                      Recording: {activeTag.eventName}
                    </div>
                    <div className="text-sm text-red-700 dark:text-red-300">
                      Click to end or select another event
                    </div>
                  </div>
                  <Button onClick={onEndTag} variant="destructive" size="sm">
                    <StopCircle className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                </div>
              </div>
            )}

            <ScrollArea className="flex-1 pr-2 min-h-0">
              <div className="space-y-6">
                {Categories.map((cat) => (
                  <Card key={cat.name}>
                    <CardHeader>
                      <CardTitle>{cat.name}</CardTitle>
                    </CardHeader>

                    <CardContent className="flex flex-wrap gap-2">
                      {cat.events.map((ev) => {
                        const isActive =
                          activeTag?.eventName === ev && activeTag?.categoryName === cat.name;
                        return (
                          <Button
                            key={ev}
                            variant={isActive ? "default" : "secondary"}
                            size="sm"
                            onClick={() => onStartTag(cat.name, ev)}
                          >
                            {ev}
                          </Button>
                        );
                      })}
                    </CardContent>
                  </Card>
                ))}
              </div>
              <ScrollBar orientation="vertical" className="opacity-100" />
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function TagsPanel({
  tags,
  activeTag,
  onPlayClip,
  onDeleteTag,
  onEditTag,
}: {
  tags: Tag[];
  activeTag: Tag | null;
  onPlayClip: (tag: Tag) => void;
  onDeleteTag: (id: string) => void;
  onEditTag: (tag: Tag) => void;
}) {
  return (
    <div className="bg-card h-full flex flex-col rounded-3xl border overflow-hidden shadow-sm">
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg">Timeline Tags</h3>
          <p className="text-sm text-muted-foreground">
            {tags.length} tag{tags.length !== 1 ? "s" : ""} created
            {activeTag && <span className="text-red-600 ml-2">• Recording...</span>}
          </p>
        </div>

        <div className="p-4 space-y-2">
          {tags.length === 0 && !activeTag && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No tags yet</p>
              <p className="text-sm">Click an event button to start tagging</p>
            </div>
          )}

          {tags.map((tag) => (
            <TagItem
              key={tag.id}
              tag={tag}
              onPlay={() => onPlayClip(tag)}
              onDelete={() => onDeleteTag(tag.id)}
              onEdit={() => onEditTag(tag)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function TagItem({
  tag,
  onPlay,
  onDelete,
  onEdit,
}: {
  tag: Tag;
  onPlay: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const duration = tag.endTime ? tag.endTime - tag.startTime : 0;

  return (
    <div className="bg-muted rounded-lg p-3 border hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{tag.eventName}</div>
          <div className="text-xs text-muted-foreground">{tag.categoryName}</div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <Button onClick={onPlay} size="sm" variant="ghost" className="h-8 w-8 p-0">
            <Play className="w-4 h-4" />
          </Button>
          <Button onClick={onEdit} size="sm" variant="ghost" className="h-8 w-8 p-0">
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            onClick={onDelete}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{formatTime(tag.startTime)}</span>
        <span>→</span>
        <span>{tag.endTime ? formatTime(tag.endTime) : "ongoing"}</span>
        {tag.endTime && <span className="ml-auto">({duration.toFixed(1)}s)</span>}
      </div>

      {tag.notes && (
        <div className="mt-2 text-xs text-muted-foreground italic border-l-2 border-muted-foreground/30 pl-2">
          {tag.notes}
        </div>
      )}
    </div>
  );
}

function EditTagDialog({
  tag,
  onSave,
  onCancel,
}: {
  tag: Tag;
  onSave: (tag: Tag) => void;
  onCancel: () => void;
}) {
  // const [editedTag, setEditedTag] = useState(tag);
  const [editedTag, setEditedTag] = useState({ ...tag }); 

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Tag</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Event Name</Label>
            <Select
              value={editedTag.eventName}
              onValueChange={(value) =>
                setEditedTag((prev) => ({ ...prev, eventName: value }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                {Categories.map((category) => (
                  <SelectGroup key={category.name}>
                    <SelectLabel>{category.name}</SelectLabel>
                    {category.events.map((event) => (
                      <SelectItem key={event} value={event}>
                        {event}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time (seconds)</Label>
              <Input
                type="number"
                step="0.1"
                value={editedTag.startTime}
                onChange={(e) =>
                  setEditedTag((prev) => ({
                    ...prev,
                    startTime: parseFloat(e.target.value),
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>End Time (seconds)</Label>
              <Input
                type="number"
                step="0.1"
                value={editedTag.endTime ?? ""}
                onChange={(e) =>
                  setEditedTag((prev) => ({
                    ...prev,
                    endTime: parseFloat(e.target.value) || null,
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              value={editedTag.notes || ""}
              onChange={(e) =>
                setEditedTag((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Add any notes about this event..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          {/* <Button onClick={() => onSave(editedTag)}>
            <Check className="w-4 h-4 mr-2" />
            Save Changes
          </Button> */}
          <Button onClick={() => onSave({ ...editedTag })}>
            <Check className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function VideoUploadComponent({
  onVideoSelected,
}: {
  onVideoSelected: (url: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxSizeMB = 50;
  const maxSize = maxSizeMB * 1024 * 1024;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);

    const f = e.dataTransfer.files?.[0];
    if (!f) return;

    if (f.size > maxSize) {
      setError(`Max allowed size is ${maxSizeMB}MB`);
      return;
    }

    const url = URL.createObjectURL(f);
    setFile(f);
    onVideoSelected(url);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > maxSize) {
      setError(`Max allowed size is ${maxSizeMB}MB`);
      return;
    }
    const url = URL.createObjectURL(f);
    setFile(f);
    onVideoSelected(url);
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        className={`relative flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed p-4 ${
          dragging ? "bg-accent/50" : ""
        }`}
      >
        {!file ? (
          <>
            <input
              type="file"
              accept="video/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFile}
            />
            <div className="flex flex-col items-center">
              <div className="mb-2 flex size-11 items-center justify-center rounded-full border bg-background">
                <ImageUpIcon className="size-4 opacity-60" />
              </div>
              <p className="text-sm font-medium">Drop your video here or click to browse</p>
              <p className="text-xs text-muted-foreground">Max size: {maxSizeMB}MB</p>
            </div>
          </>
        ) : (
          <div className="text-sm">{file.name}</div>
        )}
      </div>

      {file && (
        <button
          type="button"
          onClick={() => {
            setFile(null);
            onVideoSelected("");
          }}
          className="flex items-center gap-2 text-xs text-red-600"
        >
          <X className="size-3" /> Remove video
        </button>
      )}

      {error && (
        <div className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircleIcon className="size-3" />
          {error}
        </div>
      )}
    </div>
  );
}
