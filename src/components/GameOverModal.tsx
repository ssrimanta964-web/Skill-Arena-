import React, { useEffect } from 'react';
import { GameResult, GameInfo } from '../types';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, ArrowLeft, Sparkles, Award, Zap, CheckCircle2 } from 'lucide-react';

interface Props {
  result: GameResult;
  game: GameInfo;
  onReplay: () => void;
  onExit: () => void;
}

export default function GameOverModal({ result, game, onReplay, onExit }: Props) {
  useEffect(() => {
    if (result.isNewHigh || result.rankTierProgress?.leveledUp || result.achievementsUnlocked.length > 0) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#818cf8', '#34d399', '#fbbf24', '#f43f5e'],
      });
    }
  }, [result]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-center">
        {/* Top Celebration Badge */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5 mx-auto mb-3 shadow-xl shadow-cyan-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-400">
            {result.isNewHigh ? (
              <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
            ) : (
              <Zap className="w-8 h-8 text-cyan-400" />
            )}
          </div>
        </div>

        <h3 className="text-2xl font-black text-white tracking-tight">
          {result.isNewHigh ? 'NEW PERSONAL BEST!' : 'TRIAL COMPLETED!'}
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">{game.title}</p>

        {/* Primary Metric Display */}
        <div className="my-5 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
            Performance Result
          </div>
          <div className="text-4xl sm:text-5xl font-mono font-black text-white">
            {result.metricValue}{' '}
            <span className="text-xl sm:text-2xl font-bold text-cyan-400">
              {result.metricLabel}
            </span>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2 text-xs font-mono text-slate-300">
            <div>
              Score: <strong className="text-emerald-400">{result.score}</strong>
            </div>
            {result.accuracy !== undefined && (
              <div>
                Accuracy: <strong className="text-cyan-400">{result.accuracy}%</strong>
              </div>
            )}
          </div>
        </div>

        {/* XP & Level Up Banner */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs">
            <span className="flex items-center gap-1.5 text-indigo-300 font-bold">
              <Sparkles className="w-4 h-4 text-amber-400" />
              XP Earned
            </span>
            <span className="font-mono font-black text-white text-sm">
              +{result.xpEarned} XP
            </span>
          </div>

          {result.rankTierProgress?.leveledUp && (
            <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 text-xs font-black animate-pulse">
              <Award className="w-4 h-4 text-amber-400" />
              <span>LEVEL UP! NOW LEVEL {result.rankTierProgress.currentLevel}!</span>
            </div>
          )}

          {/* Newly Unlocked Achievements */}
          {result.achievementsUnlocked.map((ach) => (
            <div
              key={ach.id}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-left"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div className="truncate">
                <div className="text-[10px] uppercase text-emerald-400 font-mono">Trophy Unlocked</div>
                <div className="font-bold text-white truncate">{ach.title}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              soundManager.playClick();
              onExit();
            }}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ARENA HUB</span>
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              onReplay();
            }}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RETRY TRIAL</span>
          </button>
        </div>
      </div>
    </div>
  );
}
