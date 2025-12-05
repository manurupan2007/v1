import React, { useState, useEffect } from 'react';
import { GameMode, Topic, Difficulty, LeaderboardEntry } from '../types';
import { getLeaderboard } from '../services/leaderboardService';
import { Trophy, Medal, User, Calendar, ArrowLeft } from 'lucide-react';
import { Button } from './Button';

interface LeaderboardProps {
  initialConfig?: { mode: GameMode, topic: Topic, difficulty: Difficulty };
  onBack: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ initialConfig, onBack }) => {
  const [mode, setMode] = useState<GameMode>(initialConfig?.mode || GameMode.CLASSIC);
  const [topic, setTopic] = useState<Topic>(initialConfig?.topic || Topic.FACTS);
  const [difficulty, setDifficulty] = useState<Difficulty>(initialConfig?.difficulty || Difficulty.MEDIUM);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setEntries(getLeaderboard(mode, topic, difficulty));
  }, [mode, topic, difficulty]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="text-yellow-400" size={20} />;
      case 1: return <Medal className="text-gray-300" size={20} />;
      case 2: return <Medal className="text-amber-600" size={20} />;
      default: return <span className="font-mono text-gray-500 w-5 text-center">{index + 1}</span>;
    }
  };

  return (
    <div className="w-full max-w-4xl animate-fade-in flex flex-col h-[80vh]">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack} className="p-2">
           <ArrowLeft size={24} />
        </Button>
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
          Global Leaderboard
        </h2>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-surface/50 p-4 rounded-2xl border border-gray-700/50">
        <select 
          value={mode} 
          onChange={(e) => setMode(e.target.value as GameMode)}
          className="bg-dark border border-gray-700 rounded-lg p-2 text-sm focus:border-primary outline-none text-gray-200"
        >
          {Object.values(GameMode).map(m => <option key={m} value={m}>{m} Mode</option>)}
        </select>
        
        <select 
          value={topic} 
          onChange={(e) => setTopic(e.target.value as Topic)}
          className="bg-dark border border-gray-700 rounded-lg p-2 text-sm focus:border-primary outline-none text-gray-200"
        >
          {Object.values(Topic).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        
        <select 
          value={difficulty} 
          onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          className="bg-dark border border-gray-700 rounded-lg p-2 text-sm focus:border-primary outline-none text-gray-200"
        >
          {Object.values(Difficulty).map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-800">
        <div className="col-span-1 text-center">#</div>
        <div className="col-span-5 md:col-span-4">Player</div>
        <div className="col-span-3 md:col-span-2 text-right">{mode === GameMode.SURVIVAL ? 'Score' : 'WPM'}</div>
        <div className="col-span-3 md:col-span-2 text-right hidden md:block">{mode === GameMode.SURVIVAL ? 'WPM' : 'Accuracy'}</div>
        <div className="col-span-3 text-right hidden md:block">Date</div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-surface/30 rounded-b-2xl">
        {entries.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No records yet. Be the first!</div>
        ) : (
          entries.map((entry, index) => (
            <div 
              key={entry.id} 
              className={`grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-gray-800/50 hover:bg-white/5 transition-colors ${entry.isPlayer ? 'bg-primary/10' : ''}`}
            >
              <div className="col-span-1 flex justify-center">{getRankIcon(index)}</div>
              <div className="col-span-5 md:col-span-4 flex items-center gap-2 font-medium text-gray-200 truncate">
                {entry.isPlayer && <User size={14} className="text-primary" />}
                {entry.name}
              </div>
              <div className="col-span-3 md:col-span-2 text-right font-mono font-bold text-primary">
                {entry.score}
              </div>
              <div className="col-span-3 md:col-span-2 text-right hidden md:block font-mono text-gray-400">
                {entry.secondaryStat}{mode === GameMode.CLASSIC ? '%' : ''}
              </div>
              <div className="col-span-3 text-right hidden md:block text-xs text-gray-600 flex items-center justify-end gap-1">
                <Calendar size={12} />
                {new Date(entry.date).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};