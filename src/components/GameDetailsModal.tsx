import React from 'react';
import { GameInfo } from '../types';
import { soundManager } from '../utils/audio';
import { X, Play, Lightbulb, HelpCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  game: GameInfo | null;
  onClose: () => void;
  onStartGame: (game: GameInfo) => void;
}

export default function GameDetailsModal({ game, onClose, onStartGame }: Props) {
  if (!game) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              {game.category}
            </span>
            <h3 className="text-2xl font-black text-white mt-1">{game.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{game.tagline}</p>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions */}
        <div className="py-5 space-y-5">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>How To Play</span>
            </h4>
            <div className="space-y-2">
              {game.howToPlay.map((step, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Tips */}
          <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4" />
              <span>Pro Strategy & Tips</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
              {game.tips.map((tip, idx) => (
                <li key={idx} className="leading-relaxed">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Play Button */}
        <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
          >
            CLOSE
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              onStartGame(game);
              onClose();
            }}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>PLAY NOW</span>
          </button>
        </div>
      </div>
    </div>
  );
}
