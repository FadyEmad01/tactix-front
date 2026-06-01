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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircleIcon,
  Check,
  Edit,
  FileVideo,
  ImageUpIcon,
  LayoutGrid,
  LayoutDashboard,
  Loader2,
  Play,
  Pause,
  Plus,
  Scissors,
  ShieldCheck,
  StopCircle,
  Tag,
  Trash2,
  X,
  Undo,
  Redo,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
  MoveHorizontal,
  Keyboard,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Categories } from "@/constant/EVENTS";
import { formatTime } from "@/lib/video-utils";
import { toast } from "sonner";
import {
  createTag,
  deleteTag,
  updateTag,
} from "@/lib/match/actions";
import type { Tag as VideoTag } from "@/types/video-editor";
import ClipPreviewModal from "@/components/video-editor/ClipPreviewModal";
import CreateBoardModal from "@/components/video-editor/CreateBoardModal";
import { BackendTag } from "@/types/match";
import { Panel } from "@/lib/panel/panel-actions";
import { LinkedBoardsSection } from "./LinkedBoardsSection";
import {
  deleteVideoFromDB,
  getVideoFromDB,
  saveVideoToDB,
} from "@/lib/match/video-db";

const generateId = () =>
  `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const mapBackendTagToTag = (backend: BackendTag) => ({
  id: backend._id ?? generateId(),
  tagId: backend._id,
  categoryName:
    Categories.find((category) => category.events.includes(backend.event))
      ?.name ?? "Custom",
  eventName: backend.event,
  startTime: backend.startTime ?? 0,
  endTime: backend.endTime ?? null,
  notes: backend.notes,
  createdAt: backend.createdAt
    ? new Date(backend.createdAt).getTime()
    : Date.now(),
  clipUrl: backend.clipURL,
});

function ShortcutRow({ action, keys }: { action: string; keys: string[] }) {
  return (
    <div className="flex items-center justify-between text-xs py-0.5 select-none">
      <span className="text-muted-foreground font-medium">{action}</span>
      <div className="flex items-center gap-1 font-mono text-[10px]">
        {keys.map((key, index) => (
          <React.Fragment key={key}>
            {index > 0 && <span className="text-muted-foreground/40 font-sans">+</span>}
            <kbd className="px-1.5 py-0.5 bg-muted/80 border border-border/60 rounded text-foreground font-bold shadow-sm leading-none min-w-5 text-center">
              {key}
            </kbd>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

interface MatchVideoEditorProps {
  matchId: string;
  initialVideoUrl: string | null;
  initialTags: BackendTag[];
  customPanels?: Panel[];
  matchName?: string;
}

export default function MatchVideoEditor({
  matchId,
  initialVideoUrl,
  initialTags,
  customPanels = [],
  matchName = "Untitled Match",
}: MatchVideoEditorProps) {
  const initialTagModels = initialTags.map(mapBackendTagToTag);

  const [tags, setTags] = useState<VideoTag[]>(initialTagModels);
  const [activeTag, setActiveTag] = useState<VideoTag | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [editingTag, setEditingTag] = useState<VideoTag | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tagHistory, setTagHistory] = useState<VideoTag[][]>(
    initialTagModels.length ? [initialTagModels] : []
  );
  const [historyIndex, setHistoryIndex] = useState(
    initialTagModels.length ? 0 : -1
  );
  const [videoUrl, setVideoUrl] = useState<string | null>(initialVideoUrl);
  const [clipTag, setClipTag] = useState<VideoTag | null>(null);
  const [boardCreateTag, setBoardCreateTag] = useState<VideoTag | null>(null);
  const boardTabRef = useRef<Window | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(true);

  // Range Selection States for Cutting
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
  const [zoom, setZoom] = useState(1.0); // Timeline zoom multiplier lifted from TagsPanel
  const [showShortcutsHelper, setShowShortcutsHelper] = useState(false);
  const [activeHelpTab, setActiveHelpTab] = useState<'player' | 'timeline' | 'tagging'>('player');

  const handleOpenTacticalBoard = (tag: VideoTag) => {
    if (!tag.tagId) {
      toast.error(
        "Tag is not synced to backend yet. Please refresh and try again.",
      );
      return;
    }
    // Open placeholder tab synchronously while we still have the user gesture.
    // We'll redirect it to the board URL when the flow completes. This avoids
    // popup blockers triggering on async window.open() after upload finishes.
    const tab = window.open("about:blank", "_blank");
    if (tab) {
      tab.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Creating Tactical Board...</title>
            <style>
              body {
                margin: 0;
                background: #0f172a;
                color: #e2e8f0;
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                gap: 1.5rem;
              }
              .spinner {
                width: 48px;
                height: 48px;
                border: 4px solid rgba(255,255,255,0.1);
                border-top-color: #3b82f6;
                border-radius: 50%;
                animation: spin 1s linear infinite;
              }
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
              h2 {
                margin: 0;
                font-size: 1.25rem;
                font-weight: 600;
              }
              p {
                margin: 0;
                color: #94a3b8;
                font-size: 0.875rem;
              }
            </style>
          </head>
          <body>
            <div class="spinner"></div>
            <h2>Creating Tactical Board</h2>
            <p>Cutting clip and uploading... This may take a moment.</p>
          </body>
        </html>
      `);
      tab.document.close();
    }
    boardTabRef.current = tab;
    setBoardCreateTag(tag);
  };

  // Check IndexedDB for existing video on mount
  useEffect(() => {
    const loadVideo = async () => {
      try {
        const file = await getVideoFromDB(matchId);
        if (file) {
          const url = URL.createObjectURL(file);
          setVideoUrl(url);
        }
      } catch (err) {
        console.error("Error loading video from DB:", err);
      } finally {
        setIsLoadingVideo(false);
      }
    };
    loadVideo();

    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [matchId]);

  // Handle Video Upload & Persistence
  const handleVideoSelected = async (file: File) => {
    setIsLoadingVideo(true);
    try {
      await saveVideoToDB(matchId, file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    } catch (err) {
      console.error("Failed to save video:", err);
      alert("Failed to save video to browser storage. Storage might be full.");
    } finally {
      setIsLoadingVideo(false);
    }
  };

  const handleClearVideo = async () => {
    if (
      confirm(
        "Are you sure? This will remove the video from your browser cache."
      )
    ) {
      await deleteVideoFromDB(matchId);
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration || 0);

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("durationchange", updateDuration);
    video.addEventListener("loadedmetadata", updateDuration);

    if (video.duration) setDuration(video.duration);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("durationchange", updateDuration);
      video.removeEventListener("loadedmetadata", updateDuration);
    };
  }, [videoUrl]);

  // Fullscreen listeners
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // History helpers
  const addToHistory = (newTags: VideoTag[]) => {
    const newHistory = tagHistory.slice(0, historyIndex + 1);
    newHistory.push([...newTags]);
    setTagHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Start a new tag (handles range selection immediately if active)
  const startTag = async (categoryName: string, eventName: string) => {
    if (selectionRange && Math.abs(selectionRange.end - selectionRange.start) > 0.1) {
      // Create a completed tag for the selection range immediately
      const newTag: VideoTag = {
        id: generateId(),
        categoryName,
        eventName,
        startTime: selectionRange.start,
        endTime: selectionRange.end,
        createdAt: Date.now(),
      };

      const nextTags = [...tags, newTag].sort((a, b) => a.startTime - b.startTime);
      setTags(nextTags);
      addToHistory(nextTags);
      setSelectionRange(null); // Clear selection range

      const payload = {
        startTime: newTag.startTime.toFixed(3),
        endTime: newTag.endTime!.toFixed(3),
        event: newTag.eventName,
        notes: newTag.notes,
      };

      try {
        const result = await createTag(matchId, payload);
        if (result.success) {
          const backendTag = result.data?.data ?? result.data;
          if (backendTag && (backendTag._id || backendTag.id)) {
            const serverTagId = backendTag._id || backendTag.id;
            setTags((prevTags) =>
              prevTags.map((t) => (t.id === newTag.id ? { ...t, tagId: serverTagId } : t))
            );
            // Also update history
            setTagHistory((prevHistory) =>
              prevHistory.map((hist, idx) =>
                idx === historyIndex + 1
                  ? hist.map((t) => (t.id === newTag.id ? { ...t, tagId: serverTagId } : t))
                  : hist
              )
            );
          }
        } else {
          console.error("Failed to create tag via server action:", result.error);
        }
      } catch (err) {
        console.error("Failed to create tag:", err);
      }
      return;
    }

    if (activeTag) {
      void endActiveTag();
    }

    const video = videoRef.current;

    const newTag: VideoTag = {
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

    const completedTag: VideoTag = {
      ...activeTag,
      endTime: finalEndTime,
    };

    const nextTags = [...tags, completedTag].sort(
      (a, b) => a.startTime - b.startTime
    );
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
      if (result.success) {
        const backendTag = result.data?.data ?? result.data;
        if (backendTag && (backendTag._id || backendTag.id)) {
          const serverTagId = backendTag._id || backendTag.id;
          setTags((prevTags) =>
            prevTags.map((t) => (t.id === completedTag.id ? { ...t, tagId: serverTagId } : t))
          );
          // Also update history
          setTagHistory((prevHistory) =>
            prevHistory.map((hist, idx) =>
              idx === historyIndex + 1
                ? hist.map((t) => (t.id === completedTag.id ? { ...t, tagId: serverTagId } : t))
                : hist
            )
          );
        }
      } else {
        console.error("Failed to create tag via server action:", result.error);
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = (result as any).data;
      const newTagId: string | undefined =
        data?.data?._id ||
        data?.data?.id ||
        data?._id ||
        data?.id;
      if (newTagId) {
        setTags((prev) =>
          prev.map((t) =>
            t.id === completedTag.id ? { ...t, tagId: newTagId } : t,
          ),
        );
      } else {
        console.warn("createTag succeeded but no tagId in response:", data);
      }
    } catch (err) {
      console.error("Failed to create tag:", err);
    }
  };

  // Play clip from tag
  const playClip = (tag: VideoTag) => {
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
        const result = await deleteTag(tagToDelete.tagId);
        if (!result.success) {
          console.error(
            "Failed to delete tag on backend. The UI is updated locally."
          );
        }
      } catch (err) {
        console.error("Error deleting tag:", err);
      }
    }
  };

  const updateTagFunc = async (updatedTag: VideoTag) => {
    // 1. Optimistic update: instantly update tags state before sending network request
    const previousTags = [...tags];
    const newTags = tags.map((t) =>
      (t.tagId && updatedTag.tagId && t.tagId === updatedTag.tagId) ||
      (!t.tagId && !updatedTag.tagId && t.id === updatedTag.id)
        ? { ...t, ...updatedTag }
        : t
    );
    setTags([...newTags]);
    setEditingTag(null);

    const payload = {
      event: updatedTag.eventName,
      startTime: String(updatedTag.startTime),
      endTime: updatedTag.endTime !== null ? String(updatedTag.endTime) : "",
      notes: updatedTag.notes,
    };

    try {
      const res = await updateTag(updatedTag.id, payload);

      if (!res.success) {
        console.error("Update failed:", res.error);
        // Rollback on failure
        setTags(previousTags);
        return;
      }

      let backendTag = res.data;
      let mappedTag =
        backendTag && backendTag._id && backendTag.event
          ? mapBackendTagToTag(backendTag)
          : { ...updatedTag };

      const finalTags = newTags.map((t) =>
        (t.tagId && mappedTag.tagId && t.tagId === mappedTag.tagId) ||
        (!t.tagId && !mappedTag.tagId && t.id === mappedTag.id)
          ? { ...t, ...mappedTag }
          : t
      );

      setTags([...finalTags]);
      addToHistory([...finalTags]);
    } catch (err) {
      console.error("Error updating tag:", err);
      // Rollback on error
      setTags(previousTags);
    }
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

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        void document.exitFullscreen();
      } else {
        void containerRef.current.requestFullscreen();
      }
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts if the user is typing in inputs or text fields
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.hasAttribute("contenteditable"))
      ) {
        return;
      }

      const isMac = typeof window !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      switch (e.key) {
        case " ":
          e.preventDefault();
          if (videoRef.current) {
            if (videoRef.current.paused) {
              void videoRef.current.play();
            } else {
              videoRef.current.pause();
            }
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (videoRef.current) {
            if (e.shiftKey) {
              videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 0.1);
            } else {
              videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
            }
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          if (videoRef.current) {
            if (e.shiftKey) {
              videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 0.1);
            } else {
              videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 5);
            }
          }
          break;
        case "a":
        case "A":
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 0.1);
          }
          break;
        case "d":
        case "D":
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 0.1);
          }
          break;
        case "z":
        case "Z":
          if (cmdOrCtrl) {
            e.preventDefault();
            if (e.shiftKey) {
              if (historyIndex < tagHistory.length - 1) {
                redo();
              }
            } else {
              if (historyIndex > 0) {
                undo();
              }
            }
          }
          break;
        case "y":
        case "Y":
          if (cmdOrCtrl) {
            e.preventDefault();
            if (historyIndex < tagHistory.length - 1) {
              redo();
            }
          }
          break;
        case "=":
        case "+":
          e.preventDefault();
          setZoom((prev) => Math.min(100, prev * 1.3));
          break;
        case "-":
          e.preventDefault();
          setZoom((prev) => Math.max(0.05, prev / 1.3));
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;

        case "?":
          e.preventDefault();
          setShowShortcutsHelper((prev) => !prev);
          break;
        case "Escape":
          e.preventDefault();
          if (selectionRange) {
            setSelectionRange(null);
          } else if (activeTag) {
            setActiveTag(null);
          }
          break;
        case "Enter":
          e.preventDefault();
          if (activeTag) {
            void endActiveTag();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [duration, activeTag, selectionRange, tagHistory, historyIndex]);

  if (isLoadingVideo) {
    return (
      <div className="h-svh flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
          <p className="text-sm font-medium">Checking local storage for video...</p>
        </div>
      </div>
    );
  }

  if (!videoUrl) {
    return (
      <div className="min-h-svh bg-background flex items-center justify-center py-20 px-4">
        <VideoUploadComponent onVideoConfirmed={handleVideoSelected} />
      </div>
    );
  }

  return (
    <main className="h-[calc(100dvh-88px)] w-full flex flex-col font-sans text-foreground bg-transparent overflow-hidden">
      <div className="w-full h-full flex-1 flex flex-col min-h-0 relative" ref={containerRef}>
        {/* Resizable Editor Panel Group */}
        <div className="flex-1 min-h-0 bg-transparent">
          <ResizablePanelGroup
            direction="horizontal"
            className="w-full h-full"
          >
            <ResizablePanel className="flex flex-col relative" minSize={40} defaultSize={70}>
              <ResizablePanelGroup direction="vertical" className="h-full">
                <ResizablePanel defaultSize={60} minSize={45} className="relative p-1.5">
                  <VideoPanel
                    videoRef={videoRef}
                    currentTime={currentTime}
                    activeTag={activeTag}
                    onEndTag={endActiveTag}
                    videoUrl={videoUrl}
                    toggleFullscreen={toggleFullscreen}
                    isFullscreen={isFullscreen}
                    matchName={matchName}
                  />
                </ResizablePanel>

                <ResizableHandle
                  className="h-1 bg-transparent hover:bg-primary/20 duration-150 cursor-row-resize z-30"
                />

                <ResizablePanel defaultSize={40} minSize={30} maxSize={55} className="p-1.5">
                  <TagsPanel
                      tags={tags}
                      activeTag={activeTag}
                      currentTime={currentTime}
                      duration={duration}
                      onPlayClip={playClip}
                      onDeleteTag={deleteTagHandler}
                      onEditTag={setEditingTag}
                      onUpdateTag={updateTagFunc}
                      matchId={matchId}
                      videoRef={videoRef}
                      selectionRange={selectionRange}
                      setSelectionRange={setSelectionRange}
                      onUndo={undo}
                      onRedo={redo}
                      canUndo={historyIndex > 0}
                      canRedo={historyIndex < tagHistory.length - 1}
                      zoom={zoom}
                      setZoom={setZoom}
                      setClipTag={setClipTag}
                      handleOpenTacticalBoard={handleOpenTacticalBoard}
                    />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>

            <ResizableHandle
              className="w-1 bg-transparent hover:bg-primary/20 duration-150 cursor-col-resize z-30"
            />

            <ResizablePanel defaultSize={30} minSize={20} className="p-1.5">
              <EventPanel
                activeTag={activeTag}
                onStartTag={startTag}
                onEndTag={endActiveTag}
                customPanels={customPanels}
                matchId={matchId}
                hasSelection={selectionRange !== null}
                onClearSelection={() => setSelectionRange(null)}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>

      {editingTag && (
        <EditTagDialog
          tag={editingTag}
          onSave={updateTagFunc}
          onCancel={() => setEditingTag(null)}
          customPanels={customPanels}
        />
      )}

      {/* Keyboard Shortcuts Helper & Bubble Trigger at Bottom Right of Screen */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none select-none">
        {showShortcutsHelper && (
          <div className="mb-3 w-96 bg-card/95 border border-border/40 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col max-h-[420px] text-foreground font-sans animate-in slide-in-from-bottom-5 duration-200 pointer-events-auto">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between bg-muted/25 shrink-0 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Keyboard className="h-4 w-4 text-primary" />
                <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Keyboard Shortcuts</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full hover:bg-muted"
                onClick={() => setShowShortcutsHelper(false)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Tab Selectors */}
            <div className="flex border-b border-border/40 bg-muted/10 shrink-0 p-1 gap-1">
              {(['player', 'timeline', 'tagging'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveHelpTab(tab)}
                  className={`flex-1 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-lg transition-all duration-150 ${
                    activeHelpTab === tab
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none">
              {activeHelpTab === 'player' && (
                <>
                  <ShortcutRow action="Play / Pause" keys={['Space']} />
                  <ShortcutRow action="Seek Backward 5s" keys={['←']} />
                  <ShortcutRow action="Seek Forward 5s" keys={['→']} />
                  <ShortcutRow action="Frame Backward (0.1s)" keys={['Shift', '←']} />
                  <ShortcutRow action="Frame Forward (0.1s)" keys={['Shift', '→']} />
                  <ShortcutRow action="Step Backward (0.1s)" keys={['A']} />
                  <ShortcutRow action="Step Forward (0.1s)" keys={['D']} />
                </>
              )}
              {activeHelpTab === 'timeline' && (
                <>
                  <ShortcutRow action="Range Select (Drag)" keys={['Right Click']} />
                  <ShortcutRow action="Zoom In Timeline" keys={['+']} />
                  <ShortcutRow action="Zoom Out Timeline" keys={['-']} />
                  <ShortcutRow action="Undo Action" keys={['Ctrl', 'Z']} />
                  <ShortcutRow action="Redo Action" keys={['Ctrl', 'Shift', 'Z']} />
                  <ShortcutRow action="Redo (Alternative)" keys={['Ctrl', 'Y']} />
                </>
              )}
              {activeHelpTab === 'tagging' && (
                <>
                  <ShortcutRow action="End Active Tag" keys={['Enter']} />
                  <ShortcutRow action="Stop Recording / Cancel" keys={['Esc']} />
                  <ShortcutRow action="Toggle Fullscreen" keys={['F']} />
                  <ShortcutRow action="Toggle Shortcuts Helper" keys={['?']} />
                </>
              )}
            </div>

            {/* Footer Info */}
            <div className="px-4 py-2 border-t border-border/40 bg-card text-[10px] text-muted-foreground/60 text-center font-medium shrink-0 rounded-b-2xl">
              Press <kbd className="font-mono bg-muted border border-border/50 px-1 py-0.5 rounded text-foreground">?</kbd> to toggle this panel anytime.
            </div>

            {/* Bubble Arrow Tail pointing down */}
            <div className="absolute -bottom-1.5 right-[14px] w-3 h-3 bg-card border-r border-b border-border/40 rotate-45 z-10" />
          </div>
        )}

        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full shadow-lg backdrop-blur-md transition-all duration-150 hover:scale-105 active:scale-95 bg-black/60 border-white/10 text-white hover:bg-black/80 pointer-events-auto"
          onClick={() => setShowShortcutsHelper((prev) => !prev)}
          title="Keyboard Shortcuts (?)"
        >
          <Keyboard className="h-5 w-5" />
        </Button>
      </div>

      {clipTag && (
        <ClipPreviewModal
          open={!!clipTag}
          tag={clipTag}
          matchId={matchId}
          onClose={() => setClipTag(null)}
          onUploaded={(uploadedTagId, clipUrl) => {
            setTags((prev) =>
              prev.map((t) =>
                t.tagId === uploadedTagId ? { ...t, clipUrl } : t,
              ),
            );
            setClipTag((prev) =>
              prev && prev.tagId === uploadedTagId
                ? { ...prev, clipUrl }
                : prev,
            );
          }}
        />
      )}

      {boardCreateTag && (
        <CreateBoardModal
          open={!!boardCreateTag}
          tag={boardCreateTag}
          matchId={matchId}
          targetWindow={boardTabRef.current}
          onClose={() => {
            setBoardCreateTag(null);
            boardTabRef.current = null;
          }}
          onCreated={(uploadedTagId, clipUrl) => {
            if (clipUrl) {
              setTags((prev) =>
                prev.map((t) =>
                  t.tagId === uploadedTagId ? { ...t, clipUrl } : t,
                ),
              );
            }
          }}
        />
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
  toggleFullscreen,
  isFullscreen,
  matchName,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  currentTime: number;
  activeTag: VideoTag | null;
  onEndTag: () => void;
  videoUrl: string | null;
  toggleFullscreen: () => void;
  isFullscreen: boolean;
  matchName: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleDurationChange = () => setDuration(video.duration);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("volumechange", handleVolumeChange);

    setIsPlaying(!video.paused);
    setDuration(video.duration || 0);
    setVolume(video.volume);
    setIsMuted(video.muted);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("volumechange", handleVolumeChange);
    };
  }, [videoRef, videoUrl]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      void video.play();
    }
  };

  const rewind5 = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, video.currentTime - 5);
  };

  const forward5 = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(video.duration || 0, video.currentTime + 5);
  };

  const handleVolumeSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const val = parseFloat(e.target.value);
    video.volume = val;
    video.muted = val === 0;
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  };

  return (
    <div className="w-full h-full bg-card rounded-2xl border border-border/40 overflow-hidden relative flex flex-col shadow-sm">
      {/* Video Panel Header */}
      <div className="h-10 border-b border-border/30 px-4 flex items-center justify-between shrink-0 bg-muted/25 select-none">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs text-foreground truncate max-w-[180px]">{matchName}</span>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60">Video Preview</span>
      </div>

      {/* Video Viewport */}
      <div className="flex-1 min-h-0 relative flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          className="w-full h-full object-contain bg-black"
          autoPlay
          muted
          preload="metadata"
          playsInline
        >
          <source src={videoUrl!} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Floating playhead timecode overlay */}
        <div 
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/85 text-foreground text-xs px-4 py-2 rounded-full flex items-center gap-3 backdrop-blur-md border border-white/10 shadow-2xl z-10 select-none cursor-default"
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-white/10 rounded-full shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              rewind5();
            }}
            title="Return 5s"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95 duration-100 rounded-full shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 fill-current translate-x-[0.5px]" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-white/10 rounded-full shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              forward5();
            }}
            title="Skip 5s"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </Button>

          <div className="w-[1px] h-4 bg-white/15" />

          {/* Timecode (Current / Duration) */}
          <div className="font-mono text-xs font-bold text-white shrink-0">
            <span className="text-foreground">{formatTime(currentTime)}</span>
            <span className="mx-1 opacity-40">/</span>
            <span className="text-muted-foreground">{formatTime(duration)}</span>
          </div>

          <div className="w-[1px] h-4 bg-white/15" />

          {/* Volume Control */}
          <div className="flex items-center gap-1.5 group/volume">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-white/10 rounded-full shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-3.5 w-3.5 text-destructive" />
              ) : (
                <Volume2 className="h-3.5 w-3.5" />
              )}
            </Button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                e.stopPropagation();
                handleVolumeSliderChange(e);
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-12 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary group-hover/volume:w-16 transition-all duration-200"
            />
          </div>

          <div className="w-[1px] h-4 bg-white/15" />

          {/* Fullscreen Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-white/10 rounded-full shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

function EventPanel({
  activeTag,
  onStartTag,
  onEndTag,
  customPanels,
  matchId,
  hasSelection,
  onClearSelection,
}: {
  activeTag: VideoTag | null;
  onStartTag: (category: string, event: string) => void;
  onEndTag: () => void;
  customPanels: Panel[];
  matchId: string;
  hasSelection: boolean;
  onClearSelection: () => void;
}) {
  return (
    <div className="bg-card h-full flex flex-col rounded-2xl border border-border/40 select-none shadow-sm overflow-hidden @container">
      <Tabs
        className="w-full h-full flex flex-col overflow-hidden"
        defaultValue="core-events"
      >
        <ScrollArea className="w-full shrink-0 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          <TabsList className="justify-start h-auto gap-2 bg-transparent p-4 pb-0 text-foreground w-max min-w-full flex rounded-none border-b border-border/40">
            <TabsTrigger
              value="core-events"
              className="px-3 py-1.5 text-xs font-semibold rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground hover:text-foreground cursor-pointer shadow-none shrink-0"
            >
              <ShieldCheck className="w-3.5 h-3.5 @[280px]:mr-1.5 mr-0 shrink-0" />
              <span className="hidden @[280px]:inline">Core Events</span>
            </TabsTrigger>
            <TabsTrigger
              value="custom-events"
              className="px-3 py-1.5 text-xs font-semibold rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground hover:text-foreground cursor-pointer shadow-none flex items-center shrink-0"
            >
              <Tag className="w-3.5 h-3.5 @[280px]:mr-1.5 mr-0 shrink-0" />
              <span className="hidden @[280px]:inline">Custom Panels</span>
              {customPanels.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 rounded-full text-[9px] h-4 px-1.5 bg-muted">
                  {customPanels.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" className="opacity-0" />
        </ScrollArea>

        {/* Active Range Selection Banner */}
        {hasSelection && !activeTag && (
          <div className="min-h-8 bg-primary/10 border-b border-primary/20 text-primary flex items-center px-4 gap-2 text-xs font-semibold shrink-0 overflow-hidden">
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            <span className="truncate">Range Selected — Click an event to tag.</span>
            <button onClick={onClearSelection} className="ml-auto text-[10px] tracking-wider uppercase hover:underline shrink-0">
              Cancel
            </button>
          </div>
        )}

        {/* Active Tag Recording Banner */}
        {activeTag && (
          <div className="h-8 bg-destructive/10 border-b border-destructive/20 text-destructive flex items-center px-4 gap-2 text-xs font-semibold shrink-0 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-ping" />
            <span>Recording: {activeTag.eventName}</span>
            <button onClick={onEndTag} className="ml-auto text-[10px] tracking-wider uppercase hover:underline">
              Stop
            </button>
          </div>
        )}

        <div className="flex-1 overflow-hidden min-h-0">
          {/* Core Events Tab */}
          <TabsContent
            value="core-events"
            className="p-4 flex flex-col h-full overflow-hidden min-h-0 mt-0"
          >
            <ScrollArea className="flex-1 pr-1 min-h-0 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
              <div className="space-y-6">
                {Categories.map((cat, index) => (
                  <div 
                    key={cat.name}
                    className={`${index > 0 ? "border-t border-border/30 pt-4" : ""}`}
                  >
                    <h4 className="text-[11px] uppercase tracking-wider text-muted-foreground/60 font-bold mb-2">
                      {cat.name}
                    </h4>

                    <div className="flex flex-col gap-1.5">
                      {cat.events.map((ev) => {
                        const isActive =
                          activeTag?.eventName === ev &&
                          activeTag?.categoryName === cat.name;
                        return (
                          <button
                            key={ev}
                            className={`w-full text-left px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all duration-200 flex items-center justify-between group ${
                              isActive
                                ? "bg-destructive/15 border-destructive text-destructive ring-1 ring-destructive"
                                : "bg-muted/30 hover:bg-muted/70 border-border/40 text-foreground/80 hover:text-foreground hover:border-primary/45"
                            }`}
                            onClick={() => onStartTag(cat.name, ev)}
                          >
                            <span className="truncate pr-2">{ev}</span>
                            {isActive ? (
                              <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-ping shrink-0" />
                            ) : (
                              <Plus className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </TabsContent>

          {/* Custom Events Tab */}
          <TabsContent
            value="custom-events"
            className="p-4 flex flex-col h-full overflow-hidden min-h-0 mt-0"
          >
            <ScrollArea className="flex-1 pr-1 min-h-0 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
              {customPanels.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-muted/50 p-4 rounded-full mb-3 border border-border/30">
                    <Tag className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-sm font-semibold">No Custom Panels</h3>
                  <p className="text-muted-foreground text-xs max-w-[200px] mt-1">
                    Create custom panels in the Tags Dashboard to see them here.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 text-xs font-semibold border-border/60 hover:bg-muted"
                    onClick={() => window.open("/tags", "_blank")}
                  >
                    Go to Tags Dashboard
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {customPanels.map((panel, index) => (
                    <div 
                      key={panel.id}
                      className={`${index > 0 ? "border-t border-border/30 pt-4" : ""}`}
                    >
                      <h4 className="text-[11px] uppercase tracking-wider text-muted-foreground/60 font-bold mb-2 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-primary" />
                        {panel.title}
                      </h4>

                      <div className="flex flex-col gap-1.5">
                        {panel.tags.length > 0 ? (
                          panel.tags.map((tag) => {
                            const isActive =
                              activeTag?.eventName === tag &&
                              activeTag?.categoryName === panel.title;
                            return (
                              <button
                                key={tag}
                                className={`w-full text-left px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all duration-200 flex items-center justify-between group ${
                                  isActive
                                    ? "bg-destructive/15 border-destructive text-destructive ring-1 ring-destructive"
                                    : "bg-muted/30 hover:bg-muted/70 border-border/40 text-foreground/80 hover:text-foreground hover:border-primary/45"
                                }`}
                                onClick={() => onStartTag(panel.title, tag)}
                              >
                                <span className="truncate pr-2">{tag}</span>
                                {isActive ? (
                                  <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-ping shrink-0" />
                                ) : (
                                  <Plus className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                                )}
                              </button>
                            );
                          })
                        ) : (
                          <span className="text-xs text-muted-foreground/50 italic pl-1">
                            No tags in this panel
                          </span>
                        )}
                      </div>
                      
                      <LinkedBoardsSection
                        projectId={matchId}
                        tagId={panel.id}
                      />
                    </div>
                  ))}
                </div>
              )}
              <ScrollBar orientation="vertical" />
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
  currentTime,
  duration,
  onPlayClip,
  onDeleteTag,
  onEditTag,
  onUpdateTag,
  matchId,
  videoRef,
  selectionRange,
  setSelectionRange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  zoom,
  setZoom,
  setClipTag,
  handleOpenTacticalBoard,
}: {
  tags: VideoTag[];
  activeTag: VideoTag | null;
  currentTime: number;
  duration: number;
  onPlayClip: (tag: VideoTag) => void;
  onDeleteTag: (id: string) => void;
  onEditTag: (tag: VideoTag) => void;
  onUpdateTag: (tag: VideoTag) => Promise<void>;
  matchId: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  selectionRange: { start: number; end: number } | null;
  setSelectionRange: React.Dispatch<React.SetStateAction<{ start: number; end: number } | null>>;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  setClipTag: React.Dispatch<React.SetStateAction<VideoTag | null>>;
  handleOpenTacticalBoard: (tag: VideoTag) => void;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDraggingSelection, setIsDraggingSelection] = useState(false);
  const [isScrubbingPlayhead, setIsScrubbingPlayhead] = useState(false);
  const [dragStartSec, setDragStartSec] = useState(0);

  // Panning/Scrolling states via standard left-click dragging
  const [isPanning, setIsPanning] = useState(false);
  const [panStartX, setPanStartX] = useState(0);
  const [panStartScrollLeft, setPanStartScrollLeft] = useState(0);

  // Resizing states
  const [resizingTagId, setResizingTagId] = useState<string | null>(null);
  const [tempResize, setTempResize] = useState<{
    id: string;
    startTime: number;
    endTime: number | null;
  } | null>(null);


  // Drag select / scrub start on Ruler
  const handleRulerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    
    if (e.button === 2) {
      // Right-click: start range selection
      e.preventDefault();
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickPercent = clickX / rect.width;
      const sec = clickPercent * duration;

      setIsDraggingSelection(true);
      setDragStartSec(sec);
      setSelectionRange({ start: sec, end: sec });

      if (videoRef.current) {
        videoRef.current.currentTime = sec;
      }
    } else if (e.button === 0) {
      // Left-click: scrub playhead
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickPercent = clickX / rect.width;
      const sec = clickPercent * duration;

      setIsScrubbingPlayhead(true);

      if (videoRef.current) {
        videoRef.current.currentTime = sec;
      }
    }
  };

  // Drag select / scrub move on Ruler
  const handleRulerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const hoverPercent = hoverX / rect.width;
    const sec = Math.max(0, Math.min(duration, hoverPercent * duration));

    if (isDraggingSelection) {
      setSelectionRange({
        start: Math.min(dragStartSec, sec),
        end: Math.max(dragStartSec, sec),
      });
      if (videoRef.current) {
        videoRef.current.currentTime = sec;
      }
    } else if (isScrubbingPlayhead) {
      if (videoRef.current) {
        videoRef.current.currentTime = sec;
      }
    }
  };

  // Drag select end
  const handleRulerMouseUp = () => {
    setIsDraggingSelection(false);
    setIsScrubbingPlayhead(false);
    if (selectionRange && Math.abs(selectionRange.end - selectionRange.start) < 0.2) {
      setSelectionRange(null);
    }
  };

  // Drag handles resize events
  const handleLeftHandleMouseDown = (e: React.MouseEvent, tag: VideoTag) => {
    e.stopPropagation();
    e.preventDefault();
    if (!scrollContainerRef.current || !duration) return;

    const container = scrollContainerRef.current;
    const trackWidth = timelineWidth;
    let latestStartTime = tag.startTime;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouseX = moveEvent.clientX - rect.left + container.scrollLeft;
      let newStart = Math.max(0, (mouseX / trackWidth) * duration);
      
      const currentEnd = tag.endTime !== null ? tag.endTime : currentTime;
      if (newStart >= currentEnd - 0.1) {
        newStart = currentEnd - 0.1;
      }

      latestStartTime = newStart;

      setTempResize({
        id: tag.id,
        startTime: newStart,
        endTime: tag.endTime,
      });

      if (videoRef.current) {
        videoRef.current.currentTime = newStart;
      }
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      const updatedTag = {
        ...tag,
        startTime: latestStartTime,
      };
      void onUpdateTag(updatedTag);
      setTempResize(null);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const handleRightHandleMouseDown = (e: React.MouseEvent, tag: VideoTag) => {
    e.stopPropagation();
    e.preventDefault();
    if (!scrollContainerRef.current || !duration) return;

    const container = scrollContainerRef.current;
    const trackWidth = timelineWidth;
    let latestEndTime = tag.endTime;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouseX = moveEvent.clientX - rect.left + container.scrollLeft;
      let newEnd = Math.max(tag.startTime + 0.1, (mouseX / trackWidth) * duration);
      if (newEnd > duration) {
        newEnd = duration;
      }

      latestEndTime = newEnd;

      setTempResize({
        id: tag.id,
        startTime: tag.startTime,
        endTime: newEnd,
      });

      if (videoRef.current) {
        videoRef.current.currentTime = newEnd;
      }
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      const updatedTag = {
        ...tag,
        endTime: latestEndTime,
      };
      void onUpdateTag(updatedTag);
      setTempResize(null);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // Left-click drag-to-scroll, right-click drag for range selection
  const handleTimelineMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 2) {
      // Right-click: start range selection
      e.preventDefault();
      e.stopPropagation();
      setResizingTagId(null);
      if (!duration) return;
      if (scrollContainerRef.current) {
        const rect = scrollContainerRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left + scrollContainerRef.current.scrollLeft;
        const sec = Math.max(0, Math.min(duration, (clickX / timelineWidth) * duration));
        setIsDraggingSelection(true);
        setDragStartSec(sec);
        setSelectionRange({ start: sec, end: sec });
        if (videoRef.current) {
          videoRef.current.currentTime = sec;
        }
      }
    } else if (e.button === 0) {
      // Left-click: pan/scroll
      setResizingTagId(null);
      setIsPanning(true);
      setPanStartX(e.clientX);
      if (scrollContainerRef.current) {
        setPanStartScrollLeft(scrollContainerRef.current.scrollLeft);
      }
    }
  };

  const handleTimelineMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDraggingSelection && scrollContainerRef.current && duration) {
      e.preventDefault();
      const rect = scrollContainerRef.current.getBoundingClientRect();
      const hoverX = e.clientX - rect.left + scrollContainerRef.current.scrollLeft;
      const sec = Math.max(0, Math.min(duration, (hoverX / timelineWidth) * duration));
      setSelectionRange({
        start: Math.min(dragStartSec, sec),
        end: Math.max(dragStartSec, sec),
      });
      if (videoRef.current) {
        videoRef.current.currentTime = sec;
      }
    } else if (isPanning && scrollContainerRef.current) {
      e.preventDefault();
      const deltaX = e.clientX - panStartX;
      scrollContainerRef.current.scrollLeft = panStartScrollLeft - deltaX;
    }
  };

  const handleTimelineMouseUpOrLeave = () => {
    if (isPanning) {
      setIsPanning(false);
    }
    if (isDraggingSelection) {
      setIsDraggingSelection(false);
      if (selectionRange && Math.abs(selectionRange.end - selectionRange.start) < 0.2) {
        setSelectionRange(null);
      }
    }
  };

  const getCategoryColor = (categoryName: string) => {
    switch (categoryName) {
      case "Attacking Events":
        return "bg-blue-600 border-blue-500 hover:bg-blue-500 text-white";
      case "Defensive Events":
        return "bg-amber-600 border-amber-500 hover:bg-amber-500 text-white";
      case "Transition Events":
        return "bg-teal-600 border-teal-500 hover:bg-teal-500 text-white";
      case "Common Events":
        return "bg-zinc-600 border-zinc-500 hover:bg-zinc-500 text-white";
      default: // Custom category
        return "bg-purple-600 border-purple-500 hover:bg-purple-500 text-white";
    }
  };

  // Separated tracks layout: Attacking, Defensive, Transition, Common, Custom (5 total)
  const tracks = [
    { name: "Attacking", filter: (t: VideoTag) => t.categoryName === "Attacking Events" },
    { name: "Defensive", filter: (t: VideoTag) => t.categoryName === "Defensive Events" },
    { name: "Transition", filter: (t: VideoTag) => t.categoryName === "Transition Events" },
    { name: "Common", filter: (t: VideoTag) => t.categoryName === "Common Events" },
    { name: "Custom", filter: (t: VideoTag) => !["Attacking Events", "Defensive Events", "Transition Events", "Common Events"].includes(t.categoryName) },
  ];

  if (duration === 0) {
    return (
      <div className="bg-card h-full flex flex-col border-t border-border overflow-hidden">
        <div className="px-4 py-2 border-b border-border/40 flex items-center justify-between shrink-0 bg-muted/20">
          <span className="text-xs font-semibold text-muted-foreground">Timeline Tags (List View)</span>
          <Badge variant="secondary" className="rounded-full text-[10px] bg-primary/10 text-primary border border-primary/20">{tags.length} tags</Badge>
        </div>
        <ScrollArea className="flex-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          <div className="p-3 space-y-2">
            {tags.length === 0 && !activeTag && (
              <div className="text-center py-8 text-muted-foreground flex flex-col items-center justify-center">
                <Tag className="h-6 w-6 mb-1.5 text-muted-foreground/60" />
                <p className="text-xs font-medium">No tags yet</p>
                <p className="text-[10px] opacity-70">Click an event button to start tagging</p>
              </div>
            )}
            {tags.map((tag) => (
              <TagItem
                key={tag.id}
                tag={tag}
                onPlay={() => onPlayClip(tag)}
                onDelete={() => onDeleteTag(tag.id)}
                onEdit={() => onEditTag(tag)}
                onCut={() => setClipTag(tag)}
                onOpenBoard={() => handleOpenTacticalBoard(tag)}
                matchId={matchId}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Dynamic timeline width: scale pixels-per-second based on duration so short
  // videos look visibly wider per-second than long ones. A 1:20 video (~80s)
  // gets ~20 px/s while a 20-min video (~1200s) gets ~3.3 px/s before zoom.
  const basePxPerSecond = Math.max(3, 40 - duration * 0.03);
  const timelineWidth = Math.max(1200, duration * basePxPerSecond * zoom);

  const getDynamicTickInterval = () => {
    if (!duration || duration <= 0) return 10;
    const pixelsPerSecond = timelineWidth / duration;
    let rawInterval = 100 / pixelsPerSecond; // target 100px spacing

    const maxTicksLimit = 300;
    const minInterval = duration / maxTicksLimit;
    if (rawInterval < minInterval) {
      rawInterval = minInterval;
    }

    const niceIntervals = [0.1, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 1200, 1800, 3600];
    let closest = niceIntervals[0];
    let minDiff = Math.abs(rawInterval - closest);
    for (let i = 1; i < niceIntervals.length; i++) {
      const diff = Math.abs(rawInterval - niceIntervals[i]);
      if (diff < minDiff) {
        minDiff = diff;
        closest = niceIntervals[i];
      }
    }
    return closest;
  };

  const interval = getDynamicTickInterval();
  const safeInterval = interval > 0 ? interval : 10;
  const tickCount = Math.floor(duration / safeInterval);
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => i * safeInterval);
  const trackRowsStyle = {
    gridTemplateRows: `repeat(${tracks.length}, minmax(0, 1fr))`,
  };

  return (
    <div className="bg-card h-full flex flex-col rounded-2xl border border-border/40 overflow-hidden relative select-none shadow-sm">
      {/* Timeline Header bar */}
      <div className="px-4 py-1.5 border-b border-border/40 flex items-center justify-between shrink-0 bg-muted/25">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Timeline Tracks</span>
          {activeTag && (
            <Badge variant="destructive" className="rounded-full text-[10px] px-2 animate-pulse bg-destructive/10 text-destructive border border-destructive/20 h-4 flex items-center">
              • Recording...
            </Badge>
          )}
          {selectionRange && (
            <Badge className="rounded-full text-[10px] px-2 bg-primary/10 text-primary border border-primary/20 h-4 flex items-center gap-1">
              • Selection Active: {(selectionRange.end - selectionRange.start).toFixed(1)}s
            </Badge>
          )}
        </div>

        {/* Timeline Zoom & History Controls */}
        <div className="flex items-center gap-4">


          {/* Undo/Redo Buttons */}
          <div className="flex items-center gap-1 border-r border-border/40 pr-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg"
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo tag change"
            >
              <Undo className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg"
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo tag change"
            >
              <Redo className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg"
              onClick={() => setZoom((prev) => Math.max(0.05, prev / 1.3))}
              title="Zoom Out (-)"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="text-[10px] text-muted-foreground font-mono w-10 text-center select-none font-semibold">
              {zoom < 1 ? `${Math.round(zoom * 100)}%` : `${zoom.toFixed(1)}x`}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg"
              onClick={() => setZoom((prev) => Math.min(100, prev * 1.3))}
              title="Zoom In (+)"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline tracks body */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Track Headers (Sticky Left) */}
        <div className="w-24 shrink-0 bg-card border-r border-border grid z-10" style={{ gridTemplateRows: `24px repeat(${tracks.length}, minmax(0, 1fr))` }}>
          <div className="border-b border-border/30 bg-muted/30" />
          {tracks.map((track) => (
            <div key={track.name} className="min-h-0 border-b border-border/30 flex items-center px-2 text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60 overflow-hidden">
              {track.name}
            </div>
          ))}
        </div>

        {/* Scrollable Timeline Grid */}
        <div 
          ref={scrollContainerRef}
          className={`flex-1 overflow-x-auto relative [&::-webkit-scrollbar]:hidden [scrollbar-width:none] ${
            isPanning ? "cursor-grabbing" : "cursor-grab"
          }`}
          onMouseDown={handleTimelineMouseDown}
          onMouseMove={handleTimelineMouseMove}
          onMouseUp={handleTimelineMouseUpOrLeave}
          onMouseLeave={handleTimelineMouseUpOrLeave}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div 
            className="relative h-full" 
            style={{ width: `${timelineWidth}px` }}
            onMouseLeave={handleRulerMouseUp}
          >
            {/* Timeline Ruler (h-6) */}
            <div
              className="h-6 bg-muted/30 border-b border-border/30 relative cursor-col-resize select-none z-10"
              onMouseDown={handleRulerMouseDown}
              onMouseMove={handleRulerMouseMove}
              onMouseUp={handleRulerMouseUp}
              onContextMenu={(e) => e.preventDefault()}
            >
              {ticks.map((time) => {
                const percent = (time / duration) * 100;
                return (
                  <div
                    key={time}
                    className="absolute top-0 bottom-0 flex flex-col justify-between items-center pointer-events-none"
                    style={{ left: `${percent}%`, transform: 'translateX(-50%)' }}
                  >
                    <div className="w-[1px] h-1.5 bg-muted-foreground/30" />
                    <span className="text-[9px] font-mono text-muted-foreground/50 select-none pb-0.5">
                      {formatTime(time)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Selection Range Shading Overlay */}
            {selectionRange && (() => {
              const left = (selectionRange.start / duration) * 100;
              const width = ((selectionRange.end - selectionRange.start) / duration) * 100;
              return (
                <div
                  className="absolute top-6 bottom-0 bg-primary/10 border-l border-r border-primary/45 z-10 pointer-events-none"
                  style={{ left: `${left}%`, width: `${width}%` }}
                >
                  <div className="absolute top-1.5 left-2 bg-primary text-primary-foreground text-[9px] font-semibold px-1 py-0.5 rounded shadow-md leading-none">
                    {(selectionRange.end - selectionRange.start).toFixed(1)}s Cut
                  </div>
                </div>
              );
            })()}

            {/* Playhead line (spanning full height) */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-destructive z-20 pointer-events-none transition-all duration-75"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            >
              {/* Playhead Diamond Head */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-3 h-3 bg-destructive rotate-45 rounded-sm shadow-md" />
            </div>

            {/* Tracks Lanes */}
            <div className="absolute left-0 right-0 top-6 bottom-0 grid" style={trackRowsStyle}>
              {tracks.map((track) => {
                const trackTags = tags.filter(track.filter);
                return (
                  <div key={track.name} className="min-h-0 border-b border-border/30 relative bg-muted/5 hover:bg-muted/10 transition-colors overflow-visible">
                    {/* Render active ongoing tag on timeline */}
                    {activeTag && track.filter(activeTag) && (() => {
                      const startPercent = (activeTag.startTime / duration) * 100;
                      const endPercent = (currentTime / duration) * 100;
                      const widthPercent = Math.min(100 - startPercent, Math.max(1.5, endPercent - startPercent));
                      
                      const activeWidthPx = (widthPercent / 100) * timelineWidth;
                      const isActiveCompact = activeWidthPx < 80;
                      const displayActiveWidthPx = Math.max(activeWidthPx, 28);
                      const displayActiveWidthPercent = (displayActiveWidthPx / timelineWidth) * 100;
                      const displayActiveLeftPercent = Math.min(
                        startPercent,
                        Math.max(0, 100 - displayActiveWidthPercent)
                      );

                      return (
                        <div
                          className={`absolute top-1/2 -translate-y-1/2 h-[68%] min-h-7 max-h-10 border flex items-center select-none transition-all duration-200 cursor-pointer shadow-sm bg-destructive/20 border-destructive/40 text-destructive animate-pulse ${
                            isActiveCompact 
                              ? "rounded-full justify-center px-0" 
                              : "rounded-full justify-between px-3 text-xs"
                          }`}
                          style={{
                            left: `${displayActiveLeftPercent}%`,
                            width: `${displayActiveWidthPercent}%`,
                          }}
                        >
                          {isActiveCompact ? (
                            <span className="text-[10px] font-bold text-center leading-none sm:text-xs">
                              🔴
                            </span>
                          ) : (
                            <span className="text-xs font-bold truncate pr-1">
                              🔴 {activeTag.eventName}
                            </span>
                          )}
                        </div>
                      );
                    })()}

                    {/* Render completed tags */}
                    {trackTags.map((tag) => {
                      const isResizing = resizingTagId === tag.id;
                      const hasTemp = tempResize && tempResize.id === tag.id;
                      
                      const startTime = hasTemp ? tempResize.startTime : tag.startTime;
                      const tagEndTime = hasTemp 
                        ? tempResize.endTime 
                        : (tag.endTime !== null ? tag.endTime : currentTime);
                        
                      const startPercent = (startTime / duration) * 100;
                      const endPercent = ((tagEndTime !== null ? tagEndTime : currentTime) / duration) * 100;
                      const widthPercent = Math.min(100 - startPercent, Math.max(1.5, endPercent - startPercent));
                      const colors = getCategoryColor(tag.categoryName);

                      const widthPx = (widthPercent / 100) * timelineWidth;
                      const isCompact = widthPx < 80 && !isResizing;

                      const minDisplayWidth = isResizing ? 80 : 28;
                      const displayWidthPx = Math.max(widthPx, minDisplayWidth);
                      const displayWidthPercent = (displayWidthPx / timelineWidth) * 100;
                      const displayLeftPercent = Math.min(
                        startPercent,
                        Math.max(0, 100 - displayWidthPercent)
                      );

                      return (
                        <div
                          key={tag.id}
                          className={`absolute top-1/2 -translate-y-1/2 h-[68%] min-h-7 max-h-10 border flex items-center select-none transition-all duration-200 shadow-sm group ${
                            isCompact 
                              ? "rounded-full justify-center px-0" 
                              : "rounded-full justify-between px-3 text-xs"
                          } ${
                            isResizing 
                              ? "ring-2 ring-primary border-primary/80 scale-[1.01] z-40 cursor-default animate-none" 
                              : "cursor-pointer hover:scale-[1.02] hover:z-30"
                          } ${colors}`}
                          style={{
                            left: `${displayLeftPercent}%`,
                            width: `${displayWidthPercent}%`,
                          }}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.removeProperty("--mouse-x");
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isResizing) return;
                            onPlayClip(tag);
                          }}
                        >
                          {/* Drag handles for resizing start/end time */}
                          {isResizing && (
                            <>
                              <div
                                onMouseDown={(e) => handleLeftHandleMouseDown(e, tag)}
                                className="absolute left-0 top-0 bottom-0 w-2.5 bg-primary-foreground/90 hover:bg-primary-foreground border-r border-primary/25 cursor-col-resize flex items-center justify-center z-30 select-none rounded-l-full"
                                title="Drag to resize start time"
                              >
                                <span className="w-[1.5px] h-3 bg-primary/70 rounded-full" />
                              </div>
                              <div
                                onMouseDown={(e) => handleRightHandleMouseDown(e, tag)}
                                className="absolute right-0 top-0 bottom-0 w-2.5 bg-primary-foreground/90 hover:bg-primary-foreground border-l border-primary/25 cursor-col-resize flex items-center justify-center z-30 select-none rounded-r-full"
                                title="Drag to resize end time"
                              >
                                <span className="w-[1.5px] h-3 bg-primary/70 rounded-full" />
                              </div>
                            </>
                          )}

                          {isCompact ? (
                            <span className="text-[10px] font-bold text-center leading-none sm:text-xs">
                              {tag.eventName.charAt(0).toUpperCase()}
                            </span>
                          ) : (
                            <span className={`text-xs font-semibold truncate pr-1 ${isResizing ? "px-1.5 opacity-65" : ""}`}>
                              {tag.eventName}
                            </span>
                          )}

                          {/* Hover bridge wrapper */}
                          <div
                            className="absolute bottom-full pb-2 hidden group-hover:block z-50"
                            style={{
                              left: "var(--mouse-x, 50%)",
                              transform: "translateX(-50%)",
                            }}
                          >
                            <div className="flex items-center gap-1.5 bg-popover border border-border text-popover-foreground px-2.5 py-1 rounded-md shadow-lg text-[10px] whitespace-nowrap">
                              <span className="font-mono font-medium opacity-80">
                                {tagEndTime !== null ? `${(tagEndTime - startTime).toFixed(1)}s` : "ongoing"}
                              </span>
                              <div className="w-[1px] h-3 bg-border" />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setResizingTagId(isResizing ? null : tag.id);
                                }}
                                className={`transition p-0.5 ${
                                  isResizing ? "text-primary animate-pulse" : "text-muted-foreground hover:text-primary"
                                }`}
                                title={isResizing ? "Finish resizing" : "Resize duration"}
                              >
                                {isResizing ? <Check className="size-3" /> : <MoveHorizontal className="size-3" />}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditTag(tag);
                                }}
                                className="text-muted-foreground hover:text-primary transition p-0.5"
                                title="Edit tag"
                              >
                                <Edit className="size-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteTag(tag.id);
                                }}
                                className="text-muted-foreground hover:text-destructive transition p-0.5"
                                title="Delete tag"
                              >
                                <Trash2 className="size-3" />
                              </button>
                              <div className="w-[1px] h-3 bg-border" />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setClipTag(tag);
                                }}
                                className="text-muted-foreground hover:text-blue-500 transition p-0.5"
                                title="Cut to clip"
                              >
                                <Scissors className="size-3" />
                              </button>
                              {/* <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenTacticalBoard(tag);
                                }}
                                className="text-muted-foreground hover:text-emerald-500 transition p-0.5"
                                title="Open tactical board"
                              >
                                <LayoutDashboard className="size-3" />
                              </button> */}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TagItem({
  tag,
  onPlay,
  onDelete,
  onEdit,
  onCut,
  onOpenBoard,
  matchId,
}: {
  tag: VideoTag;
  onPlay: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onCut?: () => void;
  onOpenBoard?: () => void;
  matchId: string;
}) {
  const router = useRouter();
  const duration = tag.endTime ? tag.endTime - tag.startTime : 0;
  const isCustomTag = !Categories.some((cat) =>
    cat.events.includes(tag.eventName)
  );

  const getCategoryBorderColor = (categoryName: string) => {
    switch (categoryName) {
      case "Attacking Events":
        return "border-l-4 border-l-blue-500";
      case "Defensive Events":
        return "border-l-4 border-l-amber-500";
      case "Transition Events":
        return "border-l-4 border-l-teal-500";
      case "Common Events":
        return "border-l-4 border-l-zinc-500";
      default:
        return "border-l-4 border-l-purple-500";
    }
  };

  const handleCreateBoard = () => {
    const panelId = tag.tagId || `panel-${tag.categoryName}`;
    sessionStorage.setItem(
      "pendingBoardLink",
      JSON.stringify({
        projectId: matchId,
        tagId: panelId,
        tagName: tag.categoryName,
        eventName: tag.eventName,
      })
    );
    router.push("/board/new?linked=true");
  };

  return (
    <div className={`bg-muted/40 hover:bg-muted/70 rounded-lg p-3 border border-border/30 hover:border-primary/45 transition-colors flex flex-col gap-2 ${getCategoryBorderColor(tag.categoryName)}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate flex items-center gap-1.5">
            {tag.eventName}
            {isCustomTag && (
              <Badge variant="outline" className="text-[9px] h-4 px-1 rounded-full border-primary/20 text-primary">
                Custom
              </Badge>
            )}
          </div>
          <div className="text-[10px] text-muted-foreground/75 uppercase tracking-wider font-semibold">
            {tag.categoryName}
          </div>
        </div>
        <div className="flex gap-0.5">
          <Button
            onClick={onPlay}
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
            title="Play clip"
          >
            <Play className="w-3.5 h-3.5" />
          </Button>
          {tag.endTime !== null && onCut && (
            <Button
              onClick={onCut}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-blue-500 hover:text-blue-400"
              title="Cut to clip"
            >
              <Scissors className="w-4 h-4" />
            </Button>
          )}
          {/* <Button
            onClick={handleCreateBoard}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-emerald-500 hover:text-emerald-400"
            title="Open tactical board"
          >
            <LayoutDashboard className="w-4 h-4" />
          </Button> */}
          <Button
            onClick={handleCreateBoard}
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-primary hover:bg-muted"
            title="Create linked board"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </Button>
          <Button
            onClick={onEdit}
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
            title="Edit tag"
          >
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button
            onClick={onDelete}
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-muted"
            title="Delete tag"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/80">
        <span>{formatTime(tag.startTime)}</span>
        <span>→</span>
        <span>{tag.endTime ? formatTime(tag.endTime) : "ongoing"}</span>
        {tag.endTime && (
          <span className="ml-auto px-1.5 py-0.5 rounded bg-muted text-foreground/80 font-mono text-[9px]">
            {duration.toFixed(1)}s
          </span>
        )}
      </div>

      {tag.notes && (
        <div className="text-[11px] text-muted-foreground italic border-l border-border/80 pl-2 py-0.5 bg-muted/10 mt-1">
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
  customPanels,
}: {
  tag: VideoTag;
  onSave: (tag: VideoTag) => void;
  onCancel: () => void;
  customPanels: Panel[];
}) {
  const [editedTag, setEditedTag] = useState({ ...tag });

  const allCategories = [
    ...Categories.map((cat) => ({
      name: cat.name,
      events: cat.events,
      isCustom: false,
    })),
    ...customPanels.map((panel) => ({
      name: panel.title,
      events: panel.tags,
      isCustom: true,
    })),
  ];

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md bg-card border border-border/60 rounded-2xl shadow-xl select-none font-sans text-foreground">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Edit Tag</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground font-semibold">Event Name</Label>
            <Select
              value={editedTag.eventName}
              onValueChange={(value) => {
                const category = allCategories.find((cat) =>
                  cat.events.includes(value)
                );
                setEditedTag((prev) => ({
                  ...prev,
                  eventName: value,
                  categoryName: category?.name || prev.categoryName,
                }));
              }}
            >
              <SelectTrigger className="w-full bg-muted/30 border-border/50 text-foreground text-xs rounded-lg h-9">
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border text-foreground">
                <SelectGroup>
                  <SelectLabel className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    Core Events
                  </SelectLabel>
                </SelectGroup>
                {Categories.map((category) => (
                  <SelectGroup key={category.name}>
                    <SelectLabel className="pl-4 text-[10px] uppercase tracking-wider text-muted-foreground/60 font-bold">
                      {category.name}
                    </SelectLabel>
                    {category.events.map((event) => (
                      <SelectItem key={event} value={event} className="pl-6 text-xs font-semibold">
                        {event}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}

                {customPanels.length > 0 && (
                  <>
                    <Separator className="my-2" />
                    <SelectGroup>
                      <SelectLabel className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold">
                        <Tag className="w-3.5 h-3.5 text-primary" />
                        Custom Panels
                      </SelectLabel>
                    </SelectGroup>
                    {customPanels.map((panel) => (
                      <SelectGroup key={panel.id}>
                        <SelectLabel className="pl-4 text-[10px] uppercase tracking-wider text-muted-foreground/60 font-bold">
                          {panel.title}
                        </SelectLabel>
                        {panel.tags.map((event) => (
                          <SelectItem
                            key={`${panel.id}-${event}`}
                            value={event}
                            className="pl-6 text-xs font-semibold"
                          >
                            {event}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-semibold">Start Time (seconds)</Label>
              <Input
                type="number"
                step="0.1"
                value={editedTag.startTime}
                className="bg-muted/30 border-border/50 text-foreground text-xs rounded-lg h-9 font-mono"
                onChange={(e) =>
                  setEditedTag((prev) => ({
                    ...prev,
                    startTime: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-semibold">End Time (seconds)</Label>
              <Input
                type="number"
                step="0.1"
                value={editedTag.endTime ?? ""}
                className="bg-muted/30 border-border/50 text-foreground text-xs rounded-lg h-9 font-mono"
                placeholder="Ongoing"
                onChange={(e) =>
                  setEditedTag((prev) => ({
                    ...prev,
                    endTime: parseFloat(e.target.value) || null,
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground font-semibold">Notes (optional)</Label>
            <Textarea
              value={editedTag.notes || ""}
              className="bg-muted/30 border-border/50 text-foreground text-xs rounded-lg min-h-[80px]"
              onChange={(e) =>
                setEditedTag((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Add any notes about this event..."
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/20">
          <Button 
            variant="ghost" 
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg text-xs font-semibold h-9"
          >
            <X className="w-3.5 h-3.5 mr-1.5" />
            Cancel
          </Button>
          <Button 
            onClick={() => onSave({ ...editedTag })}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg text-xs h-9"
          >
            <Check className="w-3.5 h-3.5 mr-1.5" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function VideoUploadComponent({
  onVideoConfirmed,
}: {
  onVideoConfirmed: (file: File) => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const maxSizeGB = 2;
  const maxSize = maxSizeGB * 1024 * 1024 * 1024;

  const validateAndSetFile = (file: File) => {
    if (file.size > maxSize) {
      setError(`Video is too large. Max size is ${maxSizeGB}GB`);
      return;
    }
    setError(null);
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("video/")) validateAndSetFile(f);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) validateAndSetFile(f);
  };

  const handleCancel = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
  };

  const handleConfirm = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    await onVideoConfirmed(selectedFile);
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (selectedFile) {
    return (
      <Card className="w-full max-w-xl mx-auto bg-card border border-border/50 rounded-2xl shadow-xl font-sans text-foreground">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Confirm Video Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border/30 bg-muted/30 p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
              <FileVideo className="h-6 w-6 text-primary" />
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-sm truncate">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>

          {previewUrl && (
            <div className="aspect-video bg-black rounded-lg overflow-hidden border border-border/30">
              <video
                src={previewUrl}
                className="w-full h-full object-contain"
                controls
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 text-xs font-semibold rounded-lg border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/50"
              onClick={handleCancel}
              disabled={isProcessing}
            >
              <X className="w-3.5 h-3.5 mr-1.5" />
              Change Video
            </Button>
            <Button
              className="flex-1 text-xs font-semibold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-primary-foreground" />
              ) : (
                <Check className="w-3.5 h-3.5 mr-1.5" />
              )}
              {isProcessing ? "Saving to Browser..." : "Confirm & Analyze"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full max-w-2xl mx-auto font-sans text-foreground">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        className={`relative flex min-h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all duration-200 cursor-pointer ${
          dragging
            ? "bg-primary/5 border-primary"
            : "border-border/40 bg-card/40 hover:bg-card/60 hover:border-border/60"
        }`}
      >
        <input
          type="file"
          accept="video/*"
          className="absolute inset-0 opacity-0 cursor-pointer z-10"
          onChange={handleFileChange}
        />
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="mb-2 flex size-16 items-center justify-center rounded-full border border-border/40 bg-card shadow-md">
            <FileVideo className="size-8 text-muted-foreground/60" />
          </div>
          <h3 className="font-semibold text-base">Upload Match Video</h3>
          <p className="text-xs text-muted-foreground max-w-xs">
            Drag and drop your video file here, or click to browse.
            <br />
            <span className="text-[10px] opacity-60">
              Video stays in your browser (IndexedDB)
            </span>
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-center gap-2 p-3 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircleIcon className="size-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
