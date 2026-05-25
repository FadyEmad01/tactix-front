// Board link metadata for local storage
export interface BoardLink {
  boardId: string;
  projectId: string;  // Match/Project ID from video editor
  tagId: string;      // REQUIRED - panel tag ID (not optional)
  linkedAt: number;
}

// Board type classification
export type BoardType = 'individual' | 'linked';

// Helper type for board with link info
export interface BoardWithLinkInfo {
  id: string;
  name: string;
  boardType: BoardType;
  projectId?: string;    // Only for linked boards
  tagId?: string;        // REQUIRED for linked boards
  projectName?: string;  // Cached for display
  tagName?: string;      // Cached for display (panel title)
}
