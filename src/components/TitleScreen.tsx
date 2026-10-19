import React from 'react';
import type { LeaderboardEntry } from '../game/types.ts';
import { formatTimeDetailed } from '../game/logic.ts';
import { Play, Trophy, Zap, ShieldAlert, Footprints, Sparkles } from 'lucide-react';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenLeaderboard: () => void;
  topLeaderboard: LeaderboardEntry[];
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenLeaderboard,
  topLeaderboard,
}) => {
  return (
    <div className="flex flex-col items-center justify-between min-h-screen w-full max-w-xl mx-auto px-4 py-8 select-none font-mono">
      {/* Top Banner Status */}
      <div className="flex items-center gap-2 text-xs text-cyan-400/80 tracking-widest font-semibold border border-cyan-500/20 px-3 py-1 rounded-full bg-slate-950/60 backdrop-blur">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        NEURAL GRID PROTOCOL // V2.6
      </div>

      {/* Hero Showcase Centerpiece */}
      <div className="flex flex-col items-center text-center my-auto py-6">
        {/* Animated Cyber Logo Emblem */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-2xl bg-slate-950 border-2 border-cyan-400/70 flex items-center justify-center shadow-[0_0_35px_rgba(6,182,212,0.5)] transform rotate-45 transition-transform hover:rotate-90 duration-500">
            {/* Inner neon grid diamond */}
            <div className="w-14 h-14 border border-cyan-300/40 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 rounded bg-emerald-400 shadow-[0_0_15px_#10b981] animate-pulse" />
            </div>
          </div>
          {/* Subtle orbiting sparkles */}
          <div className="absolute -top-2 -right-2 text-cyan-300 animate-bounce">
            <Zap className="w-5 h-5 fill-current" />
          </div>
        </div>

        {/* Title Lockup */}
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]">
          ECHO MAZE
        </h1>
        <p className="text-xs sm:text-sm text-cyan-300/80 tracking-wider mt-2 max-w-md">
          A bright neon path flashes for <span className="text-cyan-200 font-bold">2 seconds</span>.
          <br />Memorize the sequence. Move the green avatar. Do not stray.
        </p>

        {/* 3 Quick Game Pillars */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-sm mt-6 text-left">
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-1">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] text-slate-400 font-bold uppercase">1. FLASH</span>
            <span className="text-[10px] text-slate-300 leading-tight">Neon path pulses briefly</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-1">
            <Footprints className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] text-slate-400 font-bold uppercase">2. TRACE</span>
            <span className="text-[10px] text-slate-300 leading-tight">Step avatar with arrow keys</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-1">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span className="text-[10px] text-slate-400 font-bold uppercase">3. GLITCH</span>
            <span className="text-[10px] text-slate-300 leading-tight">Off-path moves reset you</span>
          </div>
        </div>

        {/* Main Start Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs mt-8">
          <button
            type="button"
            data-start="true"
            onClick={onStartGame}
            className="flex-1 py-3.5 px-6 rounded-xl bg-cyan-400 text-slate-950 font-black text-sm tracking-widest uppercase hover:bg-cyan-300 transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.7)] active:scale-95 cursor-pointer"
            aria-label="Start Game"
          >
            <Play className="w-4 h-4 fill-current" />
            START RUN
          </button>

          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="py-3.5 px-4 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-amber-400 text-amber-300 font-bold text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            aria-label="View Leaderboard"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            TOP 3
          </button>
        </div>

        {/* Top Record Snippet */}
        {topLeaderboard.length > 0 && (
          <div className="mt-5 text-[11px] text-slate-400 flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-amber-400 font-bold">#1 RECORD:</span>
            <span className="text-slate-200">{topLeaderboard[0].name}</span>
            <span className="text-amber-300 font-black tabular-nums">
              {formatTimeDetailed(topLeaderboard[0].timeMs)}
            </span>
            <span className="text-cyan-400">({topLeaderboard[0].moves} moves)</span>
          </div>
        )}
      </div>

      {/* Non-interactive control hints at bottom */}
      <footer className="text-center text-[11px] text-slate-500 tracking-wider">
        [ARROW KEYS / WASD] Move • [SPACE / ENTER] Start • [P] Pause • [M] Mute
      </footer>
    </div>
  );
};
