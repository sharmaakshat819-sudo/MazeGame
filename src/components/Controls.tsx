import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface ControlsProps {
  onMove: (dx: number, dy: number) => void;
  disabled: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ onMove, disabled }) => {
  return (
    <div className="w-full max-w-xs mx-auto flex flex-col items-center mt-3 select-none">
      {/* Virtual D-pad for mobile & touch convenience */}
      <div className="relative w-36 h-36 flex flex-col items-center justify-center">
        {/* Up */}
        <button
          type="button"
          onClick={() => onMove(0, -1)}
          disabled={disabled}
          className="absolute top-0 w-11 h-11 rounded-xl bg-slate-900 border border-slate-700/80 active:bg-cyan-900 active:border-cyan-400 text-slate-200 active:text-cyan-300 flex items-center justify-center shadow-lg transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Move Up"
          data-testid="btn-move-up"
        >
          <ArrowUp className="w-5 h-5" />
        </button>

        {/* Middle row: Left, Center Core, Right */}
        <div className="flex items-center justify-between w-full px-1">
          <button
            type="button"
            onClick={() => onMove(-1, 0)}
            disabled={disabled}
            className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-700/80 active:bg-cyan-900 active:border-cyan-400 text-slate-200 active:text-cyan-300 flex items-center justify-center shadow-lg transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Move Left"
            data-testid="btn-move-left"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Decorative center pad core */}
          <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center pointer-events-none">
            <div className="w-2 h-2 rounded-full bg-cyan-500/40" />
          </div>

          <button
            type="button"
            onClick={() => onMove(1, 0)}
            disabled={disabled}
            className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-700/80 active:bg-cyan-900 active:border-cyan-400 text-slate-200 active:text-cyan-300 flex items-center justify-center shadow-lg transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Move Right"
            data-testid="btn-move-right"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Down */}
        <button
          type="button"
          onClick={() => onMove(0, 1)}
          disabled={disabled}
          className="absolute bottom-0 w-11 h-11 rounded-xl bg-slate-900 border border-slate-700/80 active:bg-cyan-900 active:border-cyan-400 text-slate-200 active:text-cyan-300 flex items-center justify-center shadow-lg transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Move Down"
          data-testid="btn-move-down"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      </div>

      {/* Keyboard Controls Hint */}
      <div className="mt-2 text-center text-[11px] font-mono text-slate-500 tracking-wide">
        <span className="text-slate-400 font-semibold">ARROWS / WASD</span> to move • Tap tiles directly
      </div>
    </div>
  );
};
