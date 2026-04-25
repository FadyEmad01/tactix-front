'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Cloud, Download, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatTime } from '@/lib/video-utils';
import { clipVideo } from '@/lib/video-clip';
import { uploadToS3 } from '@/lib/s3-upload';
import { getVideoFromDB } from '@/lib/match/video-db';
import { getTagUploadUrl, verifyTagUpload } from '@/lib/match/actions';
import type { Tag as VideoTag } from '@/types/video-editor';

interface ClipPreviewModalProps {
  open: boolean;
  onClose: () => void;
  tag: VideoTag;
  matchId: string;
  onUploaded?: (tagId: string, clipUrl: string) => void;
}

type ClipState = 'loading' | 'processing' | 'ready' | 'error';
type UploadState = 'idle' | 'uploading' | 'uploaded' | 'error';

export default function ClipPreviewModal({
  open,
  onClose,
  tag,
  matchId,
  onUploaded,
}: ClipPreviewModalProps) {
  const [state, setState] = useState<ClipState>('loading');
  const [progress, setProgress] = useState(0);
  const [clipUrl, setClipUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const clipUrlRef = useRef<string | null>(null);
  const clipBlobRef = useRef<Blob | null>(null);

  const alreadyUploaded = !!tag.clipUrl;
  const [uploadState, setUploadState] = useState<UploadState>(
    alreadyUploaded ? 'uploaded' : 'idle',
  );
  const [uploadProgress, setUploadProgress] = useState(0);

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

      clipBlobRef.current = blob;
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
    if (!open) return;
    processClip();
    return () => {
      if (clipUrlRef.current) {
        URL.revokeObjectURL(clipUrlRef.current);
        clipUrlRef.current = null;
      }
      clipBlobRef.current = null;
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

  const handleUpload = useCallback(async () => {
    if (!clipBlobRef.current) return;

    const tagId = tag.tagId;
    if (!tagId) {
      toast.error('Tag is not synced to backend yet. Please refresh and try again.');
      return;
    }

    setUploadState('uploading');
    setUploadProgress(0);

    try {
      // Step 1: presigned URL
      const urlRes = await getTagUploadUrl(tagId);
      if (!urlRes.success || !urlRes.data?.url) {
        throw new Error(
          typeof urlRes.error === 'string'
            ? urlRes.error
            : 'Failed to get upload URL',
        );
      }

      // Step 2: PUT to S3 (with progress)
      await uploadToS3(urlRes.data.url, clipBlobRef.current, setUploadProgress);

      // Step 3: verify
      const verify = await verifyTagUpload(tagId);
      if (!verify.success) throw new Error('Failed to verify upload');

      setUploadState('uploaded');
      onUploaded?.(tagId, verify.url ?? '');
      toast.success('Clip uploaded successfully');
    } catch (err) {
      console.error('Upload error:', err);
      setUploadState('idle');
      toast.error(err instanceof Error ? err.message : 'Failed to upload clip');
    }
  }, [tag, onUploaded]);

  const duration = tag.endTime! - tag.startTime;
  const canUpload = state === 'ready' && uploadState !== 'uploading' && uploadState !== 'uploaded';

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
            <div className="space-y-3">
              <div className="rounded-lg overflow-hidden bg-black aspect-video">
                <video
                  src={clipUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </div>

              {uploadState === 'uploading' && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Uploading to S3…</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-2 flex-wrap">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={handleDownload}
            disabled={state !== 'ready'}
            variant="secondary"
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Download MP4
          </Button>
          {uploadState === 'uploaded' ? (
            <Button
              disabled
              className="gap-2 bg-emerald-600 hover:bg-emerald-600 text-white"
            >
              <Check className="w-4 h-4" />
              Uploaded
            </Button>
          ) : (
            <Button
              onClick={handleUpload}
              disabled={!canUpload}
              className="gap-2"
            >
              {uploadState === 'uploading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {uploadProgress}%
                </>
              ) : (
                <>
                  <Cloud className="w-4 h-4" />
                  Upload to S3
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
