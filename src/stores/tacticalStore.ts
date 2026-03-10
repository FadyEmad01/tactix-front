import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  Tool, Player, Ball, DrawingPath, Arrow,
  TeamConfig, Scene, Project, FieldType, ToolSettings,
  HistoryState, LineType, ArrowHead, FieldRotation, Point
} from '@/types/tactical-board';

// Helper to generate IDs without external dependency
const generateId = () => Math.random().toString(36).substring(2, 15);

// Round position to 2 decimal places for consistency
const roundPosition = (value: number): number => Math.round(value * 100) / 100;

interface TacticalState {
  currentProject: Project | null;
  currentSceneIndex: number;
  activeTool: Tool;
  toolSettings: ToolSettings;
  selectedIds: string[];
  history: HistoryState[];
  historyIndex: number;
  zoom: number;
  panX: number;
  panY: number;
  isPanning: boolean;
  
  // Actions
  setActiveTool: (tool: Tool) => void;
  updateToolSettings: (settings: Partial<ToolSettings>) => void;
  
  addPlayer: (player: Omit<Player, 'id'>) => void;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  removePlayer: (id: string) => void;
  
  addBall: (x: number, y: number) => void;
  updateBall: (id: string, updates: Partial<Ball>) => void;
  removeBall: (id: string) => void;
  
  addDrawing: (drawing: Omit<DrawingPath, 'id'>) => void;
  removeDrawing: (id: string) => void;
  
  addArrow: (arrow: Omit<Arrow, 'id'>) => void;
  updateArrow: (id: string, updates: Partial<Arrow>) => void;
  removeArrow: (id: string) => void;
  
  setSelection: (ids: string[]) => void;
  clearSelection: () => void;
  deleteSelected: () => void;
  
  // Eraser action - delete objects at position
  eraseAtPosition: (x: number, y: number, radius: number) => void;
  
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  
  addScene: () => void;
  duplicateScene: (index: number) => void;
  removeScene: (index: number) => void;
  setCurrentScene: (index: number) => void;
  renameScene: (index: number, name: string) => void;
  
  createProject: (name: string) => void;
  updateProjectName: (name: string) => void;
  
  updateHomeTeam: (config: Partial<TeamConfig>) => void;
  updateAwayTeam: (config: Partial<TeamConfig>) => void;
  
  setFieldType: (type: FieldType) => void;
  setFieldRotation: (rotation: FieldRotation) => void;
  
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  setIsPanning: (isPanning: boolean) => void;
  resetView: () => void;
  
  applyFormation: (team: 'home' | 'away', formation: string) => void;
  clearCanvas: () => void;
}

const defaultToolSettings: ToolSettings = {
  penColor: '#ffffff',
  penThickness: 3,
  penOpacity: 1,
  lineType: 'straight',
  arrowHeadStart: 'none',
  arrowHeadEnd: 'arrow',
  lineColor: '#ffffff',
  lineThickness: 2,
  lineOpacity: 1,
  eraserSize: 5,
};

const defaultHomeTeam: TeamConfig = {
  name: 'Home Team',
  primaryColor: '#e63946',
  secondaryColor: '#1d3557',
  textColor: '#ffffff',
};

const defaultAwayTeam: TeamConfig = {
  name: 'Away Team',
  primaryColor: '#457b9d',
  secondaryColor: '#f1faee',
  textColor: '#ffffff',
};

const createEmptyScene = (name: string = 'Scene 1'): Scene => ({
  id: generateId(),
  name,
  players: [],
  balls: [],
  drawings: [],
  arrows: [],
  timestamp: Date.now(),
});

const createEmptyProject = (name: string = 'Untitled Project'): Project => ({
  id: generateId(),
  name,
  scenes: [createEmptyScene()],
  homeTeam: defaultHomeTeam,
  awayTeam: defaultAwayTeam,
  fieldType: 'full',
  fieldRotation: 0,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// Helper to check if point is near a position
const isPointNear = (px: number, py: number, x: number, y: number, radius: number): boolean => {
  const dx = px - x;
  const dy = py - y;
  return Math.sqrt(dx * dx + dy * dy) <= radius;
};

// Helper to check if point is near a line segment
const isPointNearLine = (
  px: number, py: number, 
  x1: number, y1: number, 
  x2: number, y2: number, 
  threshold: number
): boolean => {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  
  if (lenSq !== 0) param = dot / lenSq;
  
  let xx, yy;
  if (param < 0) { xx = x1; yy = y1; }
  else if (param > 1) { xx = x2; yy = y2; }
  else { xx = x1 + param * C; yy = y1 + param * D; }
  
  const dx = px - xx;
  const dy = py - yy;
  return Math.sqrt(dx * dx + dy * dy) <= threshold;
};

export const useTacticalStore = create<TacticalState>()(
  persist(
    (set, get) => ({
      currentProject: createEmptyProject(),
      currentSceneIndex: 0,
      activeTool: 'select',
      toolSettings: defaultToolSettings,
      selectedIds: [],
      history: [],
      historyIndex: -1,
      zoom: 1,
      panX: 0,
      panY: 0,
      isPanning: false,

      setActiveTool: (tool) => set({ activeTool: tool, selectedIds: [] }),
      
      updateToolSettings: (settings) => set((state) => ({
        toolSettings: { ...state.toolSettings, ...settings },
      })),

      addPlayer: (player) => {
        const state = get();
        if (!state.currentProject) return;
        
        state.saveToHistory();
        const newPlayer: Player = { 
          ...player, 
          id: generateId(),
          x: roundPosition(player.x),
          y: roundPosition(player.y),
        };
        
        const newScenes = [...state.currentProject.scenes];
        const currentScene = newScenes[state.currentSceneIndex];
        newScenes[state.currentSceneIndex] = {
          ...currentScene,
          players: [...currentScene.players, newPlayer],
          timestamp: Date.now(),
        };
        
        set({
          currentProject: {
            ...state.currentProject,
            scenes: newScenes,
            updatedAt: Date.now(),
          },
        });
      },

      updatePlayer: (id, updates) => {
        set((state) => {
          if (!state.currentProject) return state;
          
          const newScenes = [...state.currentProject.scenes];
          const currentScene = newScenes[state.currentSceneIndex];
          newScenes[state.currentSceneIndex] = {
            ...currentScene,
            players: currentScene.players.map((p) =>
              p.id === id ? { 
                ...p, 
                ...updates,
                x: updates.x !== undefined ? roundPosition(updates.x) : p.x,
                y: updates.y !== undefined ? roundPosition(updates.y) : p.y,
              } : p
            ),
            timestamp: Date.now(),
          };
          
          return {
            currentProject: {
              ...state.currentProject,
              scenes: newScenes,
              updatedAt: Date.now(),
            },
          };
        });
      },

      removePlayer: (id) => {
        const state = get();
        if (!state.currentProject) return;
        
        state.saveToHistory();
        const newScenes = [...state.currentProject.scenes];
        const currentScene = newScenes[state.currentSceneIndex];
        newScenes[state.currentSceneIndex] = {
          ...currentScene,
          players: currentScene.players.filter((p) => p.id !== id),
          timestamp: Date.now(),
        };
        
        set({
          currentProject: {
            ...state.currentProject,
            scenes: newScenes,
            updatedAt: Date.now(),
          },
          selectedIds: state.selectedIds.filter((sid) => sid !== id),
        });
      },

      addBall: (x, y) => {
        const state = get();
        if (!state.currentProject) return;
        
        state.saveToHistory();
        const newBall: Ball = { 
          id: generateId(), 
          x: roundPosition(x), 
          y: roundPosition(y) 
        };
        
        const newScenes = [...state.currentProject.scenes];
        const currentScene = newScenes[state.currentSceneIndex];
        newScenes[state.currentSceneIndex] = {
          ...currentScene,
          balls: [...currentScene.balls, newBall],
          timestamp: Date.now(),
        };
        
        set({
          currentProject: {
            ...state.currentProject,
            scenes: newScenes,
            updatedAt: Date.now(),
          },
        });
      },

      updateBall: (id, updates) => {
        set((state) => {
          if (!state.currentProject) return state;
          
          const newScenes = [...state.currentProject.scenes];
          const currentScene = newScenes[state.currentSceneIndex];
          newScenes[state.currentSceneIndex] = {
            ...currentScene,
            balls: currentScene.balls.map((b) =>
              b.id === id ? { 
                ...b, 
                ...updates,
                x: updates.x !== undefined ? roundPosition(updates.x) : b.x,
                y: updates.y !== undefined ? roundPosition(updates.y) : b.y,
              } : b
            ),
            timestamp: Date.now(),
          };
          
          return {
            currentProject: {
              ...state.currentProject,
              scenes: newScenes,
              updatedAt: Date.now(),
            },
          };
        });
      },

      removeBall: (id) => {
        const state = get();
        if (!state.currentProject) return;
        
        state.saveToHistory();
        const newScenes = [...state.currentProject.scenes];
        const currentScene = newScenes[state.currentSceneIndex];
        newScenes[state.currentSceneIndex] = {
          ...currentScene,
          balls: currentScene.balls.filter((b) => b.id !== id),
          timestamp: Date.now(),
        };
        
        set({
          currentProject: {
            ...state.currentProject,
            scenes: newScenes,
            updatedAt: Date.now(),
          },
          selectedIds: state.selectedIds.filter((sid) => sid !== id),
        });
      },

      addDrawing: (drawing) => {
        const state = get();
        if (!state.currentProject) return;
        
        const newDrawing: DrawingPath = { 
          ...drawing, 
          id: generateId(),
          points: drawing.points.map(p => ({
            x: roundPosition(p.x),
            y: roundPosition(p.y),
          })),
        };
        
        const newScenes = [...state.currentProject.scenes];
        const currentScene = newScenes[state.currentSceneIndex];
        newScenes[state.currentSceneIndex] = {
          ...currentScene,
          drawings: [...currentScene.drawings, newDrawing],
          timestamp: Date.now(),
        };
        
        set({
          currentProject: {
            ...state.currentProject,
            scenes: newScenes,
            updatedAt: Date.now(),
          },
        });
      },

      removeDrawing: (id) => {
        set((state) => {
          if (!state.currentProject) return state;
          
          const newScenes = [...state.currentProject.scenes];
          const currentScene = newScenes[state.currentSceneIndex];
          newScenes[state.currentSceneIndex] = {
            ...currentScene,
            drawings: currentScene.drawings.filter((d) => d.id !== id),
            timestamp: Date.now(),
          };
          
          return {
            currentProject: {
              ...state.currentProject,
              scenes: newScenes,
              updatedAt: Date.now(),
            },
          };
        });
      },

      addArrow: (arrow) => {
        const state = get();
        if (!state.currentProject) return;
        
        state.saveToHistory();
        const newArrow: Arrow = { 
          ...arrow, 
          id: generateId(),
          startPoint: {
            x: roundPosition(arrow.startPoint.x),
            y: roundPosition(arrow.startPoint.y),
          },
          endPoint: {
            x: roundPosition(arrow.endPoint.x),
            y: roundPosition(arrow.endPoint.y),
          },
          controlPoint: arrow.controlPoint ? {
            x: roundPosition(arrow.controlPoint.x),
            y: roundPosition(arrow.controlPoint.y),
          } : undefined,
        };
        
        const newScenes = [...state.currentProject.scenes];
        const currentScene = newScenes[state.currentSceneIndex];
        newScenes[state.currentSceneIndex] = {
          ...currentScene,
          arrows: [...currentScene.arrows, newArrow],
          timestamp: Date.now(),
        };
        
        set({
          currentProject: {
            ...state.currentProject,
            scenes: newScenes,
            updatedAt: Date.now(),
          },
        });
      },

      updateArrow: (id, updates) => {
        set((state) => {
          if (!state.currentProject) return state;
          
          const newScenes = [...state.currentProject.scenes];
          const currentScene = newScenes[state.currentSceneIndex];
          newScenes[state.currentSceneIndex] = {
            ...currentScene,
            arrows: currentScene.arrows.map((a) =>
              a.id === id ? { ...a, ...updates } : a
            ),
            timestamp: Date.now(),
          };
          
          return {
            currentProject: {
              ...state.currentProject,
              scenes: newScenes,
              updatedAt: Date.now(),
            },
          };
        });
      },

      removeArrow: (id) => {
        const state = get();
        if (!state.currentProject) return;
        
        state.saveToHistory();
        const newScenes = [...state.currentProject.scenes];
        const currentScene = newScenes[state.currentSceneIndex];
        newScenes[state.currentSceneIndex] = {
          ...currentScene,
          arrows: currentScene.arrows.filter((a) => a.id !== id),
          timestamp: Date.now(),
        };
        
        set({
          currentProject: {
            ...state.currentProject,
            scenes: newScenes,
            updatedAt: Date.now(),
          },
          selectedIds: state.selectedIds.filter((sid) => sid !== id),
        });
      },

      // Eraser functionality - deletes any object at position
      eraseAtPosition: (x, y, radius) => {
        const state = get();
        if (!state.currentProject) return;
        
        const currentScene = state.currentProject.scenes[state.currentSceneIndex];
        let hasChanges = false;
        
        // Check players
        const playersToRemove = currentScene.players.filter(p => 
          isPointNear(x, y, p.x, p.y, radius + 3)
        );
        
        // Check balls
        const ballsToRemove = currentScene.balls.filter(b => 
          isPointNear(x, y, b.x, b.y, radius + 2)
        );
        
        // Check arrows
        const arrowsToRemove = currentScene.arrows.filter(a => 
          isPointNearLine(x, y, a.startPoint.x, a.startPoint.y, a.endPoint.x, a.endPoint.y, radius)
        );
        
        // Check drawings
        const drawingsToRemove = currentScene.drawings.filter(d => 
          d.points.some((p, i) => {
            if (i === 0) return isPointNear(x, y, p.x, p.y, radius);
            const prev = d.points[i - 1];
            return isPointNearLine(x, y, prev.x, prev.y, p.x, p.y, radius);
          })
        );
        
        if (playersToRemove.length > 0 || ballsToRemove.length > 0 || 
            arrowsToRemove.length > 0 || drawingsToRemove.length > 0) {
          
          if (!hasChanges) {
            state.saveToHistory();
            hasChanges = true;
          }
          
          const newScenes = [...state.currentProject.scenes];
          newScenes[state.currentSceneIndex] = {
            ...currentScene,
            players: currentScene.players.filter(p => !playersToRemove.includes(p)),
            balls: currentScene.balls.filter(b => !ballsToRemove.includes(b)),
            arrows: currentScene.arrows.filter(a => !arrowsToRemove.includes(a)),
            drawings: currentScene.drawings.filter(d => !drawingsToRemove.includes(d)),
            timestamp: Date.now(),
          };
          
          set({
            currentProject: {
              ...state.currentProject,
              scenes: newScenes,
              updatedAt: Date.now(),
            },
          });
        }
      },

      setSelection: (ids) => set({ selectedIds: ids }),
      clearSelection: () => set({ selectedIds: [] }),
      
      deleteSelected: () => {
        const state = get();
        if (state.selectedIds.length === 0 || !state.currentProject) return;
        
        state.saveToHistory();
        const newScenes = [...state.currentProject.scenes];
        const currentScene = newScenes[state.currentSceneIndex];
        
        newScenes[state.currentSceneIndex] = {
          ...currentScene,
          players: currentScene.players.filter((p) => !state.selectedIds.includes(p.id)),
          balls: currentScene.balls.filter((b) => !state.selectedIds.includes(b.id)),
          arrows: currentScene.arrows.filter((a) => !state.selectedIds.includes(a.id)),
          drawings: currentScene.drawings.filter((d) => !state.selectedIds.includes(d.id)),
          timestamp: Date.now(),
        };
        
        set({
          currentProject: {
            ...state.currentProject,
            scenes: newScenes,
            updatedAt: Date.now(),
          },
          selectedIds: [],
        });
      },

      saveToHistory: () => {
        const state = get();
        const currentScene = state.currentProject?.scenes[state.currentSceneIndex];
        if (!currentScene) return;

        const historyState: HistoryState = {
          players: JSON.parse(JSON.stringify(currentScene.players)),
          balls: JSON.parse(JSON.stringify(currentScene.balls)),
          drawings: JSON.parse(JSON.stringify(currentScene.drawings)),
          arrows: JSON.parse(JSON.stringify(currentScene.arrows)),
        };

        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(historyState);
        
        if (newHistory.length > 30) newHistory.shift();

        set({
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      undo: () => {
        const state = get();
        if (state.historyIndex <= 0 || !state.currentProject) return;

        const newIndex = state.historyIndex - 1;
        const historyState = state.history[newIndex];
        
        const newScenes = [...state.currentProject.scenes];
        newScenes[state.currentSceneIndex] = {
          ...newScenes[state.currentSceneIndex],
          ...historyState,
          timestamp: Date.now(),
        };

        set({
          currentProject: {
            ...state.currentProject,
            scenes: newScenes,
            updatedAt: Date.now(),
          },
          historyIndex: newIndex,
          selectedIds: [],
        });
      },

      redo: () => {
        const state = get();
        if (state.historyIndex >= state.history.length - 1 || !state.currentProject) return;

        const newIndex = state.historyIndex + 1;
        const historyState = state.history[newIndex];
        
        const newScenes = [...state.currentProject.scenes];
        newScenes[state.currentSceneIndex] = {
          ...newScenes[state.currentSceneIndex],
          ...historyState,
          timestamp: Date.now(),
        };

        set({
          currentProject: {
            ...state.currentProject,
            scenes: newScenes,
            updatedAt: Date.now(),
          },
          historyIndex: newIndex,
          selectedIds: [],
        });
      },

      addScene: () => {
        set((state) => {
          if (!state.currentProject) return state;
          const newScene = createEmptyScene(`Scene ${state.currentProject.scenes.length + 1}`);
          return {
            currentProject: {
              ...state.currentProject,
              scenes: [...state.currentProject.scenes, newScene],
              updatedAt: Date.now(),
            },
            currentSceneIndex: state.currentProject.scenes.length,
            history: [],
            historyIndex: -1,
            selectedIds: [],
          };
        });
      },

      duplicateScene: (index) => {
        set((state) => {
          if (!state.currentProject) return state;
          const sceneToClone = state.currentProject.scenes[index];
          const newScene: Scene = {
            ...JSON.parse(JSON.stringify(sceneToClone)),
            id: generateId(),
            name: `${sceneToClone.name} (Copy)`,
            timestamp: Date.now(),
          };
          // Regenerate IDs for all elements
          newScene.players = newScene.players.map(p => ({ ...p, id: generateId() }));
          newScene.balls = newScene.balls.map(b => ({ ...b, id: generateId() }));
          newScene.drawings = newScene.drawings.map(d => ({ ...d, id: generateId() }));
          newScene.arrows = newScene.arrows.map(a => ({ ...a, id: generateId() }));
          
          const newScenes = [...state.currentProject.scenes];
          newScenes.splice(index + 1, 0, newScene);
          return {
            currentProject: {
              ...state.currentProject,
              scenes: newScenes,
              updatedAt: Date.now(),
            },
            currentSceneIndex: index + 1,
            history: [],
            historyIndex: -1,
            selectedIds: [],
          };
        });
      },

      removeScene: (index) => {
        set((state) => {
          if (!state.currentProject || state.currentProject.scenes.length <= 1) return state;
          const newScenes = state.currentProject.scenes.filter((_, i) => i !== index);
          const newIndex = Math.min(state.currentSceneIndex, newScenes.length - 1);
          return {
            currentProject: {
              ...state.currentProject,
              scenes: newScenes,
              updatedAt: Date.now(),
            },
            currentSceneIndex: newIndex >= 0 ? newIndex : 0,
            history: [],
            historyIndex: -1,
            selectedIds: [],
          };
        });
      },

      setCurrentScene: (index) => {
        set({
          currentSceneIndex: index,
          selectedIds: [],
          history: [],
          historyIndex: -1,
        });
      },

      renameScene: (index, name) => {
        set((state) => {
          if (!state.currentProject) return state;
          const newScenes = [...state.currentProject.scenes];
          newScenes[index] = { ...newScenes[index], name };
          return {
            currentProject: {
              ...state.currentProject,
              scenes: newScenes,
              updatedAt: Date.now(),
            },
          };
        });
      },

      createProject: (name) => {
        set({
          currentProject: createEmptyProject(name),
          currentSceneIndex: 0,
          selectedIds: [],
          history: [],
          historyIndex: -1,
          zoom: 1,
          panX: 0,
          panY: 0,
        });
      },

      updateProjectName: (name) => {
        set((state) => {
          if (!state.currentProject) return state;
          return {
            currentProject: {
              ...state.currentProject,
              name,
              updatedAt: Date.now(),
            },
          };
        });
      },

      updateHomeTeam: (config) => {
        set((state) => {
          if (!state.currentProject) return state;
          return {
            currentProject: {
              ...state.currentProject,
              homeTeam: { ...state.currentProject.homeTeam, ...config },
              updatedAt: Date.now(),
            },
          };
        });
      },

      updateAwayTeam: (config) => {
        set((state) => {
          if (!state.currentProject) return state;
          return {
            currentProject: {
              ...state.currentProject,
              awayTeam: { ...state.currentProject.awayTeam, ...config },
              updatedAt: Date.now(),
            },
          };
        });
      },

      setFieldType: (type) => {
        set((state) => {
          if (!state.currentProject) return state;
          return {
            currentProject: {
              ...state.currentProject,
              fieldType: type,
              updatedAt: Date.now(),
            },
          };
        });
      },

      setFieldRotation: (rotation) => {
        set((state) => {
          if (!state.currentProject) return state;
          return {
            currentProject: {
              ...state.currentProject,
              fieldRotation: rotation,
              updatedAt: Date.now(),
            },
          };
        });
      },

      setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(3, zoom)) }),
      setPan: (x, y) => set({ panX: x, panY: y }),
      setIsPanning: (isPanning) => set({ isPanning }),
      resetView: () => set({ zoom: 1, panX: 0, panY: 0 }),

      applyFormation: (team, formation) => {
        const state = get();
        if (!state.currentProject) return;
        
        state.saveToHistory();
        
        const formations: Record<string, { x: number; y: number; number: number }[]> = {
          '4-3-3': [
            { x: 50, y: 90, number: 1 },
            { x: 15, y: 70, number: 2 },
            { x: 35, y: 75, number: 4 },
            { x: 65, y: 75, number: 5 },
            { x: 85, y: 70, number: 3 },
            { x: 30, y: 50, number: 6 },
            { x: 50, y: 55, number: 8 },
            { x: 70, y: 50, number: 10 },
            { x: 15, y: 25, number: 7 },
            { x: 50, y: 20, number: 9 },
            { x: 85, y: 25, number: 11 },
          ],
          '4-4-2': [
            { x: 50, y: 90, number: 1 },
            { x: 15, y: 70, number: 2 },
            { x: 35, y: 75, number: 4 },
            { x: 65, y: 75, number: 5 },
            { x: 85, y: 70, number: 3 },
            { x: 15, y: 45, number: 7 },
            { x: 35, y: 50, number: 6 },
            { x: 65, y: 50, number: 8 },
            { x: 85, y: 45, number: 11 },
            { x: 35, y: 20, number: 9 },
            { x: 65, y: 20, number: 10 },
          ],
          '3-5-2': [
            { x: 50, y: 90, number: 1 },
            { x: 25, y: 75, number: 4 },
            { x: 50, y: 78, number: 5 },
            { x: 75, y: 75, number: 6 },
            { x: 10, y: 50, number: 2 },
            { x: 30, y: 50, number: 8 },
            { x: 50, y: 45, number: 10 },
            { x: 70, y: 50, number: 7 },
            { x: 90, y: 50, number: 3 },
            { x: 35, y: 20, number: 9 },
            { x: 65, y: 20, number: 11 },
          ],
        };

        const formationPositions = formations[formation] || formations['4-3-3'];
        
        const adjustedPositions = team === 'away' 
          ? formationPositions.map((p) => ({ ...p, y: 100 - p.y }))
          : formationPositions;

        const newPlayers: Player[] = adjustedPositions.map((pos) => ({
          id: generateId(),
          x: roundPosition(pos.x),
          y: roundPosition(pos.y),
          number: pos.number,
          team,
        }));

        const newScenes = [...state.currentProject.scenes];
        const currentScene = newScenes[state.currentSceneIndex];
        const otherTeamPlayers = currentScene.players.filter((p) => p.team !== team);
        
        newScenes[state.currentSceneIndex] = {
          ...currentScene,
          players: [...otherTeamPlayers, ...newPlayers],
          timestamp: Date.now(),
        };
        
        set({
          currentProject: {
            ...state.currentProject,
            scenes: newScenes,
            updatedAt: Date.now(),
          },
        });
      },

      clearCanvas: () => {
        const state = get();
        if (!state.currentProject) return;
        
        state.saveToHistory();
        const newScenes = [...state.currentProject.scenes];
        newScenes[state.currentSceneIndex] = {
          ...newScenes[state.currentSceneIndex],
          players: [],
          balls: [],
          drawings: [],
          arrows: [],
          timestamp: Date.now(),
        };
        
        set({
          currentProject: {
            ...state.currentProject,
            scenes: newScenes,
            updatedAt: Date.now(),
          },
          selectedIds: [],
        });
      },
    }),
    {
      name: 'tactical-board-v2',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentProject: state.currentProject,
        currentSceneIndex: state.currentSceneIndex,
        toolSettings: state.toolSettings,
      }),
    }
  )
);