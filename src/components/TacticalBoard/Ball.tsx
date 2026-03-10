'use client';

import React, { useState, useCallback, memo, useRef } from 'react';
import { useTacticalStore } from '@/stores/tacticalStore';
import { Ball as BallType } from '@/types/tactical-board';

interface BallProps {
  ball: BallType;
  scale: number;
}

const BallElement = memo<BallProps>(({ ball, scale }) => {
  const [isDragging, setIsDragging] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; ballX: number; ballY: number } | null>(null);

  const activeTool = useTacticalStore((s) => s.activeTool);
  const selectedIds = useTacticalStore((s) => s.selectedIds);
  const setSelection = useTacticalStore((s) => s.setSelection);
  const updateBall = useTacticalStore((s) => s.updateBall);
  const saveToHistory = useTacticalStore((s) => s.saveToHistory);

  const isSelected = selectedIds.includes(ball.id);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (activeTool !== 'select') return;
    
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    
    setIsDragging(true);
    saveToHistory();
    
    if (!isSelected) {
      setSelection([ball.id]);
    }

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      ballX: ball.x,
      ballY: ball.y,
    };
  }, [activeTool, isSelected, ball.id, ball.x, ball.y, setSelection, saveToHistory]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    
    const canvas = elementRef.current?.closest('[data-canvas-bg]');
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStartRef.current.y) / rect.height) * 100;
    
    const newX = Math.max(2, Math.min(98, dragStartRef.current.ballX + deltaX));
    const newY = Math.max(2, Math.min(98, dragStartRef.current.ballY + deltaY));
    
    updateBall(ball.id, { x: newX, y: newY });
  }, [isDragging, ball.id, updateBall]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  // Calculate size based on scale
  const size = Math.max(20, 32 * scale);

  return (
    <div
      ref={elementRef}
      className="absolute touch-none"
      style={{
        left: `${ball.x}%`,
        top: `${ball.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: isDragging ? 100 : isSelected ? 50 : 5,
        cursor: activeTool === 'select' ? (isDragging ? 'grabbing' : 'grab') : 'default',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Selection Ring */}
      {isSelected && (
        <div
          className="absolute rounded-full border-2 border-blue-400 animate-pulse"
          style={{
            width: size + 6,
            height: size + 6,
            left: -3,
            top: -3,
          }}
        />
      )}

      {/* Football Ball SVG */}
      <svg
        className="drop-shadow-lg"
        style={{ width: size, height: size }}
        viewBox="0 0 100 100"
        fill="none"
      >
        <circle cx="50" cy="50" r="48" fill="white" stroke="#333" strokeWidth="2" />
        <path d="M50 2 L50 20 M50 80 L50 98 M2 50 L20 50 M80 50 L98 50" stroke="#333" strokeWidth="1.5" />
        <path d="M50 20 L35 35 L35 65 L50 80 L65 65 L65 35 Z" fill="#333" />
        <circle cx="50" cy="50" r="8" fill="white" />
      </svg>
    </div>
  );
});

BallElement.displayName = 'BallElement';
export default BallElement;