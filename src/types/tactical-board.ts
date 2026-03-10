export type Tool =
    | 'select'
    | 'pen'
    | 'line'
    | 'player-home'
    | 'player-away'
    | 'ball'
    | 'eraser';

export type LineType = 'straight' | 'curved' | 'dotted' | 'dashed';
export type ArrowHead = 'none' | 'arrow' | 'triangle' | 'x' | 'circle';
export type FieldRotation = 0 | 90 | 180 | 270;

export interface Point {
    x: number;
    y: number;
}

export interface Player {
    id: string;
    x: number;
    y: number;
    number: number;
    name?: string;
    team: 'home' | 'away';
}

export interface Ball {
    id: string;
    x: number;
    y: number;
}

export interface DrawingPath {
    id: string;
    points: Point[];
    color: string;
    thickness: number;
    opacity: number;
    tool?: 'pen' | 'eraser';
}

export interface Arrow {
    id: string;
    startPoint: Point;
    endPoint: Point;
    controlPoint?: Point;
    lineType: LineType;
    headType: ArrowHead;
    tailType: ArrowHead;
    color: string;
    thickness: number;
    opacity: number;
}

export interface TeamConfig {
    name: string;
    primaryColor: string;
    secondaryColor: string;
    textColor: string;
}

export interface Scene {
    id: string;
    name: string;
    players: Player[];
    balls: Ball[];
    drawings: DrawingPath[];
    arrows: Arrow[];
    timestamp: number;
}

export interface Project {
    id: string;
    name: string;
    scenes: Scene[];
    homeTeam: TeamConfig;
    awayTeam: TeamConfig;
    fieldType: FieldType;
    fieldRotation: FieldRotation;
    createdAt: number;
    updatedAt: number;
}

export type FieldType =
    | 'full'
    | 'half'
    | 'third'
    | 'penalty-area';

export interface ToolSettings {
    penColor: string;
    penThickness: number;
    penOpacity: number;
    lineType: LineType;
    arrowHeadStart: ArrowHead;
    arrowHeadEnd: ArrowHead;
    lineColor: string;
    lineThickness: number;
    lineOpacity: number;
    eraserSize: number;
}

export interface HistoryState {
    players: Player[];
    balls: Ball[];
    drawings: DrawingPath[];
    arrows: Arrow[];
}

export interface ViewState {
    zoom: number;
    panX: number;
    panY: number;
}