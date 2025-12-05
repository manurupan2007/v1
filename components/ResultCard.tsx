import React, { useState } from 'react';
import { TypingStats, GameMode, GameConfig, LeaderboardEntry } from '../types';
import { saveScore } from '../services/leaderboardService';
import { Button } from './Button';
import { RefreshCw, Home, Trophy, Target, Save, List } from 'lucide-react';

interface ResultCardProps {
  stats: TypingStats;
  config: GameConfig;
  onRestart: () => void;
  onMenu: () => void;
  onViewLeaderboard: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ stats, config, onRestart, onMenu, onViewLeaderboard }) => {
  const isSurvival = stats.mode === GameMode.SURVIVAL;
  const [playerName, setPlayerName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [rank, setRank] = useState<number | null>(null);

  const handleSubmitScore = () => {
    if (!playerName.trim()) return;
    
    const entries = saveScore(
      config.mode, 
      config.topic, 
      config.difficulty, 
      stats, 
      playerName
    );
    
    const myRank = entries.findIndex(e => e.name === playerName && e.isPlayer) + 1;
    setRank(myRank);
    setSubmitted(true);
  };

  return (
    <div className="w-full max-w-2xl animate-fade-in-up">
      <div className="bg-surface border border-gray-700 rounded-3xl p-8 md:p-12 shadow-2xl text-center">
        <h2 className="text-3xl font-bold text-white mb-2">
          {isSurvival ? 'Game Over!' : 'Session Complete!'}
        </h2>
        <p className="text-gray-400 mb-8">
          {isSurvival ? 'You fought bravely.' : 'Great typing!'}
        </p>

        {isSurvival ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-dark/50 p-6 rounded-2xl border border-gray-700/50">
              <div className="text-5xl font-mono font-bold text-primary mb-2">{stats.score}</div>
              <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold flex items-center justify-center gap-2">
                <Trophy size={14} /> Final Score
              </div>
            </div>
            <div className="bg-dark/50 p-6 rounded-2xl border border-gray-700/50">
              <div className="text-5xl font-mono font-bold text-secondary mb-2">{stats.wpm}</div>
              <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold flex items-center justify-center gap-2">
                 <Target size={14} /> Avg WPM
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-dark/50 p-6 rounded-2xl border border-gray-700/50">
              <div className="text-4xl font-mono font-bold text-primary mb-1">{stats.wpm}</div>
              <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">WPM</div>
            </div>
            <div className="bg-dark/50 p-6 rounded-2xl border border-gray-700/50">
              <div className="text-4xl font-mono font-bold text-secondary mb-1">{stats.accuracy}%</div>
              <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Accuracy</div>
            </div>
            <div className="bg-dark/50 p-6 rounded-2xl border border-gray-700/50">
              <div className="text-4xl font-mono font-bold text-blue-400 mb-1">{stats.timeElapsed}s</div>
              <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Time</div>
            </div>
          </div>
        )}

        {/* Score Submission Section */}
        {!submitted ? (
          <div className="bg-dark/30 p-6 rounded-2xl border border-gray-700/50 mb-8">
             <h3 className="text-white font-semibold mb-4 flex items-center justify-center gap-2">
               <Trophy size={18} className="text-yellow-400" />
               Submit to Leaderboard
             </h3>
             <div className="flex gap-2">
               <input 
                 type="text" 
                 value={playerName}
                 onChange={(e) => setPlayerName(e.target.value)}
                 placeholder="Enter your name"
                 maxLength={15}
                 className="flex-1 bg-dark border border-gray-600 rounded-xl px-4 text-white focus:border-primary outline-none"
                 onKeyDown={(e) => e.key === 'Enter' && handleSubmitScore()}
               />
               <Button onClick={handleSubmitScore} disabled={!playerName.trim()} className="py-2 px-4">
                 <Save size={18} />
               </Button>
             </div>
          </div>
        ) : (
          <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl mb-8 flex flex-col items-center">
             <p className="text-green-400 font-semibold mb-2">Score Submitted!</p>
             {rank && (
               <p className="text-sm text-gray-300">
                 You are currently ranked <span className="font-bold text-white">#{rank}</span> on the leaderboard.
               </p>
             )}
             <button 
               onClick={onViewLeaderboard}
               className="mt-3 text-sm text-primary hover:text-white underline underline-offset-4"
             >
               View Leaderboard
             </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={onRestart} className="flex items-center gap-2">
            <RefreshCw size={18} />
            {isSurvival ? 'Try Again' : 'Play Again'}
          </Button>
          <Button variant="secondary" onClick={onMenu} className="flex items-center gap-2">
            <Home size={18} />
            Menu
          </Button>
          <Button variant="ghost" onClick={onViewLeaderboard} className="flex items-center gap-2">
            <List size={18} />
            Scores
          </Button>
        </div>
      </div>
    </div>
  );
};