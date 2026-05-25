'use client';

import React, { useState, useCallback, memo, useRef } from 'react';
import { useTacticalStore } from '@/stores/tacticalStore';
import { Player as PlayerType } from '@/types/tactical-board';

interface PlayerProps {
  player: PlayerType;
  scale: number;
}

const PlayerElement = memo<PlayerProps>(({ player, scale }) => {
  const [isDragging, setIsDragging] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; playerX: number; playerY: number } | null>(null);

  const currentProject = useTacticalStore((s) => s.currentProject);
  const activeTool = useTacticalStore((s) => s.activeTool);
  const selectedIds = useTacticalStore((s) => s.selectedIds);
  const setSelection = useTacticalStore((s) => s.setSelection);
  const updatePlayer = useTacticalStore((s) => s.updatePlayer);
  const saveToHistory = useTacticalStore((s) => s.saveToHistory);

  const isSelected = selectedIds.includes(player.id);
  const teamConfig = player.team === 'home' 
    ? currentProject?.homeTeam 
    : currentProject?.awayTeam;

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (activeTool !== 'select') return;
    
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    
    setIsDragging(true);
    saveToHistory();
    
    if (!isSelected) {
      setSelection([player.id]);
    }

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      playerX: player.x,
      playerY: player.y,
    };
  }, [activeTool, isSelected, player.id, player.x, player.y, setSelection, saveToHistory]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    
    const canvas = elementRef.current?.closest('[data-canvas-bg]');
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStartRef.current.y) / rect.height) * 100;
    
    const newX = Math.max(2, Math.min(98, dragStartRef.current.playerX + deltaX));
    const newY = Math.max(2, Math.min(98, dragStartRef.current.playerY + deltaY));
    
    updatePlayer(player.id, { x: newX, y: newY });
  }, [isDragging, player.id, updatePlayer]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeTool === 'select' && !isDragging) {
      setSelection([player.id]);
    }
  }, [activeTool, isDragging, player.id, setSelection]);

  // Calculate size based on scale
  const size = Math.max(24, 40 * scale);
  const fontSize = Math.max(10, 14 * scale);

  return (
    <div
      ref={elementRef}
      className="absolute touch-none"
      style={{
        left: `${player.x}%`,
        top: `${player.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: isDragging ? 100 : isSelected ? 50 : 10,
        cursor: activeTool === 'select' ? (isDragging ? 'grabbing' : 'grab') : 'default',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={handleClick}
    >
      {/* Selection Ring */}
      {isSelected && (
        <div
          data-export-hide
          className="absolute rounded-full border-2 border-primary animate-pulse"
          style={{
            width: size + 8,
            height: size + 8,
            left: -4,
            top: -4,
          }}
        />
      )}

      {/* Player Circle */}
      <div
        className="rounded-full flex items-center justify-center font-bold shadow-lg border-2 transition-transform hover:scale-105"
        style={{
          width: size,
          height: size,
          backgroundColor: teamConfig?.primaryColor || '#e63946',
          borderColor: teamConfig?.secondaryColor || '#1d3557',
          color: teamConfig?.textColor || '#ffffff',
          fontSize,
        }}
      >
        {player.number}
      </div>

      {/* Player Name */}
      {player.name && (
        <div
          className="absolute left-1/2 transform -translate-x-1/2 px-1 rounded text-center whitespace-nowrap"
          style={{
            top: size + 4,
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: '#fff',
            fontSize: Math.max(8, 10 * scale),
            maxWidth: 80,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {player.name}
        </div>
      )}
    </div>
  );
});

PlayerElement.displayName = 'PlayerElement';
export default PlayerElement;