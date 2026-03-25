import React from 'react';
import { Project, Point } from '@/types/tactical-board';
import FieldBackground from '@/components/TacticalBoard/FieldBackground';

interface BoardPreviewProps {
  project: Project;
}

export default function BoardPreview({ project }: BoardPreviewProps) {
  const scene = project.scenes && project.scenes.length > 0 ? project.scenes[0] : null;
  const fieldRotation = project.fieldRotation || 0;

  if (!scene) return <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">Empty Board</div>;

  const renderPath = (points: Point[]): string => {
    if (!points || points.length < 2) return '';
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    return path;
  };

  const renderArrowPath = (start: Point, end: Point, control?: Point, lineType?: string): string => {
    if (control && lineType === 'curved') {
      return `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`;
    }
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  };

  const getStrokeDashArray = (lineType: string, thickness: number): string | undefined => {
    if (lineType === 'dotted') return `${thickness} ${thickness * 2}`;
    if (lineType === 'dashed') return `${thickness * 3} ${thickness * 2}`;
    return undefined;
  };

  const renderArrowHead = (end: Point, start: Point, control: Point | undefined, type: string, color: string, thickness: number) => {
    if (type === 'none') return null;
    let angle: number;
    if (control) {
      angle = Math.atan2(end.y - control.y, end.x - control.x);
    } else {
      angle = Math.atan2(end.y - start.y, end.x - start.x);
    }
    const size = thickness * 3;
    const angleDeg = angle * (180 / Math.PI);

    if (type === 'arrow') {
      return (
        <path
          d={`M ${-size} ${-size / 2} L 0 0 L ${-size} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeLinejoin="round"
          transform={`translate(${end.x}, ${end.y}) rotate(${angleDeg})`}
        />
      );
    }
    return null;
  };

  return (
    <div className="relative w-full h-full bg-green-700 overflow-hidden select-none pointer-events-none rounded-t-xl" style={{ aspectRatio: fieldRotation === 90 || fieldRotation === 270 ? '10 / 16' : '16 / 10' }}>
      <FieldBackground type={project.fieldType || 'full'} rotation={fieldRotation} />

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {scene.drawings?.map((d, i) => (
          <path key={d.id || crypto.randomUUID() || i} d={renderPath(d.points)} stroke={d.color} strokeWidth={d.thickness * 0.3} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={d.opacity} />
        ))}
        {scene.arrows?.map((a, i) => (
          <g key={a.id || crypto.randomUUID() || i} opacity={a.opacity}>
            <path d={renderArrowPath(a.startPoint, a.endPoint, a.controlPoint, a.lineType)} stroke={a.color} strokeWidth={a.thickness * 0.3} strokeLinecap="round" fill="none" strokeDasharray={getStrokeDashArray(a.lineType, a.thickness * 0.3)} />
            {renderArrowHead(a.endPoint, a.startPoint, a.controlPoint, a.headType, a.color, a.thickness * 0.3)}
          </g>
        ))}
      </svg>

      {/* Balls */}
      {scene.balls?.map((ball, i) => {
        const size = 16;
        return (
          <div key={ball.id || crypto.randomUUID() || i} className="absolute drop-shadow-sm" style={{ left: `${ball.x}%`, top: `${ball.y}%`, transform: 'translate(-50%, -50%)' }}>
            <svg style={{ width: size, height: size }} viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="48" fill="white" stroke="#333" strokeWidth="2" />
              <path d="M50 2 L50 20 M50 80 L50 98 M2 50 L20 50 M80 50 L98 50" stroke="#333" strokeWidth="1.5" />
              <path d="M50 20 L35 35 L35 65 L50 80 L65 65 L65 35 Z" fill="#333" />
              <circle cx="50" cy="50" r="8" fill="white" />
            </svg>
          </div>
        )
      })}

      {/* Players */}
      {scene.players?.map((player, i) => {
        const teamConfig = player.team === 'home' ? project.homeTeam : project.awayTeam;
        const size = 18;
        const fontSize = 8;
        return (
          <div key={player.id || crypto.randomUUID() || i} className="absolute rounded-full flex items-center justify-center font-bold shadow-sm border" style={{ left: `${player.x}%`, top: `${player.y}%`, transform: 'translate(-50%, -50%)', width: size, height: size, backgroundColor: teamConfig?.primaryColor || '#e63946', borderColor: teamConfig?.secondaryColor || '#1d3557', color: teamConfig?.textColor || '#ffffff', fontSize }}>
            {player.number}
          </div>
        )
      })}
    </div>
  );
}
