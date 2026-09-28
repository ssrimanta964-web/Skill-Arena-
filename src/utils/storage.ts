import { UserProfile, GameStats, Settings, Achievement, GameId, RankTier } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'skillarena_profile_v2',
  STATS: 'skillarena_stats_v2',
  SETTINGS: 'skillarena_settings_v2',
  ACHIEVEMENTS: 'skillarena_achievements_v2',
  DAILY: 'skillarena_daily_v2',
};

export const DEFAULT_SETTINGS: Settings = {
  soundEnabled: true,
  soundVolume: 0.7,
  musicEnabled: false,
  musicVolume: 0.3,
  hapticsEnabled: true,
  highContrast: false,
};

export const DEFAULT_PROFILE: UserProfile = {
  id: 'player_1',
  username: 'Challenger',
  avatar: '⚡',
  title: 'Synapse Scout',
  level: 1,
  xp: 0,
  xpForNextLevel: 100,
  totalGamesPlayed: 0,
  dailyStreak: 0,
  lastDailyDate: null,
  unlockedTitles: ['Synapse Scout'],
  createdAt: Date.now(),
};

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_blood',
    title: 'First Step',
    description: 'Complete your first mini-game in SkillArena',
    icon: 'Flag',
    category: 'general',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'lightning_reflex',
    title: 'Lightning Synapse',
    description: 'Score under 210ms in Reaction Rush',
    icon: 'Zap',
    category: 'reflex',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'sub_200',
    title: 'Superluminal',
    description: 'Score under 190ms in Reaction Rush',
    icon: 'Sparkles',
    category: 'reflex',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'dodge_survivor',
    title: 'Bullet Dancer',
    description: 'Survive for over 45 seconds in Dodge Zone',
    icon: 'Shield',
    category: 'reflex',
    unlocked: false,
    progress: 0,
    maxProgress: 45,
  },
  {
    id: 'matrix_genius',
    title: 'Matrix Mastermind',
    description: 'Reach Stage 8 in Memory Matrix',
    icon: 'Grid',
    category: 'memory',
    unlocked: false,
    progress: 0,
    maxProgress: 8,
  },
  {
    id: 'sharpshooter',
    title: 'Hawkeye Sniper',
    description: 'Score 1200+ points in Aim Master with 90%+ accuracy',
    icon: 'Target',
    category: 'precision',
    unlocked: false,
    progress: 0,
    maxProgress: 1200,
  },
  {
    id: 'speed_demon',
    title: 'Sonic Blitz',
    description: 'Clear Number Blitz in under 18 seconds',
    icon: 'Timer',
    category: 'speed',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'finger_frenzy',
    title: 'Finger on Fire',
    description: 'Reach 10.0+ CPS in Tap Master',
    icon: 'Flame',
    category: 'speed',
    unlocked: false,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: 'harmonic_mind',
    title: 'Audio-Visual Maestro',
    description: 'Reach sequence 10 in Pattern Breaker',
    icon: 'Music',
    category: 'memory',
    unlocked: false,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: 'stroop_slayer',
    title: 'Cognitive Steel',
    description: 'Score 1500+ in Color Clash',
    icon: 'Eye',
    category: 'focus',
    unlocked: false,
    progress: 0,
    maxProgress: 1500,
  },
  {
    id: 'lexical_titan',
    title: 'Elephant Memory',
    description: 'Remember 35+ words in Memory Words',
    icon: 'BookOpen',
    category: 'memory',
    unlocked: false,
    progress: 0,
    maxProgress: 35,
  },
  {
    id: 'steady_surgeon',
    title: 'Surgical Precision',
    description: 'Complete Precision Path with 95%+ stability',
    icon: 'Compass',
    category: 'precision',
    unlocked: false,
    progress: 0,
    maxProgress: 95,
  },
  {
    id: 'dedicated_grinder',
    title: 'Arena Regular',
    description: 'Play a total of 25 mini-game rounds',
    icon: 'Trophy',
    category: 'general',
    unlocked: false,
    progress: 0,
    maxProgress: 25,
  },
  {
    id: 'arena_legend',
    title: 'Apex Competitor',
    description: 'Reach Level 15 in Player Progression',
    icon: 'Crown',
    category: 'general',
    unlocked: false,
    progress: 1,
    maxProgress: 15,
  }
];

export function getRankTier(level: number): { tier: RankTier; color: string; badge: string } {
  if (level >= 50) return { tier: 'Apex', color: 'text-rose-400 border-rose-500 bg-rose-500/10', badge: '👑' };
  if (level >= 30) return { tier: 'Master', color: 'text-purple-400 border-purple-500 bg-purple-500/10', badge: '💎' };
  if (level >= 20) return { tier: 'Diamond', color: 'text-cyan-400 border-cyan-500 bg-cyan-500/10', badge: '💠' };
  if (level >= 15) return { tier: 'Platinum', color: 'text-emerald-400 border-emerald-500 bg-emerald-500/10', badge: '🏆' };
  if (level >= 10) return { tier: 'Gold', color: 'text-amber-400 border-amber-500 bg-amber-500/10', badge: '🥇' };
  if (level >= 5) return { tier: 'Silver', color: 'text-slate-300 border-slate-400 bg-slate-400/10', badge: '🥈' };
  return { tier: 'Bronze', color: 'text-amber-700 border-amber-800 bg-amber-900/20', badge: '🥉' };
}

export function loadProfile(): UserProfile {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (data) {
      return { ...DEFAULT_PROFILE, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error('Failed to load profile', e);
  }
  return DEFAULT_PROFILE;
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

export function loadStats(): Record<string, GameStats> {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STATS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load stats', e);
  }
  return {};
}

export function saveStats(stats: Record<string, GameStats>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats', e);
  }
}

export function loadSettings(): Settings {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error('Failed to load settings', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export function loadAchievements(): Achievement[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    if (data) {
      const parsed: Achievement[] = JSON.parse(data);
      // Merge with latest schema in case new achievements were added
      return INITIAL_ACHIEVEMENTS.map(initial => {
        const found = parsed.find(p => p.id === initial.id);
        return found ? { ...initial, ...found } : initial;
      });
    }
  } catch (e) {
    console.error('Failed to load achievements', e);
  }
  return INITIAL_ACHIEVEMENTS;
}

export function saveAchievements(achievements: Achievement[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  } catch (e) {
    console.error('Failed to save achievements', e);
  }
}

export function resetAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.STATS);
    localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
    localStorage.removeItem(STORAGE_KEYS.DAILY);
  } catch (e) {
    console.error('Failed to reset data', e);
  }
}
