import React, { useState, useEffect, useRef, useCallback } from 'react';
import { soundManager } from '../../utils/audio';
import { Sparkles, RotateCcw, Music, Activity } from 'lucide-react';

interface Props {
  onFinish: (result: { score: number; metricValue: number; metricLabel: string; accuracy?: number }) => void;
  isDaily?: boolean;
}

const PADS = [
  { id: 0, label: 'ALPHA', color: 'cyan', bg: 'bg-cyan-500', glow: 'neon-glow-cyan', border: 'border-cyan-300' },
  { id: 1, label: 'BETA', color: 'amber', bg: 'bg-amber-500', glow: 'neon-glow-amber', border: 'border-amber-300' },
  { id: 2, label: 'GAMMA', color: 'rose', bg: 'bg-rose-500', glow: 'neon-glow-rose', border: 'border-rose-300' },
  { id: 3, label: 'DELTA', color: 'emerald', bg: 'bg-emerald-500', glow: 'neon-glow-emerald', border: 'border-emerald-300' },
];

export default function PatternBreaker({ onFinish }: Props) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [round, setRound] = useState(0);

  const timeoutIds = useRef<number[]>([]);

  const clearTimeouts = () => {
    timeoutIds.current.forEach(clearTimeout);
    timeoutIds.current = [];
  };

  const playSequence = useCallback((seq: number[]) => {
    setIsShowingSequence(true);
    setPlayerIndex(0);

    const stepDuration = Math.max(300, 580 - seq.length * 20);
    const pauseDuration = 120;

    seq.forEach((padIndex, i) => {
      const startId = window.setTimeout(() => {
        setActivePad(padIndex);
        soundManager.playSimonTone(padIndex, stepDuration / 1000);
        soundManager.vibrate(25);
      }, i * (stepDuration + pauseDuration) + 400);

      const endId = window.setTimeout(() => {
        setActivePad(null);
        if (i === seq.length - 1) {
          setIsShowingSequence(false);
        }
      }, i * (stepDuration + pauseDuration) + 400 + stepDuration);

      timeoutIds.current.push(startId, endId);
    });
  }, []);

  const startNextRound = useCallback((currentSeq: number[]) => {
    const nextPad = Math.floor(Math.random() * 4);
    const newSeq = [...currentSeq, nextPad];
    setSequence(newSeq);
    setRound(newSeq.length);
    playSequence(newSeq);
  }, [playSequence]);

  const startGame = () => {
    clearTimeouts();
    setIsPlaying(true);
    setSequence([]);
    setRound(0);
    setPlayerIndex(0);
    setActivePad(null);

    soundManager.playCountdown(true);
    setTimeout(() => {
      startNextRound([]);
    }, 500);
  };

  const handlePadClick = (padIndex: number) => {
    if (!isPlaying || isShowingSequence) return;

    setActivePad(padIndex);
    soundManager.playSimonTone(padIndex, 0.25);
    soundManager.vibrate(20);
    setTimeout(() => setActivePad(null), 200);

    if (padIndex === sequence[playerIndex]) {
      const nextIdx = playerIndex + 1;
      setPlayerIndex(nextIdx);

      if (nextIdx === sequence.length) {
        soundManager.playSuccess();
        setIsShowingSequence(true);
        setTimeout(() => {
          startNextRound(sequence);
        }, 800);
      }
    } else {
      soundManager.playFail();
      soundManager.vibrate(100);
      setIsPlaying(false);
      clearTimeouts();

      const finalRound = sequence.length - 1;
      const score = Math.max(0, finalRound * 150);

      onFinish({
        score,
        metricValue: finalRound,
        metricLabel: 'seq',
        accuracy: Math.min(100, Math.round((finalRound / (finalRound + 1)) * 100)),
      });
    }
  };

  useEffect(() => {
    return () => clearTimeouts();
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center select-none">
      {/* Sci-Fi HUD Header */}
      <div className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl mb-4 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">SEQUENCE CAPACITY</div>
            <div className="text-xl font-mono font-black text-indigo-400">
              {round} <span className="text-xs text-slate-400">NOTES</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isShowingSequence ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-wider animate-pulse">
              <Activity className="w-4 h-4 animate-spin" />
              <span>RECORDING</span>
            </div>
          ) : isPlaying ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase tracking-wider">
              <span>YOUR TURN ({playerIndex + 1}/{sequence.length})</span>
            </div>
          ) : (
            <span className="text-xs text-slate-500 font-mono">STANDBY</span>
          )}
        </div>
      </div>

      {/* Main Synthesizer Console */}
      <div className="w-full aspect-square max-w-md bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-slate-800/90 rounded-3xl p-6 relative shadow-2xl flex items-center justify-center overflow-hidden">
        {/* Center Oscilloscope Hub */}
        <div className="absolute w-28 h-28 rounded-full bg-slate-950 border-4 border-slate-800 shadow-2xl flex flex-col items-center justify-center z-20 pointer-events-none">
          <Sparkles className={`w-8 h-8 transition-transform duration-200 ${activePad !== null ? 'scale-125 text-white' : 'text-slate-600'}`} />
          <div className="text-[9px] font-mono font-bold text-slate-400 tracking-widest mt-1">
            {activePad !== null ? 'SIGNAL' : 'SYNTH'}
          </div>
        </div>

        {!isPlaying ? (
          <div className="flex flex-col items-center gap-5 text-center p-4 z-30 animate-fade-in">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-500 to-blue-600 p-0.5 shadow-xl shadow-indigo-500/25">
                <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-indigo-400">
                  <Sparkles className="w-10 h-10" />
                </div>
              </div>
              <div className="absolute -inset-2 bg-indigo-500/20 rounded-full blur-xl -z-10 animate-pulse-glow" />
            </div>

            <div>
              <h3 className="text-3xl font-black text-white tracking-tight">PATTERN BREAKER</h3>
              <p className="text-slate-400 text-sm mt-1 max-w-xs leading-relaxed">
                Commit musical and visual frequencies to memory. Replicate the expanding harmonic loop!
              </p>
            </div>
            <button
              onClick={startGame}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:brightness-110 text-white font-black text-sm shadow-xl shadow-indigo-500/30 tracking-wider uppercase transition flex items-center gap-2 cursor-pointer"
            >
              {round > 0 ? <RotateCcw className="w-4 h-4" /> : <Music className="w-4 h-4" />}
              <span>{round > 0 ? 'RETRY SEQUENCE' : 'START HARMONIC SEQUENCE'}</span>
            </button>
          </div>
        ) : (
          <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-4 z-10 p-2">
            {PADS.map((pad) => {
              const isActive = activePad === pad.id;
              return (
                <button
                  key={pad.id}
                  onClick={() => handlePadClick(pad.id)}
                  disabled={isShowingSequence}
                  className={`rounded-3xl transition-all duration-100 cursor-pointer shadow-xl active:scale-95 border-2 flex items-center justify-center relative overflow-hidden ${
                    isActive
                      ? `${pad.bg} ${pad.border} ${pad.glow} scale-[1.03] shadow-2xl brightness-125`
                      : `${pad.bg} opacity-40 hover:opacity-75 border-white/20 hover:scale-[1.01]`
                  }`}
                >
                  <div className="absolute top-4 left-4 text-[10px] font-mono font-bold text-white/50 tracking-wider">
                    {pad.label}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="w-full mt-3 text-center text-xs text-slate-400 font-medium">
        Listen carefully to individual pitch harmonies to anchor memory recall
      </div>
    </div>
  );
}
