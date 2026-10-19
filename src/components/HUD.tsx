import React from 'react';
import { formatTime } from '../game/logic.ts';
import { Volume2, VolumeX, Pause, RotateCcw, Trophy, Eye, Zap } from 'lucide-react';

interface HUDProps {
  levelNumber: number;
  totalLevels: number;
  levelName: string;
  totalMoves: number;
  levelMoves: number;
  glitchCount: number;
  elapsedTimeMs: number;
  echoCount: number;
  maxEchoes: number;
  isMuted: boolean;
  canRecallEcho: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onResetLevel: () => void;
  onOpenLeaderboard: () => void;
  onRecallEcho: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  levelNumber,
  totalLevels,
  levelName,
  totalMoves,
  levelMoves,
  glitchCount,
  elapsedTimeMs,
  echoCount,
  maxEchoes,
  isMuted,
  canRecallEcho,
  onToggleMute,
  onPause,
  onResetLevel,
  onOpenLeaderboard,
  onRecallEcho,
}) => {
  return (
    <header className="w-full max-w-xl mx-auto flex flex-col gap-2.5 mb-2 select-none">
      {/* Top Bar: Level title + Quick utility controls */}
      <div className="flex items-center justify-between px-2 pt-1">
        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-mono text-xs font-bold tracking-widest flex items-center gap-1 shadow-[0_0_8px_rgba(6,182,212,0.4)]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block mr-0.5" />
            LVL {levelNumber.toString().padStart(2, '0')}/{totalLevels.toString().padStart(2, '0')}
          </div>
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase hidden sm:inline">
            {levelName}
          </span>
        </div>

        {/* Right utility buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-amber-400 hover:border-amber-400 hover:bg-slate-800 transition-colors"
            title="View Leaderboard [L]"
            aria-label="View Leaderboard"
          >
            <Trophy className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-300 hover:border-cyan-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
            title="Toggle Sound [M]"
            aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onResetLevel}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-300 hover:border-cyan-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
            title="Reset Level [R]"
            aria-label="Reset Level"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onPause}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-300 hover:border-cyan-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
            title="Pause Game [Esc / P]"
            aria-label="Pause Game"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main HUD Stats Grid */}
      <div className="grid grid-cols-4 gap-2 bg-slate-950/70 border border-cyan-900/60 rounded-xl p-2.5 backdrop-blur shadow-lg font-mono">
        {/* Moves Counter (HERO STAT) */}
        <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] tracking-wider text-slate-400 uppercase font-semibold">
            MOVES
          </span>
          <span className="text-xl sm:text-2xl font-black text-cyan-300 tabular-nums leading-none mt-0.5">
            {totalMoves}
          </span>
          <span className="text-[9px] text-slate-500 mt-0.5">
            lvl: {levelMoves}
          </span>
        </div>

        {/* Timer */}
        <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] tracking-wider text-slate-400 uppercase font-semibold">
            TIME
          </span>
          <span className="text-xl sm:text-2xl font-black text-amber-300 tabular-nums leading-none mt-0.5">
            {formatTime(elapsedTimeMs)}
          </span>
          <span className="text-[9px] text-slate-500 mt-0.5">
            race clock
          </span>
        </div>

        {/* Glitches / Fails */}
        <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] tracking-wider text-slate-400 uppercase font-semibold">
            GLITCHES
          </span>
          <span className={`text-xl sm:text-2xl font-black tabular-nums leading-none mt-0.5 ${glitchCount > 0 ? 'text-red-400' : 'text-slate-400'}`}>
            {glitchCount}
          </span>
          <span className="text-[9px] text-slate-500 mt-0.5">
            strayed
          </span>
        </div>

        {/* Recall Echo Action */}
        <button
          type="button"
          onClick={onRecallEcho}
          disabled={!canRecallEcho}
          className={`flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all ${
            canRecallEcho
              ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300 hover:bg-cyan-900/60 hover:border-cyan-400 cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.3)]'
              : 'bg-slate-900/40 border-slate-800/80 text-slate-600 cursor-not-allowed opacity-60'
          }`}
          title="Recall Neon Echo (Re-flash the path)"
          aria-label="Recall Neon Echo"
        >
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span className="text-[10px] tracking-wider font-semibold uppercase">
              ECHO
            </span>
          </div>
          <span className="text-base sm:text-lg font-black leading-none mt-0.5 text-cyan-400">
            {echoCount}/{maxEchoes}
          </span>
          <span className="text-[9px] text-cyan-600 mt-0.5">
            re-flash
          </span>
        </button>
      </div>
    </header>
  );
};
