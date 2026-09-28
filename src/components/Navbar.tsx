import React from 'react';
import { UserProfile, Settings } from '../types';
import { getRankTier } from '../utils/storage';
import { soundManager } from '../utils/audio';
import { Volume2, VolumeX, Music, Settings as SettingsIcon, Flame, Trophy, User, BarChart2, Gamepad2, Calendar } from 'lucide-react';

interface Props {
  activeTab: 'arena' | 'daily' | 'profile' | 'achievements' | 'stats';
  setActiveTab: (tab: 'arena' | 'daily' | 'profile' | 'achievements' | 'stats') => void;
  profile: UserProfile;
  settings: Settings;
  onOpenSettings: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  profile,
  settings,
  onOpenSettings,
  onToggleSound,
  onToggleMusic,
}: Props) {
  const rank = getRankTier(profile.level);

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => {
            soundManager.playClick();
            setActiveTab('arena');
          }}
          className="flex items-center gap-2.5 text-left group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-black text-xl text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-indigo-400">
              ⚡
            </div>
          </div>
          <div>
            <div className="font-black text-lg tracking-tight text-white flex items-center gap-1.5">
              <span>SKILL</span>
              <span className="text-cyan-400">ARENA</span>
            </div>
            <div className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 -mt-1">
              Cognitive Reflex Lab
            </div>
          </div>
        </button>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('arena');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'arena'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Games</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('daily');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'daily'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Daily Protocol</span>
            {profile.dailyStreak > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] bg-amber-600/30 text-amber-300 px-1.5 py-0.5 rounded-full font-mono">
                <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
                {profile.dailyStreak}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('profile');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'profile'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('achievements');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'achievements'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Trophies</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('stats');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'stats'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Records</span>
          </button>
        </nav>

        {/* Player Level & Settings Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Profile Summary Badge */}
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('profile');
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-sm">
              {profile.avatar}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-white flex items-center gap-1">
                <span>Lvl {profile.level}</span>
                <span className={`text-[10px] px-1 py-0.2 rounded border ${rank.color}`}>
                  {rank.tier}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[100px]">
                {profile.title}
              </div>
            </div>
          </button>

          {/* Quick Sound Toggle */}
          <button
            onClick={onToggleSound}
            aria-label="Toggle sound"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Quick Music Toggle */}
          <button
            onClick={onToggleMusic}
            aria-label="Toggle ambient synth music"
            className={`p-2 rounded-xl bg-slate-900 border border-slate-800 transition cursor-pointer ${
              settings.musicEnabled ? 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            <Music className="w-4 h-4" />
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 px-2 py-2 flex items-center justify-around">
        <button
          onClick={() => {
            soundManager.playClick();
            setActiveTab('arena');
          }}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl ${
            activeTab === 'arena' ? 'text-indigo-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Gamepad2 className="w-5 h-5" />
          <span className="text-[10px]">Games</span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            setActiveTab('daily');
          }}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl ${
            activeTab === 'daily' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px]">Daily</span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            setActiveTab('profile');
          }}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl ${
            activeTab === 'profile' ? 'text-indigo-400 font-bold' : 'text-slate-400'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Profile</span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            setActiveTab('achievements');
          }}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl ${
            activeTab === 'achievements' ? 'text-indigo-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[10px]">Trophies</span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            setActiveTab('stats');
          }}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl ${
            activeTab === 'stats' ? 'text-indigo-400 font-bold' : 'text-slate-400'
          }`}
        >
          <BarChart2 className="w-5 h-5" />
          <span className="text-[10px]">Stats</span>
        </button>
      </div>
    </header>
  );
}
