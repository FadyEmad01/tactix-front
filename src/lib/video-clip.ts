'use client';

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpegInstance: FFmpeg | null = null;
let loadingPromise: Promise<FFmpeg> | null = null;

async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance) return ffmpegInstance;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const ff = new FFmpeg();
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    await ff.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    ffmpegInstance = ff;
    return ff;
  })();

  return loadingPromise;
}

export async function clipVideo(
  source: Blob | File,
  startSec: number,
  endSec: number,
  onProgress?: (pct: number) => void
): Promise<Blob> {
  const ff = await getFFmpeg();
  const duration = endSec - startSec;

  if (duration <= 0) throw new Error('endTime must be greater than startTime');

  ff.on('progress', ({ progress }) => {
    onProgress?.(Math.min(100, Math.round(progress * 100)));
  });

  const inputName = 'clip-input.mp4';
  const outputName = 'clip-output.mp4';

  await ff.writeFile(inputName, await fetchFile(source));

  try {
    // Stream copy — fast, no quality loss
    await ff.exec([
      '-ss', String(startSec),
      '-i', inputName,
      '-t', String(duration),
      '-c', 'copy',
      '-avoid_negative_ts', 'make_zero',
      '-movflags', '+faststart',
      outputName,
    ]);
  } catch {
    // Fallback: re-encode (handles non-keyframe boundaries)
    await ff.exec([
      '-ss', String(startSec),
      '-i', inputName,
      '-t', String(duration),
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-crf', '23',
      '-c:a', 'aac',
      '-movflags', '+faststart',
      outputName,
    ]);
  }

  const data = await ff.readFile(outputName);
  await ff.deleteFile(inputName);
  await ff.deleteFile(outputName);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Blob([data as any], { type: 'video/mp4' });
}
