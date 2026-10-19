import React from 'react';
import type { Position, LevelConfig, GamePhase } from '../game/types.ts';
import { posEquals } from '../game/logic.ts';
import { ShieldAlert, Zap, Compass, Sparkles } from 'lucide-react';

interface GameBoardProps {
  level: LevelConfig;
  playerPos: Position;
  pathIndex: number;
  gamePhase: GamePhase;
  isGlitching: boolean;
  glitchPos: Position | null;
  echoTimeRemainingRatio: number;
  onTileClick: (pos: Position) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  level,
  playerPos,
  pathIndex,
  gamePhase,
  isGlitching,
  glitchPos,
  echoTimeRemainingRatio,
  onTileClick,
}) => {
  const { size, path } = level;
  const startPos = path[0];
  const exitPos = path[path.length - 1];

  // Set of path keys for quick lookup during memorize phase
  const pathSet = React.useMemo(() => {
    const set = new Set<string>();
    path.forEach((p) => set.add(`${p.x},${p.y}`));
    return set;
  }, [path]);

  // Set of visited path points up to current pathIndex
  const visitedSet = React.useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i <= pathIndex; i++) {
      if (path[i]) {
        set.add(`${path[i].x},${path[i].y}`);
      }
    }
    return set;
  }, [path, pathIndex]);

  // Generate grid tiles row by row (y from 0 to size-1, x from 0 to size-1)
  const tiles: Position[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      tiles.push({ x, y });
    }
  }

  return (
    <div className="relative flex flex-col items-center w-full max-w-md mx-auto">
      {/* Echo Memory Countdown Bar */}
      {gamePhase === 'memorize' && (
        <div className="w-full mb-3 px-1 animate-pulse">
          <div className="flex justify-between items-center text-xs tracking-wider text-cyan-400 font-mono mb-1">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-cyan-300 animate-spin" />
              NEON PATH SYNCHRONIZING...
            </span>
            <span>MEMORIZE THE ROUTE</span>
          </div>
          <div className="w-full h-2 bg-slate-900 border border-cyan-500/40 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-500 rounded-full transition-all duration-75 shadow-[0_0_10px_#06b6d4]"
              style={{ width: `${Math.max(0, Math.min(100, echoTimeRemainingRatio * 100))}%` }}
            />
          </div>
        </div>
      )}

      {/* Grid container with subtle glowing cyber frame */}
      <div
        className={`relative p-3 rounded-2xl bg-slate-950/90 border-2 transition-all duration-200 select-none shadow-2xl backdrop-blur-md ${
          isGlitching
            ? 'animate-glitch border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.6)]'
            : gamePhase === 'memorize'
            ? 'border-cyan-500/80 shadow-[0_0_25px_rgba(6,182,212,0.4)]'
            : 'border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
        }`}
        style={{
          width: '100%',
          maxWidth: '440px',
        }}
      >
        {/* Subtle scanline overlay in glitch */}
        {isGlitching && (
          <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden z-20 scanline opacity-70" />
        )}

        {/* Glitch alert banner */}
        {isGlitching && (
          <div className="absolute inset-x-0 -top-10 z-30 flex items-center justify-center pointer-events-none">
            <div className="bg-red-950/90 border border-red-500 text-red-300 px-4 py-1 rounded text-xs font-mono font-bold tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.8)]">
              <ShieldAlert className="w-4 h-4 text-red-400 animate-bounce" />
              PATH MISMATCH! SYSTEM REBOUND
            </div>
          </div>
        )}

        {/* CSS Grid */}
        <div
          className="grid gap-1.5 sm:gap-2 w-full aspect-square"
          style={{
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,
          }}
          role="grid"
          aria-label={`Echo Maze Grid Level ${level.level}`}
        >
          {tiles.map((pos) => {
            const key = `${pos.x},${pos.y}`;
            const isStart = posEquals(pos, startPos);
            const isExit = posEquals(pos, exitPos);
            const isPlayer = posEquals(pos, playerPos);
            const isPathTile = pathSet.has(key);
            const isVisited = visitedSet.has(key);
            const isGlitchTile = glitchPos && posEquals(pos, glitchPos);

            // Determine display state of this cell
            const showNeonBlue = gamePhase === 'memorize' && isPathTile;

            let cellClass =
              'relative rounded-lg flex items-center justify-center font-mono font-bold text-xs transition-all duration-150 cursor-pointer overflow-hidden border ';

            if (isGlitchTile) {
              cellClass += 'bg-red-600/60 border-red-400 neon-glow-red text-white scale-95';
            } else if (showNeonBlue) {
              // Bright neon blue flashing path!
              cellClass +=
                'bg-cyan-400 border-cyan-200 text-slate-950 neon-glow-cyan-lg scale-[1.02] z-10';
            } else if (isPlayer) {
              // Green Avatar on this tile!
              cellClass +=
                'bg-emerald-950/80 border-emerald-400 neon-glow-green text-emerald-300 z-10';
            } else if (isExit) {
              // Target exit tile
              cellClass +=
                'bg-amber-950/50 border-amber-500/70 text-amber-300 hover:border-amber-400';
            } else if (isVisited && gamePhase === 'playing') {
              // Previously visited safe path tile - subtle cyan trace
              cellClass +=
                'bg-cyan-950/40 border-cyan-500/30 text-cyan-600 hover:border-cyan-400/50';
            } else if (isStart) {
              // Start point
              cellClass +=
                'bg-slate-900 border-emerald-500/40 text-emerald-500 hover:border-emerald-400/60';
            } else {
              // Standard grid tile
              cellClass +=
                'bg-slate-900/80 border-slate-800 text-slate-700 hover:border-cyan-500/40 hover:bg-slate-800/80';
            }

            return (
              <button
                key={key}
                type="button"
                onClick={() => onTileClick(pos)}
                className={cellClass}
                disabled={gamePhase !== 'playing'}
                aria-label={`Tile ${pos.x}, ${pos.y}${isStart ? ' Start' : ''}${isExit ? ' Exit' : ''}${isPlayer ? ' Player' : ''}`}
                data-testid={`tile-${pos.x}-${pos.y}`}
              >
                {/* Background path connection or sequence helper during memorize */}
                {showNeonBlue && (
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-300 via-sky-400 to-cyan-500 flex items-center justify-center">
                    <span className="text-[10px] font-black text-cyan-950 opacity-90 select-none">
                      {isStart ? 'START' : isExit ? 'EXIT' : '•'}
                    </span>
                  </div>
                )}

                {/* Exit Portal indicator */}
                {isExit && !showNeonBlue && (
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-ping" />
                    <span className="text-[9px] font-mono tracking-tighter text-amber-400/90 mt-0.5">
                      EXIT
                    </span>
                  </div>
                )}

                {/* Start indicator */}
                {isStart && !showNeonBlue && !isPlayer && (
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-500/80" />
                    <span className="text-[9px] font-mono tracking-tighter text-emerald-500/90 mt-0.5">
                      START
                    </span>
                  </div>
                )}

                {/* Player Avatar */}
                {isPlayer && (
                  <div className="relative flex items-center justify-center w-full h-full">
                    {/* Glowing outer aura */}
                    <div className="absolute inset-1 rounded-md bg-emerald-400/20 animate-pulse pointer-events-none" />
                    
                    {/* High-visibility green avatar */}
                    <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-400 border-2 border-emerald-200 flex items-center justify-center shadow-[0_0_15px_#10b981] text-emerald-950 font-black">
                      <div className="w-2.5 h-2.5 rounded-sm bg-slate-950 flex items-center justify-center">
                        <div className="w-1 h-1 rounded-full bg-emerald-300" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Visited breadcrumb dot */}
                {isVisited && !isPlayer && !showNeonBlue && !isStart && !isExit && (
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/50 shadow-[0_0_4px_#06b6d4]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
