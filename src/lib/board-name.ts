const SEPARATOR = '||';

export function encodeBoardName(
  matchId: string | undefined | null,
  tagId: string | undefined | null,
  displayName: string,
): string {
  if (matchId && tagId) {
    return `${matchId}${SEPARATOR}${tagId}${SEPARATOR}${displayName}`;
  }
  return displayName;
}

export function decodeBoardName(name: string): {
  matchId?: string;
  tagId?: string;
  displayName: string;
} {
  const parts = name?.split(SEPARATOR) ?? [];
  if (parts.length === 3 && parts[0] && parts[1]) {
    return { matchId: parts[0], tagId: parts[1], displayName: parts[2] };
  }
  return { displayName: name ?? '' };
}

export function isBoardLinked(board: {
  tagId?: string | null;
  linkedMatchId?: string | null;
  linkedTagId?: string | null;
  name?: string;
}): boolean {
  if (board.tagId) return true;
  if (board.linkedTagId) return true;
  const { matchId, tagId } = decodeBoardName(board.name ?? '');
  return !!(matchId && tagId);
}

export function getBoardName(name: string): string {
  return decodeBoardName(name).displayName;
}
