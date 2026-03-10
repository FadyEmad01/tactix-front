'use client';

import React from 'react';
import { DrawingPath, Point, ToolSettings, Tool } from '@/types/tactical-board';

interface DrawingLayerProps {
  drawings: DrawingPath[];
  currentPath: Point[];
  isDrawing: boolean;
  toolSettings: ToolSettings;
  activeTool: Tool;
}

export default function DrawingLayer({
  drawings,
  currentPath,
  isDrawing,
  toolSettings,
  activeTool,
}: DrawingLayerProps) {
  const pointsToPath = (points: Point[]): string => {
    if (points.length < 2) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    
    return path;
  };

  const smoothPath = (points: Point[]): string => {
    if (points.length < 2) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      path += ` Q ${points[i].x} ${points[i].y} ${xc} ${yc}`;
    }
    
    // Connect to the last point
    if (points.length > 1) {
      const lastPoint = points[points.length - 1];
      path += ` L ${lastPoint.x} ${lastPoint.y}`;
    }
    
    return path;
  };

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        {/* Eraser mask */}
        <mask id="eraser-mask">
          <rect width="100" height="100" fill="white" />
          {drawings
            .filter((d) => d.tool === 'eraser')
            .map((drawing) => (
              <path
                key={drawing.id}
                d={smoothPath(drawing.points)}
                stroke="black"
                strokeWidth={drawing.thickness}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}
        </mask>
      </defs>

      {/* Rendered drawings */}
      <g mask="url(#eraser-mask)">
        {drawings
          .filter((d) => d.tool === 'pen')
          .map((drawing) => (
            <path
              key={drawing.id}
              d={smoothPath(drawing.points)}
              stroke={drawing.color}
              strokeWidth={drawing.thickness}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity={drawing.opacity}
            />
          ))}
      </g>

      {/* Current drawing preview */}
      {isDrawing && currentPath.length > 1 && (
        <path
          d={smoothPath(currentPath)}
          stroke={activeTool === 'eraser' ? 'rgba(255,255,255,0.5)' : toolSettings.penColor}
          strokeWidth={toolSettings.penThickness}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={activeTool === 'eraser' ? 0.5 : toolSettings.penOpacity}
          strokeDasharray={activeTool === 'eraser' ? '5 5' : undefined}
        />
      )}
    </svg>
  );
}