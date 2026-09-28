import React, { useState } from 'react';
import { Achievement } from '../types';
import { soundManager } from '../utils/audio';
import { Trophy, CheckCircle, Lock, Zap, Brain, Target, Flame, Compass, Award } from 'lucide-react';

interface Props {
  achievements: Achievement[];
}

export default function AchievementsView({ achievements }: Props) {
  const [filter, setFilter] = useState<string>('all');

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const percentComplete = Math.round((unlockedCount / achievements.length) * 100);

  const filtered = filter === 'all'
    ? achievements
    : achievements.filter((a) => a.category === filter);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'reflex':
        return <Zap className="w-4 h-4 text-emerald-400" />;
      case 'memory':
        return <Brain className="w-4 h-4 text-cyan-400" />;
      case 'precision':
        return <Target className="w-4 h-4 text-rose-400" />;
      case 'speed':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'focus':
        return <Compass className="w-4 h-4 text-fuchsia-400" />;
      default:
        return <Award className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Trophies & Badges</h2>
              <p className="text-xs text-slate-400">
                Unlock achievements to prove your cognitive dominance and earn bonus recognition.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center font-mono">
            <span className="text-2xl font-black text-amber-400">{unlockedCount}</span>
            <span className="text-slate-500 text-lg">/</span>
            <span className="text-lg font-bold text-slate-300">{achievements.length}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 ml-2">
              {percentComplete}% Complete
            </span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            style={{ width: `${percentComplete}%` }}
            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 transition-all duration-500"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pt-5 pb-1 text-xs font-bold scrollbar-none">
          {['all', 'general', 'reflex', 'memory', 'precision', 'speed', 'focus'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                soundManager.playClick();
                setFilter(cat);
              }}
              className={`px-3 py-1.5 rounded-xl uppercase tracking-wider transition whitespace-nowrap cursor-pointer ${
                filter === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((ach) => {
          const progressPercent = Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100));

          return (
            <div
              key={ach.id}
              className={`rounded-2xl p-4 border transition-all duration-200 flex items-start gap-4 ${
                ach.unlocked
                  ? 'bg-slate-900/80 border-slate-700/80 shadow-lg shadow-indigo-500/5'
                  : 'bg-slate-950/40 border-slate-900/80 opacity-75'
              }`}
            >
              {/* Badge Icon */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform ${
                  ach.unlocked
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}
              >
                {ach.unlocked ? <Trophy className="w-6 h-6 stroke-[2.5]" /> : <Lock className="w-5 h-5" />}
              </div>

              {/* Badge Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-bold text-sm text-white truncate flex items-center gap-1.5">
                    <span>{ach.title}</span>
                  </h4>
                  <div className="flex items-center gap-1">
                    {getCategoryIcon(ach.category)}
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {ach.description}
                </p>

                {/* Progress Indicator */}
                {!ach.unlocked ? (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                      <span>Progress</span>
                      <span>
                        {ach.progress} / {ach.maxProgress}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${progressPercent}%` }}
                        className="h-full rounded-full bg-slate-600"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Unlocked</span>
                    {ach.unlockedAt && (
                      <span className="text-slate-500 text-[10px] font-mono ml-auto">
                        {new Date(ach.unlockedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
