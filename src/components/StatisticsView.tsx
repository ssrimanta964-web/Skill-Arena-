import React, { useState } from 'react';
import { GameStats } from '../types';
import { GAMES_LIST } from '../utils/gamesData';
import { soundManager } from '../utils/audio';
import { BarChart2, Trophy, PlayCircle, History, RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  stats: Record<string, GameStats>;
  onResetData: () => void;
}

export default function StatisticsView({ stats, onResetData }: Props) {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const totalPlaysOverall = Object.values(stats).reduce((acc, s) => acc + (s.plays || 0), 0);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400">
              <PlayCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Trials Played
              </div>
              <div className="text-2xl font-black font-mono text-white mt-0.5">
                {totalPlaysOverall}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Games Mastered
              </div>
              <div className="text-2xl font-black font-mono text-white mt-0.5">
                {Object.keys(stats).length} / {GAMES_LIST.length}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Evaluation Protocol
              </div>
              <div className="text-sm font-bold text-white mt-1">
                All 10 Cognitive Disciplines
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Game Records Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span>Game Hall of Records</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="pb-3 pl-2">Game</th>
                <th className="pb-3 text-center">Category</th>
                <th className="pb-3 text-center">Plays</th>
                <th className="pb-3 text-right">Personal Best</th>
                <th className="pb-3 text-right pr-2">Avg Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {GAMES_LIST.map((game) => {
                const s = stats[game.id];
                const plays = s?.plays || 0;
                const bestMetric = s?.bestMetric !== null && s?.bestMetric !== undefined
                  ? `${s.bestMetric} ${game.unit}`
                  : '--';
                const avg = s?.averageScore || '--';

                return (
                  <tr key={game.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 pl-2 font-bold text-white flex items-center gap-2">
                      <span>{game.title}</span>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {game.category}
                      </span>
                    </td>
                    <td className="py-3.5 text-center font-mono text-slate-300">
                      {plays}
                    </td>
                    <td className="py-3.5 text-right font-mono font-bold text-cyan-400">
                      {bestMetric}
                    </td>
                    <td className="py-3.5 text-right pr-2 font-mono text-slate-300">
                      {avg}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Danger Zone / Reset */}
      <div className="bg-rose-950/20 border border-rose-900/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Reset Player Data</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Wipe all high scores, levels, streaks, and unlocked achievements back to factory state.
          </p>
        </div>

        {showConfirmReset ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playFail();
                onResetData();
                setShowConfirmReset(false);
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition"
            >
              CONFIRM WIPE
            </button>
            <button
              onClick={() => setShowConfirmReset(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold transition"
            >
              CANCEL
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              soundManager.playClick();
              setShowConfirmReset(true);
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-rose-300 border border-rose-800/40 text-xs font-bold transition flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET ALL RECORDS</span>
          </button>
        )}
      </div>
    </div>
  );
}
