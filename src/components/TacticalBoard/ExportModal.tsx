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
  const currentProject = useTacticalStore((s) => s.currentProject);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  const handleExportImage = useCallback(async () => {
    setExporting(true);
    try {
      const canvas = document.querySelector('[data-canvas-bg]')?.parentElement;
      if (!canvas) return;

      const html2canvas = (await import('html2canvas')).default;
      const canvasElement = await html2canvas(canvas as HTMLElement, {
        scale: 2,
        backgroundColor: '#1f2937',
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `${currentProject?.name || 'tactical'}-${Date.now()}.png`;
      link.href = canvasElement.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
    }
    setExporting(false);
  }, [currentProject?.name]);

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

        <div className="p-4 space-y-3">
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