'use client';

import { useEffect } from 'react';
import { useTacticalStore } from '@/stores/tacticalStore';

export function useKeyboardShortcutsTacticalBoard() {
  const setActiveTool = useTacticalStore((s) => s.setActiveTool);
  const undo = useTacticalStore((s) => s.undo);
  const redo = useTacticalStore((s) => s.redo);
  const deleteSelected = useTacticalStore((s) => s.deleteSelected);
  const clearSelection = useTacticalStore((s) => s.clearSelection);
  const selectedIds = useTacticalStore((s) => s.selectedIds);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Tool shortcuts
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'v': setActiveTool('select'); break;
          case 'p': setActiveTool('pen'); break;
          case 'l': setActiveTool('line'); break;
          case 'h': setActiveTool('player-home'); break;
          case 'a': setActiveTool('player-away'); break;
          case 'b': setActiveTool('ball'); break;
          case 'e': setActiveTool('eraser'); break;
          case 'escape': clearSelection(); break;
          case 'delete':
          case 'backspace':
            if (selectedIds.length > 0) {
              e.preventDefault();
              deleteSelected();
            }
            break;
        }
      }

      // Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTool, undo, redo, deleteSelected, clearSelection, selectedIds]);
}