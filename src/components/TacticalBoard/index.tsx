'use client';

import React, { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useTacticalStore } from '@/stores/tacticalStore';
import Toolbar from './Toolbar';
import Canvas from './Canvas';
import SceneManager from './SceneManager';
import { useKeyboardShortcutsTacticalBoard as useKeyboardShortcuts } from '@/hooks/useKeyboardShortcutsTacticalBoard';

// Lazy load modals
const PropertiesPanel = dynamic(() => import('./PropertiesPanel'), { ssr: false });
const TeamSettings = dynamic(() => import('./TeamSettings'), { ssr: false });
const ExportModal = dynamic(() => import('./ExportModal'), { ssr: false });

export default function TacticalBoard() {
    const [showTeamSettings, setShowTeamSettings] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);

    useKeyboardShortcuts();

    const currentProject = useTacticalStore((s) => s.currentProject);
    const selectedIds = useTacticalStore((s) => s.selectedIds);
    const updateProjectName = useTacticalStore((s) => s.updateProjectName);

    const handleProjectNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        updateProjectName(e.target.value);
    }, [updateProjectName]);

    if (!currentProject) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-900 overflow-hidden touch-none">
            {/* Top Bar */}
            <header className="flex items-center justify-between px-2 sm:px-4 py-2 bg-gray-800 border-b border-gray-700 flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-4">
                    <h1 className="text-lg sm:text-xl font-bold text-white hidden sm:block">⚽ TACTICALista</h1>
                    <h1 className="text-lg font-bold text-white sm:hidden">⚽</h1>
                    <input
                        type="text"
                        value={currentProject.name}
                        onChange={handleProjectNameChange}
                        className="bg-gray-700 text-white px-2 sm:px-3 py-1 rounded border border-gray-600 focus:outline-none focus:border-blue-500 text-sm w-28 sm:w-auto"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowTeamSettings(true)}
                        className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-white bg-gray-700 rounded hover:bg-gray-600 transition"
                    >
                        <span className="hidden sm:inline">Team Settings</span>
                        <span className="sm:hidden">Teams</span>
                    </button>
                    <button
                        onClick={() => setShowExportModal(true)}
                        className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-white bg-blue-600 rounded hover:bg-blue-500 transition"
                    >
                        Export
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden min-h-0">
                {/* Left Toolbar */}
                <Toolbar />

                {/* Main Canvas Area */}
                <div className="flex-1 relative overflow-hidden min-w-0">
                    <Canvas />
                </div>

                {/* Right Properties Panel */}
                {selectedIds.length > 0 && (
                    <div className="w-64 hidden lg:block flex-shrink-0">
                        <PropertiesPanel />
                    </div>
                )}
            </div>

            {/* Bottom Scene Manager */}
            <SceneManager />

            {/* Modals */}
            {showTeamSettings && (
                <TeamSettings onClose={() => setShowTeamSettings(false)} />
            )}
            {showExportModal && (
                <ExportModal onClose={() => setShowExportModal(false)} />
            )}
        </div>
    );
}