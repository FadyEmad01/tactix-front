// src/components/TacticalBoard/ExportModal.tsx
'use client';

import React, { useState, memo, useCallback } from 'react';
import { useTacticalStore } from '@/stores/tacticalStore';
import { Button } from '@/components/ui/button';

interface ExportModalProps {
  onClose: () => void;
}

const ExportModal = memo<ExportModalProps>(({ onClose }) => {
  const [exporting, setExporting] = useState(false);
  const [quality, setQuality] = useState<1 | 2 | 3>(2);
  const currentProject = useTacticalStore((s) => s.currentProject);
  const fieldRotation = currentProject?.fieldRotation || 0;

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  const handleExportImage = useCallback(async () => {
    setExporting(true);
    try {
      // Find the actual canvas element
      const canvasElement = document.querySelector('[data-canvas-bg]') as HTMLElement;
      if (!canvasElement) {
        console.error('Canvas element not found');
        return;
      }

      // Calculate dimensions based on field rotation
      const isPortrait = fieldRotation === 90 || fieldRotation === 270;
      const width = 1000;
      const height = isPortrait ? 1600 : 625;

      // Save original styles to restore later
      const originalTransform = canvasElement.style.transform;
      const originalWidth = canvasElement.style.width;
      const originalMaxWidth = canvasElement.style.maxWidth;
      const originalHeight = canvasElement.style.height;

      // Temporarily modify the canvas for clean export
      canvasElement.style.transform = 'none';
      canvasElement.style.width = `${width}px`;
      canvasElement.style.maxWidth = `${width}px`;
      canvasElement.style.height = `${height}px`;

      const { toPng } = await import('html-to-image');

      // Small delay to ensure DOM updates
      await new Promise(resolve => setTimeout(resolve, 100));

      const dataUrl = await toPng(canvasElement, {
        quality: quality === 1 ? 0.9 : quality === 2 ? 0.95 : 1,
        pixelRatio: quality,
        backgroundColor: '#15803d',
        width,
        height,
        cacheBust: true,
        filter: (node) => {
          if (node.tagName === 'circle' && node.getAttribute('stroke') === 'rgba(255,255,255,0.5)') {
            return false;
          }
          return true;
        },
      });

      // Restore original styles
      canvasElement.style.transform = originalTransform;
      canvasElement.style.width = originalWidth;
      canvasElement.style.maxWidth = originalMaxWidth;
      canvasElement.style.height = originalHeight;

      const link = document.createElement('a');
      link.download = `${currentProject?.name || 'tactical'}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
    }
    setExporting(false);
  }, [currentProject?.name, quality, fieldRotation]);

  const handleExportJSON = useCallback(() => {
    if (!currentProject) return;
    const dataStr = JSON.stringify(currentProject, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.download = `${currentProject.name}-${Date.now()}.json`;
    link.href = dataUri;
    link.click();
  }, [currentProject]);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-sm">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Export</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white rounded-full">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {/* Quality Selector */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Export Quality</label>
            <div className="flex gap-2">
              {([1, 2, 3] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                    quality === q
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {q}x
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              {quality === 1 && 'Standard quality (1000px wide)'}
              {quality === 2 && 'High quality (2000px wide) - Recommended'}
              {quality === 3 && 'Ultra quality (3000px wide)'}
            </p>
          </div>

          <Button
            size="lg"
            onClick={handleExportImage}
            disabled={exporting}
            className="w-full bg-green-600 text-white hover:bg-green-500 transition disabled:opacity-50"
          >
            {exporting ? 'Exporting...' : 'Download as PNG'}
          </Button>

          <Button
            size="lg"
            variant="secondary"
            onClick={handleExportJSON}
            className="w-full bg-gray-700 text-white hover:bg-gray-600 transition"
          >
            Download as JSON
          </Button>
        </div>
      </div>
    </div>
  );
});

ExportModal.displayName = 'ExportModal';
export default ExportModal;
