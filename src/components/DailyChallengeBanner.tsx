import React from 'react';
import { DailyChallenge, UserProfile, GameInfo } from '../types';
import { soundManager } from '../utils/audio';
import { Flame, Sparkles, CheckCircle2, Play, Calendar } from 'lucide-react';

interface Props {
  challenge: DailyChallenge;
  game: GameInfo;
  profile: UserProfile;
  onPlay: (game: GameInfo) => void;
}

export default function DailyChallengeBanner({ challenge, game, profile, onPlay }: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-indigo-500/10 border border-amber-500/30 p-5 sm:p-6 backdrop-blur-md shadow-xl">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5 shadow-lg shadow-amber-500/20 flex-shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[10px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono">
                DAILY PROTOCOL
              </span>
              <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1 font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                {challenge.xpMultiplier}x XP BOOST
              </span>
              {profile.dailyStreak > 0 && (
                <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-full">
                  <Flame className="w-3.5 h-3.5 fill-rose-500" />
                  {profile.dailyStreak} Day Streak
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              {challenge.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              {challenge.description}
            </p>
          </div>
        </div>

        {/* Action Button / Completed Badge */}
        <div className="flex items-center gap-3 self-end md:self-center">
          {challenge.completed ? (
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>PROTOCOL COMPLETED</span>
            </div>
          ) : (
            <button
              onClick={() => {
                soundManager.playClick();
                onPlay(game);
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>ACCEPT CHALLENGE</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
