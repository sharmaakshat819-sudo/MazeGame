import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Position, GamePhase, LeaderboardEntry } from './game/types.ts';
import { LEVELS } from './game/levels.ts';
import {
  validateMove,
  DEFAULT_LEADERBOARD,
  insertLeaderboardRecord,
  isTopThreeScore,
  posEquals,
} from './game/logic.ts';
import { soundManager } from './game/audio.ts';
import { GameBoard } from './components/GameBoard.tsx';
import { HUD } from './components/HUD.tsx';
import { Controls } from './components/Controls.tsx';
import { TitleScreen } from './components/TitleScreen.tsx';
import { PauseModal } from './components/PauseModal.tsx';
import { LeaderboardModal } from './components/LeaderboardModal.tsx';
import { VictoryModal } from './components/VictoryModal.tsx';
import { CheckCircle2, Zap } from 'lucide-react';

const STORAGE_KEY = 'echo_maze_leaderboard_v1';
const MAX_ECHOES_PER_LEVEL = 2;

export default function App() {
  // Query param autostart check
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const autostart = searchParams.get('autostart') === '1';

  // Game Phases: 'title' | 'memorize' | 'playing' | 'glitch' | 'level_cleared' | 'victory' | 'paused'
  const [gamePhase, setGamePhase] = useState<GamePhase>(autostart ? 'memorize' : 'title');
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);

  // Player position and path progress
  const [playerPos, setPlayerPos] = useState<Position>({ x: 0, y: 0 });
  const [pathIndex, setPathIndex] = useState(0);

  // Score counters & stats
  const [totalMoves, setTotalMoves] = useState(0);
  const [levelMoves, setLevelMoves] = useState(0);
  const [glitchCount, setGlitchCount] = useState(0);
  const [elapsedTimeMs, setElapsedTimeMs] = useState(0);

  // Echo recall availability
  const [echoCount, setEchoCount] = useState(MAX_ECHOES_PER_LEVEL);
  const [echoTimeRemainingRatio, setEchoTimeRemainingRatio] = useState(1);

  // Glitch states
  const [isGlitching, setIsGlitching] = useState(false);
  const [glitchPos, setGlitchPos] = useState<Position | null>(null);

  // Modals
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasSubmittedRecord, setHasSubmittedRecord] = useState(false);

  // Leaderboard state from localStorage
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_LEADERBOARD;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, 3);
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_LEADERBOARD;
  });

  const currentLevel = LEVELS[currentLevelIdx] || LEVELS[0];

  // Timer reference
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);

  // Sync document.body.dataset.state for ultra-mode automation
  useEffect(() => {
    let state = 'title';
    if (gamePhase === 'title') {
      state = 'title';
    } else if (gamePhase === 'paused' || isPaused) {
      state = 'paused';
    } else if (gamePhase === 'victory') {
      state = 'gameover';
    } else {
      state = 'playing';
    }
    document.body.dataset.state = state;
  }, [gamePhase, isPaused]);

  // Start Level Memorize Flash (2 seconds)
  const startLevelMemorize = useCallback((levelIndex: number) => {
    const level = LEVELS[levelIndex];
    if (!level) return;

    setGamePhase('memorize');
    setPlayerPos(level.path[0]);
    setPathIndex(0);
    setLevelMoves(0);
    setEchoCount(MAX_ECHOES_PER_LEVEL);
    setIsGlitching(false);
    setGlitchPos(null);

    soundManager.playEchoFlash();

    const duration = level.echoDurationMs || 2000;
    const startTimestamp = performance.now();

    const updateEchoBar = () => {
      const now = performance.now();
      const elapsed = now - startTimestamp;
      const remainingRatio = 1 - Math.min(1, elapsed / duration);
      setEchoTimeRemainingRatio(remainingRatio);

      if (elapsed < duration) {
        requestAnimationFrame(updateEchoBar);
      } else {
        setGamePhase('playing');
        setEchoTimeRemainingRatio(0);
      }
    };

    requestAnimationFrame(updateEchoBar);
  }, []);

  // Start new run from Level 1
  const handleStartGame = useCallback(() => {
    soundManager.playClick();
    setCurrentLevelIdx(0);
    setTotalMoves(0);
    setLevelMoves(0);
    setGlitchCount(0);
    setElapsedTimeMs(0);
    accumulatedTimeRef.current = 0;
    startTimeRef.current = performance.now();
    setHasSubmittedRecord(false);
    setIsPaused(false);
    startLevelMemorize(0);
  }, [startLevelMemorize]);

  // If autostart query param is present on mount
  useEffect(() => {
    if (autostart) {
      handleStartGame();
    }
  }, [autostart, handleStartGame]);

  // Game clock loop: ticks when playing
  useEffect(() => {
    if (gamePhase === 'playing' || gamePhase === 'memorize' || gamePhase === 'glitch') {
      startTimeRef.current = performance.now();
      timerRef.current = window.setInterval(() => {
        const now = performance.now();
        const delta = now - startTimeRef.current;
        startTimeRef.current = now;
        accumulatedTimeRef.current += delta;
        setElapsedTimeMs(Math.floor(accumulatedTimeRef.current));
      }, 50);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gamePhase]);

  // Execute Step movement (Arrow keys, WASD, or virtual d-pad)
  const handleMove = useCallback(
    (dx: number, dy: number) => {
      if (gamePhase !== 'playing' || isGlitching) return;

      const nextPos: Position = {
        x: playerPos.x + dx,
        y: playerPos.y + dy,
      };

      const result = validateMove(
        currentLevel.path,
        pathIndex,
        nextPos,
        currentLevel.size
      );

      // Increment moves counter on any step attempt
      setTotalMoves((m) => m + 1);
      setLevelMoves((m) => m + 1);

      if (result.valid) {
        // Safe step!
        setPlayerPos(nextPos);
        setPathIndex(result.nextIndex);
        soundManager.playStep(result.nextIndex, currentLevel.path.length);

        // Did we reach the exit tile?
        if (result.isExit) {
          if (currentLevelIdx < LEVELS.length - 1) {
            // Level cleared! Advance to next level
            soundManager.playLevelClear();
            setGamePhase('level_cleared');
            setTimeout(() => {
              const nextLvl = currentLevelIdx + 1;
              setCurrentLevelIdx(nextLvl);
              startLevelMemorize(nextLvl);
            }, 1000);
          } else {
            // All 5 levels completed! VICTORY!
            soundManager.playVictory();
            setGamePhase('victory');
          }
        }
      } else {
        // Moved off the safe path! Trigger Glitch & Reset!
        soundManager.playGlitch();
        setIsGlitching(true);
        setGlitchPos(nextPos);
        setGlitchCount((c) => c + 1);

        // After glitch effect, reset player position back to level start
        setTimeout(() => {
          setIsGlitching(false);
          setGlitchPos(null);
          setPlayerPos(currentLevel.path[0]);
          setPathIndex(0);
        }, 400);
      }
    },
    [gamePhase, isGlitching, playerPos, currentLevel, pathIndex, currentLevelIdx, startLevelMemorize]
  );

  // Click on tile to move
  const handleTileClick = useCallback(
    (targetPos: Position) => {
      if (gamePhase !== 'playing' || isGlitching) return;
      const dx = targetPos.x - playerPos.x;
      const dy = targetPos.y - playerPos.y;
      if (Math.abs(dx) + Math.abs(dy) === 1) {
        handleMove(dx, dy);
      }
    },
    [gamePhase, isGlitching, playerPos, handleMove]
  );

  // Recall Echo action (flashes the path for 1.2s during gameplay)
  const handleRecallEcho = useCallback(() => {
    if (gamePhase !== 'playing' || echoCount <= 0 || isGlitching) return;

    setEchoCount((c) => c - 1);
    setGamePhase('memorize');
    soundManager.playEchoFlash();

    const duration = 1200;
    const startTimestamp = performance.now();

    const updateEchoBar = () => {
      const now = performance.now();
      const elapsed = now - startTimestamp;
      const remainingRatio = 1 - Math.min(1, elapsed / duration);
      setEchoTimeRemainingRatio(remainingRatio);

      if (elapsed < duration) {
        requestAnimationFrame(updateEchoBar);
      } else {
        setGamePhase('playing');
        setEchoTimeRemainingRatio(0);
      }
    };

    requestAnimationFrame(updateEchoBar);
  }, [gamePhase, echoCount, isGlitching]);

  // Restart current level
  const handleResetLevel = useCallback(() => {
    soundManager.playClick();
    setIsPaused(false);
    startLevelMemorize(currentLevelIdx);
  }, [currentLevelIdx, startLevelMemorize]);

  // Pause / Resume
  const handleTogglePause = useCallback(() => {
    if (gamePhase === 'title' || gamePhase === 'victory') return;
    soundManager.playClick();
    setIsPaused((prev) => {
      const next = !prev;
      setGamePhase(next ? 'paused' : 'playing');
      return next;
    });
  }, [gamePhase]);

  // Sound mute toggle
  const handleToggleMute = useCallback(() => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    soundManager.setMuted(nextMute);
  }, [isMuted]);

  // Save new leaderboard record
  const handleSaveRecord = useCallback(
    (playerName: string) => {
      const newEntry: LeaderboardEntry = {
        id: `run-${Date.now()}`,
        name: playerName,
        timeMs: elapsedTimeMs,
        moves: totalMoves,
        date: new Date().toISOString().split('T')[0],
      };

      const updated = insertLeaderboardRecord(leaderboard, newEntry);
      setLeaderboard(updated);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // fallback
      }
      setHasSubmittedRecord(true);
      soundManager.playClick();
    },
    [elapsedTimeMs, totalMoves, leaderboard]
  );

  // Reset leaderboard to defaults
  const handleResetLeaderboard = useCallback(() => {
    soundManager.playClick();
    setLeaderboard(DEFAULT_LEADERBOARD);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_LEADERBOARD));
    } catch {
      // fallback
    }
  }, []);

  // Keyboard Event Listeners on window
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for game keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      // Title screen start triggers
      if (gamePhase === 'title') {
        if (e.key === ' ' || e.key === 'Enter') {
          handleStartGame();
        }
        return;
      }

      // Pause toggle
      if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
        handleTogglePause();
        return;
      }

      // Mute toggle
      if (e.key.toLowerCase() === 'm') {
        handleToggleMute();
        return;
      }

      // Reset level
      if (e.key.toLowerCase() === 'r') {
        handleResetLevel();
        return;
      }

      // Movement keys
      if (gamePhase === 'playing' && !isGlitching) {
        if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
          handleMove(0, -1);
        } else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
          handleMove(0, 1);
        } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
          handleMove(-1, 0);
        } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
          handleMove(1, 0);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    gamePhase,
    isGlitching,
    handleStartGame,
    handleTogglePause,
    handleToggleMute,
    handleResetLevel,
    handleMove,
  ]);

  const qualifiesForTopThree = isTopThreeScore(leaderboard, elapsedTimeMs);

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-3 sm:p-5 cyber-grid-bg overflow-x-hidden">
      {/* Title Screen State */}
      {gamePhase === 'title' ? (
        <TitleScreen
          onStartGame={handleStartGame}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          topLeaderboard={leaderboard}
        />
      ) : (
        /* Active Game Simulation */
        <main className="flex flex-col items-center justify-between min-h-[calc(100vh-2.5rem)] w-full max-w-xl mx-auto">
          {/* Top HUD */}
          <HUD
            levelNumber={currentLevel.level}
            totalLevels={LEVELS.length}
            levelName={currentLevel.name}
            totalMoves={totalMoves}
            levelMoves={levelMoves}
            glitchCount={glitchCount}
            elapsedTimeMs={elapsedTimeMs}
            echoCount={echoCount}
            maxEchoes={MAX_ECHOES_PER_LEVEL}
            isMuted={isMuted}
            canRecallEcho={gamePhase === 'playing' && echoCount > 0 && !isGlitching}
            onToggleMute={handleToggleMute}
            onPause={handleTogglePause}
            onResetLevel={handleResetLevel}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            onRecallEcho={handleRecallEcho}
          />

          {/* Level Transition Overlay */}
          {gamePhase === 'level_cleared' && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none animate-fade-in">
              <div className="p-5 rounded-2xl bg-cyan-950/90 border-2 border-cyan-400 text-center font-mono shadow-[0_0_35px_rgba(6,182,212,0.6)]">
                <CheckCircle2 className="w-10 h-10 text-cyan-300 mx-auto mb-2 animate-bounce" />
                <h3 className="text-xl font-black text-cyan-200 tracking-wider">
                  GRID STAGE {currentLevel.level} SYNCHRONIZED!
                </h3>
                <p className="text-xs text-cyan-400/80 mt-1">
                  PREPARING NEXT NEURAL LATTICE...
                </p>
              </div>
            </div>
          )}

          {/* Interactive Game Board */}
          <div className="my-auto w-full flex items-center justify-center py-2">
            <GameBoard
              level={currentLevel}
              playerPos={playerPos}
              pathIndex={pathIndex}
              gamePhase={gamePhase}
              isGlitching={isGlitching}
              glitchPos={glitchPos}
              echoTimeRemainingRatio={echoTimeRemainingRatio}
              onTileClick={handleTileClick}
            />
          </div>

          {/* Directional D-pad and Keyboard Instructions */}
          <Controls
            onMove={handleMove}
            disabled={gamePhase !== 'playing' || isGlitching}
          />
        </main>
      )}

      {/* Modals */}
      <PauseModal
        isOpen={isPaused || gamePhase === 'paused'}
        onResume={() => {
          setIsPaused(false);
          setGamePhase('playing');
        }}
        onRestartLevel={handleResetLevel}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onReturnToTitle={() => {
          setIsPaused(false);
          setGamePhase('title');
        }}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        records={leaderboard}
        onClose={() => setIsLeaderboardOpen(false)}
        onResetLeaderboard={handleResetLeaderboard}
      />

      <VictoryModal
        isOpen={gamePhase === 'victory'}
        totalTimeMs={elapsedTimeMs}
        totalMoves={totalMoves}
        glitchCount={glitchCount}
        isTopThree={qualifiesForTopThree}
        hasSubmittedRecord={hasSubmittedRecord}
        onSaveRecord={handleSaveRecord}
        onPlayAgain={handleStartGame}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
      />
    </div>
  );
}
