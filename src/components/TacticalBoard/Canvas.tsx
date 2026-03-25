'use client';

import React, { useRef, useState, useCallback, useEffect, memo, useMemo } from 'react';
import { useTacticalStore } from '@/stores/tacticalStore';
import FieldBackground from './FieldBackground';
import PlayerElement from './Player';
import BallElement from './Ball';
import { Point } from '@/types/tactical-board';

const Canvas = memo(() => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [lineStart, setLineStart] = useState<Point | null>(null);
  const [lineEnd, setLineEnd] = useState<Point | null>(null);
  const [curveControl, setCurveControl] = useState<Point | null>(null);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
  const [lastPan, setLastPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const currentProject = useTacticalStore((s) => s.currentProject);
  const currentSceneIndex = useTacticalStore((s) => s.currentSceneIndex);
  const activeTool = useTacticalStore((s) => s.activeTool);
  const toolSettings = useTacticalStore((s) => s.toolSettings);
  const zoom = useTacticalStore((s) => s.zoom);
  const panX = useTacticalStore((s) => s.panX);
  const panY = useTacticalStore((s) => s.panY);
  const isPanning = useTacticalStore((s) => s.isPanning);

  const setZoom = useTacticalStore((s) => s.setZoom);
  const setPan = useTacticalStore((s) => s.setPan);
  const setIsPanning = useTacticalStore((s) => s.setIsPanning);
  const resetView = useTacticalStore((s) => s.resetView);
  const addPlayer = useTacticalStore((s) => s.addPlayer);
  const addBall = useTacticalStore((s) => s.addBall);
  const addDrawing = useTacticalStore((s) => s.addDrawing);
  const addArrow = useTacticalStore((s) => s.addArrow);
  const clearSelection = useTacticalStore((s) => s.clearSelection);
  const saveToHistory = useTacticalStore((s) => s.saveToHistory);
  const eraseAtPosition = useTacticalStore((s) => s.eraseAtPosition);

  const currentScene = currentProject?.scenes?.[currentSceneIndex];
  const fieldRotation = currentProject?.fieldRotation || 0;

  // Measure canvas size for responsive scaling
  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Calculate object scale based on canvas size
  const objectScale = useMemo(() => {
    const baseWidth = 800;
    const scale = Math.min(canvasSize.width / baseWidth, 1);
    return Math.max(scale, 0.5);
  }, [canvasSize.width]);

  // Convert screen coordinates to canvas percentage
  const screenToCanvas = useCallback((clientX: number, clientY: number): Point => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();

    let x = ((clientX - rect.left) / rect.width) * 100;
    let y = ((clientY - rect.top) / rect.height) * 100;

    // Clamp values
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));

    return { x, y };
  }, []);

  // Handle wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(zoom + delta);
    }
  }, [zoom, setZoom]);

  // Get event coordinates (mouse or touch)
  const getEventCoords = useCallback((e: React.MouseEvent | React.TouchEvent): { clientX: number; clientY: number } => {
    if ('touches' in e) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }
    return { clientX: e.clientX, clientY: e.clientY };
  }, []);

  // Handle pointer down
  const handlePointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const { clientX, clientY } = getEventCoords(e);
    const point = screenToCanvas(clientX, clientY);

    // Check for middle mouse button or space key panning
    const isMiddleButton = 'button' in e && e.button === 1;
    const isSpacePan = activeTool === 'select' && 'button' in e && e.button === 0 && e.altKey;

    if (isMiddleButton || isSpacePan) {
      setIsPanning(true);
      setPanStart({ x: clientX - panX, y: clientY - panY });
      setLastPan({ x: panX, y: panY });
      return;
    }

    // Handle tool actions
    switch (activeTool) {
      case 'select':
        if ((e.target as HTMLElement).closest('[data-canvas-bg]')) {
          clearSelection();
        }
        break;

      case 'pen':
        saveToHistory();
        setIsDrawing(true);
        setCurrentPath([point]);
        break;

      case 'eraser':
        setIsDrawing(true);
        eraseAtPosition(point.x, point.y, toolSettings.eraserSize);
        break;

      case 'line':
        if (!lineStart) {
          saveToHistory();
          setLineStart(point);
        }
        break;

      case 'player-home':
        addPlayer({
          x: point.x,
          y: point.y,
          number: (currentScene?.players.filter(p => p.team === 'home').length || 0) + 1,
          team: 'home',
        });
        break;

      case 'player-away':
        addPlayer({
          x: point.x,
          y: point.y,
          number: (currentScene?.players.filter(p => p.team === 'away').length || 0) + 1,
          team: 'away',
        });
        break;

      case 'ball':
        addBall(point.x, point.y);
        break;
    }
  }, [activeTool, screenToCanvas, lineStart, currentScene, addPlayer, addBall, clearSelection, saveToHistory, eraseAtPosition, toolSettings.eraserSize, panX, panY, setIsPanning, getEventCoords]);

  // Handle pointer move
  const handlePointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const { clientX, clientY } = getEventCoords(e);

    // Handle panning
    if (isPanning && panStart) {
      const newPanX = clientX - panStart.x;
      const newPanY = clientY - panStart.y;
      setPan(newPanX, newPanY);
      return;
    }

    const point = screenToCanvas(clientX, clientY);

    if (isDrawing && activeTool === 'pen') {
      setCurrentPath(prev => [...prev, point]);
    }

    if (isDrawing && activeTool === 'eraser') {
      eraseAtPosition(point.x, point.y, toolSettings.eraserSize);
    }

    if (lineStart && activeTool === 'line') {
      setLineEnd(point);

      if (toolSettings.lineType === 'curved') {
        const midX = (lineStart.x + point.x) / 2;
        const midY = (lineStart.y + point.y) / 2;
        const dx = point.x - lineStart.x;
        const dy = point.y - lineStart.y;
        setCurveControl({ x: midX - dy * 0.3, y: midY + dx * 0.3 });
      }
    }
  }, [isPanning, panStart, isDrawing, activeTool, lineStart, screenToCanvas, eraseAtPosition, toolSettings, setPan, getEventCoords]);

  // Handle pointer up
  const handlePointerUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
      return;
    }

    if (isDrawing && currentPath.length > 1 && activeTool === 'pen') {
      addDrawing({
        points: currentPath,
        color: toolSettings.penColor,
        thickness: toolSettings.penThickness,
        opacity: toolSettings.penOpacity,
      });
    }

    if (lineStart && lineEnd && activeTool === 'line') {
      addArrow({
        startPoint: lineStart,
        endPoint: lineEnd,
        controlPoint: toolSettings.lineType === 'curved' ? curveControl || undefined : undefined,
        lineType: toolSettings.lineType,
        headType: toolSettings.arrowHeadEnd,
        tailType: toolSettings.arrowHeadStart,
        color: toolSettings.lineColor,
        thickness: toolSettings.lineThickness,
        opacity: toolSettings.lineOpacity,
      });
    }

    setIsDrawing(false);
    setCurrentPath([]);
    setLineStart(null);
    setLineEnd(null);
    setCurveControl(null);
  }, [isPanning, isDrawing, currentPath, lineStart, lineEnd, activeTool, toolSettings, addDrawing, addArrow, curveControl, setIsPanning]);

  // Handle keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearSelection();
        setLineStart(null);
        setLineEnd(null);
        setIsDrawing(false);
        setCurrentPath([]);
      }
      if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        resetView();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearSelection, resetView]);

  if (!currentScene) return null;

  // Render path for drawings
  const renderPath = (points: Point[]): string => {
    if (points.length < 2) return '';
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    return path;
  };

  // Render arrow path
  const renderArrowPath = (start: Point, end: Point, control?: Point, lineType?: string): string => {
    if (control && lineType === 'curved') {
      return `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`;
    }
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  };

  // Get stroke dash array
  const getStrokeDashArray = (lineType: string, thickness: number): string | undefined => {
    if (lineType === 'dotted') return `${thickness} ${thickness * 2}`;
    if (lineType === 'dashed') return `${thickness * 3} ${thickness * 2}`;
    return undefined;
  };

  // Render arrow head
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
    if (type === 'triangle') {
      return (
        <polygon
          points={`0,0 ${-size},${-size / 2} ${-size},${size / 2}`}
          fill={color}
          transform={`translate(${end.x}, ${end.y}) rotate(${angleDeg})`}
        />
      );
    }
    if (type === 'x') {
      return (
        <g transform={`translate(${end.x}, ${end.y}) rotate(${angleDeg})`}>
          <line x1={-size / 2} y1={-size / 2} x2={size / 2} y2={size / 2} stroke={color} strokeWidth={thickness} />
          <line x1={size / 2} y1={-size / 2} x2={-size / 2} y2={size / 2} stroke={color} strokeWidth={thickness} />
        </g>
      );
    }
    return null;
  };

  const cursor = isPanning ? 'grabbing' :
    activeTool === 'select' ? 'default' :
      activeTool === 'eraser' ? 'crosshair' : 'crosshair';

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center p-2 sm:p-4 md:p-8 bg-gray-900 overflow-hidden"
      onWheel={handleWheel}
    >
      {/* Zoom Controls */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-gray-800 rounded-lg px-2 py-1 sm:px-3 sm:py-2">
        <button
          onClick={() => setZoom(zoom - 0.1)}
          className="text-white hover:text-primary transition p-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <span className="text-white text-xs sm:text-sm min-w-[40px] sm:min-w-[50px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(zoom + 0.1)}
          className="text-white hover:text-primary transition p-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          onClick={resetView}
          className="text-white text-xs hover:text-primary transition ml-1 sm:ml-2 p-1"
        >
          ⟲
        </button>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        data-canvas-bg
        className="relative bg-green-700 rounded-lg shadow-2xl overflow-hidden select-none"
        style={{
          width: '100%',
          maxWidth: '1000px',
          aspectRatio: fieldRotation === 90 || fieldRotation === 270 ? '10 / 16' : '16 / 10',
          transform: `scale(${zoom}) translate(${panX / zoom}px, ${panY / zoom}px)`,
          transformOrigin: 'center center',
          cursor,
          touchAction: 'none',
        }}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
        {/* Field Background */}
        <FieldBackground
          type={currentProject?.fieldType || 'full'}
          rotation={fieldRotation}
        />

        {/* SVG Layer for Drawings and Arrows */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Saved Drawings */}
          {currentScene.drawings.map((drawing) => (
            <path
              key={drawing.id}
              d={renderPath(drawing.points)}
              stroke={drawing.color}
              strokeWidth={drawing.thickness * 0.3}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity={drawing.opacity}
            />
          ))}

          {/* Current Drawing */}
          {isDrawing && currentPath.length > 1 && activeTool === 'pen' && (
            <path
              d={renderPath(currentPath)}
              stroke={toolSettings.penColor}
              strokeWidth={toolSettings.penThickness * 0.3}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity={toolSettings.penOpacity}
            />
          )}

          {/* Saved Arrows */}
          {currentScene.arrows.map((arrow, i) => (
            <g key={arrow.id || crypto.randomUUID() || i} opacity={arrow.opacity}>
              <path
                d={renderArrowPath(arrow.startPoint, arrow.endPoint, arrow.controlPoint, arrow.lineType)}
                stroke={arrow.color}
                strokeWidth={arrow.thickness * 0.3}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={getStrokeDashArray(arrow.lineType, arrow.thickness * 0.3)}
              />
              {renderArrowHead(arrow.endPoint, arrow.startPoint, arrow.controlPoint, arrow.headType, arrow.color, arrow.thickness * 0.3)}
            </g>
          ))}

          {/* Preview Arrow */}
          {lineStart && lineEnd && (
            <g opacity={0.6}>
              <path
                d={renderArrowPath(lineStart, lineEnd, curveControl || undefined, toolSettings.lineType)}
                stroke={toolSettings.lineColor}
                strokeWidth={toolSettings.lineThickness * 0.3}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={getStrokeDashArray(toolSettings.lineType, toolSettings.lineThickness * 0.3)}
              />
              {renderArrowHead(lineEnd, lineStart, curveControl || undefined, toolSettings.arrowHeadEnd, toolSettings.lineColor, toolSettings.lineThickness * 0.3)}
            </g>
          )}

          {/* Eraser Cursor */}
          {activeTool === 'eraser' && (
            <circle
              cx="50"
              cy="50"
              r={toolSettings.eraserSize}
              fill="none"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="0.5"
              strokeDasharray="2 2"
              style={{ pointerEvents: 'none' }}
            />
          )}
        </svg>

        {/* Balls */}
        {currentScene.balls.map((ball, i) => (
          <BallElement
            key={ball.id || crypto.randomUUID() || i}
            ball={ball}
            scale={objectScale}
          />
        ))}

        {/* Players */}
        {currentScene.players.map((player,i) => (
          <PlayerElement
            key={player.id || crypto.randomUUID() || i}
            player={player}
            scale={objectScale}
          />
        ))}
      </div>
    </div>
  );
});

Canvas.displayName = 'Canvas';
export default Canvas;