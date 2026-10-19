export interface Position {
  x: number;
  y: number;
}

export interface LevelConfig {
  level: number;
  name: string;
  size: number;
  path: Position[]; // Path array from start to exit
  echoDurationMs: number; // Duration the neon path flashes
}

export type GamePhase =
  | 'title'
  | 'memorize'
  | 'playing'
  | 'glitch'
  | 'level_cleared'
  | 'victory'
  | 'paused';

export interface LeaderboardEntry {
  id: string;
  name: string;
  timeMs: number;
  moves: number;
  date: string;
}

export interface RunStats {
  totalMoves: number;
  levelMoves: number;
  glitchCount: number;
  startTime: number;
  elapsedTimeMs: number;
  levelTimes: number[];
}
