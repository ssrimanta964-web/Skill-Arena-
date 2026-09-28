import { UserProfile, GameStats, Achievement, GameResult, GameId } from '../types';
import { GAMES_DATA } from './gamesData';
import { loadAchievements, saveAchievements, loadProfile, saveProfile, loadStats, saveStats } from './storage';

export const LEVEL_TITLES: { level: number; title: string }[] = [
  { level: 1, title: 'Synapse Scout' },
  { level: 3, title: 'Reflex Initiate' },
  { level: 5, title: 'Neural Striker' },
  { level: 8, title: 'Cognitive Prodigy' },
  { level: 12, title: 'Precision Artisan' },
  { level: 16, title: 'Vanguard Specialist' },
  { level: 20, title: 'Cerebral Virtuoso' },
  { level: 25, title: 'Hyperfocus Elite' },
  { level: 30, title: 'Matrix Sovereign' },
  { level: 40, title: 'Apex Grandmaster' },
  { level: 50, title: 'Temporal Deity' },
];

export function calculateXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.25));
}

export function processGameResult(
  gameId: GameId,
  score: number,
  metricValue: number,
  metricLabel: string,
  options?: {
    accuracy?: number;
    durationMs?: number;
    isDailyChallenge?: boolean;
    dailyMultiplier?: number;
  }
): GameResult {
  const profile = loadProfile();
  const allStats = loadStats();
  const achievements = loadAchievements();
  const gameInfo = GAMES_DATA[gameId];

  // 1. Calculate XP
  let baseXp = Math.max(15, Math.floor(score / 8));
  if (gameInfo?.isLowerScoreBetter) {
    // e.g. Reaction time or Number blitz time
    // For reaction time: 200ms -> 120 XP, 300ms -> 60 XP
    if (gameId === 'reaction-rush') {
      baseXp = Math.max(20, Math.floor(180 - (metricValue - 150) * 0.5));
    } else if (gameId === 'number-blitz') {
      baseXp = Math.max(20, Math.floor(150 - metricValue * 3));
    }
  }

  const accuracyMult = options?.accuracy ? Math.max(0.6, options.accuracy / 100) : 1;
  const dailyMult = options?.isDailyChallenge ? (options.dailyMultiplier || 2.0) : 1;
  const xpEarned = Math.round(baseXp * accuracyMult * dailyMult);

  // 2. Update Stats
  const currentStats: GameStats = allStats[gameId] || {
    plays: 0,
    highScore: 0,
    bestMetric: null,
    averageScore: 0,
    totalScore: 0,
    recentScores: []
  };

  currentStats.plays += 1;
  currentStats.totalScore += score;
  currentStats.averageScore = Math.round(currentStats.totalScore / currentStats.plays);

  let isNewHigh = false;
  if (score > currentStats.highScore) {
    currentStats.highScore = score;
    isNewHigh = true;
  }

  if (gameInfo?.isLowerScoreBetter) {
    if (currentStats.bestMetric === null || metricValue < currentStats.bestMetric) {
      currentStats.bestMetric = metricValue;
      isNewHigh = true;
    }
  } else {
    if (currentStats.bestMetric === null || metricValue > currentStats.bestMetric) {
      currentStats.bestMetric = metricValue;
    }
  }

  currentStats.recentScores.unshift({
    score,
    date: Date.now(),
    metric: `${metricValue} ${metricLabel}`
  });
  if (currentStats.recentScores.length > 20) {
    currentStats.recentScores.pop();
  }

  allStats[gameId] = currentStats;
  saveStats(allStats);

  // 3. Update Profile & Level
  const prevLevel = profile.level;
  profile.totalGamesPlayed += 1;
  profile.xp += xpEarned;

  let currentLevel = profile.level;
  let nextLvlReq = calculateXpForLevel(currentLevel);

  while (profile.xp >= nextLvlReq) {
    profile.xp -= nextLvlReq;
    currentLevel += 1;
    profile.level = currentLevel;
    nextLvlReq = calculateXpForLevel(currentLevel);
  }
  profile.xpForNextLevel = nextLvlReq;

  // Check title unlocks
  LEVEL_TITLES.forEach(t => {
    if (currentLevel >= t.level && !profile.unlockedTitles.includes(t.title)) {
      profile.unlockedTitles.push(t.title);
      profile.title = t.title; // auto-equip highest unlocked
    }
  });

  saveProfile(profile);

  // 4. Check Achievements
  const newlyUnlocked: Achievement[] = [];
  const updatedAchievements = achievements.map(ach => {
    if (ach.unlocked) return ach;

    let shouldUnlock = false;
    let newProgress = ach.progress;

    switch (ach.id) {
      case 'first_blood':
        newProgress = 1;
        shouldUnlock = true;
        break;
      case 'lightning_reflex':
        if (gameId === 'reaction-rush' && metricValue <= 210) {
          newProgress = 1;
          shouldUnlock = true;
        }
        break;
      case 'sub_200':
        if (gameId === 'reaction-rush' && metricValue <= 190) {
          newProgress = 1;
          shouldUnlock = true;
        }
        break;
      case 'dodge_survivor':
        if (gameId === 'dodge-zone') {
          newProgress = Math.max(newProgress, Math.floor(metricValue));
          if (newProgress >= 45) shouldUnlock = true;
        }
        break;
      case 'matrix_genius':
        if (gameId === 'memory-matrix') {
          newProgress = Math.max(newProgress, metricValue);
          if (newProgress >= 8) shouldUnlock = true;
        }
        break;
      case 'sharpshooter':
        if (gameId === 'aim-master') {
          newProgress = Math.max(newProgress, score);
          if (score >= 1200 && (options?.accuracy || 0) >= 90) shouldUnlock = true;
        }
        break;
      case 'speed_demon':
        if (gameId === 'number-blitz' && metricValue <= 18) {
          newProgress = 1;
          shouldUnlock = true;
        }
        break;
      case 'finger_frenzy':
        if (gameId === 'tap-master') {
          newProgress = Math.max(newProgress, Math.floor(metricValue));
          if (metricValue >= 10.0) shouldUnlock = true;
        }
        break;
      case 'harmonic_mind':
        if (gameId === 'pattern-breaker') {
          newProgress = Math.max(newProgress, metricValue);
          if (metricValue >= 10) shouldUnlock = true;
        }
        break;
      case 'stroop_slayer':
        if (gameId === 'color-clash') {
          newProgress = Math.max(newProgress, score);
          if (score >= 1500) shouldUnlock = true;
        }
        break;
      case 'lexical_titan':
        if (gameId === 'memory-words') {
          newProgress = Math.max(newProgress, metricValue);
          if (metricValue >= 35) shouldUnlock = true;
        }
        break;
      case 'steady_surgeon':
        if (gameId === 'precision-path') {
          newProgress = Math.max(newProgress, Math.floor(metricValue));
          if (metricValue >= 95) shouldUnlock = true;
        }
        break;
      case 'dedicated_grinder':
        newProgress = profile.totalGamesPlayed;
        if (newProgress >= 25) shouldUnlock = true;
        break;
      case 'arena_legend':
        newProgress = profile.level;
        if (newProgress >= 15) shouldUnlock = true;
        break;
    }

    if (shouldUnlock) {
      const unlockedItem = {
        ...ach,
        unlocked: true,
        progress: ach.maxProgress,
        unlockedAt: Date.now()
      };
      newlyUnlocked.push(unlockedItem);
      return unlockedItem;
    }

    return { ...ach, progress: newProgress };
  });

  if (newlyUnlocked.length > 0) {
    saveAchievements(updatedAchievements);
  }

  return {
    gameId,
    score,
    metricValue,
    metricLabel,
    accuracy: options?.accuracy,
    durationMs: options?.durationMs,
    isNewHigh,
    xpEarned,
    achievementsUnlocked: newlyUnlocked,
    rankTierProgress: {
      prevLevel,
      currentLevel,
      leveledUp: currentLevel > prevLevel
    }
  };
}
