import { DailyChallenge, GameId } from '../types';
import { GAMES_LIST } from './gamesData';
import { loadProfile, saveProfile } from './storage';

export function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getDailyChallenge(): DailyChallenge {
  const todayKey = getTodayKey();
  const storedDailyJson = localStorage.getItem('skillarena_daily_v2');

  if (storedDailyJson) {
    try {
      const parsed = JSON.parse(storedDailyJson);
      if (parsed.date === todayKey) {
        return parsed;
      }
    } catch {
      // fallback to regenerating
    }
  }

  // Generate deterministic challenge for today using date string hash
  let hash = 0;
  for (let i = 0; i < todayKey.length; i++) {
    hash = (hash * 31 + todayKey.charCodeAt(i)) >>> 0;
  }

  const gameIndex = hash % GAMES_LIST.length;
  const game = GAMES_LIST[gameIndex];

  let targetScore = 500;
  let description = 'Reach the target score to complete today\'s challenge and claim 2.5x XP!';

  switch (game.id) {
    case 'reaction-rush':
      targetScore = 230;
      description = 'Achieve an average reaction speed under 230ms across 5 rounds.';
      break;
    case 'dodge-zone':
      targetScore = 30;
      description = 'Survive in the Dodge Zone bullet storm for at least 30 seconds.';
      break;
    case 'memory-matrix':
      targetScore = 6;
      description = 'Conquer Stage 6 in the expanding spatial Memory Matrix.';
      break;
    case 'aim-master':
      targetScore = 800;
      description = 'Score 800+ points with sharp precision and quick target flicks.';
      break;
    case 'number-blitz':
      targetScore = 24;
      description = 'Clear all 24 numbers in sequence in under 24 seconds.';
      break;
    case 'tap-master':
      targetScore = 8;
      description = 'Unleash rapid tapping of at least 8.0 CPS during the speed trial.';
      break;
    case 'pattern-breaker':
      targetScore = 6;
      description = 'Successfully replicate a sequence of 6 harmonic sensory pads.';
      break;
    case 'color-clash':
      targetScore = 800;
      description = 'Resist Stroop cognitive conflict and score 800+ points.';
      break;
    case 'memory-words':
      targetScore = 18;
      description = 'Accurately distinguish 18 seen and new words in verbal memory.';
      break;
    case 'precision-path':
      targetScore = 85;
      description = 'Trace through the cyber labyrinth with at least 85% path stability.';
      break;
  }

  const newChallenge: DailyChallenge = {
    date: todayKey,
    gameId: game.id as GameId,
    title: `${game.title} Daily Protocol`,
    description,
    targetScore,
    xpMultiplier: 2.5,
    completed: false
  };

  localStorage.setItem('skillarena_daily_v2', JSON.stringify(newChallenge));
  return newChallenge;
}

export function checkAndCompleteDaily(score: number): { completedJustNow: boolean; streak: number } {
  const challenge = getDailyChallenge();
  if (challenge.completed) {
    return { completedJustNow: false, streak: loadProfile().dailyStreak };
  }

  let metRequirement = false;
  if (challenge.gameId === 'reaction-rush' || challenge.gameId === 'number-blitz') {
    metRequirement = score <= challenge.targetScore && score > 0;
  } else {
    metRequirement = score >= challenge.targetScore;
  }

  if (metRequirement) {
    challenge.completed = true;
    challenge.userBestScore = score;
    localStorage.setItem('skillarena_daily_v2', JSON.stringify(challenge));

    // Update streak in profile
    const profile = loadProfile();
    const today = getTodayKey();

    // Check if yesterday was played
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    if (profile.lastDailyDate === yesterdayKey) {
      profile.dailyStreak += 1;
    } else if (profile.lastDailyDate !== today) {
      profile.dailyStreak = 1;
    }

    profile.lastDailyDate = today;
    saveProfile(profile);

    return { completedJustNow: true, streak: profile.dailyStreak };
  }

  return { completedJustNow: false, streak: loadProfile().dailyStreak };
}
