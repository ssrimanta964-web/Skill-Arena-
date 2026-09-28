import React, { useState, useEffect, useRef } from 'react';
import { soundManager } from '../../utils/audio';
import { ListOrdered, RotateCcw, Timer, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';

interface Props {
  onFinish: (result: { score: number; metricValue: number; metricLabel: string; accuracy?: number }) => void;
  isDaily?: boolean;
}

export default function NumberBlitz({ onFinish }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [nextNumber, setNextNumber] = useState(1);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [clearedNumbers, setClearedNumbers] = useState<number[]>([]);
  const [wrongNumber, setWrongNumber] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [penalties, setPenalties] = useState(0);
  const [penaltyFlash, setPenaltyFlash] = useState(false);

  const startTimeRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  const shuffleNumbers = () => {
    const arr = Array.from({ length: 24 }, (_, i) => i + 1);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const startGame = () => {
    const shuffled = shuffleNumbers();
    setNumbers(shuffled);
    setClearedNumbers([]);
    setNextNumber(1);
    setPenalties(0);
    setWrongNumber(null);
    setElapsedMs(0);
    setIsPlaying(true);

    soundManager.playCountdown(true);
    startTimeRef.current = performance.now();
  };

  const handleNumberClick = (num: number) => {
    if (!isPlaying) return;

    if (num === nextNumber) {
      soundManager.playClick(500 + num * 32);
      soundManager.vibrate(20);
      setClearedNumbers((prev) => [...prev, num]);

      if (num === 24) {
        const totalElapsedSec = parseFloat(((elapsedMs + penalties * 1000) / 1000).toFixed(2));
        setIsPlaying(false);
        soundManager.playLevelUp();

        const score = Math.max(50, Math.round(3000 - totalElapsedSec * 90));
        const accuracy = Math.round((24 / (24 + penalties)) * 100);

        onFinish({
          score,
          metricValue: totalElapsedSec,
          metricLabel: 'sec',
          accuracy,
        });
      } else {
        setNextNumber((prev) => prev + 1);
      }
    } else {
      soundManager.playFail();
      soundManager.vibrate(80);
      setWrongNumber(num);
      setPenalties((p) => p + 1);
      setPenaltyFlash(true);
      setTimeout(() => setWrongNumber(null), 350);
      setTimeout(() => setPenaltyFlash(false), 800);
    }
  };

  useEffect(() => {
    if (!isPlaying) return;

    const tick = () => {
      setElapsedMs(performance.now() - startTimeRef.current);
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  const currentSeconds = ((elapsedMs + penalties * 1000) / 1000).toFixed(2);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center select-none">
      {/* Sci-Fi HUD Header */}
      <div className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl mb-4 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <ListOrdered className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">CURRENT TARGET</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-mono font-black text-violet-400">
                {isPlaying ? nextNumber : '--'}
              </span>
              {isPlaying && nextNumber < 24 && (
                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                  <ArrowRight className="w-3 h-3" />
                  <span>{nextNumber + 1}</span>
                  {nextNumber + 2 <= 24 && <span>, {nextNumber + 2}</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {penaltyFlash && (
            <div className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-bounce font-bold">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>+1.0s PENALTY</span>
            </div>
          )}
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">SCAN CHRONO</div>
            <div className="text-xl font-mono font-black text-white flex items-center gap-1">
              <Timer className="w-4 h-4 text-violet-400" />
              <span>{currentSeconds}s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Number Grid */}
      <div className="w-full aspect-[4/3] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-slate-800/90 rounded-3xl p-5 flex flex-col items-center justify-center relative shadow-2xl overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:16px_16px]" />

        {!isPlaying ? (
          <div className="flex flex-col items-center gap-5 text-center p-4 z-10 animate-fade-in">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-violet-500 to-purple-600 p-0.5 shadow-xl shadow-violet-500/25">
                <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-violet-400">
                  <ListOrdered className="w-10 h-10" />
                </div>
              </div>
              <div className="absolute -inset-2 bg-violet-500/20 rounded-full blur-xl -z-10 animate-pulse-glow" />
            </div>

            <div>
              <h3 className="text-3xl font-black text-white tracking-tight">NUMBER BLITZ</h3>
              <p className="text-slate-400 text-sm mt-1 max-w-xs leading-relaxed">
                Scan and tap numbers in ascending order from 1 to 24. Clean scan speed without misclicks!
              </p>
            </div>
            <button
              onClick={startGame}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:brightness-110 text-white font-black text-sm shadow-xl shadow-violet-500/30 tracking-wider uppercase transition flex items-center gap-2 cursor-pointer"
            >
              {clearedNumbers.length === 24 ? <RotateCcw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              <span>{clearedNumbers.length === 24 ? 'REPLAY BLITZ' : 'INITIALIZE SCAN'}</span>
            </button>
          </div>
        ) : (
          <div className="w-full h-full grid grid-cols-6 grid-rows-4 gap-2.5 z-10">
            {numbers.map((num) => {
              const isCleared = clearedNumbers.includes(num);
              const isWrong = wrongNumber === num;
              const isCurrentTarget = num === nextNumber;

              let style =
                'bg-slate-900/90 border border-slate-700/60 text-slate-200 hover:border-violet-400 hover:bg-slate-800/90 shadow-md';

              if (isCleared) {
                style =
                  'bg-violet-950/20 border-violet-950/40 text-violet-500/25 pointer-events-none scale-90 shadow-none';
              } else if (isWrong) {
                style =
                  'bg-rose-600 border-2 border-rose-300 text-white animate-shake shadow-lg shadow-rose-600/50';
              } else if (isCurrentTarget) {
                style =
                  'bg-gradient-to-b from-slate-900 to-slate-800 border-2 border-violet-400/80 text-violet-300 shadow-md shadow-violet-500/30';
              }

              return (
                <button
                  key={num}
                  onClick={() => handleNumberClick(num)}
                  disabled={isCleared}
                  className={`rounded-2xl font-mono text-xl sm:text-2xl font-black transition-all duration-150 flex items-center justify-center cursor-pointer active:scale-90 ${style}`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="w-full mt-3 text-center text-xs text-slate-400 font-medium">
        Mistake penalty: +1.0s added per error · Clear all 24 numbers in sequence
      </div>
    </div>
  );
}
