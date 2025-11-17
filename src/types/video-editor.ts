
export interface Tag {
    id: string;
    categoryName: string;
    eventName: string;
    startTime: number;
    endTime: number | null;
    notes?: string;
    createdAt: number;
}

export interface Category {
    name: string;
    events: string[];
}

export interface VideoPanelProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    containerRef: React.RefObject<HTMLDivElement | null>;
  
    currentTime: number;
    activeTag: Tag | null;
    tags: Tag[];
  
    isFullscreen: boolean;
  
    onStartTag: (categoryName: string, eventName: string) => void;
    onEndTag: () => void;
    onPlayClip: (tag: Tag) => void;
  
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;

    onEnterFullscreen: () => void;   
    onExitFullscreen?: () => void;   
  }
  