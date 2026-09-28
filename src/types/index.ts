export type GameId =
  | 'reaction-rush'
  | 'dodge-zone'
  | 'memory-matrix'
  | 'aim-master'
  | 'number-blitz'
  | 'tap-master'
  | 'pattern-breaker'
  | 'color-clash'
  | 'memory-words'
  | 'precision-path';

export type GameCategory = 'reflex' | 'memory' | 'precision' | 'speed' | 'focus';

export interface GameInfo {
  id: GameId;
  title: string;
  tagline: string;
  description: string;
  category: GameCategory;
  iconName: string;
  accentColor: string; // Tailwind color class or hex
  gradient: string;
  unit: string;
  isLowerScoreBetter?: boolean;
  howToPlay: string[];
  tips: string[];
}

export type RankTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master' | 'Apex';

export interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  title: string;
  level: number;
  xp: number;
  xpForNextLevel: number;
  totalGamesPlayed: number;
  dailyStreak: number;
  lastDailyDate: string | null;
  unlockedTitles: string[];
  createdAt: number;
}

export interface GameStats {
  plays: number;
  highScore: number;
  bestMetric: number | null; // e.g. lowest ms for reaction rush
  averageScore: number;
  totalScore: number;
  recentScores: { score: number; date: number; metric?: string }[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: GameCategory | 'general';
  unlocked: boolean;
  unlockedAt?: number;
  progress: number;
  maxProgress: number;
}

export interface DailyChallenge {
  date: string;
  gameId: GameId;
  title: string;
  description: string;
  targetScore: number;
  xpMultiplier: number;
  completed: boolean;
  userBestScore?: number;
}

export interface GameResult {
  gameId: GameId;
  score: number;
  metricValue: number;
  metricLabel: string;
  accuracy?: number;
  durationMs?: number;
  isNewHigh: boolean;
  xpEarned: number;
  bonusXp?: number;
  achievementsUnlocked: Achievement[];
  rankTierProgress?: {
    prevLevel: number;
    currentLevel: number;
    leveledUp: boolean;
  };
}

export interface Settings {
  soundEnabled: boolean;
  soundVolume: number;
  musicEnabled: boolean;
  musicVolume: number;
  hapticsEnabled: boolean;
  highContrast: boolean;
}
