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
import { Check, Edit, Maximize, Minimize, Pause, Play, Redo, Settings, StopCircle, Timer, Trash2, Undo, Volume2, VolumeX, X, ChevronRight } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const generateId = () => `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export default function Page() {
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

    const newTags = [...tags, completedTag].sort((a, b) => a.startTime - b.startTime);
    setTags(newTags);
    addToHistory(newTags);
    setActiveTag(null);
  };

  // Play clip from tag
  const playClip = (tag: Tag) => {
    if (!videoRef.current) return;

    videoRef.current.currentTime = tag.startTime;
    videoRef.current.play();

    // Pause at end time
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
    const newTags = tags.filter(t => t.id !== tagId);
    setTags(newTags);
    addToHistory(newTags);
  };

  // Update tag
  const updateTag = (updatedTag: Tag) => {
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

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  return (
    <main className="h-svh overflow-hidden py-10">
      <Container className="max-w-full h-full">
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
                  containerRef={containerRef}
                  currentTime={currentTime}
                  activeTag={activeTag}
                  isFullscreen={isFullscreen}
                  onEndTag={endActiveTag}
                  onStartTag={startTag}
                  onEnterFullscreen={enterFullscreen}
                  onExitFullscreen={exitFullscreen}
                  tags={tags}
                  onPlayClip={playClip}
                  onUndo={undo}
                  onRedo={redo}
                  canUndo={historyIndex > 0}
                  canRedo={historyIndex < tagHistory.length - 1}
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

// Helper function to parse time input (MM:SS or seconds)
function parseTimeInput(input: string): number | null {
  if (!input) return null;
  
  const asNumber = parseFloat(input);
  if (!isNaN(asNumber)) return asNumber;
  
  const parts = input.split(':');
  if (parts.length === 2) {
    const minutes = parseInt(parts[0]);
    const seconds = parseFloat(parts[1]);
    if (!isNaN(minutes) && !isNaN(seconds)) {
      return minutes * 60 + seconds;
    }
  }
  
  return null;
}

// Settings Submenus
function SpeedSubmenu({
  currentRate,
  onRateChange,
  onBack
}: {
  currentRate: number;
  onRateChange: (rate: number) => void;
  onBack: () => void;
}) {
  const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  return (
    <div className="py-2">
      <button
        onClick={onBack}
        className="w-full px-4 py-2 flex items-center gap-2 hover:bg-muted transition-colors text-left border-b"
      >
        <ChevronRight className="h-4 w-4 rotate-180" />
        <span className="text-sm font-medium">Playback speed</span>
      </button>
      {speeds.map((speed) => (
        <button
          key={speed}
          onClick={() => onRateChange(speed)}
          className={`w-full px-4 py-2 flex items-center justify-between hover:bg-muted transition-colors text-left ${
            currentRate === speed ? 'bg-muted' : ''
          }`}
        >
          <span className="text-sm">{speed === 1 ? 'Normal' : `${speed}x`}</span>
          {currentRate === speed && <Check className="h-4 w-4" />}
        </button>
      ))}
    </div>
  );
}

function QualitySubmenu({
  selectedQuality,
  onQualityChange,
  onBack
}: {
  selectedQuality: string;
  onQualityChange: (quality: string) => void;
  onBack: () => void;
}) {
  const qualities = ['Auto', '1080p', '720p', '480p', '360p'];

  return (
    <div className="py-2">
      <button
        onClick={onBack}
        className="w-full px-4 py-2 flex items-center gap-2 hover:bg-muted transition-colors text-left border-b"
      >
        <ChevronRight className="h-4 w-4 rotate-180" />
        <span className="text-sm font-medium">Quality</span>
      </button>
      {qualities.map((quality) => (
        <button
          key={quality}
          onClick={() => onQualityChange(quality)}
          className={`w-full px-4 py-2 flex items-center justify-between hover:bg-muted transition-colors text-left ${
            selectedQuality === quality ? 'bg-muted' : ''
          }`}
        >
          <span className="text-sm">{quality}</span>
          {selectedQuality === quality && <Check className="h-4 w-4" />}
        </button>
      ))}
    </div>
  );
}

function LoopSubmenu({
  isLooping,
  loopStart,
  loopEnd,
  duration,
  onToggle,
  onStartChange,
  onEndChange,
  onBack
}: {
  isLooping: boolean;
  loopStart: number;
  loopEnd: number;
  duration: number;
  onToggle: () => void;
  onStartChange: (time: number) => void;
  onEndChange: (time: number) => void;
  onBack: () => void;
}) {
  const [startInput, setStartInput] = useState(formatTime(loopStart));
  const [endInput, setEndInput] = useState(formatTime(loopEnd));

  const handleStartSubmit = () => {
    const time = parseTimeInput(startInput);
    if (time !== null && time >= 0 && time < loopEnd) {
      onStartChange(time);
    }
  };

  const handleEndSubmit = () => {
    const time = parseTimeInput(endInput);
    if (time !== null && time > loopStart && time <= duration) {
      onEndChange(time);
    }
  };

  return (
    <div className="py-2">
      <button
        onClick={onBack}
        className="w-full px-4 py-2 flex items-center gap-2 hover:bg-muted transition-colors text-left border-b"
      >
        <ChevronRight className="h-4 w-4 rotate-180" />
        <span className="text-sm font-medium">Loop</span>
      </button>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm">Enable loop</span>
          <Button
            size="sm"
            variant={isLooping ? "default" : "outline"}
            onClick={onToggle}
          >
            {isLooping ? "On" : "Off"}
          </Button>
        </div>
        {isLooping && (
          <>
            <div className="space-y-2">
              <Label className="text-xs">Loop start</Label>
              <div className="flex gap-2">
                <Input
                  value={startInput}
                  onChange={(e) => setStartInput(e.target.value)}
                  placeholder="00:00"
                  className="text-sm h-8"
                />
                <Button size="sm" onClick={handleStartSubmit} className="h-8">Set</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Loop end</Label>
              <div className="flex gap-2">
                <Input
                  value={endInput}
                  onChange={(e) => setEndInput(e.target.value)}
                  placeholder="00:00"
                  className="text-sm h-8"
                />
                <Button size="sm" onClick={handleEndSubmit} className="h-8">Set</Button>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Looping: {formatTime(loopStart)} → {formatTime(loopEnd)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function GoToTimeSubmenu({
  duration,
  onGoToTime,
  onBack
}: {
  duration: number;
  onGoToTime: (time: number) => void;
  onBack: () => void;
}) {
  const [timeInput, setTimeInput] = useState("");

  const handleSubmit = () => {
    const time = parseTimeInput(timeInput);
    if (time !== null && time >= 0 && time <= duration) {
      onGoToTime(time);
    }
  };

  return (
    <div className="py-2">
      <button
        onClick={onBack}
        className="w-full px-4 py-2 flex items-center gap-2 hover:bg-muted transition-colors text-left border-b"
      >
        <ChevronRight className="h-4 w-4 rotate-180" />
        <span className="text-sm font-medium">Go to time</span>
      </button>
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <Label className="text-xs">Time (MM:SS or seconds)</Label>
          <div className="flex gap-2">
            <Input
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              placeholder="00:00 or 0"
              className="text-sm h-8"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <Button size="sm" onClick={handleSubmit} className="h-8">Go</Button>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Video duration: {formatTime(duration)}
        </div>
      </div>
    </div>
  );
}

// Settings Menu Component
type Submenu = "main" | "speed" | "quality" | "loop" | "goto";

interface MenuItemProps {
  label: string;
  value?: string;
  onClick: () => void;
}

const MenuItem = ({ label, value, onClick }: MenuItemProps) => (
  <button
    onClick={onClick}
    className="w-full px-4 py-2 flex items-center justify-between hover:bg-muted transition-colors text-left"
  >
    <span className="text-sm">{label}</span>
    <div className="flex items-center gap-2">
      {value && <span className="text-sm text-muted-foreground">{value}</span>}
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </div>
  </button>
);

function SettingsMenu({
  playbackRate,
  onPlaybackRateChange,
  isLooping,
  loopStart,
  loopEnd,
  onLoopToggle,
  onLoopStartChange,
  onLoopEndChange,
  onGoToTime,
  duration,
  selectedQuality,
  onQualityChange,
}: {
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;
  isLooping: boolean;
  loopStart: number;
  loopEnd: number;
  onLoopToggle: () => void;
  onLoopStartChange: (time: number) => void;
  onLoopEndChange: (time: number) => void;
  onGoToTime: (time: number) => void;
  duration: number;
  selectedQuality: string;
  onQualityChange: (quality: string) => void;
}) {
  const [activeSubmenu, setActiveSubmenu] = useState<Submenu>("main");
  const [open, setOpen] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setActiveSubmenu("main");
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-0"
        align="end"
        side="top"
      >
        {activeSubmenu === "main" && (
          <div className="py-2">
            <MenuItem
              label="Playback speed"
              value={playbackRate === 1 ? "Normal" : `${playbackRate}x`}
              onClick={() => setActiveSubmenu("speed")}
            />
            <MenuItem
              label="Quality"
              value={selectedQuality}
              onClick={() => setActiveSubmenu("quality")}
            />
            <MenuItem
              label="Loop"
              value={isLooping ? "On" : "Off"}
              onClick={() => setActiveSubmenu("loop")}
            />
            <MenuItem
              label="Go to time"
              onClick={() => setActiveSubmenu("goto")}
            />
          </div>
        )}

        {activeSubmenu === "speed" && (
          <SpeedSubmenu
            currentRate={playbackRate}
            onRateChange={(rate) => {
              onPlaybackRateChange(rate);
              setActiveSubmenu("main");
            }}
            onBack={() => setActiveSubmenu("main")}
          />
        )}

        {activeSubmenu === "quality" && (
          <QualitySubmenu
            selectedQuality={selectedQuality}
            onQualityChange={(quality) => {
              onQualityChange(quality);
              setActiveSubmenu("main");
            }}
            onBack={() => setActiveSubmenu("main")}
          />
        )}

        {activeSubmenu === "loop" && (
          <LoopSubmenu
            isLooping={isLooping}
            loopStart={loopStart}
            loopEnd={loopEnd}
            duration={duration}
            onToggle={onLoopToggle}
            onStartChange={onLoopStartChange}
            onEndChange={onLoopEndChange}
            onBack={() => setActiveSubmenu("main")}
          />
        )}

        {activeSubmenu === "goto" && (
          <GoToTimeSubmenu
            duration={duration}
            onGoToTime={(time) => {
              onGoToTime(time);
              setOpen(false);
              setActiveSubmenu("main");
            }}
            onBack={() => setActiveSubmenu("main")}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}

function VideoPanel({
  videoRef,
  containerRef,
  currentTime,
  activeTag,
  isFullscreen,
  onEndTag,
  onStartTag,
  onEnterFullscreen,
  onExitFullscreen,
  tags,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}: VideoPanelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(Categories[0].name);
  const [selectedEvent, setSelectedEvent] = useState(Categories[0].events[0]);
  const [isLooping, setIsLooping] = useState(false);
  const [loopStart, setLoopStart] = useState(0);
  const [loopEnd, setLoopEnd] = useState(0);
  const [selectedQuality, setSelectedQuality] = useState('Auto');
  const [isControlsHovered, setIsControlsHovered] = useState(false);
  
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setLoopEnd(video.duration);
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  // Loop functionality
  useEffect(() => {
    if (!isLooping || !videoRef.current) return;

    const video = videoRef.current;
    const handleTimeUpdate = () => {
      if (video.currentTime >= loopEnd) {
        video.currentTime = loopStart;
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [isLooping, loopStart, loopEnd]);

  // YouTube-like controls visibility
  useEffect(() => {
    if (!isFullscreen) {
      setShowControls(true);
      return;
    }

    const scheduleHide = () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }

      // Don't hide if hovering controls
      if (isControlsHovered) {
        setShowControls(true);
        return;
      }

      setShowControls(true);
      hideControlsTimeoutRef.current = setTimeout(() => {
        if (!isControlsHovered) {
          setShowControls(false);
        }
      }, 3000);
    };

    scheduleHide();

    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, [isFullscreen, isControlsHovered, currentTime]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      videoRef.current.muted = newMuted;
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const handleMouseMove = () => {
    if (isFullscreen) {
      setShowControls(true);
    }
  };

  const handleStartFullscreenTag = () => {
    onStartTag(selectedCategory, selectedEvent);
  };

  const handleGoToTime = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const toggleFullscreen = () => {
    if (isFullscreen && onExitFullscreen) {
      onExitFullscreen();
    } else {
      onEnterFullscreen();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          toggleMute();
          break;
        case 'ArrowLeft':
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
          break;
        case 'ArrowRight':
          videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 5);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isFullscreen, duration]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-3xl bg-black overflow-hidden relative group"
      onMouseMove={handleMouseMove}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        preload="metadata"
        onClick={togglePlay}
      >
        <source src="https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
      </video>

      {/* Active Tag Indicator (Non-Fullscreen) */}
      {!isFullscreen && activeTag && (
        <div className="absolute top-4 left-4 right-4 bg-red-600/90 text-white p-3 rounded-lg flex items-center justify-between animate-pulse z-10">
          <div>
            <div className="font-bold">{activeTag.eventName}</div>
            <div className="text-sm opacity-90">Recording since {formatTime(activeTag.startTime)}</div>
          </div>
          <Button onClick={onEndTag} variant="secondary" size="sm" className="bg-white text-red-600 hover:bg-gray-100">
            <StopCircle className="w-4 h-4 mr-2" />
            End Tag
          </Button>
        </div>
      )}

      {/* Fullscreen Tagging Toolbar */}
      {isFullscreen && (
        <div 
          className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/90 to-transparent p-6 transition-all duration-300 z-20 ${
            showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
          onMouseEnter={() => setIsControlsHovered(true)}
          onMouseLeave={() => setIsControlsHovered(false)}
        >
          <div className="max-w-7xl mx-auto">
            {activeTag ? (
              <div className="bg-red-600/95 text-white p-4 rounded-lg flex items-center justify-between backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <Timer className="w-6 h-6 animate-pulse" />
                  <div>
                    <div className="font-bold text-lg">{activeTag.eventName}</div>
                    <div className="text-sm opacity-90 flex items-center gap-3">
                      <span>Start: {formatTime(activeTag.startTime)}</span>
                      <span>•</span>
                      <span>Duration: {formatTime(currentTime - activeTag.startTime)}</span>
                    </div>
                  </div>
                </div>
                <Button onClick={onEndTag} variant="secondary" size="lg" className="bg-white text-red-600 hover:bg-gray-100">
                  <StopCircle className="w-5 h-5 mr-2" />
                  Stop Tag
                </Button>
              </div>
            ) : (
              <div className="bg-gray-900/95 text-white p-4 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <Select value={selectedCategory} onValueChange={(val) => {
                      setSelectedCategory(val);
                      const cat = Categories.find(c => c.name === val);
                      if (cat) setSelectedEvent(cat.events[0]);
                    }}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Categories.map(cat => (
                          <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Categories.find(c => c.name === selectedCategory)?.events.map(ev => (
                          <SelectItem key={ev} value={ev}>{ev}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleStartFullscreenTag} size="lg" className="bg-red-600 hover:bg-red-700">
                    <Play className="w-5 h-5 mr-2" />
                    Start Tag
                  </Button>
                  <div className="flex gap-2">
                    <Button onClick={onUndo} disabled={!canUndo} variant="ghost" size="icon" className="text-white hover:bg-white/20 disabled:opacity-30">
                      <Undo className="w-5 h-5" />
                    </Button>
                    <Button onClick={onRedo} disabled={!canRedo} variant="ghost" size="icon" className="text-white hover:bg-white/20 disabled:opacity-30">
                      <Redo className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Video Controls */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-all duration-300 z-20 ${
          (!isFullscreen || showControls) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        onMouseEnter={() => setIsControlsHovered(true)}
        onMouseLeave={() => setIsControlsHovered(false)}
      >
        <div className="p-4 space-y-2">
          {/* Timeline with Tag Markers */}
          <div className="relative group/timeline">
            <Slider
              value={[currentTime]}
              max={duration}
              step={0.1}
              onValueChange={handleSeek}
              className="cursor-pointer"
            />
            {/* Tag Markers */}
            <div className="absolute inset-0 pointer-events-none">
              {tags.map(tag => {
                const startPercent = (tag.startTime / duration) * 100;
                const endPercent = tag.endTime ? (tag.endTime / duration) * 100 : startPercent;
                return (
                  <div
                    key={tag.id}
                    className="absolute top-0 h-full bg-blue-500/60 rounded"
                    style={{
                      left: `${startPercent}%`,
                      width: `${Math.max(endPercent - startPercent, 0.5)}%`,
                    }}
                    title={`${tag.eventName} (${formatTime(tag.startTime)} - ${formatTime(tag.endTime || 0)})`}
                  />
                );
              })}
              {/* Loop markers */}
              {isLooping && (
                <>
                  <div
                    className="absolute top-0 h-full border-l-2 border-green-400"
                    style={{ left: `${(loopStart / duration) * 100}%` }}
                    title={`Loop start: ${formatTime(loopStart)}`}
                  />
                  <div
                    className="absolute top-0 h-full border-r-2 border-green-400"
                    style={{ left: `${(loopEnd / duration) * 100}%` }}
                    title={`Loop end: ${formatTime(loopEnd)}`}
                  />
                  <div
                    className="absolute top-0 h-full bg-green-400/20"
                    style={{
                      left: `${(loopStart / duration) * 100}%`,
                      width: `${((loopEnd - loopStart) / duration) * 100}%`,
                    }}
                  />
                </>
              )}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <Button onClick={togglePlay} variant="ghost" size="icon" className="text-white hover:bg-white/20">
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </Button>
              <div className="flex items-center gap-2">
                <Button onClick={toggleMute} variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                <div className="w-24 group-hover/controls:w-32 transition-all">
                  <Slider value={[isMuted ? 0 : volume]} max={1} step={0.01} onValueChange={handleVolumeChange} />
                </div>
              </div>
              <span className="text-sm font-mono tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <SettingsMenu
                playbackRate={playbackRate}
                onPlaybackRateChange={handlePlaybackRateChange}
                isLooping={isLooping}
                loopStart={loopStart}
                loopEnd={loopEnd}
                onLoopToggle={() => setIsLooping(!isLooping)}
                onLoopStartChange={setLoopStart}
                onLoopEndChange={setLoopEnd}
                onGoToTime={handleGoToTime}
                duration={duration}
                selectedQuality={selectedQuality}
                onQualityChange={setSelectedQuality}
              />
              <Button onClick={toggleFullscreen} variant="ghost" size="icon" className="text-white hover:bg-white/20">
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
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
          <TabsContent value="tagging-events" className="p-4 flex flex-col h-full overflow-hidden min-h-0 mt-0">

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
              <div className="space-y-6 pb-4">
                {Categories.map((cat) => (
                  <Card key={cat.name}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
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
                            className={isActive ? "animate-pulse" : ""}
                          >
                            {ev}
                          </Button>
                        );
                      })}
                    </CardContent>
                  </Card>
                ))}
              </div>
              <ScrollBar orientation="vertical" />
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
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg">Timeline Tags</h3>
        <p className="text-sm text-muted-foreground">
          {tags.length} tag{tags.length !== 1 ? 's' : ''} created
          {activeTag && <span className="text-red-600 ml-2">• Recording...</span>}
        </p>
      </div>

      <ScrollArea className="flex-1 min-h-0">
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
          <Button onClick={onPlay} size="sm" variant="ghost" className="h-8 w-8 p-0" title="Play clip">
            <Play className="w-4 h-4" />
          </Button>
          <Button onClick={onEdit} size="sm" variant="ghost" className="h-8 w-8 p-0" title="Edit tag">
            <Edit className="w-4 h-4" />
          </Button>
          <Button onClick={onDelete} size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" title="Delete tag">
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