import type { Position, LeaderboardEntry } from './types.ts';

export function posEquals(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

export function isAdjacent(a: Position, b: Position): boolean {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
}

export interface StepValidationResult {
  valid: boolean;
  nextIndex: number;
  isExit: boolean;
  isBacktrack: boolean;
}

/**
 * Validates moving from current position on the path.
 * The player starts at path[0].
 * Legal forward step is path[currentIndex + 1].
 * Legal backward step is path[currentIndex - 1] (if currentIndex > 0).
 * Any other move is off the safe path and triggers a glitch reset.
 */
export function validateMove(
  path: Position[],
  currentIndex: number,
  nextPos: Position,
  gridSize: number
): StepValidationResult {
  // Check grid boundaries
  if (
    nextPos.x < 0 ||
    nextPos.x >= gridSize ||
    nextPos.y < 0 ||
    nextPos.y >= gridSize
  ) {
    return { valid: false, nextIndex: currentIndex, isExit: false, isBacktrack: false };
  }

  const currentPos = path[currentIndex];
  if (!currentPos || !isAdjacent(currentPos, nextPos)) {
    return { valid: false, nextIndex: currentIndex, isExit: false, isBacktrack: false };
  }

  // Check forward move
  const forwardTarget = path[currentIndex + 1];
  if (forwardTarget && posEquals(forwardTarget, nextPos)) {
    const nextIndex = currentIndex + 1;
    const isExit = nextIndex === path.length - 1;
    return { valid: true, nextIndex, isExit, isBacktrack: false };
  }

  // Check backtrack move (safe, allows player to retrace)
  if (currentIndex > 0) {
    const backtrackTarget = path[currentIndex - 1];
    if (backtrackTarget && posEquals(backtrackTarget, nextPos)) {
      return { valid: true, nextIndex: currentIndex - 1, isExit: false, isBacktrack: true };
    }
  }

  // Any other tile (even if elsewhere on path but non-contiguous) is considered off the safe path!
  return { valid: false, nextIndex: 0, isExit: false, isBacktrack: false };
}

export function formatTime(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((ms % 1000) / 100);

  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');
  return `${mm}:${ss}.${tenths}`;
}

export function formatTimeDetailed(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centis = Math.floor((ms % 1000) / 10);

  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');
  const cc = centis.toString().padStart(2, '0');
  return `${mm}:${ss}.${cc}`;
}

export const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'seed-1',
    name: 'NEO_VEX',
    timeMs: 44250, // 00:44.25
    moves: 78,
    date: '2026-10-18',
  },
  {
    id: 'seed-2',
    name: 'PULSE_9',
    timeMs: 56800, // 00:56.80
    moves: 86,
    date: '2026-10-17',
  },
  {
    id: 'seed-3',
    name: 'CYBER_GHOST',
    timeMs: 69400, // 01:09.40
    moves: 95,
    date: '2026-10-16',
  },
];

export function isTopThreeScore(records: LeaderboardEntry[], timeMs: number): boolean {
  if (records.length < 3) return true;
  // Sorted asc by time
  const sorted = [...records].sort((a, b) => a.timeMs - b.timeMs);
  return timeMs < sorted[2].timeMs;
}

export function insertLeaderboardRecord(
  records: LeaderboardEntry[],
  newRecord: LeaderboardEntry
): LeaderboardEntry[] {
  const combined = [...records, newRecord];
  combined.sort((a, b) => {
    if (a.timeMs !== b.timeMs) {
      return a.timeMs - b.timeMs;
    }
    return a.moves - b.moves;
  });
  return combined.slice(0, 3);
}
