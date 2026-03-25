'use client';

import React, { useState, useCallback, memo } from 'react';
import { useTacticalStore } from '@/stores/tacticalStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const SceneManager = memo(() => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const currentProject = useTacticalStore((s) => s.currentProject);
  const currentSceneIndex = useTacticalStore((s) => s.currentSceneIndex);
  const setCurrentScene = useTacticalStore((s) => s.setCurrentScene);
  const addScene = useTacticalStore((s) => s.addScene);
  const duplicateScene = useTacticalStore((s) => s.duplicateScene);
  const removeScene = useTacticalStore((s) => s.removeScene);
  const renameScene = useTacticalStore((s) => s.renameScene);

  const handleStartEdit = useCallback((index: number, name: string) => {
    setEditingIndex(index);
    setEditName(name);
  }, []);

  const handleFinishEdit = useCallback(() => {
    if (editingIndex !== null && editName.trim()) {
      renameScene(editingIndex, editName.trim());
    }
    setEditingIndex(null);
    setEditName('');
  }, [editingIndex, editName, renameScene]);

  const handleRemoveScene = useCallback((e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (currentProject && currentProject.scenes?.length > 1) {
      removeScene(index);
    }
  }, [currentProject, removeScene]);

  const handleDuplicateScene = useCallback((e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    duplicateScene(index);
  }, [duplicateScene]);

  if (!currentProject) return null;

  return (
    <div className="bg-gray-800 border-t border-gray-700 p-2 flex-shrink-0">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {/* Scene tabs */}
        {currentProject.scenes?.map((scene, index) => (
          <div
            key={scene.id}
            className={`
              group flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg cursor-pointer transition-colors flex-shrink-0
              ${index === currentSceneIndex
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }
            `}
            onClick={() => setCurrentScene(index)}
          >
            {editingIndex === index ? (
              <Input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleFinishEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFinishEdit();
                  if (e.key === 'Escape') setEditingIndex(null);
                }}
                className="bg-transparent border-none focus-visible:ring-0 shadow-none outline-none text-xs sm:text-sm w-16 sm:w-24 h-6 px-1"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                className="text-xs sm:text-sm truncate max-w-[60px] sm:max-w-[100px]"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleStartEdit(index, scene.name);
                }}
              >
                {scene.name}
              </span>
            )}

            {/* Scene actions */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => handleDuplicateScene(e, index)}
                className="p-0.5 hover:bg-white/20 rounded"
                title="Duplicate"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
              </button>
              {currentProject.scenes?.length > 1 && (
                <button
                  onClick={(e) => handleRemoveScene(e, index)}
                  className="p-0.5 hover:bg-red-500/50 rounded"
                  title="Delete"
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Add scene button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={addScene}
          className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition flex-shrink-0"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span className="hidden sm:inline">Add Scene</span>
        </Button>
      </div>
    </div>
  );
});

SceneManager.displayName = 'SceneManager';
export default SceneManager;