'use client';

import React, { memo } from 'react';
import { useTacticalStore } from '@/stores/tacticalStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const PropertiesPanel = memo(() => {
  const currentProject = useTacticalStore((s) => s.currentProject);
  const currentSceneIndex = useTacticalStore((s) => s.currentSceneIndex);
  const selectedIds = useTacticalStore((s) => s.selectedIds);
  const updatePlayer = useTacticalStore((s) => s.updatePlayer);
  const deleteSelected = useTacticalStore((s) => s.deleteSelected);

  const currentScene = currentProject?.scenes?.[currentSceneIndex];
  if (!currentScene || selectedIds.length === 0) return null;

  const selectedPlayer = currentScene.players.find((p) => selectedIds.includes(p.id));
  const selectedBall = currentScene.balls.find((b) => selectedIds.includes(b.id));

  return (
    <div className="h-full bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">Properties</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={deleteSelected}
          className="text-red-400 hover:text-red-300 hover:bg-transparent transition h-8 w-8"
          title="Delete"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </Button>
      </div>

      {selectedPlayer && (
        <div className="space-y-4">
          <div className="text-sm text-gray-400">
            {selectedPlayer.team === 'home' ? currentProject?.homeTeam.name : currentProject?.awayTeam.name}
          </div>
          
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Number</label>
            <Input
              type="number"
              value={selectedPlayer.number}
              onChange={(e) => updatePlayer(selectedPlayer.id, { number: parseInt(e.target.value) || 1 })}
              className="bg-gray-700 text-white border-gray-600 focus-visible:ring-primary h-9"
              min={1}
              max={99}
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Name</label>
            <Input
              type="text"
              value={selectedPlayer.name || ''}
              onChange={(e) => updatePlayer(selectedPlayer.id, { name: e.target.value })}
              placeholder="Player name"
              className="bg-gray-700 text-white border-gray-600 focus-visible:ring-primary h-9"
            />
          </div>
        </div>
      )}

      {selectedBall && (
        <div className="text-sm text-gray-400">Ball selected</div>
      )}

      {selectedIds.length > 1 && (
        <div className="text-sm text-gray-400">{selectedIds.length} items selected</div>
      )}
    </div>
  );
});

PropertiesPanel.displayName = 'PropertiesPanel';
export default PropertiesPanel;