import React, { useState } from 'react';
import { UserProfile, GameStats } from '../types';
import { getRankTier, saveProfile } from '../utils/storage';
import { soundManager } from '../utils/audio';
import { User, Shield, Trophy, Flame, Zap, Award, Edit3, Check, Brain, Target, Compass, Sparkles } from 'lucide-react';

interface Props {
  profile: UserProfile;
  stats: Record<string, GameStats>;
  onProfileUpdate: (updated: UserProfile) => void;
}

const AVATARS = ['⚡', '🎯', '🧠', '🚀', '💎', '🐉', '👁️', '👑', '🔥', '⚔️'];

export default function ProfileView({ profile, stats, onProfileUpdate }: Props) {
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState(profile.username);
  const rank = getRankTier(profile.level);

  const handleSaveUsername = () => {
    const trimmed = usernameInput.trim();
    if (trimmed) {
      const updated = { ...profile, username: trimmed };
      saveProfile(updated);
      onProfileUpdate(updated);
      soundManager.playSuccess();
    }
    setIsEditingUsername(false);
  };

  const handleSelectAvatar = (av: string) => {
    soundManager.playClick();
    const updated = { ...profile, avatar: av };
    saveProfile(updated);
    onProfileUpdate(updated);
  };

  const handleSelectTitle = (t: string) => {
    soundManager.playClick();
    const updated = { ...profile, title: t };
    saveProfile(updated);
    onProfileUpdate(updated);
  };

  // Calculate Cognitive Attributes (0-100 score based on gameplay)
  const calcAttribute = (gameIds: string[]): number => {
    let totalScore = 0;
    let plays = 0;
    gameIds.forEach((id) => {
      const s = stats[id];
      if (s && s.plays > 0) {
        totalScore += s.highScore;
        plays += s.plays;
      }
    });
    if (plays === 0) return 20; // baseline
    return Math.min(99, Math.max(30, Math.round(40 + (totalScore / 50))));
  };

  const attributes = [
    { name: 'Synaptic Reflex', score: calcAttribute(['reaction-rush', 'dodge-zone']), icon: Zap, color: 'text-emerald-400', bar: 'bg-emerald-500' },
    { name: 'Working Memory', score: calcAttribute(['memory-matrix', 'pattern-breaker', 'memory-words']), icon: Brain, color: 'text-cyan-400', bar: 'bg-cyan-500' },
    { name: 'Motor Precision', score: calcAttribute(['aim-master', 'precision-path']), icon: Target, color: 'text-rose-400', bar: 'bg-rose-500' },
    { name: 'Processing Speed', score: calcAttribute(['number-blitz', 'tap-master']), icon: Flame, color: 'text-amber-400', bar: 'bg-amber-500' },
    { name: 'Cognitive Focus', score: calcAttribute(['color-clash']), icon: Compass, color: 'text-fuchsia-400', bar: 'bg-fuchsia-500' },
  ];

  const xpProgress = Math.min(100, Math.round((profile.xp / profile.xpForNextLevel) * 100));

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Player Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar & Selector */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-1 shadow-xl shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-4xl select-none">
                {profile.avatar}
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap justify-center max-w-[200px] mt-1">
              {AVATARS.slice(0, 5).map((av) => (
                <button
                  key={av}
                  onClick={() => handleSelectAvatar(av)}
                  className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition ${
                    profile.avatar === av
                      ? 'bg-indigo-600 text-white scale-110 shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* User Info & Titles */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                {isEditingUsername ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={18}
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveUsername()}
                      className="px-3 py-1 rounded-lg bg-slate-800 border border-indigo-500 text-white font-bold text-lg focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveUsername}
                      className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-white tracking-tight">
                      {profile.username}
                    </h2>
                    <button
                      onClick={() => setIsEditingUsername(true)}
                      className="text-slate-500 hover:text-slate-300 transition"
                      aria-label="Edit username"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${rank.color}`}>
                  {rank.badge} {rank.tier}
                </span>
              </div>

              {/* Title Selector */}
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-xs text-slate-400">Title:</span>
                <select
                  value={profile.title}
                  onChange={(e) => handleSelectTitle(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500"
                >
                  {profile.unlockedTitles.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Level & XP Progression Bar */}
            <div className="mt-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                <span className="text-white flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  Level {profile.level} Challenger
                </span>
                <span className="text-slate-400 font-mono">
                  {profile.xp} / {profile.xpForNextLevel} XP ({xpProgress}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
                <div
                  style={{ width: `${xpProgress}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500 shadow-sm shadow-cyan-500/50"
                />
              </div>
            </div>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-3 gap-3 mt-4 text-center">
              <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Total Games</div>
                <div className="text-lg font-black font-mono text-white">{profile.totalGamesPlayed}</div>
              </div>
              <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Daily Streak</div>
                <div className="text-lg font-black font-mono text-amber-400 flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4 fill-amber-400" />
                  <span>{profile.dailyStreak}</span>
                </div>
              </div>
              <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Rank Standing</div>
                <div className="text-lg font-black font-mono text-cyan-400">{rank.tier}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Axis Cognitive Evaluation Matrix */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base text-white">Cognitive Performance Radar</h3>
          </div>
          <span className="text-xs text-slate-400">Calculated across your high scores</span>
        </div>

        <div className="space-y-4">
          {attributes.map((attr) => {
            const Icon = attr.icon;
            return (
              <div key={attr.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-300 font-semibold">
                    <Icon className={`w-4 h-4 ${attr.color}`} />
                    <span>{attr.name}</span>
                  </div>
                  <span className="font-mono font-bold text-white">{attr.score} / 100</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${attr.score}%` }}
                    className={`h-full rounded-full ${attr.bar} transition-all duration-500`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
