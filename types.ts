export enum GameState {
  MENU = 'MENU',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED',
  LEADERBOARD = 'LEADERBOARD',
  ERROR = 'ERROR'
}

export enum GameMode {
  CLASSIC = 'Classic',
  SURVIVAL = 'Survival'
}

export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard'
}

export enum Topic {
  STORY = 'Story',
  FACTS = 'Fun Facts',
  CODE = 'Code Snippets',
  JOKES = 'Jokes',
  QUOTES = 'Inspirational Quotes'
}

export interface TypingStats {
  wpm: number;
  accuracy: number;
  timeElapsed: number;
  errors: number;
  totalChars: number;
  correctChars: number;
  score?: number;     // For Survival Mode
  mode?: GameMode;
}

export interface GameConfig {
  difficulty: Difficulty;
  topic: Topic;
  mode: GameMode;
}

export interface GeneratedContent {
  text?: string;
  words?: string[];
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number; // Score for Survival, WPM for Classic
  secondaryStat: number; // WPM for Survival, Accuracy for Classic
  date: string;
  isPlayer: boolean;
}