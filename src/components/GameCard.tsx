import React from 'react';
import { GameInfo, GameStats } from '../types';
import { soundManager } from '../utils/audio';
import {
  Zap,
  ShieldAlert,
  Grid3X3,
  Crosshair,
  ListOrdered,
  Flame,
  Sparkles,
  Palette,
  BookOpen,
  Route,
  Play,
  Info,
  Trophy,
} from 'lucide-react';

interface Props {
  game: GameInfo;
  stats?: GameStats;
  onPlay: (game: GameInfo) => void;
  onInfo: (game: GameInfo) => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  reflex: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  memory: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  precision: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
  speed: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  focus: { bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-400', border: 'border-fuchsia-500/30' },
};

export default function GameCard({ game, stats, onPlay, onInfo }: Props) {
  const categoryStyle = CATEGORY_COLORS[game.category] || CATEGORY_COLORS.reflex;

  const renderIcon = () => {
    const iconClass = 'w-6 h-6';
    switch (game.id) {
      case 'reaction-rush':
        return <Zap className={iconClass} />;
      case 'dodge-zone':
        return <ShieldAlert className={iconClass} />;
      case 'memory-matrix':
        return <Grid3X3 className={iconClass} />;
      case 'aim-master':
        return <Crosshair className={iconClass} />;
      case 'number-blitz':
        return <ListOrdered className={iconClass} />;
      case 'tap-master':
        return <Flame className={iconClass} />;
      case 'pattern-breaker':
        return <Sparkles className={iconClass} />;
      case 'color-clash':
        return <Palette className={iconClass} />;
      case 'memory-words':
        return <BookOpen className={iconClass} />;
      case 'precision-path':
        return <Route className={iconClass} />;
      default:
        return <Zap className={iconClass} />;
    }
  };

  const bestMetricDisplay = stats?.bestMetric !== null && stats?.bestMetric !== undefined
    ? `${stats.bestMetric} ${game.unit}`
    : null;

  return (
    <div className="group relative bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5 backdrop-blur-sm overflow-hidden">
      {/* Decorative gradient corner aura */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${game.accentColor} opacity-5 group-hover:opacity-15 rounded-full blur-2xl transition-opacity pointer-events-none`} />

      <div>
        {/* Top Header: Category Tag & Info Button */}
        <div className="flex items-center justify-between mb-4">
          <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}>
            {game.category}
          </span>
          <button
            onClick={() => {
              soundManager.playClick();
              onInfo(game);
            }}
            aria-label="View game instructions"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        {/* Icon & Title */}
        <div className="flex items-start gap-3.5 mb-2.5">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${game.accentColor} text-white shadow-md shadow-slate-950/50 flex-shrink-0 group-hover:scale-105 transition`}>
            {renderIcon()}
          </div>
          <div>
            <h3 className="font-bold text-base text-white tracking-tight group-hover:text-cyan-300 transition">
              {game.title}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
              {game.tagline}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Section: Personal Best & Launch Button */}
      <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          {bestMetricDisplay ? (
            <span className="font-mono">
              Best: <strong className="text-white">{bestMetricDisplay}</strong>
            </span>
          ) : (
            <span className="text-slate-500 italic">No record</span>
          )}
        </div>

        <button
          onClick={() => {
            soundManager.playClick();
            onPlay(game);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 group-hover:bg-indigo-600 text-white font-bold text-xs shadow-sm transition-all duration-150 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>PLAY</span>
        </button>
      </div>
    </div>
  );
}
