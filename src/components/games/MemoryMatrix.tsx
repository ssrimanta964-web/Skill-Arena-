import React, { useState, useEffect, useRef, useCallback } from 'react';
import { soundManager } from '../../utils/audio';
import { Grid3X3, Heart, RotateCcw, Sparkles, Check, X } from 'lucide-react';

interface Props {
  onFinish: (result: { score: number; metricValue: number; metricLabel: string; accuracy?: number }) => void;
  isDaily?: boolean;
}

type StageConfig = {
  gridSize: number;
  tileCount: number;
};

const STAGES: StageConfig[] = [
  { gridSize: 3, tileCount: 3 },
  { gridSize: 3, tileCount: 4 },
  { gridSize: 4, tileCount: 4 },
  { gridSize: 4, tileCount: 5 },
  { gridSize: 4, tileCount: 6 },
  { gridSize: 5, tileCount: 6 },
  { gridSize: 5, tileCount: 7 },
  { gridSize: 5, tileCount: 8 },
  { gridSize: 6, tileCount: 9 },
  { gridSize: 6, tileCount: 11 },
  { gridSize: 6, tileCount: 13 },
];

export default function MemoryMatrix({ onFinish }: Props) {
  const [stage, setStage] = useState(1);
  const [lives, setLives] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMemorizing, setIsMemorizing] = useState(false);
  const [targetTiles, setTargetTiles] = useState<number[]>([]);
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [wrongTiles, setWrongTiles] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const timerRef = useRef<number | null>(null);

  const currentConfig = STAGES[Math.min(stage - 1, STAGES.length - 1)];
  const totalCells = currentConfig.gridSize * currentConfig.gridSize;

  const startStage = useCallback((stageNum: number) => {
    const config = STAGES[Math.min(stageNum - 1, STAGES.length - 1)];
    const total = config.gridSize * config.gridSize;

    const indices: number[] = [];
    while (indices.length < config.tileCount) {
      const rand = Math.floor(Math.random() * total);
      if (!indices.includes(rand)) {
        indices.push(rand);
      }
    }

    setTargetTiles(indices);
    setSelectedTiles([]);
    setWrongTiles([]);
    setIsMemorizing(true);
    soundManager.playCountdown(false);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setIsMemorizing(false);
      soundManager.playClick(600);
    }, 1300);
  }, []);

  const startGame = () => {
    setIsPlaying(true);
    setStage(1);
    setLives(3);
    setScore(0);
    setStreak(0);
    startStage(1);
  };

  const handleCellClick = (index: number) => {
    if (!isPlaying || isMemorizing) return;
    if (selectedTiles.includes(index) || wrongTiles.includes(index)) return;

    if (targetTiles.includes(index)) {
      const updated = [...selectedTiles, index];
      setSelectedTiles(updated);
      setStreak((s) => s + 1);
      soundManager.playSuccess();
      soundManager.vibrate(20);
      setScore((s) => s + 100 * stage);

      if (updated.length === targetTiles.length) {
        soundManager.playLevelUp();
        setTimeout(() => {
          setStage((st) => {
            const next = st + 1;
            startStage(next);
            return next;
          });
        }, 600);
      }
    } else {
      setWrongTiles((prev) => [...prev, index]);
      setStreak(0);
      soundManager.playFail();
      soundManager.vibrate(80);

      const nextLives = lives - 1;
      setLives(nextLives);

      if (nextLives <= 0) {
        setIsPlaying(false);
        const finalScore = score;
        onFinish({
          score: finalScore,
          metricValue: stage,
          metricLabel: 'lvl',
          accuracy: Math.min(100, Math.round((selectedTiles.length / (selectedTiles.length + 3)) * 100)),
        });
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center select-none">
      {/* Sci-Fi HUD Header */}
      <div className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl mb-4 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Grid3X3 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">MATRIX STAGE</div>
            <div className="text-sm font-black text-white font-mono flex items-center gap-1.5">
              <span>SECTOR {stage}</span>
              <span className="text-slate-600">·</span>
              <span className="text-cyan-400">{currentConfig.gridSize}×{currentConfig.gridSize}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 transition-all ${
                  i < lives ? 'text-rose-500 fill-rose-500 drop-shadow-md' : 'text-slate-800 scale-90'
                }`}
              />
            ))}
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">SCORE</div>
            <div className="text-sm font-black font-mono text-cyan-400">{score}</div>
          </div>
        </div>
      </div>

      {/* Main Grid Matrix Card */}
      <div className="w-full aspect-square max-w-md bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-slate-800/90 rounded-3xl p-6 flex flex-col items-center justify-center relative shadow-2xl overflow-hidden">
        {/* Subtle holographic background lines */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Scan line sweep during memorizing */}
        {isPlaying && isMemorizing && (
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400/80 animate-bounce pointer-events-none z-20" />
        )}

        {!isPlaying ? (
          <div className="flex flex-col items-center gap-5 text-center p-4 z-10 animate-fade-in">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-xl shadow-cyan-500/25">
                <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-cyan-400">
                  <Grid3X3 className="w-10 h-10" />
                </div>
              </div>
              <div className="absolute -inset-2 bg-cyan-500/20 rounded-full blur-xl -z-10 animate-pulse-glow" />
            </div>

            <div>
              <h3 className="text-3xl font-black text-white tracking-tight">MEMORY MATRIX</h3>
              <p className="text-slate-400 text-sm mt-1 max-w-xs leading-relaxed">
                Observe the neon cells illuminate. Reconstruct the spatial configuration without error!
              </p>
            </div>
            <button
              onClick={startGame}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/30 tracking-wider uppercase transition cursor-pointer flex items-center gap-2"
            >
              {lives <= 0 ? <RotateCcw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              <span>{lives <= 0 ? 'RETRY MATRIX' : 'INITIALIZE MATRIX'}</span>
            </button>
          </div>
        ) : (
          <div
            className="w-full h-full grid gap-2.5 z-10 transition-all duration-300"
            style={{
              gridTemplateColumns: `repeat(${currentConfig.gridSize}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${currentConfig.gridSize}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: totalCells }).map((_, index) => {
              const isTarget = targetTiles.includes(index);
              const isSelected = selectedTiles.includes(index);
              const isWrong = wrongTiles.includes(index);

              let cellStyle =
                'bg-slate-900/90 border border-slate-700/60 hover:border-cyan-500/50 hover:bg-slate-800/80 shadow-inner';

              if (isMemorizing && isTarget) {
                cellStyle =
                  'bg-cyan-400 border-2 border-white neon-glow-cyan scale-[0.98]';
              } else if (isSelected) {
                cellStyle =
                  'bg-gradient-to-br from-cyan-500 to-blue-600 border-2 border-cyan-300 shadow-lg shadow-cyan-500/50 text-white';
              } else if (isWrong) {
                cellStyle =
                  'bg-rose-600 border-2 border-rose-300 shadow-lg shadow-rose-600/50 animate-shake';
              }

              return (
                <button
                  key={index}
                  onClick={() => handleCellClick(index)}
                  disabled={isMemorizing}
                  className={`rounded-2xl transition-all duration-150 flex items-center justify-center cursor-pointer active:scale-95 ${cellStyle}`}
                >
                  {isSelected && <Check className="w-5 h-5 stroke-[3] animate-scale-in" />}
                  {isWrong && <X className="w-5 h-5 stroke-[3] text-white" />}
                </button>
              );
            })}
          </div>
        )}

        {isPlaying && isMemorizing && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-cyan-950/90 border border-cyan-400/60 text-cyan-300 text-xs font-black uppercase tracking-widest backdrop-blur-md animate-pulse shadow-lg shadow-cyan-500/30 z-30">
            ENCODING NEURAL PATTERN
          </div>
        )}
      </div>

      <div className="w-full mt-3 text-center text-xs text-slate-400">
        Recall {currentConfig.tileCount} target coordinates · {lives} Life Nodes remaining
      </div>
    </div>
  );
}
