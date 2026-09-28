import React, { useState, useEffect, useRef, useCallback } from 'react';
import { soundManager } from '../../utils/audio';
import { RotateCcw, AlertTriangle, CheckCircle, Zap, Activity, Flame, Shield } from 'lucide-react';

interface Props {
  onFinish: (resultData: { score: number; metricValue: number; metricLabel: string; accuracy?: number }) => void;
  isDaily?: boolean;
}

type State = 'idle' | 'waiting' | 'ready' | 'early' | 'round-finished' | 'complete';

export default function ReactionRush({ onFinish }: Props) {
  const [gameState, setGameState] = useState<State>('idle');
  const [round, setRound] = useState(1);
  const totalRounds = 5;
  const [currentMs, setCurrentMs] = useState<number | null>(null);
  const [roundScores, setRoundScores] = useState<number[]>([]);
  const [falseStarts, setFalseStarts] = useState(0);
  const [clickRipple, setClickRipple] = useState<{ x: number; y: number } | null>(null);

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const startRound = useCallback(() => {
    setGameState('waiting');
    setCurrentMs(null);

    // Random delay between 1800ms and 4500ms
    const delay = Math.floor(Math.random() * 2700) + 1800;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setGameState('ready');
      startTimeRef.current = performance.now();
      soundManager.playCountdown(true);
      soundManager.vibrate(35);
    }, delay);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setClickRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setTimeout(() => setClickRipple(null), 500);

    if (gameState === 'idle') {
      soundManager.playClick();
      startRound();
      return;
    }

    if (gameState === 'waiting') {
      // Too early!
      if (timerRef.current) clearTimeout(timerRef.current);
      setGameState('early');
      setFalseStarts((prev) => prev + 1);
      soundManager.playFail();
      soundManager.vibrate(80);
      return;
    }

    if (gameState === 'ready') {
      const elapsed = Math.round(performance.now() - startTimeRef.current);
      setCurrentMs(elapsed);
      const updated = [...roundScores, elapsed];
      setRoundScores(updated);

      if (elapsed < 200) {
        soundManager.playSuccess();
      } else {
        soundManager.playClick(600);
      }

      if (round >= totalRounds) {
        setGameState('complete');
        const avg = Math.round(updated.reduce((a, b) => a + b, 0) / updated.length);
        const score = Math.max(10, Math.round(2500 - avg * 4));
        onFinish({
          score,
          metricValue: avg,
          metricLabel: 'ms',
          accuracy: Math.max(20, 100 - falseStarts * 15),
        });
      } else {
        setGameState('round-finished');
      }
    } else if (gameState === 'early' || gameState === 'round-finished') {
      setRound((prev) => (gameState === 'round-finished' ? prev + 1 : prev));
      startRound();
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const currentAverage = roundScores.length > 0
    ? Math.round(roundScores.reduce((a, b) => a + b, 0) / roundScores.length)
    : null;

  const getTier = (ms: number) => {
    if (ms < 190) return { label: 'GODLIKE', color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10' };
    if (ms < 225) return { label: 'ELITE PRO', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' };
    if (ms < 270) return { label: 'FAST', color: 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10' };
    if (ms < 330) return { label: 'AVERAGE', color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' };
    return { label: 'SLUGGISH', color: 'text-rose-400 border-rose-500/40 bg-rose-500/10' };
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center select-none">
      {/* High-Tech HUD Telemetry Bar */}
      <div className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl mb-4 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">TRIAL PROGRESS</div>
            <div className="text-sm font-black text-white font-mono flex items-center gap-1.5">
              <span>ROUND {round}</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-400">{totalRounds}</span>
            </div>
          </div>
        </div>

        {/* LED Stage Indicators */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalRounds }).map((_, idx) => {
            const hasScore = roundScores[idx] !== undefined;
            const scoreVal = roundScores[idx];
            return (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div
                  className={`w-3.5 h-3.5 rounded-md transition-all duration-300 ${
                    hasScore
                      ? scoreVal < 210
                        ? 'bg-emerald-400 shadow-md shadow-emerald-400/60'
                        : scoreVal < 270
                        ? 'bg-indigo-400 shadow-md shadow-indigo-400/50'
                        : 'bg-amber-400 shadow-md shadow-amber-400/50'
                      : idx === round - 1 && gameState !== 'complete'
                      ? 'bg-slate-700 animate-pulse border border-slate-500'
                      : 'bg-slate-800 border border-slate-800/80'
                  }`}
                />
                <span className="text-[9px] font-mono text-slate-500">R{idx + 1}</span>
              </div>
            );
          })}
        </div>

        {/* Rolling Average & False Start Tracker */}
        <div className="text-right">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">CERTIFIED AVG</div>
          <div className="text-sm font-black font-mono text-cyan-400">
            {currentAverage ? `${currentAverage} ms` : '--'}
          </div>
        </div>
      </div>

      {/* Main Interactive Screen with Cockpit Styling */}
      <div
        onClick={handleClick}
        className={`w-full aspect-[4/3] sm:aspect-[16/9] rounded-3xl flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all duration-200 relative overflow-hidden shadow-2xl border-2 select-none ${
          gameState === 'idle'
            ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-slate-800 hover:border-emerald-500/40 hover:shadow-emerald-500/10'
            : gameState === 'waiting'
            ? 'bg-gradient-to-b from-rose-950 via-slate-950 to-rose-950 border-rose-600/80 neon-glow-rose'
            : gameState === 'ready'
            ? 'bg-gradient-to-b from-emerald-500 to-teal-400 border-white text-slate-950 neon-glow-emerald scale-[1.01]'
            : gameState === 'early'
            ? 'bg-gradient-to-b from-amber-950 via-slate-950 to-amber-950 border-amber-500 neon-glow-amber'
            : gameState === 'round-finished'
            ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-indigo-500/60'
            : 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-emerald-500'
        }`}
      >
        {/* Radial Background Grid Lines */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]" />

        {/* Click Ripple Shockwave */}
        {clickRipple && (
          <div
            style={{ left: `${clickRipple.x}px`, top: `${clickRipple.y}px` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-2 border-white/60 animate-ping pointer-events-none"
          />
        )}

        {/* Decorative Corner Tech Crosshairs */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-slate-600 pointer-events-none" />
        <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-slate-600 pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-slate-600 pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-slate-600 pointer-events-none" />

        {gameState === 'idle' && (
          <div className="flex flex-col items-center gap-5 z-10 animate-fade-in">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/30">
                <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-emerald-400">
                  <Zap className="w-12 h-12 animate-pulse" />
                </div>
              </div>
              <div className="absolute -inset-2 bg-emerald-500/20 rounded-full blur-xl -z-10 animate-pulse-glow" />
            </div>

            <div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
                REACTION RUSH
              </h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                Hold your focus. The moment the red chamber ignites{' '}
                <strong className="text-emerald-400 font-bold">EMERALD GREEN</strong>, tap anywhere instantly!
              </p>
            </div>

            <div className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/30 tracking-wider uppercase transition hover:scale-105 active:scale-95">
              TAP SCREEN TO INITIALIZE
            </div>
          </div>
        )}

        {gameState === 'waiting' && (
          <div className="flex flex-col items-center gap-3 z-10 animate-fade-in">
            <div className="w-16 h-16 rounded-full border-4 border-rose-500/40 border-t-rose-500 animate-spin flex items-center justify-center mb-2">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
            </div>
            <div className="text-4xl sm:text-6xl font-black text-rose-300 tracking-wider">
              WAIT FOR GREEN...
            </div>
            <p className="text-rose-400 text-sm font-semibold tracking-widest uppercase">
              Standby · Keep finger hovering
            </p>
          </div>
        )}

        {gameState === 'ready' && (
          <div className="flex flex-col items-center gap-2 z-10 animate-scale-in">
            <div className="text-7xl sm:text-9xl font-black tracking-tighter text-slate-950 drop-shadow-2xl">
              TAP NOW!
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-widest uppercase">
              RELEASE REFLEX!
            </div>
          </div>
        )}

        {gameState === 'early' && (
          <div className="flex flex-col items-center gap-4 z-10 animate-shake">
            <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-10 h-10 animate-bounce" />
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-amber-300 tracking-tight">
                FALSE START DETECTED!
              </div>
              <p className="text-amber-200/80 text-sm mt-1 max-w-sm mx-auto">
                Trigger pressed before green illumination. Deep breath, stay patient!
              </p>
            </div>
            <div className="mt-2 text-xs font-mono font-bold px-5 py-2.5 rounded-xl bg-amber-900/60 border border-amber-600/60 text-amber-300">
              TAP TO RETRY ROUND {round}
            </div>
          </div>
        )}

        {gameState === 'round-finished' && currentMs && (
          <div className="flex flex-col items-center gap-4 z-10 animate-scale-in">
            <div className={`px-4 py-1.5 rounded-full border text-xs font-black tracking-wider uppercase ${getTier(currentMs).color}`}>
              {getTier(currentMs).label}
            </div>

            <div className="text-6xl sm:text-7xl font-black font-mono text-white tracking-tight drop-shadow-md">
              {currentMs} <span className="text-2xl sm:text-3xl text-emerald-400">ms</span>
            </div>

            {/* Visual Speedometer Scale Bar */}
            <div className="w-full max-w-xs space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>150ms (Apex)</span>
                <span>250ms</span>
                <span>350ms</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div
                  style={{
                    left: `${Math.min(95, Math.max(5, ((currentMs - 150) / 250) * 100))}%`,
                  }}
                  className="absolute top-0 bottom-0 w-2.5 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/80 -translate-x-1/2"
                />
              </div>
            </div>

            <div className="mt-2 text-xs font-bold px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white shadow-lg transition">
              TAP TO PROCEED TO ROUND {round + 1}
            </div>
          </div>
        )}

        {gameState === 'complete' && (
          <div className="flex flex-col items-center gap-3 z-10 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div className="text-xs uppercase tracking-widest font-bold text-emerald-400">
              CERTIFIED PROTOCOL COMPLETE
            </div>
            <div className="text-6xl font-black font-mono text-white">
              {currentAverage} <span className="text-2xl text-emerald-400">ms</span>
            </div>
            <p className="text-slate-400 text-xs">Computing synaptic evaluation score...</p>
          </div>
        )}
      </div>

      {falseStarts > 0 && (
        <div className="mt-3 text-xs text-rose-400/80 font-mono flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{falseStarts} False Start penalty recorded</span>
        </div>
      )}
    </div>
  );
}
