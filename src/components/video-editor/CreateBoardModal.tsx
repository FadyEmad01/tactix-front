'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Check, Circle, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { clipVideo } from '@/lib/video-clip';
import { uploadToS3 } from '@/lib/s3-upload';
import { getVideoFromDB } from '@/lib/match/video-db';
import {
  getTagBoard,
  getTagUploadUrl,
  linkTagToBoard,
  verifyTagUpload,
} from '@/lib/match/actions';
import { updateBoardAction, getBoardByIdAction } from '@/app/(dashboard)/board/actions';
import { encodeBoardName } from '@/lib/board-name';
import type { Tag as VideoTag } from '@/types/video-editor';

interface CreateBoardModalProps {
  open: boolean;
  onClose: () => void;
  tag: VideoTag;
  matchId: string;
  targetWindow?: Window | null;
  onCreated?: (tagId: string, clipUrl: string | null, boardId: string) => void;
}

type Step =
  | { kind: 'checking-board' }
  | { kind: 'cutting'; pct: number }
  | { kind: 'uploading'; pct: number }
  | { kind: 'verifying' }
  | { kind: 'linking' }
  | { kind: 'done'; boardId: string }
  | { kind: 'error'; message: string };

function openBoardTab(href: string, target?: Window | null) {
  if (target && !target.closed) {
    try {
      target.location.href = href;
      target.focus();
      return;
    } catch {
      // fall through
    }
  }
  window.open(href, '_blank');
}

const STEP_ORDER = ['check', 'cut', 'upload', 'verify', 'link'] as const;
type StepKey = (typeof STEP_ORDER)[number];

function statusFor(step: Step, key: StepKey): 'pending' | 'active' | 'done' | 'skipped' | 'error' {
  // Map step.kind → which step we're on
  const order: Record<string, number> = {
    'checking-board': 0,
    cutting: 1,
    uploading: 2,
    verifying: 3,
    linking: 4,
    done: 5,
    error: -1,
  };
  const keyOrder: Record<StepKey, number> = {
    check: 0,
    cut: 1,
    upload: 2,
    verify: 3,
    link: 4,
  };
  const current = order[step.kind];
  if (step.kind === 'error') return 'pending';
  if (current === keyOrder[key]) return 'active';
  if (current > keyOrder[key]) return 'done';
  return 'pending';
}

export default function CreateBoardModal({
  open,
  onClose,
  tag,
  matchId,
  targetWindow,
  onCreated,
}: CreateBoardModalProps) {
  const [step, setStep] = useState<Step>({ kind: 'checking-board' });
  const skipUpload = !!tag.clipUrl;
  const startedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      startedRef.current = false;
      setStep({ kind: 'checking-board' });
      return;
    }
    if (startedRef.current) return;
    startedRef.current = true;

    if (!tag.tagId) {
      setStep({ kind: 'error', message: 'Tag is not synced to backend.' });
      return;
    }
    const tagId = tag.tagId;

    (async () => {
      try {
        // Step 0: check existing board
        setStep({ kind: 'checking-board' });
        const existing = await getTagBoard(tagId);
        if (existing.success) {
          const existingBoard = await getBoardByIdAction(existing.boardId);
          const existingName = existingBoard?.name ?? 'Tactical Board';
          await updateBoardAction(existing.boardId, {
            name: encodeBoardName(matchId, tagId, existingName),
            linkedMatchId: matchId,
            linkedTagId: tagId,
            updatedAt: Date.now(),
          } as any);
          openBoardTab(`/board/${existing.boardId}`, targetWindow);
          setStep({ kind: 'done', boardId: existing.boardId });
          onCreated?.(tagId, tag.clipUrl ?? null, existing.boardId);
          setTimeout(() => onClose(), 600);
          return;
        }

        // Step 1-3: cut + upload + verify (skip if already uploaded)
        if (!tag.clipUrl) {
          const file = await getVideoFromDB(matchId);
          if (!file) throw new Error('Video file not found in browser storage.');

          setStep({ kind: 'cutting', pct: 0 });
          const blob = await clipVideo(
            file,
            tag.startTime,
            tag.endTime!,
            (pct) => setStep({ kind: 'cutting', pct }),
          );

          setStep({ kind: 'uploading', pct: 0 });
          const urlRes = await getTagUploadUrl(tagId);
          if (!urlRes.success || !urlRes.data?.url) {
            throw new Error(
              typeof urlRes.error === 'string'
                ? urlRes.error
                : 'Failed to get upload URL',
            );
          }
          await uploadToS3(urlRes.data.url, blob, (pct) =>
            setStep({ kind: 'uploading', pct }),
          );

          setStep({ kind: 'verifying' });
          const verify = await verifyTagUpload(tagId);
          if (!verify.success) throw new Error('Failed to verify upload');
        }

        // Step 4: link → create board
        setStep({ kind: 'linking' });
        const linked = await linkTagToBoard(tagId);
        if (!linked.success) {
          throw new Error(
            typeof linked.error === 'string'
              ? linked.error
              : 'Failed to create tactical board',
          );
        }

        // Persist link info in the board's JSON
        const newBoard = await getBoardByIdAction(linked.boardId);
        const newBoardName = newBoard?.name ?? 'Tactical Board';
        await updateBoardAction(linked.boardId, {
          name: encodeBoardName(matchId, tagId, newBoardName),
          linkedMatchId: matchId,
          linkedTagId: tagId,
          updatedAt: Date.now(),
        } as any);

        openBoardTab(`/board/${linked.boardId}`, targetWindow);
        setStep({ kind: 'done', boardId: linked.boardId });
        onCreated?.(tagId, tag.clipUrl ?? null, linked.boardId);
        setTimeout(() => onClose(), 800);
      } catch (err) {
        console.error('Create-board flow error:', err);
        if (targetWindow && !targetWindow.closed) {
          try { targetWindow.close(); } catch {}
        }
        setStep({
          kind: 'error',
          message: err instanceof Error ? err.message : 'Failed to create board',
        });
      }
    })();
  }, [open, tag, matchId, onClose, onCreated, targetWindow]);

  const isError = step.kind === 'error';
  const isDone = step.kind === 'done';

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v && (isError || isDone)) onClose();
      }}
    >
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Create Tactical Board</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <StepRow
            status={statusFor(step, 'check')}
            label="Checking existing board"
          />
          <StepRow
            status={
              skipUpload ? 'skipped' : statusFor(step, 'cut')
            }
            label="Cutting clip"
            progress={step.kind === 'cutting' ? step.pct : undefined}
            skippedLabel="Already uploaded — skipping"
          />
          <StepRow
            status={skipUpload ? 'skipped' : statusFor(step, 'upload')}
            label="Uploading to S3"
            progress={step.kind === 'uploading' ? step.pct : undefined}
            skippedLabel="Already uploaded — skipping"
          />
          <StepRow
            status={skipUpload ? 'skipped' : statusFor(step, 'verify')}
            label="Verifying upload"
            skippedLabel="Already uploaded — skipping"
          />
          <StepRow
            status={statusFor(step, 'link')}
            label="Creating board"
          />

          {isError && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-destructive text-sm mt-3">
              <X className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{(step as { kind: 'error'; message: string }).message}</span>
            </div>
          )}

          {isDone && (
            <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400 text-sm mt-3">
              <Check className="w-4 h-4" />
              <span>Board ready — opening in new tab…</span>
            </div>
          )}
        </div>

        {(isError || isDone) && (
          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function StepRow({
  status,
  label,
  progress,
  skippedLabel,
}: {
  status: 'pending' | 'active' | 'done' | 'skipped' | 'error';
  label: string;
  progress?: number;
  skippedLabel?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 flex items-center justify-center shrink-0">
        {status === 'done' || status === 'skipped' ? (
          <Check className="w-4 h-4 text-emerald-500" />
        ) : status === 'active' ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        ) : (
          <Circle className="w-4 h-4 text-muted-foreground/40" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div
          className={
            status === 'pending'
              ? 'text-sm text-muted-foreground'
              : status === 'skipped'
                ? 'text-sm text-muted-foreground line-through'
                : 'text-sm'
          }
        >
          {status === 'skipped' && skippedLabel ? skippedLabel : label}
        </div>

        {status === 'active' && typeof progress === 'number' && (
          <div className="mt-1 h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {status === 'active' && typeof progress === 'number' && (
        <div className="text-xs text-muted-foreground tabular-nums">
          {progress}%
        </div>
      )}
    </div>
  );
}
