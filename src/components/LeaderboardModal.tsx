import React from 'react';
import type { LeaderboardEntry } from '../game/types.ts';
import { formatTimeDetailed } from '../game/logic.ts';
import { Trophy, Medal, X, RotateCcw, Clock, Footprints } from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  records: LeaderboardEntry[];
  onClose: () => void;
  onResetLeaderboard: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  records,
  onClose,
  onResetLeaderboard,
}) => {
  if (!isOpen) return null;

  const rankBadges = [
    { label: '1ST', color: 'text-amber-400 border-amber-500/60 bg-amber-950/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]', icon: '👑' },
    { label: '2ND', color: 'text-slate-300 border-slate-400/60 bg-slate-900/60', icon: '🥈' },
    { label: '3RD', color: 'text-amber-600 border-amber-700/60 bg-amber-950/20', icon: '🥉' },
  ];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="leaderboard-title"
    >
      <div className="relative w-full max-w-md bg-slate-950 border border-cyan-500/50 rounded-2xl p-5 shadow-[0_0_40px_rgba(6,182,212,0.25)] flex flex-col gap-4 font-mono">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 id="leaderboard-title" className="text-base font-bold tracking-wider text-slate-100 uppercase">
              Hall of Fast Runners
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 transition-colors"
            aria-label="Close Leaderboard"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Subhead info */}
        <p className="text-xs text-slate-400">
          Top 3 fastest all-level completion times recorded in the Echo Matrix.
        </p>

        {/* Records list */}
        <div className="flex flex-col gap-2.5 my-1">
          {records.slice(0, 3).map((record, index) => {
            const badge = rankBadges[index] || rankBadges[2];
            return (
              <div
                key={record.id}
                className={`flex items-center justify-between p-3 rounded-xl border ${badge.color} transition-all`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm bg-black/40 border border-inherit">
                    <span>{badge.icon}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm tracking-wide text-slate-100">
                      {record.name}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {record.date}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 text-sm font-black text-amber-300 tabular-nums">
                    <Clock className="w-3.5 h-3.5 text-amber-400/80" />
                    <span>{formatTimeDetailed(record.timeMs)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-cyan-400 tabular-nums">
                    <Footprints className="w-3 h-3 text-cyan-500" />
                    <span>{record.moves} moves</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={onResetLeaderboard}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restore Defaults
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-950 border border-cyan-500/60 text-cyan-300 hover:bg-cyan-900 text-xs font-bold tracking-wider uppercase transition-colors shadow-[0_0_10px_rgba(6,182,212,0.3)]"
          >
            Return to Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
