import { GameMode, Topic, Difficulty, LeaderboardEntry, TypingStats } from "../types";

const STORAGE_KEY_PREFIX = 'typemaster_lb_';

// Mock data to simulate "connected" players
const MOCK_NAMES = ['CyberNinja', 'TypeRacer', 'GeminiFan', 'KeyboardWarrior', 'SpeedyGonzales', 'CodeMaster', 'PixelPerfect', 'ByteMe'];

const generateMockEntries = (mode: GameMode, difficulty: Difficulty): LeaderboardEntry[] => {
  const entries: LeaderboardEntry[] = [];
  const count = 5 + Math.floor(Math.random() * 5); // 5-10 random players

  for (let i = 0; i < count; i++) {
    const isClassic = mode === GameMode.CLASSIC;
    
    // Generate realistic scores based on difficulty
    let baseScore = isClassic ? 40 : 1000; // 40 WPM or 1000 pts
    const multiplier = difficulty === Difficulty.HARD ? 1.5 : difficulty === Difficulty.MEDIUM ? 1.2 : 1.0;
    
    const score = Math.floor(baseScore * multiplier * (0.8 + Math.random() * 0.5));
    const secondary = isClassic 
      ? Math.floor(90 + Math.random() * 10) // Accuracy
      : Math.floor(30 + Math.random() * 50); // WPM for Survival

    entries.push({
      id: `mock_${Date.now()}_${i}`,
      name: MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)],
      score: score,
      secondaryStat: secondary,
      date: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
      isPlayer: false
    });
  }
  return entries.sort((a, b) => b.score - a.score);
};

const getKey = (mode: GameMode, topic: Topic, difficulty: Difficulty) => {
  return `${STORAGE_KEY_PREFIX}${mode}_${topic}_${difficulty}`;
};

export const getLeaderboard = (mode: GameMode, topic: Topic, difficulty: Difficulty): LeaderboardEntry[] => {
  const key = getKey(mode, topic, difficulty);
  const stored = localStorage.getItem(key);
  
  if (stored) {
    return JSON.parse(stored);
  }

  // Seed with mock data if empty to make it feel alive
  const seeded = generateMockEntries(mode, difficulty);
  localStorage.setItem(key, JSON.stringify(seeded));
  return seeded;
};

export const saveScore = (
  mode: GameMode, 
  topic: Topic, 
  difficulty: Difficulty, 
  stats: TypingStats, 
  playerName: string
): LeaderboardEntry[] => {
  const key = getKey(mode, topic, difficulty);
  const currentBoard = getLeaderboard(mode, topic, difficulty);

  const mainScore = mode === GameMode.SURVIVAL ? (stats.score || 0) : stats.wpm;
  const secondary = mode === GameMode.SURVIVAL ? stats.wpm : stats.accuracy;

  const newEntry: LeaderboardEntry = {
    id: `p_${Date.now()}`,
    name: playerName || 'Anonymous',
    score: mainScore,
    secondaryStat: secondary,
    date: new Date().toISOString(),
    isPlayer: true
  };

  const updatedBoard = [...currentBoard, newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 50); // Keep top 50

  localStorage.setItem(key, JSON.stringify(updatedBoard));
  return updatedBoard;
};