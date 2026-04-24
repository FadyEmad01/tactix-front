'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Download, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatTime } from '@/lib/video-utils';
import { clipVideo } from '@/lib/video-clip';
import { getVideoFromDB } from '@/lib/match/video-db';
import type { Tag as VideoTag } from '@/types/video-editor';

interface ClipPreviewModalProps {
  open: boolean;
  onClose: () => void;
  tag: VideoTag;
  matchId: string;
}

type ClipState = 'loading' | 'processing' | 'ready' | 'error';

export default function ClipPreviewModal({
  open,
  onClose,
  tag,
  matchId,
}: ClipPreviewModalProps) {
  const [state, setState] = useState<ClipState>('loading');
  const [progress, setProgress] = useState(0);
  const [clipUrl, setClipUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const clipUrlRef = useRef<string | null>(null);

  const processClip = useCallback(async () => {
    setState('loading');
    setProgress(0);
    setErrorMsg('');

    try {
      const file = await getVideoFromDB(matchId);
      if (!file) throw new Error('Video file not found in browser storage.');

      setState('processing');

      const blob = await clipVideo(
        file,
        tag.startTime,
        tag.endTime!,
        (pct) => setProgress(pct),
      );

      const url = URL.createObjectURL(blob);
      clipUrlRef.current = url;
      setClipUrl(url);
      setState('ready');
    } catch (err) {
      console.error('Clip error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to create clip.');
      setState('error');
    }
  }, [matchId, tag.startTime, tag.endTime]);

  useEffect(() => {
    if (open) {
      processClip();
    }
    return () => {
      if (clipUrlRef.current) {
        URL.revokeObjectURL(clipUrlRef.current);
        clipUrlRef.current = null;
      }
      setClipUrl(null);
      setState('loading');
      setProgress(0);
    };
  }, [open, processClip]);

  const handleDownload = useCallback(() => {
    if (!clipUrl) return;
    const a = document.createElement('a');
    a.href = clipUrl;
    a.download = `${tag.eventName}-${formatTime(tag.startTime)}-${formatTime(tag.endTime!)}.mp4`
      .replace(/:/g, '-');
    a.click();
  }, [clipUrl, tag.eventName, tag.startTime, tag.endTime]);

  const duration = tag.endTime! - tag.startTime;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{tag.eventName}</span>
            <span className="text-sm font-normal text-muted-foreground">
              {formatTime(tag.startTime)} → {formatTime(tag.endTime!)} ({duration.toFixed(1)}s)
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Loading ffmpeg */}
          {state === 'loading' && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm">Loading video processor…</p>
              <p className="text-xs opacity-60">First time may take a few seconds</p>
            </div>
          )}

          {/* Processing */}
          {state === 'processing' && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Cutting clip…</p>
              <div className="w-full max-w-xs bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{progress}%</p>
            </div>
          )}

          {/* Error */}
          {state === 'error' && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <X className="w-10 h-10 text-destructive" />
              <p className="text-sm font-medium">Failed to create clip</p>
              <p className="text-xs text-muted-foreground text-center max-w-sm">{errorMsg}</p>
              <Button variant="outline" size="sm" onClick={processClip}>
                Try again
              </Button>
            </div>
          )}

          {/* Ready — video preview */}
          {state === 'ready' && clipUrl && (
            <div className="rounded-lg overflow-hidden bg-black aspect-video">
              <video
                src={clipUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={handleDownload}
            disabled={state !== 'ready'}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Download MP4
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
