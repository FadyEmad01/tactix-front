'use client';

import React, { useState, useCallback, memo } from 'react';
import { useTacticalStore } from '@/stores/tacticalStore';
import { Tool, LineType, ArrowHead } from '@/types/tactical-board';

interface ToolButtonProps {
  tool: Tool;
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  isActive: boolean;
  onClick: () => void;
}

const ToolButton = memo<ToolButtonProps>(({ icon, label, shortcut, isActive, onClick }) => (
  <button
    onClick={onClick}
    title={`${label}${shortcut ? ` (${shortcut})` : ''}`}
    className={`
      relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg transition-all
      ${isActive 
        ? 'bg-blue-600 text-white' 
        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
      }
    `}
  >
    {icon}
  </button>
));

ToolButton.displayName = 'ToolButton';

const Toolbar = memo(() => {
  const activeTool = useTacticalStore((s) => s.activeTool);
  const toolSettings = useTacticalStore((s) => s.toolSettings);
  const historyIndex = useTacticalStore((s) => s.historyIndex);
  const historyLength = useTacticalStore((s) => s.history.length);
  const setActiveTool = useTacticalStore((s) => s.setActiveTool);
  const updateToolSettings = useTacticalStore((s) => s.updateToolSettings);
  const undo = useTacticalStore((s) => s.undo);
  const redo = useTacticalStore((s) => s.redo);
  const applyFormation = useTacticalStore((s) => s.applyFormation);
  const clearCanvas = useTacticalStore((s) => s.clearCanvas);

  const [showPenSettings, setShowPenSettings] = useState(false);
  const [showLineSettings, setShowLineSettings] = useState(false);
  const [showFormationMenu, setShowFormationMenu] = useState(false);

  const tools: { tool: Tool; icon: React.ReactNode; label: string; shortcut: string }[] = [
    {
      tool: 'select',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 4l7.07 17 2.51-7.39L21 11.07 4 4z" />
        </svg>
      ),
      label: 'Select & Move',
      shortcut: 'V',
    },
    {
      tool: 'pen',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 19l7-7 3 3-7 7-3-3z" />
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        </svg>
      ),
      label: 'Pen',
      shortcut: 'P',
    },
    {
      tool: 'line',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="5" y1="19" x2="19" y2="5" />
          <polyline points="15 5 19 5 19 9" />
        </svg>
      ),
      label: 'Arrow/Line',
      shortcut: 'L',
    },
    {
      tool: 'player-home',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="8" r="5" />
          <path d="M12 14c-5 0-9 2.5-9 5.5V22h18v-2.5c0-3-4-5.5-9-5.5z" />
        </svg>
      ),
      label: 'Home Player',
      shortcut: 'H',
    },
    {
      tool: 'player-away',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="5" />
          <path d="M12 14c-5 0-9 2.5-9 5.5V22h18v-2.5c0-3-4-5.5-9-5.5z" />
        </svg>
      ),
      label: 'Away Player',
      shortcut: 'A',
    },
    {
      tool: 'ball',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
      ),
      label: 'Ball',
      shortcut: 'B',
    },
    {
      tool: 'eraser',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 20H9L4 15c-.6-.6-.6-1.5 0-2.1l9.9-9.9c.6-.6 1.5-.6 2.1 0l5 5c.6.6.6 1.5 0 2.1L12 19" />
        </svg>
      ),
      label: 'Eraser',
      shortcut: 'E',
    },
  ];

  const handleToolClick = useCallback((tool: Tool) => {
    setActiveTool(tool);
    setShowPenSettings(false);
    setShowLineSettings(false);
  }, [setActiveTool]);

  const formations = ['4-3-3', '4-4-2', '3-5-2'];

  return (
    <div className="flex flex-col bg-gray-800 border-r border-gray-700 p-1 sm:p-2 gap-1 flex-shrink-0">
      {/* Main Tools */}
      <div className="flex flex-col gap-1">
        {tools.map((t) => (
          <div key={t.tool} className="relative">
            <ToolButton
              tool={t.tool}
              icon={t.icon}
              label={t.label}
              shortcut={t.shortcut}
              isActive={activeTool === t.tool}
              onClick={() => {
                handleToolClick(t.tool);
                if (t.tool === 'pen') setShowPenSettings(!showPenSettings);
                if (t.tool === 'line') setShowLineSettings(!showLineSettings);
              }}
            />
            
            {/* Pen Settings Popup */}
            {t.tool === 'pen' && showPenSettings && activeTool === 'pen' && (
              <div className="absolute left-full top-0 ml-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-3 z-50 w-48">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Color</label>
                    <input
                      type="color"
                      value={toolSettings.penColor}
                      onChange={(e) => updateToolSettings({ penColor: e.target.value })}
                      className="w-full h-8 cursor-pointer rounded"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">
                      Size: {toolSettings.penThickness}px
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={toolSettings.penThickness}
                      onChange={(e) => updateToolSettings({ penThickness: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">
                      Opacity: {Math.round(toolSettings.penOpacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={toolSettings.penOpacity * 100}
                      onChange={(e) => updateToolSettings({ penOpacity: parseInt(e.target.value) / 100 })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Line Settings Popup */}
            {t.tool === 'line' && showLineSettings && activeTool === 'line' && (
              <div className="absolute left-full top-0 ml-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-3 z-50 w-56">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-2 block">Line Type</label>
                    <div className="flex gap-1">
                      {(['straight', 'curved', 'dotted', 'dashed'] as LineType[]).map((lt) => (
                        <button
                          key={lt}
                          onClick={() => updateToolSettings({ lineType: lt })}
                          className={`flex-1 p-2 rounded text-xs ${
                            toolSettings.lineType === lt ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                          }`}
                        >
                          {lt[0].toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-2 block">Arrow Head</label>
                    <div className="flex gap-1">
                      {(['none', 'arrow', 'triangle', 'x'] as ArrowHead[]).map((ah) => (
                        <button
                          key={ah}
                          onClick={() => updateToolSettings({ arrowHeadEnd: ah })}
                          className={`flex-1 p-2 rounded text-xs ${
                            toolSettings.arrowHeadEnd === ah ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                          }`}
                        >
                          {ah === 'none' ? '○' : ah === 'arrow' ? '→' : ah === 'triangle' ? '▶' : '✕'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Color</label>
                    <input
                      type="color"
                      value={toolSettings.lineColor}
                      onChange={(e) => updateToolSettings({ lineColor: e.target.value })}
                      className="w-full h-8 cursor-pointer rounded"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">
                      Thickness: {toolSettings.lineThickness}px
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="8"
                      value={toolSettings.lineThickness}
                      onChange={(e) => updateToolSettings({ lineThickness: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="h-px bg-gray-700 my-2" />

      {/* Formation Quick Apply */}
      <div className="relative">
        <button
          onClick={() => setShowFormationMenu(!showFormationMenu)}
          title="Apply Formation"
          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="4" r="2" />
            <circle cx="6" cy="10" r="2" />
            <circle cx="18" cy="10" r="2" />
            <circle cx="4" cy="18" r="2" />
            <circle cx="12" cy="16" r="2" />
            <circle cx="20" cy="18" r="2" />
          </svg>
        </button>
        
        {showFormationMenu && (
          <div
            className="absolute left-full top-0 ml-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-3 z-50 w-40"
            onMouseLeave={() => setShowFormationMenu(false)}
          >
            <div className="space-y-2">
              <p className="text-xs text-gray-400 font-medium">Home Team</p>
              {formations.map((f) => (
                <button
                  key={`home-${f}`}
                  onClick={() => {
                    applyFormation('home', f);
                    setShowFormationMenu(false);
                  }}
                  className="w-full text-left px-2 py-1 text-sm text-white hover:bg-gray-700 rounded"
                >
                  {f}
                </button>
              ))}
              <div className="h-px bg-gray-700 my-1" />
              <p className="text-xs text-gray-400 font-medium">Away Team</p>
              {formations.map((f) => (
                <button
                  key={`away-${f}`}
                  onClick={() => {
                    applyFormation('away', f);
                    setShowFormationMenu(false);
                  }}
                  className="w-full text-left px-2 py-1 text-sm text-white hover:bg-gray-700 rounded"
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Clear Canvas */}
      <button
        onClick={clearCanvas}
        title="Clear Canvas"
        className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-600 hover:text-white transition"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
        </svg>
      </button>

      <div className="flex-1" />

      {/* Undo/Redo */}
      <button
        onClick={undo}
        disabled={historyIndex <= 0}
        title="Undo (Ctrl+Z)"
        className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg transition ${
          historyIndex <= 0 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
        }`}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 10h10a5 5 0 015 5v2M3 10l5-5M3 10l5 5" />
        </svg>
      </button>
      
      <button
        onClick={redo}
        disabled={historyIndex >= historyLength - 1}
        title="Redo (Ctrl+Shift+Z)"
        className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg transition ${
          historyIndex >= historyLength - 1 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
        }`}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10H11a5 5 0 00-5 5v2M21 10l-5-5M21 10l-5 5" />
        </svg>
      </button>
    </div>
  );
});

Toolbar.displayName = 'Toolbar';
export default Toolbar;