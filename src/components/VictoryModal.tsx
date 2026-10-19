import React, { useState } from 'react';
import { formatTimeDetailed } from '../game/logic.ts';
import { Trophy, Clock, Footprints, ShieldAlert, Award, Play, Check } from 'lucide-react';

interface VictoryModalProps {
  isOpen: boolean;
  totalTimeMs: number;
  totalMoves: number;
  glitchCount: number;
  isTopThree: boolean;
  hasSubmittedRecord: boolean;
  onSaveRecord: (name: string) => void;
  onPlayAgain: () => void;
  onOpenLeaderboard: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  totalTimeMs,
  totalMoves,
  glitchCount,
  isTopThree,
  hasSubmittedRecord,
  onSaveRecord,
  onPlayAgain,
  onOpenLeaderboard,
}) => {
  if (!isOpen) return null;

  const [callsign, setCallsign] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = callsign.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (!trimmed) {
      setErrorMsg('Enter a valid callsign (letters, numbers, dash)');
      return;
    }
    setErrorMsg('');
    onSaveRecord(trimmed.slice(0, 12));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="victory-title"
    >
      <div className="relative w-full max-w-md bg-slate-950 border-2 border-emerald-500/80 rounded-2xl p-6 shadow-[0_0_50px_rgba(16,185,129,0.35)] flex flex-col gap-5 font-mono text-center">
        {/* Victory Emblem */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border-2 border-emerald-400 flex items-center justify-center mb-2 shadow-[0_0_20px_#10b981]">
            <Trophy className="w-8 h-8 text-emerald-300 animate-bounce" />
          </div>
          <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">
            ALL 5 LEVELS BREACHED
          </span>
          <h2 id="victory-title" className="text-2xl font-black tracking-wider text-slate-100 uppercase mt-0.5">
            ECHO MAZE CONQUERED
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            You successfully synchronized through all neural grid barriers.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 bg-slate-900/80 border border-slate-800 rounded-xl p-3">
          <div className="flex flex-col items-center">
            <Clock className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-[10px] text-slate-400 font-semibold uppercase">TOTAL TIME</span>
            <span className="text-sm font-black text-amber-300 tabular-nums">
              {formatTimeDetailed(totalTimeMs)}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <Footprints className="w-4 h-4 text-cyan-400 mb-1" />
            <span className="text-[10px] text-slate-400 font-semibold uppercase">TOTAL MOVES</span>
            <span className="text-sm font-black text-cyan-300 tabular-nums">
              {totalMoves}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <ShieldAlert className="w-4 h-4 text-red-400 mb-1" />
            <span className="text-[10px] text-slate-400 font-semibold uppercase">GLITCHES</span>
            <span className="text-sm font-black text-slate-200 tabular-nums">
              {glitchCount}
            </span>
          </div>
        </div>

        {/* Top 3 Qualification Input */}
        {isTopThree && !hasSubmittedRecord && (
          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/50 flex flex-col gap-2">
            <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-bold tracking-wider uppercase">
              <Award className="w-4 h-4" />
              TOP 3 FASTEST TIME QUALIFIED!
            </div>
            <p className="text-[11px] text-slate-300">
              Submit your call-sign to immortalize your speedrun record:
            </p>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={callsign}
                onChange={(e) => setCallsign(e.target.value.toUpperCase())}
                placeholder="CALLSIGN (e.g. CYBER_ACE)"
                maxLength={12}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-amber-500/50 text-amber-300 text-xs font-bold tracking-wider placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs tracking-wider uppercase hover:bg-amber-400 transition-colors flex items-center gap-1 shadow-[0_0_10px_#f59e0b]"
              >
                <Check className="w-4 h-4" />
                SAVE
              </button>
            </form>
            {errorMsg && <span className="text-[10px] text-red-400">{errorMsg}</span>}
          </div>
        )}

        {hasSubmittedRecord && (
          <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            Record stored in Top 3 Leaderboard!
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
          <button
            type="button"
            data-start="true"
            onClick={onPlayAgain}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 text-slate-950 font-black text-sm tracking-widest uppercase hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_#10b981]"
          >
            <Play className="w-4 h-4 fill-current" />
            PLAY AGAIN
          </button>

          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-amber-300 font-bold text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5"
          >
            <Trophy className="w-4 h-4" />
            LEADERBOARD
          </button>
        </div>
      </div>
    </div>
  );
};
