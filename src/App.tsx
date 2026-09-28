import React, { useState, useEffect } from 'react';
import { GameInfo, GameResult, UserProfile, Settings, Achievement, GameStats, GameCategory } from './types';
import { GAMES_LIST, GAMES_DATA } from './utils/gamesData';
import {
  loadProfile,
  loadStats,
  loadSettings,
  saveSettings,
  loadAchievements,
  resetAllData,
  DEFAULT_SETTINGS,
} from './utils/storage';
import { processGameResult } from './utils/progression';
import { getDailyChallenge, checkAndCompleteDaily } from './utils/dailyChallenge';
import { soundManager } from './utils/audio';

// Components
import Navbar from './components/Navbar';
import GameCard from './components/GameCard';
import DailyChallengeBanner from './components/DailyChallengeBanner';
import ProfileView from './components/ProfileView';
import AchievementsView from './components/AchievementsView';
import StatisticsView from './components/StatisticsView';
import SettingsModal from './components/SettingsModal';
import GameDetailsModal from './components/GameDetailsModal';
import GameOverModal from './components/GameOverModal';

// Games
import ReactionRush from './components/games/ReactionRush';
import DodgeZone from './components/games/DodgeZone';
import MemoryMatrix from './components/games/MemoryMatrix';
import AimMaster from './components/games/AimMaster';
import NumberBlitz from './components/games/NumberBlitz';
import TapMaster from './components/games/TapMaster';
import PatternBreaker from './components/games/PatternBreaker';
import ColorClash from './components/games/ColorClash';
import MemoryWords from './components/games/MemoryWords';
import PrecisionPath from './components/games/PrecisionPath';

import { ArrowLeft, Search, Filter, Sparkles, Trophy, Zap } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'arena' | 'daily' | 'profile' | 'achievements' | 'stats'>('arena');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [profile, setProfile] = useState<UserProfile>(loadProfile());
  const [stats, setStats] = useState<Record<string, GameStats>>(loadStats());
  const [achievements, setAchievements] = useState<Achievement[]>(loadAchievements());
  const [settings, setSettings] = useState<Settings>(loadSettings());
  const [dailyChallenge, setDailyChallenge] = useState(getDailyChallenge());

  const [currentGame, setCurrentGame] = useState<GameInfo | null>(null);
  const [inspectingGame, setInspectingGame] = useState<GameInfo | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  useEffect(() => {
    soundManager.updateSettings(settings);
  }, [settings]);

  const handleToggleSound = () => {
    const updated = { ...settings, soundEnabled: !settings.soundEnabled };
    setSettings(updated);
    saveSettings(updated);
    soundManager.updateSettings(updated);
    soundManager.playClick();
  };

  const handleToggleMusic = () => {
    const updated = { ...settings, musicEnabled: !settings.musicEnabled };
    setSettings(updated);
    saveSettings(updated);
    soundManager.updateSettings(updated);
    soundManager.playClick();
  };

  const handleStartGame = (game: GameInfo) => {
    soundManager.playClick();
    setCurrentGame(game);
    setGameResult(null);
  };

  const handleExitGame = () => {
    soundManager.playClick();
    setCurrentGame(null);
    setGameResult(null);
  };

  const handleFinishRound = (data: {
    score: number;
    metricValue: number;
    metricLabel: string;
    accuracy?: number;
    durationMs?: number;
  }) => {
    if (!currentGame) return;

    const isDaily = dailyChallenge.gameId === currentGame.id && !dailyChallenge.completed;

    // Process XP, Level, Stats & Achievements
    const result = processGameResult(
      currentGame.id,
      data.score,
      data.metricValue,
      data.metricLabel,
      {
        accuracy: data.accuracy,
        durationMs: data.durationMs,
        isDailyChallenge: isDaily,
        dailyMultiplier: dailyChallenge.xpMultiplier,
      }
    );

    // Check Daily Challenge completion
    if (isDaily) {
      const dailyOutcome = checkAndCompleteDaily(data.score);
      if (dailyOutcome.completedJustNow) {
        setDailyChallenge(getDailyChallenge());
      }
    }

    // Refresh state from storage
    setProfile(loadProfile());
    setStats(loadStats());
    setAchievements(loadAchievements());
    setGameResult(result);
  };

  const handleResetAllData = () => {
    resetAllData();
    setProfile(loadProfile());
    setStats(loadStats());
    setAchievements(loadAchievements());
    setDailyChallenge(getDailyChallenge());
    setSettings(DEFAULT_SETTINGS);
  };

  // Filter games based on search and category
  const filteredGames = GAMES_LIST.filter((game) => {
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
    const matchesSearch =
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const dailyGameInfo = GAMES_DATA[dailyChallenge.gameId] || GAMES_LIST[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white pb-20 md:pb-8">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (currentGame) setCurrentGame(null);
          setActiveTab(tab);
        }}
        profile={profile}
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleSound={handleToggleSound}
        onToggleMusic={handleToggleMusic}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* If user is inside an active game */}
        {currentGame ? (
          <div className="relative space-y-4 animate-fade-in">
            {/* Themed Ambient Backdrop Glow */}
            <div
              className={`absolute -top-10 left-1/2 -translate-x-1/2 w-3/4 max-w-2xl h-48 bg-gradient-to-b ${currentGame.accentColor} opacity-10 blur-3xl pointer-events-none -z-10`}
            />

            {/* Active Game Top Bar */}
            <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-3.5 backdrop-blur-xl shadow-lg">
              <button
                onClick={handleExitGame}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>EXIT TO HUB</span>
              </button>

              <div className="text-center">
                <h2 className="text-lg font-black text-white tracking-tight">{currentGame.title}</h2>
                <div className="text-[10px] font-mono font-bold text-slate-400 tracking-widest uppercase">
                  {currentGame.category} Discipline · {currentGame.tagline}
                </div>
              </div>

              <button
                onClick={() => setInspectingGame(currentGame)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <span>RULES</span>
              </button>
            </div>

            {/* Dynamic Game Render */}
            <div className="py-2">
              {currentGame.id === 'reaction-rush' && (
                <ReactionRush onFinish={handleFinishRound} />
              )}
              {currentGame.id === 'dodge-zone' && (
                <DodgeZone onFinish={handleFinishRound} />
              )}
              {currentGame.id === 'memory-matrix' && (
                <MemoryMatrix onFinish={handleFinishRound} />
              )}
              {currentGame.id === 'aim-master' && (
                <AimMaster onFinish={handleFinishRound} />
              )}
              {currentGame.id === 'number-blitz' && (
                <NumberBlitz onFinish={handleFinishRound} />
              )}
              {currentGame.id === 'tap-master' && (
                <TapMaster onFinish={handleFinishRound} />
              )}
              {currentGame.id === 'pattern-breaker' && (
                <PatternBreaker onFinish={handleFinishRound} />
              )}
              {currentGame.id === 'color-clash' && (
                <ColorClash onFinish={handleFinishRound} />
              )}
              {currentGame.id === 'memory-words' && (
                <MemoryWords onFinish={handleFinishRound} />
              )}
              {currentGame.id === 'precision-path' && (
                <PrecisionPath onFinish={handleFinishRound} />
              )}
            </div>
          </div>
        ) : (
          /* Hub Views */
          <div>
            {activeTab === 'arena' && (
              <div className="space-y-6 animate-fade-in">
                {/* Daily Challenge Spotlight */}
                <DailyChallengeBanner
                  challenge={dailyChallenge}
                  game={dailyGameInfo}
                  profile={profile}
                  onPlay={handleStartGame}
                />

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
                    {[
                      { id: 'all', label: 'All Games' },
                      { id: 'reflex', label: '⚡ Reflex' },
                      { id: 'memory', label: '🧠 Memory' },
                      { id: 'precision', label: '🎯 Precision' },
                      { id: 'speed', label: '🔥 Speed' },
                      { id: 'focus', label: '👁️ Focus' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          soundManager.playClick();
                          setSelectedCategory(cat.id);
                        }}
                        className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap cursor-pointer ${
                          selectedCategory === cat.id
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Search Input */}
                  <div className="relative min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search mini-games..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Games Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredGames.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      stats={stats[game.id]}
                      onPlay={handleStartGame}
                      onInfo={(g) => setInspectingGame(g)}
                    />
                  ))}
                </div>

                {filteredGames.length === 0 && (
                  <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
                    <p className="text-slate-400 text-sm">No mini-games matched your filter.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'daily' && (
              <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
                <DailyChallengeBanner
                  challenge={dailyChallenge}
                  game={dailyGameInfo}
                  profile={profile}
                  onPlay={handleStartGame}
                />

                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span>How Daily Protocols Work</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1">
                      <div className="font-bold text-amber-400 text-sm">1. New Game Daily</div>
                      <p className="text-slate-400">
                        Every 24 hours at midnight, a selected discipline is chosen for all contenders worldwide.
                      </p>
                    </div>
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1">
                      <div className="font-bold text-rose-400 text-sm">2. 2.5x XP Boost</div>
                      <p className="text-slate-400">
                        Conquering the protocol grants 2.5x player progression experience to level up faster.
                      </p>
                    </div>
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1">
                      <div className="font-bold text-emerald-400 text-sm">3. Build Your Streak</div>
                      <p className="text-slate-400">
                        Play consecutive days to keep your streak multiplier alive and unlock exclusive badges.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <ProfileView
                profile={profile}
                stats={stats}
                onProfileUpdate={(p) => setProfile(p)}
              />
            )}

            {activeTab === 'achievements' && (
              <AchievementsView achievements={achievements} />
            )}

            {activeTab === 'stats' && (
              <StatisticsView stats={stats} onResetData={handleResetAllData} />
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(s) => {
          setSettings(s);
          saveSettings(s);
        }}
      />

      <GameDetailsModal
        game={inspectingGame}
        onClose={() => setInspectingGame(null)}
        onStartGame={handleStartGame}
      />

      {gameResult && currentGame && (
        <GameOverModal
          result={gameResult}
          game={currentGame}
          onReplay={() => {
            setGameResult(null);
          }}
          onExit={() => {
            setGameResult(null);
            setCurrentGame(null);
          }}
        />
      )}
    </div>
  );
}
