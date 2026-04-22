// 'use client';

// import React, { useState, useCallback, useMemo, useEffect } from 'react';
// import dynamic from 'next/dynamic';
// import { useTacticalStore } from '@/stores/tacticalStore';
// import Toolbar from './Toolbar';
// import Canvas from './Canvas';
// import SceneManager from './SceneManager';
// import { useKeyboardShortcutsTacticalBoard as useKeyboardShortcuts } from '@/hooks/useKeyboardShortcutsTacticalBoard';
// import SaveIndicator from './ui/SaveIndicator';
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { createBoardAction, updateBoardAction } from '@/app/(dashboard)/board/actions';
// import { useRouter } from 'next/navigation';
// import { Project } from '@/types/tactical-board';

// // Lazy load modals
// const PropertiesPanel = dynamic(() => import('./PropertiesPanel'), { ssr: false });
// const TeamSettings = dynamic(() => import('./TeamSettings'), { ssr: false });
// const ExportModal = dynamic(() => import('./ExportModal'), { ssr: false });

// function getIdFromResponse(res: any) {
//     return (
//         res?.data?._id ||
//         res?.data?.id ||
//         res?._id ||
//         res?.id ||
//         null
//     );
// }


// export default function TacticalBoard({ initialBoards}: { initialBoards?: Project[], }) {
//     const router = useRouter();
//     const [showTeamSettings, setShowTeamSettings] = useState(false);
//     const [showExportModal, setShowExportModal] = useState(false);
//     const [showProjectsModal, setShowProjectsModal] = useState(false);
//     const [showSaveMenu, setShowSaveMenu] = useState(false);
//     const [isSyncing, setIsSyncing] = useState(false);
//     const [isAutoSave, setIsAutoSave] = useState(false);

//     useKeyboardShortcuts();

//     const currentProject = useTacticalStore((s) => s.currentProject);
//     const selectedIds = useTacticalStore((s) => s.selectedIds);
//     const updateProjectName = useTacticalStore((s) => s.updateProjectName);
//     const setInitialBoards = useTacticalStore((s) => s.setInitialBoards);
//     const createProject = useTacticalStore((s) => s.createProject);

//     const handleProjectNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
//         updateProjectName(e.target.value);
//     }, [updateProjectName]);

//     // useEffect(() => {
//     //     if (isNewBoard) {
//     //         createProject("Untitled Board");
//     //     } else if (initialBoards && initialBoards.length > 0) {
//     //         setInitialBoards(initialBoards);
//     //     }
//     // }, [initialBoards, setInitialBoards, createProject]);

//     useEffect(() => {
//     if (initialBoards && initialBoards.length > 0) {
//         setInitialBoards(initialBoards);
//     } else {
//         createProject("Untitled Board");
//     }
// }, [initialBoards]);

//     // const handleQuickSave = useCallback(async () => {
//     //     if (!currentProject) return;
//     //     setIsSyncing(true);
//     //     try {
//     //         // A simple heuristic: if id is < 20 chars, it's likely our local short id. Otherwise it's a mongo ObjectId.
//     //         // Also checking if _id exists in case it's passed from mongo

//     //         const boardId = (currentProject as any)._id || currentProject.id;
//     //         const isLocal = !boardId || boardId.length < 20;

//     //         if (isLocal) {
//     //             const res = await createBoardAction(currentProject);
//     //             console.log("Created successfully", res);
//     //             const newId = res?.data?._id || res?.data?.id || res?._id || res?.id || res?.board?._id || res?.board?.id;
//     //             if (newId) {
//     //                 useTacticalStore.setState((s) => {
//     //                     if (s.currentProject) {
//     //                         return { currentProject: { ...s.currentProject, id: newId, _id: newId } as any };
//     //                     }
//     //                     return s;
//     //                 });
//     //                 router.replace(`/board/${newId}`);
//     //             }
//     //         } else {
//     //             const res = await updateBoardAction(boardId, currentProject);
//     //             console.log("Updated successfully", res);
//     //         }
//     //     } catch (error) {
//     //         console.error("Save error:", error);
//     //     } finally {
//     //         setIsSyncing(false);
//     //         setShowSaveMenu(false);
//     //     }
//     // }, [currentProject]);

//     //     const handleQuickSave = useCallback(async () => {
//     //         if (!currentProject) return;
//     //         setIsSyncing(true);

//     //         try {
//     //             const currentId = (currentProject as any)._id;
//     // const isLocal = !currentId;

//     //             if (isLocal) {
//     //                 const res = await createBoardAction(currentProject);
//     //                 const newId = res?.data?._id || res?.data?.id || res?._id || res?.id;

//     //                 if (newId) {
//     //                     // Update store to match the database exactly
//     //                     useTacticalStore.setState((s) => ({
//     //                         currentProject: { ...s.currentProject, id: newId, _id: newId } as any
//     //                     }));

//     //                     // Use replace so 'board/new' is removed from browser history
//     //                     router.replace(`/board/${newId}`);
//     //                 }
//     //             } else {
//     //                 // Updating existing board
//     //                 await updateBoardAction(currentId, currentProject);
//     //             }
//     //         } catch (error) {
//     //             console.error("Save error:", error);
//     //         } finally {
//     //             setIsSyncing(false);
//     //             setShowSaveMenu(false);
//     //         }
//     //     }, [currentProject, router]);

//     const handleQuickSave = useCallback(async () => {
//         if (!currentProject) return;

//         setIsSyncing(true);

//         try {

//             const serverId = (currentProject as any)._id;

//             const isLocal = !serverId;

//             if (isLocal) {

//                 // ✅ CREATE
//                 const res = await createBoardAction(currentProject);

//                 const newId =
//                     res?.data?._id ||
//                     res?._id ||
//                     res?.id;

//                 if (newId) {

//                     // ✅ update store with server id
//                     useTacticalStore.setState((s) => ({
//                         currentProject: {
//                             ...s.currentProject,
//                             id: newId,
//                             _id: newId,
//                         } as any,
//                     }));

//                     router.replace(`/board/${newId}`);
//                 }

//             } else {

//                 // ✅ UPDATE
//                 await updateBoardAction(serverId, currentProject);

//             }

//         } catch (error) {

//             console.error("Save error:", error);

//         } finally {

//             setIsSyncing(false);
//             setShowSaveMenu(false);

//         }

//     }, [currentProject, router]);


//     // Auto-save effect

//     // const handleQuickSave = useCallback(async () => {
//     //     if (!currentProject) return;
//     //     setIsSyncing(true);

//     //     try {
//     //         const boardId = (currentProject as any)._id || currentProject.id;
//     //         // Check if the board is temporary/local
//     //         const isLocal = !boardId || boardId.length < 20;

//     //         if (isLocal) {
//     //             // 1. Tell backend to create the empty record
//     //             const res = await createBoardAction();

//     //             // 2. Extract the new ID from your API response structure
//     //             const newId = res?.data?._id || res?.data?.id || res?._id || res?.id;

//     //             if (newId) {
//     //                 // 3. Sync the current local data to the newly created record
//     //                 await updateBoardAction(newId, currentProject);

//     //                 // 4. Update the local store so it knows it's now persisted
//     //                 useTacticalStore.setState((s) => {
//     //                     if (s.currentProject) {
//     //                         return {
//     //                             currentProject: { ...s.currentProject, id: newId, _id: newId } as any
//     //                         };
//     //                     }
//     //                     return s;
//     //                 });

//     //                 // 5. Change the URL to the new ID without a full page reload
//     //                 router.replace(`/board/${newId}`);
//     //                 console.log("Board promoted to server successfully");
//     //             }
//     //         } else {
//     //             // Standard update for existing boards
//     //             await updateBoardAction(boardId, currentProject);
//     //             console.log("Updated successfully");
//     //         }
//     //     } catch (error) {
//     //         console.error("Save error:", error);
//     //     } finally {
//     //         setIsSyncing(false);
//     //         setShowSaveMenu(false);
//     //     }
//     // }, [currentProject, router]);

//     useEffect(() => {
//         if (!isAutoSave || !currentProject) return;

//         const timeoutId = setTimeout(() => {
//             handleQuickSave();
//         }, 2500);

//         return () => clearTimeout(timeoutId);
//     }, [currentProject, isAutoSave, handleQuickSave]);

//     useEffect(() => {
//         const handleClickOutside = () => setShowSaveMenu(false);
//         if (showSaveMenu) {
//             document.addEventListener('click', handleClickOutside);
//             return () => document.removeEventListener('click', handleClickOutside);
//         }
//     }, [showSaveMenu]);


//     if (!currentProject) {
//         return (
//             <div className="flex items-center justify-center h-screen bg-gray-900">
//                 <div className="text-white">Loading...</div>
//             </div>
//         );
//     }

//     return (
//         <div className="flex flex-col h-screen bg-gray-900 overflow-hidden touch-none">
//             {/* Top Bar */}
//             <header className="flex items-center justify-between px-2 sm:px-4 py-2 bg-gray-800 border-b border-gray-700 flex-shrink-0">
//                 <div className="flex items-center gap-2 sm:gap-4">
//                     <h1 className="text-lg sm:text-xl font-bold text-white hidden sm:block">⚽ TACTICALista</h1>
//                     <h1 className="text-lg font-bold text-white sm:hidden">⚽</h1>
//                     <Input
//                         type="text"
//                         value={currentProject.name}
//                         onChange={handleProjectNameChange}
//                         className="bg-gray-700 text-white h-8 border-gray-600 focus-visible:ring-primary w-32 sm:w-48"
//                     />
//                 </div>

//                 <div className="flex items-center gap-2">
//                     {/* Save Button with Dropdown */}
//                     <div className="relative">
//                         <Button
//                             onClick={(e) => {
//                                 e.stopPropagation();
//                                 setShowSaveMenu(!showSaveMenu);
//                             }}
//                             disabled={isSyncing}
//                             size="sm"
//                             className={`
//                                 flex items-center gap-1
//                                 ${isSyncing ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-500 text-white'}
//                             `}
//                             title="Save Configuration"
//                         >
//                             {isSyncing ? (
//                                 <>
//                                     <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
//                                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
//                                     </svg>
//                                     <span className="hidden sm:inline">Saving...</span>
//                                 </>
//                             ) : (
//                                 <>
//                                     <span>💾</span>
//                                     <span className="hidden sm:inline">Save</span>
//                                 </>
//                             )}
//                         </Button>

//                         {showSaveMenu && (
//                             <div className="absolute right-0 top-full mt-1 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
//                                 <button
//                                     onClick={(e) => {
//                                         e.stopPropagation();
//                                         setIsAutoSave(!isAutoSave);
//                                     }}
//                                     className="w-full flex items-center justify-between px-4 py-3 text-sm text-white hover:bg-gray-700 border-b border-gray-700"
//                                 >
//                                     <span>Auto-Save</span>
//                                     <div className={`w-8 h-4 rounded-full transition-colors flex items-center px-0.5 ${isAutoSave ? 'bg-primary' : 'bg-gray-500'}`}>
//                                         <div className={`w-3 h-3 bg-white rounded-full transition-transform ${isAutoSave ? 'translate-x-4' : 'translate-x-0'}`} />
//                                     </div>
//                                 </button>
//                                 <button
//                                     onClick={handleQuickSave}
//                                     disabled={isSyncing}
//                                     className="w-full text-left px-4 py-3 text-sm text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
//                                 >
//                                     💾 Save / Update Now
//                                 </button>
//                             </div>
//                         )}
//                     </div>

//                     <Button
//                         variant="secondary"
//                         size="sm"
//                         onClick={() => setShowTeamSettings(true)}
//                         className="bg-gray-700 text-white hover:bg-gray-600"
//                     >
//                         <span className="hidden sm:inline">Team Settings</span>
//                         <span className="sm:hidden">Teams</span>
//                     </Button>
//                     <Button
//                         onClick={() => setShowExportModal(true)}
//                         size="sm"
//                     >
//                         <span className="hidden sm:inline">Export</span>
//                         <span className="sm:hidden">📤</span>
//                     </Button>
//                 </div>
//             </header>

//             {/* Error Banner */}
//             {/* {syncError && (
//                 <div className="bg-red-500 text-white px-4 py-2 flex items-center justify-between">
//                     <span className="text-sm">⚠️ {syncError}</span>
//                     <button 
//                         onClick={clearSyncError}
//                         className="text-white hover:text-gray-200"
//                     >
//                         ✕
//                     </button>
//                 </div>
//             )} */}

//             <div className="flex flex-1 overflow-hidden min-h-0">
//                 {/* Left Toolbar */}
//                 <Toolbar />

//                 {/* Main Canvas Area */}
//                 <div className="flex-1 relative overflow-hidden min-w-0">
//                     <Canvas />
//                 </div>

//                 {/* Right Properties Panel */}
//                 {selectedIds.length > 0 && (
//                     <div className="w-64 hidden lg:block flex-shrink-0">
//                         <PropertiesPanel />
//                     </div>
//                 )}
//             </div>

//             {/* Bottom Scene Manager */}
//             <SceneManager />

//             {/* Modals */}
//             {showTeamSettings && (
//                 <TeamSettings onClose={() => setShowTeamSettings(false)} />
//             )}
//             {showExportModal && (
//                 <ExportModal onClose={() => setShowExportModal(false)} />
//             )}
//         </div>
//     );
// }

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useTacticalStore } from '@/stores/tacticalStore';
import Toolbar from './Toolbar';
import Canvas from './Canvas';
import SceneManager from './SceneManager';
import { useKeyboardShortcutsTacticalBoard as useKeyboardShortcuts } from '@/hooks/useKeyboardShortcutsTacticalBoard';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createBoardAction, updateBoardAction } from '@/app/(dashboard)/board/actions';
import { Project } from '@/types/tactical-board';
import { BoardBreadcrumb } from './BoardBreadcrumb';
import { LinkBoardModal } from './LinkBoardModal';
import { getBoardLink, isBoardLinked, saveBoardLink } from '@/lib/board-link/local-storage';
import { Link2, ArrowLeft } from 'lucide-react';

// Lazy load modals
const PropertiesPanel = dynamic(() => import('./PropertiesPanel'), { ssr: false });
const TeamSettings = dynamic(() => import('./TeamSettings'), { ssr: false });
const ExportModal = dynamic(() => import('./ExportModal'), { ssr: false });

// ✅ Helper to get ID safely from any API response
function getIdFromResponse(res: any) {
    return (
        res?.data?._id ||
        res?.data?.id ||
        res?._id ||
        res?.id ||
        null
    );
}

export default function TacticalBoard({ initialBoards }: { initialBoards?: Project[] }) {
    const router = useRouter();

    const [showTeamSettings, setShowTeamSettings] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showSaveMenu, setShowSaveMenu] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isAutoSave, setIsAutoSave] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [isLinked, setIsLinked] = useState(false);

    useKeyboardShortcuts();

    const currentProject = useTacticalStore((s) => s.currentProject);
    const selectedIds = useTacticalStore((s) => s.selectedIds);
    const updateProjectName = useTacticalStore((s) => s.updateProjectName);
    const setInitialBoards = useTacticalStore((s) => s.setInitialBoards);
    const createProject = useTacticalStore((s) => s.createProject);

    // Initialize project
    useEffect(() => {
        if (initialBoards && initialBoards.length > 0) {
            setInitialBoards(initialBoards);
        } else {
            createProject("Untitled Board");
        }
    }, [initialBoards]);

    // Check if board is linked
    useEffect(() => {
        if (currentProject?.id) {
            setIsLinked(!!getBoardLink(currentProject.id));
        }
    }, [currentProject?.id]);

    const handleProjectNameChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            updateProjectName(e.target.value);
        },
        [updateProjectName]
    );

    // ✅ Quick Save / Auto Save Handler
    const handleQuickSave = useCallback(async () => {
        if (!currentProject) return;

        setIsSyncing(true);

        try {
            const localId = (currentProject as any)._id || currentProject.id;
            const isLocal = !localId;

            if (isLocal) {
                // CREATE
                const res = await createBoardAction(currentProject);
                const newId = getIdFromResponse(res);

                if (newId) {
                    // Update store with server ID
                    useTacticalStore.setState((s) => ({
                        currentProject: { ...s.currentProject, id: newId, _id: newId } as any,
                    }));

                    // Check for pending link from tag creation
                    const pendingLink = sessionStorage.getItem('pendingBoardLink');
                    if (pendingLink) {
                        const { projectId, tagId } = JSON.parse(pendingLink);
                        saveBoardLink(newId, projectId, tagId);
                        setIsLinked(true);
                        sessionStorage.removeItem('pendingBoardLink');
                    }

                    router.replace(`/board/${newId}`);
                }
            } else {
                // UPDATE
                await updateBoardAction(localId, currentProject);
            }
        } catch (error) {
            console.error("Save error:", error);
        } finally {
            setIsSyncing(false);
            setShowSaveMenu(false);
        }
    }, [currentProject, router]);

    // Auto-save effect
    useEffect(() => {
        if (!isAutoSave || !currentProject) return;

        const timeoutId = setTimeout(() => {
            handleQuickSave();
        }, 2500);

        return () => clearTimeout(timeoutId);
    }, [currentProject, isAutoSave, handleQuickSave]);

    // Click outside save menu
    useEffect(() => {
        const handleClickOutside = () => setShowSaveMenu(false);
        if (showSaveMenu) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [showSaveMenu]);

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
                <div className="flex items-center gap-4">
                    {/* Back button */}
                    {isLinked ? (
                        <Button variant="ghost" size="sm" onClick={() => router.push('/projects')} className="text-white hover:text-white hover:bg-gray-700">
                            <ArrowLeft className="size-4 mr-2" />
                            Back to Projects
                        </Button>
                    ) : (
                        <Button variant="ghost" size="sm" onClick={() => router.push('/board')} className="text-white hover:text-white hover:bg-gray-700">
                            <ArrowLeft className="size-4 mr-2" />
                            Back to Boards
                        </Button>
                    )}
                    
                    {/* Breadcrumb */}
                    {currentProject && (
                        <BoardBreadcrumb 
                            boardId={currentProject.id} 
                            boardName={currentProject.name} 
                        />
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowSaveMenu(!showSaveMenu);
                            }}
                            disabled={isSyncing}
                            size="sm"
                            className={`flex items-center gap-1 ${isSyncing ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-500 text-white'}`}
                            title="Save Configuration"
                        >
                            {isSyncing ? (
                                <>
                                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    <span className="hidden sm:inline">Saving...</span>
                                </>
                            ) : (
                                <>
                                    <span>💾</span>
                                    <span className="hidden sm:inline">Save</span>
                                </>
                            )}
                        </Button>

                        {showSaveMenu && (
                            <div className="absolute right-0 top-full mt-1 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsAutoSave(!isAutoSave);
                                    }}
                                    className="w-full flex items-center justify-between px-4 py-3 text-sm text-white hover:bg-gray-700 border-b border-gray-700"
                                >
                                    <span>Auto-Save</span>
                                    <div className={`w-8 h-4 rounded-full transition-colors flex items-center px-0.5 ${isAutoSave ? 'bg-primary' : 'bg-gray-500'}`}>
                                        <div className={`w-3 h-3 bg-white rounded-full transition-transform ${isAutoSave ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </div>
                                </button>
                                <button
                                    onClick={handleQuickSave}
                                    disabled={isSyncing}
                                    className="w-full text-left px-4 py-3 text-sm text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    💾 Save / Update Now
                                </button>
                            </div>
                        )}
                    </div>

                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowTeamSettings(true)}
                        className="bg-gray-700 text-white hover:bg-gray-600"
                    >
                        <span className="hidden sm:inline">Team Settings</span>
                        <span className="sm:hidden">Teams</span>
                    </Button>
                    {/* Make Linked Board button - only for individual boards */}
                    {!isLinked && (
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowLinkModal(true)}
                            className="bg-gray-700 text-white hover:bg-gray-600 border-gray-600"
                        >
                            <Link2 className="size-4 mr-2" />
                            <span className="hidden sm:inline">Make Linked Board</span>
                            <span className="sm:hidden">Link</span>
                        </Button>
                    )}
                    
                    <Button
                        onClick={() => setShowExportModal(true)}
                        size="sm"
                    >
                        <span className="hidden sm:inline">Export</span>
                        <span className="sm:hidden">📤</span>
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden min-h-0">
                <Toolbar />
                <div className="flex-1 relative overflow-hidden min-w-0">
                    <Canvas />
                </div>
                {selectedIds.length > 0 && (
                    <div className="w-64 hidden lg:block flex-shrink-0">
                        <PropertiesPanel />
                    </div>
                )}
            </div>

            <SceneManager />

            {/* Modals */}
            {showTeamSettings && <TeamSettings onClose={() => setShowTeamSettings(false)} />}
            {showExportModal && <ExportModal onClose={() => setShowExportModal(false)} />}
            {currentProject && (
                <LinkBoardModal
                    boardId={currentProject.id}
                    boardName={currentProject.name}
                    isOpen={showLinkModal}
                    onClose={() => setShowLinkModal(false)}
                    onLinked={() => setIsLinked(true)}
                />
            )}
        </div>
    );
}
