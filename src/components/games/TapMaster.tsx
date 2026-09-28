import React, { useState, useEffect, useRef } from 'react';
import { soundManager } from '../../utils/audio';
import { Flame, RotateCcw, Zap, Timer, Gauge, Sparkles } from 'lucide-react';

interface Props {
  onFinish: (result: { score: number; metricValue: number; metricLabel: string; accuracy?: number }) => void;
  isDaily?: boolean;
}

export default function TapMaster({ onFinish }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<5 | 10>(5);
  const [timeLeft, setTimeLeft] = useState<number>(5);
  const [clicks, setClicks] = useState(0);
  const [cps, setCps] = useState(0);
  const [peakCps, setPeakCps] = useState(0);
  const [isPressed, setIsPressed] = useState(false);

  const clickTimestamps = useRef<number[]>([]);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const startGame = () => {
    setIsPlaying(true);
    setClicks(0);
    setCps(0);
    setPeakCps(0);
    setTimeLeft(duration);
    clickTimestamps.current = [];
    startTimeRef.current = performance.now();

    soundManager.playCountdown(true);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTap = () => {
    if (!isPlaying) {
      startGame();
      return;
    }

    const now = performance.now();
    clickTimestamps.current.push(now);
    setClicks((c) => c + 1);

    const oneSecAgo = now - 1000;
    clickTimestamps.current = clickTimestamps.current.filter((t) => t > oneSecAgo);
    const currentCps = clickTimestamps.current.length;
    setCps(currentCps);
    setPeakCps((p) => Math.max(p, currentCps));

    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 60);

    if (currentCps > 10) {
      soundManager.playCombo(currentCps);
    } else {
      soundManager.playClick(420 + currentCps * 45);
    }
    soundManager.vibrate(15);
  };

  useEffect(() => {
    if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      soundManager.playLevelUp();

      const finalCps = parseFloat((clicks / duration).toFixed(2));
      const score = Math.round(finalCps * 220);

      onFinish({
        score,
        metricValue: finalCps,
        metricLabel: 'cps',
        accuracy: Math.min(100, Math.round((finalCps / 12) * 100)),
      });
    }
  }, [timeLeft, isPlaying, clicks, duration, onFinish]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const needleAngle = Math.min(180, (cps / 14) * 180) - 90; // -90 deg to +90 deg

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center select-none">
      {/* Duration Mode Switcher */}
      {!isPlaying && (
        <div className="flex items-center gap-2 mb-3 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-md">
          <button
            onClick={() => setDuration(5)}
            className={`px-5 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition cursor-pointer ${
              duration === 5
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            5S SPRINT
          </button>
          <button
            onClick={() => setDuration(10)}
            className={`px-5 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition cursor-pointer ${
              duration === 10
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            10S MARATHON
          </button>
        </div>
      )}

      {/* Sci-Fi Tachometer HUD */}
      <div className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl mb-4 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CLOCK</div>
            <div className="text-xl font-mono font-black text-amber-400">{timeLeft}s</div>
          </div>
        </div>

        {/* Real-time CPS Tachometer Dial */}
        <div className="flex items-center gap-3 bg-slate-950/60 px-4 py-1.5 rounded-xl border border-slate-800">
          <Gauge className="w-5 h-5 text-amber-400" />
          <div>
            <div className="text-[9px] font-mono text-slate-400">TACHOMETER</div>
            <div className="text-sm font-mono font-black text-white">
              <span className="text-amber-400 text-base">{cps}</span>{' '}
              <span className="text-xs text-slate-400">CPS</span> (Peak: {peakCps})
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">TOTAL TAPS</div>
          <div className="text-xl font-mono font-black text-white">{clicks}</div>
        </div>
      </div>

      {/* Main Turbine Tap Core Card */}
      <div className="w-full aspect-square max-w-md bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-slate-800/90 rounded-3xl p-8 flex flex-col items-center justify-center relative shadow-2xl overflow-hidden">
        {/* Tachometer Arc */}
        <div className="absolute top-6 flex flex-col items-center pointer-events-none">
          <div className="w-36 h-18 overflow-hidden relative">
            <div className="w-36 h-36 rounded-full border-4 border-slate-800 border-t-amber-500" />
            <div
              style={{ transform: `rotate(${needleAngle}deg)` }}
              className="w-1 h-16 bg-gradient-to-t from-white to-amber-400 absolute bottom-0 left-1/2 -translate-x-1/2 origin-bottom transition-transform duration-100"
            />
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">CADENCE GAUGE</div>
        </div>

        {/* Ambient flame halo when bursting */}
        {cps >= 8 && (
          <div className="absolute inset-0 bg-gradient-to-t from-rose-600/20 via-amber-500/10 to-transparent pointer-events-none animate-pulse" />
        )}

        {/* Big Tactile Core Button */}
        <button
          onClick={handleTap}
          className={`w-52 h-52 sm:w-60 sm:h-60 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-75 select-none relative z-10 border-4 ${
            isPressed ? 'scale-95 shadow-inner' : 'scale-100'
          } ${
            cps >= 10
              ? 'bg-gradient-to-br from-amber-400 via-rose-500 to-purple-600 border-white shadow-2xl shadow-rose-500/60 neon-glow-rose'
              : cps >= 7
              ? 'bg-gradient-to-br from-amber-500 to-orange-600 border-amber-200 shadow-xl shadow-amber-500/50 neon-glow-amber'
              : 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border-slate-700 hover:border-amber-500/60 shadow-2xl text-white'
          }`}
        >
          {/* Metallic Inner Rim */}
          <div className="absolute inset-2 rounded-full border-2 border-white/20 pointer-events-none" />

          <Flame
            className={`w-14 h-14 sm:w-16 sm:h-16 mb-2 transition-transform ${
              cps >= 10
                ? 'text-white scale-125 animate-bounce'
                : cps >= 7
                ? 'text-amber-200 scale-110'
                : 'text-amber-500'
            }`}
          />

          <div className="font-black text-2xl sm:text-3xl tracking-wider uppercase text-white drop-shadow-md">
            {!isPlaying ? 'TAP TO START' : 'TAP FASTER!'}
          </div>

          <div className="text-xs font-mono font-bold text-white/80 mt-1">
            {isPlaying ? `${cps} CPS` : 'SPEED TEST'}
          </div>
        </button>

        {isPlaying && cps >= 10 && (
          <div className="absolute bottom-5 px-5 py-1.5 rounded-full bg-rose-500 text-white text-xs font-black tracking-widest uppercase animate-bounce shadow-xl shadow-rose-500/50 z-20">
            🔥 SUPERNOVA OVERLOAD! 🔥
          </div>
        )}
      </div>

      <div className="w-full mt-3 text-center text-xs text-slate-400 font-medium">
        Alternate fingers rapidly for maximum mechanical frequency
      </div>
    </div>
  );
}
