"use client"
import Container from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Categories } from "@/constant/EVENTS";
import { formatTime } from "@/lib/video-utils";
import { Tag, VideoPanelProps } from "@/types/video-editor";
import { Check, Edit, Maximize, Pause, Play, Redo, Settings, StopCircle, Timer, Trash2, Undo, Volume2, VolumeX, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

const generateId = () => `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export default function page() {
  const searchParams = useSearchParams();
  const matchId = searchParams.get("matchId");

  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTag, setActiveTag] = useState<Tag | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tagHistory, setTagHistory] = useState<Tag[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync current time with video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    video.addEventListener('timeupdate', updateTime);
    return () => video.removeEventListener('timeupdate', updateTime);
  }, []);

  // Fullscreen listeners
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Add history to make undo and redo
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
      endActiveTag();
    }

    const newTag: Tag = {
      id: generateId(),
      categoryName,
      eventName,
      startTime: currentTime,
      endTime: null,
      createdAt: Date.now(),
    };

    setActiveTag(newTag);
  };

  // End the active tag
  const endActiveTag = () => {
    if (!activeTag) return;

    const completedTag: Tag = {
      ...activeTag,
      endTime: currentTime,
    };

    setTags(prev => [...prev, completedTag].sort((a, b) => a.startTime - b.startTime));
    setActiveTag(null);

    // Persist tag to backend if matchId is available
    if (matchId) {
      const payload = {
        startTime: String(completedTag.startTime),
        endTime: String(completedTag.endTime ?? currentTime),
        event: completedTag.eventName,
        notes: completedTag.notes,
      };

      fetch(`/api/tag/${matchId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }).catch((err) => {
        console.error("Failed to create tag:", err);
      });
    }
  };

  // Play clip from tag
  const playClip = (tag: Tag) => {
    if (!videoRef.current) return;

    videoRef.current.currentTime = tag.startTime;
    videoRef.current.play();

    // Optional: pause at end time
    if (tag.endTime) {
      const checkTime = () => {
        if (videoRef.current && videoRef.current.currentTime >= tag.endTime!) {
          videoRef.current.pause();
          videoRef.current.removeEventListener('timeupdate', checkTime);
        }
      };
      videoRef.current.addEventListener('timeupdate', checkTime);
    }
  };

  // Delete tag
  const deleteTag = (tagId: string) => {
    // setTags(prev => prev.filter(t => t.id !== tagId));

    const newTags = tags.filter(t => t.id !== tagId);
    setTags(newTags);
    addToHistory(newTags);
  };

  // Update tag
  const updateTag = (updatedTag: Tag) => {
    // setTags(prev => prev.map(t => t.id === updatedTag.id ? updatedTag : t)
    //   .sort((a, b) => a.startTime - b.startTime));
    // setEditingTag(null);

    const newTags = tags.map(t => t.id === updatedTag.id ? updatedTag : t).sort((a, b) => a.startTime - b.startTime);
    setTags(newTags);
    addToHistory(newTags);
    setEditingTag(null);
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
      containerRef.current.requestFullscreen();
    }
  };

  return (
    <main className="h-svh overflow-hidden py-10">
      <Container className="max-w-full h-full">
        {/* dh autoSaveId="persistence 3shan lw 3yz a3ml save lel Resize fel localStorage" */}
        <ResizablePanelGroup
          direction="horizontal"
          className="w-full h-full gap-2"
        >
          <ResizablePanel className="space-y-4" minSize={40} defaultSize={70}>
            <ResizablePanelGroup className="gap-2" direction="vertical">
              {/* video panel */}
              <ResizablePanel defaultSize={80} minSize={40}>
                <VideoPanel
                  videoRef={videoRef}
                  currentTime={currentTime}
                  activeTag={activeTag}
                  onEndTag={endActiveTag}
                />
              </ResizablePanel>

              <ResizableHandle
                className="bg-transparent opacity-0 hover:opacity-100 duration-200"
                withHandle
              />

              {/* tags */}
              <ResizablePanel defaultSize={20} minSize={20}>
                <TagsPanel
                  tags={tags}
                  activeTag={activeTag}
                  onPlayClip={playClip}
                  onDeleteTag={deleteTag}
                  onEditTag={setEditingTag}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle
            className="bg-transparent opacity-0 hover:opacity-100 duration-200"
            withHandle
          />

          {/* events panel*/}

          <ResizablePanel defaultSize={30}>
            <EventPanel
              activeTag={activeTag}
              onStartTag={startTag}
              onEndTag={endActiveTag}
            />
          </ResizablePanel>

        </ResizablePanelGroup>
      </Container>

      {editingTag && (
        <EditTagDialog
          tag={editingTag}
          onSave={updateTag}
          onCancel={() => setEditingTag(null)}
        />
      )}
    </main>
  );
}

export function VideoPanel({
  videoRef,
  currentTime,
  activeTag,
  onEndTag
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  currentTime: number;
  activeTag: Tag | null;
  onEndTag: () => void;
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
        <source src="/videos/vid1.mp4" type="video/mp4" />
        {/* <source src="https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" type="video/mp4" /> */}
        {/* <source src="https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" type="video/mp4" /> */}
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

export function EventPanel({
  activeTag,
  onStartTag,
  onEndTag
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
              className="flex-0 cursor-pointer !text-muted-foreground
                       hover:!text-foreground 
                       data-[state=active]:!text-foreground
                       data-[state=active]:hover:!text-foreground
                       data-[state=active]:bg-muted
                       data-[state=active]:shadow-none"
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
                  <Card key={cat.name} className="">
                    <CardHeader className="">
                      <CardTitle className="">
                        {cat.name}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="flex flex-wrap gap-2">
                      {cat.events.map((ev) => {
                        const isActive = activeTag?.eventName === ev && activeTag?.categoryName === cat.name;
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
  )
}


export function TagsPanel({
  tags,
  activeTag,
  onPlayClip,
  onDeleteTag,
  onEditTag
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
            {tags.length} tag{tags.length !== 1 ? 's' : ''} created
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
  )
}

function TagItem({
  tag,
  onPlay,
  onDelete,
  onEdit
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
          <Button onClick={onDelete} size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{formatTime(tag.startTime)}</span>
        <span>→</span>
        <span>{tag.endTime ? formatTime(tag.endTime) : 'ongoing'}</span>
        {tag.endTime && (
          <span className="ml-auto">({duration.toFixed(1)}s)</span>
        )}
      </div>

      {tag.notes && (
        <div className="mt-2 text-xs text-muted-foreground italic border-l-2 border-muted-foreground/30 pl-2">
          {tag.notes}
        </div>
      )}
    </div>
  );
}

// Edit Tag Dialog Component
function EditTagDialog({
  tag,
  onSave,
  onCancel
}: {
  tag: Tag;
  onSave: (tag: Tag) => void;
  onCancel: () => void;
}) {
  const [editedTag, setEditedTag] = useState(tag);

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Tag</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Event Name</Label>
            <Input
              value={editedTag.eventName}
              onChange={(e) => setEditedTag(prev => ({ ...prev, eventName: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time (seconds)</Label>
              <Input
                type="number"
                step="0.1"
                value={editedTag.startTime}
                onChange={(e) => setEditedTag(prev => ({
                  ...prev,
                  startTime: parseFloat(e.target.value)
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label>End Time (seconds)</Label>
              <Input
                type="number"
                step="0.1"
                value={editedTag.endTime || ''}
                onChange={(e) => setEditedTag(prev => ({
                  ...prev,
                  endTime: parseFloat(e.target.value) || null
                }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              value={editedTag.notes || ''}
              onChange={(e) => setEditedTag(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any notes about this event..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={() => onSave(editedTag)}>
            <Check className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}