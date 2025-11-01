import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Upload, Square, SkipBack, SkipForward } from 'lucide-react';

interface EventTag {
    eventType: string;
    timestamp: number;
    id: string;
}

const EVENT_CATEGORIES = [
    {
        title: 'Build Up',
        color: 'oklch(0.6 0.2 240)',
        events: ['Build Up', 'Progression', 'Final Third']
    },
    {
        title: 'Defensive Block',
        color: 'oklch(0.6 0.2 280)',
        events: ['High Press', 'Mid Block', 'Low Block']
    },
    {
        title: 'Transitions',
        color: 'oklch(0.65 0.25 320)',
        events: ['Attacking Transition', 'Defensive Transition']
    }
];

const PLAYBACK_SPEEDS = [
    { value: '0.5', label: '0.5x' },
    { value: '1', label: '1x' },
    { value: '1.5', label: '1.5x' },
    { value: '2', label: '2x' }
];

export default function VideoEditor() {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [tags, setTags] = useState<EventTag[]>([]);
    const [playbackSpeed, setPlaybackSpeed] = useState('1');
    const videoRef = useRef<HTMLVideoElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            if (videoUrl) URL.revokeObjectURL(videoUrl);
        };
    }, [videoUrl]);

    useEffect(() => {
        if (videoRef.current) videoRef.current.playbackRate = parseFloat(playbackSpeed);
    }, [playbackSpeed]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('video/')) {
            // Clean up previous video URL
            if (videoUrl) {
                URL.revokeObjectURL(videoUrl);
            }
            
            setVideoFile(file);
            const url = URL.createObjectURL(file);
            setVideoUrl(url);
            setTags([]);
            setCurrentTime(0);
            setIsPlaying(false);
            setPlaybackSpeed('1');
            
            // Reset video player state
            if (videoRef.current) {
                videoRef.current.currentTime = 0;
            }
        }
        // Reset file input so the same file can be selected again
        e.target.value = '';
    };

    const handlePlayPause = () => {
        if (!videoRef.current) return;
        if (isPlaying) videoRef.current.pause();
        else videoRef.current.play();
        setIsPlaying(!isPlaying);
    };

    const handleStop = () => {
        if (!videoRef.current) return;
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        setIsPlaying(false);
        setCurrentTime(0);
    };

    const handleSkipBackward = () => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
    };

    const handleSkipForward = () => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 5);
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) setDuration(videoRef.current.duration || 0);
    };

    const handleTagClick = (eventType: string) => {
        if (!videoRef.current || !videoUrl) return;
        const timestamp = videoRef.current.currentTime;
        const newTag: EventTag = {
            eventType,
            timestamp,
            id: `${eventType}-${timestamp}-${Date.now()}`
        };
        setTags((prev) => [...prev, newTag].sort((a, b) => a.timestamp - b.timestamp));
    };

    const handleTagJump = (timestamp: number) => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = timestamp;
        setCurrentTime(timestamp);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getButtonColor = (eventType: string) => {
        for (const c of EVENT_CATEGORIES) if (c.events.includes(eventType)) return c.color;
        return 'oklch(0.6 0.2 240)';
    };

    return (
        <div className="flex h-screen bg-[oklch(0.2_0_0)]">
            <aside className="w-64 bg-[oklch(0.25_0_0)] border-r border-[oklch(0.3_0_0)] p-4 flex flex-col gap-6">
                {EVENT_CATEGORIES.map((cat) => (
                    <div key={cat.title} className="space-y-3">
                        <h3 className="text-sm font-semibold text-[oklch(0.7_0_0)] mb-3">{cat.title}</h3>
                        {cat.events.map((event) => (
                            <button
                                key={event}
                                onClick={() => handleTagClick(event)}
                                disabled={!videoUrl}
                                className="w-full h-12 text-white font-medium rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: getButtonColor(event), border: 'none' }}
                            >
                                {event}
                            </button>
                        ))}
                    </div>
                ))}
            </aside>

            <main className="flex-1 flex flex-col p-6 gap-6 overflow-auto">
                <div className="flex-1 flex flex-col bg-[oklch(0.18_0_0)] border border-[oklch(0.3_0_0)] rounded-lg overflow-hidden min-h-[60vh]">
                    {/* Video area */}
                    <div className="flex-1 relative">
                        {/* Hidden file input - always rendered */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="video/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        
                        {!videoUrl ? (
                            <div
                                className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-[oklch(0.4_0_0)] rounded-lg cursor-pointer hover:border-[oklch(0.5_0_0)] transition-colors m-6"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="w-16 h-16 text-[oklch(0.5_0_0)] mb-4" />
                                <p className="text-[oklch(0.6_0_0)] text-lg font-medium">Click to upload a video</p>
                                <p className="text-[oklch(0.5_0_0)] text-sm mt-2">Supports MP4, WebM, and other formats</p>
                            </div>
                        ) : (
                            <video
                                ref={videoRef}
                                src={videoUrl}
                                className="absolute inset-0 w-full h-full object-contain"
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleLoadedMetadata}
                                onEnded={() => setIsPlaying(false)}
                            />
                        )}
                    </div>

                    {/* Controls - Always visible but disabled when no video */}
                    <div className="p-4 border-t border-[oklch(0.3_0_0)] bg-[oklch(0.22_0_0)]">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePlayPause}
                                    disabled={!videoUrl}
                                    className="p-2 rounded-md bg-[oklch(0.6_0.2_240)] hover:bg-[oklch(0.65_0.2_240)] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                </button>

                                <button
                                    onClick={handleStop}
                                    disabled={!videoUrl}
                                    className="p-2 rounded-md bg-[oklch(0.6_0.2_280)] hover:bg-[oklch(0.65_0.2_280)] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Square className="w-5 h-5" />
                                </button>

                                <button
                                    onClick={handleSkipBackward}
                                    disabled={!videoUrl}
                                    className="p-2 rounded-md border border-[oklch(0.4_0_0)] text-[oklch(0.7_0_0)] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <SkipBack className="w-5 h-5" />
                                </button>

                                <button
                                    onClick={handleSkipForward}
                                    disabled={!videoUrl}
                                    className="p-2 rounded-md border border-[oklch(0.4_0_0)] text-[oklch(0.7_0_0)] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <SkipForward className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 flex items-center gap-3">
                                <span className="text-[oklch(0.7_0_0)] text-sm font-mono min-w-[3ch]">
                                    {formatTime(currentTime)}
                                </span>
                                <div className="flex-1 h-2 bg-[oklch(0.3_0_0)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[oklch(0.6_0.2_240)] transition-all"
                                        style={{ width: `${(currentTime / Math.max(duration, 1)) * 100}%` }}
                                    />
                                </div>
                                <span className="text-[oklch(0.7_0_0)] text-sm font-mono min-w-[3ch]">
                                    {formatTime(duration)}
                                </span>
                            </div>

                            <select
                                value={playbackSpeed}
                                onChange={(e) => setPlaybackSpeed(e.target.value)}
                                disabled={!videoUrl}
                                className="w-24 bg-[oklch(0.25_0_0)] border border-[oklch(0.4_0_0)] text-[oklch(0.7_0_0)] px-2 py-1 rounded disabled:opacity-50"
                            >
                                {PLAYBACK_SPEEDS.map((s) => (
                                    <option key={s.value} value={s.value}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>

                            <button
                                onClick={() => {
                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = '';
                                        fileInputRef.current.click();
                                    }
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[oklch(0.4_0_0)] text-[oklch(0.7_0_0)] hover:bg-[oklch(0.3_0_0)] transition-colors"
                            >
                                <Upload className="w-4 h-4" />
                                Change Video
                            </button>
                        </div>
                    </div>
                </div>

                <div className="h-64 bg-[oklch(0.18_0_0)] border border-[oklch(0.3_0_0)] rounded-lg overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-[oklch(0.3_0_0)]">
                        <h2 className="text-lg font-semibold text-[oklch(0.85_0_0)]">Event Timeline</h2>
                        <p className="text-sm text-[oklch(0.6_0_0)] mt-1">
                            {tags.length === 0 ? 'No events tagged yet. Click event buttons while playing the video.' : `${tags.length} event${tags.length !== 1 ? 's' : ''} tagged`}
                        </p>
                    </div>
                    <div className="flex-1 p-4 overflow-auto">
                        <div className="space-y-2">
                            {tags.map((tag) => (
                                <button
                                    key={tag.id}
                                    onClick={() => handleTagJump(tag.timestamp)}
                                    className="w-full p-3 rounded-lg bg-[oklch(0.25_0_0)] hover:bg-[oklch(0.3_0_0)] border border-[oklch(0.35_0_0)] transition-all text-left group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getButtonColor(tag.eventType) }} />
                                            <span className="text-[oklch(0.85_0_0)] font-medium">{tag.eventType}</span>
                                        </div>
                                        <span className="text-[oklch(0.6_0_0)] font-mono text-sm group-hover:text-[oklch(0.7_0_0)]">{formatTime(tag.timestamp)}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}