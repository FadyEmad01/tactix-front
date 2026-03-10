'use client';

import React from 'react';
import { Arrow, ArrowHead, LineType, Point } from '@/types/tactical-board';
import { useTacticalStore } from '@/stores/tacticalStore';

interface ArrowLayerProps {
  arrows: Arrow[];
  previewArrow: Omit<Arrow, 'id'> | null;
}

export default function ArrowLayer({ arrows, previewArrow }: ArrowLayerProps) {
  const { selectedIds, setSelection, activeTool } = useTacticalStore();

  const renderArrowHead = (
    type: ArrowHead,
    position: Point,
    angle: number,
    color: string,
    size: number = 8
  ): React.ReactNode => {
    const transform = `translate(${position.x}, ${position.y}) rotate(${angle})`;

    switch (type) {
      case 'arrow':
        return (
          <path
            d={`M ${-size} ${-size / 2} L 0 0 L ${-size} ${size / 2}`}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform={transform}
          />
        );
      case 'triangle':
        return (
          <polygon
            points={`0,0 ${-size},${-size / 2} ${-size},${size / 2}`}
            fill={color}
            transform={transform}
          />
        );
      case 'x':
        return (
          <g transform={transform}>
            <line x1={-size / 2} y1={-size / 2} x2={size / 2} y2={size / 2} stroke={color} strokeWidth="2" />
            <line x1={size / 2} y1={-size / 2} x2={-size / 2} y2={size / 2} stroke={color} strokeWidth="2" />
          </g>
        );
      case 'circle':
        return (
          <circle
            cx={0}
            cy={0}
            r={size / 2}
            fill="none"
            stroke={color}
            strokeWidth="2"
            transform={transform}
          />
        );
      default:
        return null;
    }
  };

  const calculateAngle = (start: Point, end: Point): number => {
    return Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);
  };

  const renderArrow = (arrow: Omit<Arrow, 'id'> & { id?: string }, isPreview: boolean = false) => {
    const { startPoint, endPoint, controlPoint, lineType, headType, tailType, color, thickness, opacity } = arrow;
    
    let pathD: string;
    let endAngle: number;
    let startAngle: number;

    if (lineType === 'curved' && controlPoint) {
      pathD = `M ${startPoint.x} ${startPoint.y} Q ${controlPoint.x} ${controlPoint.y} ${endPoint.x} ${endPoint.y}`;
      // Calculate angles for curved line
      endAngle = calculateAngle(controlPoint, endPoint);
      startAngle = calculateAngle(controlPoint, startPoint);
    } else {
      pathD = `M ${startPoint.x} ${startPoint.y} L ${endPoint.x} ${endPoint.y}`;
      endAngle = calculateAngle(startPoint, endPoint);
      startAngle = endAngle + 180;
    }

    const strokeDasharray = 
      lineType === 'dotted' ? `${thickness} ${thickness * 2}` :
      lineType === 'dashed' ? `${thickness * 3} ${thickness * 2}` :
      undefined;

    const isSelected = arrow.id && selectedIds.includes(arrow.id);

    return (
      <g
        key={arrow.id || 'preview'}
        opacity={opacity}
        style={{ cursor: activeTool === 'select' && !isPreview ? 'pointer' : 'default' }}
        onClick={(e) => {
          if (activeTool === 'select' && arrow.id && !isPreview) {
            e.stopPropagation();
            setSelection([arrow.id]);
          }
        }}
      >
        {/* Selection highlight */}
        {isSelected && (
          <path
            d={pathD}
            stroke="#3b82f6"
            strokeWidth={thickness + 4}
            fill="none"
            strokeLinecap="round"
          />
        )}

        {/* Main line */}
        <path
          d={pathD}
          stroke={color}
          strokeWidth={thickness}
          strokeDasharray={strokeDasharray}
          fill="none"
          strokeLinecap="round"
        />

        {/* End arrow head */}
        {headType !== 'none' && renderArrowHead(headType, endPoint, endAngle, color, thickness * 3)}

        {/* Start arrow head */}
        {tailType !== 'none' && renderArrowHead(tailType, startPoint, startAngle, color, thickness * 3)}
      </g>
    );
  };

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ pointerEvents: activeTool === 'select' ? 'auto' : 'none' }}
    >
      {/* Render saved arrows */}
      {arrows.map((arrow) => renderArrow(arrow))}

      {/* Render preview arrow */}
      {previewArrow && renderArrow(previewArrow, true)}
    </svg>
  );
}