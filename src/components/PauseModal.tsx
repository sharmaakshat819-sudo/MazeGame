import React from 'react';
import { Play, RotateCcw, Trophy, Home } from 'lucide-react';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestartLevel: () => void;
  onOpenLeaderboard: () => void;
  onReturnToTitle: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onRestartLevel,
  onOpenLeaderboard,
  onReturnToTitle,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-title"
    >
      <div className="relative w-full max-w-sm bg-slate-950 border border-slate-700/80 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 font-mono text-center">
        <h2 id="pause-title" className="text-xl font-black tracking-widest text-slate-100 uppercase">
          SIMULATION PAUSED
        </h2>
        <p className="text-xs text-slate-400">
          Neural link on standby. Ready to re-engage?
        </p>

        <div className="flex flex-col gap-2 mt-2">
          <button
            type="button"
            onClick={onResume}
            className="py-3 px-4 rounded-xl bg-cyan-400 text-slate-950 font-black text-xs tracking-wider uppercase hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
          >
            <Play className="w-4 h-4 fill-current" />
            RESUME RUN [ESC / P]
          </button>

          <button
            type="button"
            onClick={onRestartLevel}
            className="py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-cyan-500/60 text-slate-200 text-xs font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            RESTART LEVEL [R]
          </button>

          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-amber-400 text-amber-300 text-xs font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-2"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            LEADERBOARD
          </button>

          <button
            type="button"
            onClick={onReturnToTitle}
            className="py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-red-400 text-red-300 text-xs font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            TITLE MENU
          </button>
        </div>
      </div>
    </div>
  );
};
