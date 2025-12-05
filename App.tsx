import React, { useState, useEffect } from 'react';
import { GameState, GameConfig, Difficulty, Topic, TypingStats, GameMode, GeneratedContent } from './types';
import { generateTypingContent } from './services/geminiService';
import { TypingArea } from './components/TypingArea';
import { SurvivalGame } from './components/SurvivalGame';
import { ResultCard } from './components/ResultCard';
import { Leaderboard } from './components/Leaderboard';
import { Button } from './components/Button';
import { Spinner } from './components/Spinner';
import { Keyboard, Zap, BookOpen, Code, Smile, Trophy, MessageSquare, Crosshair, Target } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [config, setConfig] = useState<GameConfig>({
    difficulty: Difficulty.MEDIUM,
    topic: Topic.FACTS,
    mode: GameMode.CLASSIC
  });
  const [content, setContent] = useState<GeneratedContent>({});
  const [stats, setStats] = useState<TypingStats | null>(null);

  const startGame = async () => {
    setGameState(GameState.LOADING);
    const data = await generateTypingContent(config.topic, config.difficulty, config.mode);
    setContent(data);
    setGameState(GameState.PLAYING);
  };

  const handleFinish = (resultStats: TypingStats) => {
    // Preserve the mode in stats if not present
    const finalStats = { ...resultStats, mode: config.mode };
    setStats(finalStats);
    setGameState(GameState.FINISHED);
  };

  const resetGame = () => {
    setGameState(GameState.MENU);
    setStats(null);
  };

  const openLeaderboard = () => {
    setGameState(GameState.LEADERBOARD);
  };

  const restartSameSettings = () => {
    startGame();
  };

  // Global Key Handlers for shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((gameState === GameState.PLAYING || gameState === GameState.LEADERBOARD) && e.key === 'Escape') {
        resetGame();
      }
      // Tab restart only makes sense for Classic or if paused
      if (gameState === GameState.PLAYING && config.mode === GameMode.CLASSIC && e.key === 'Tab') {
        e.preventDefault();
        startGame(); 
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, config]);

  return (
    <div className="min-h-screen bg-dark text-gray-100 font-sans selection:bg-primary/30 selection:text-white flex flex-col">
      {/* Header */}
      <header className="w-full p-6 border-b border-gray-800 bg-dark/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={resetGame}>
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Keyboard className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              TypeMaster AI
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
             <Button variant="ghost" onClick={openLeaderboard} className="hidden md:flex items-center gap-2 text-yellow-500 hover:text-yellow-400">
                <Trophy size={16} />
                Leaderboards
             </Button>
             <span className="hidden md:inline h-4 w-px bg-gray-700"></span>
             <span className="hidden md:inline">Powered by Gemini 2.5</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-7xl mx-auto">
        
        {/* MENU STATE */}
        {gameState === GameState.MENU && (
          <div className="w-full max-w-4xl animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Master your keyboard.</h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Select a game mode, topic, and difficulty to generate a unique challenge instantly.
              </p>
            </div>

            {/* Game Mode Selector */}
            <div className="flex justify-center mb-12">
               <div className="bg-surface border border-gray-700 p-1 rounded-2xl inline-flex">
                 <button
                    onClick={() => setConfig({ ...config, mode: GameMode.CLASSIC })}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                      config.mode === GameMode.CLASSIC 
                      ? 'bg-primary text-white shadow-lg' 
                      : 'text-gray-400 hover:text-white'
                    }`}
                 >
                   <Target size={18} />
                   Classic Practice
                 </button>
                 <button
                    onClick={() => setConfig({ ...config, mode: GameMode.SURVIVAL })}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                      config.mode === GameMode.SURVIVAL 
                      ? 'bg-red-500 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-white'
                    }`}
                 >
                   <Crosshair size={18} />
                   Survival Mode
                 </button>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Difficulty Selection */}
              <div className="space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Select Difficulty</h3>
                <div className="grid grid-cols-1 gap-3">
                  {(Object.values(Difficulty) as Difficulty[]).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setConfig({ ...config, difficulty: diff })}
                      className={`p-4 rounded-xl border text-left transition-all duration-200 flex items-center justify-between group ${
                        config.difficulty === diff
                          ? config.mode === GameMode.SURVIVAL ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-primary/10 border-primary text-primary'
                          : 'bg-surface border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200'
                      }`}
                    >
                      <span className="font-medium">{diff}</span>
                      <div className={`w-3 h-3 rounded-full ${
                        config.difficulty === diff 
                        ? (config.mode === GameMode.SURVIVAL ? 'bg-red-500' : 'bg-primary') 
                        : 'bg-gray-700 group-hover:bg-gray-600'
                      }`}></div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic Selection */}
              <div className="space-y-6">
                 <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Select Topic</h3>
                 <div className="grid grid-cols-2 gap-3">
                    {[
                      { type: Topic.STORY, icon: BookOpen },
                      { type: Topic.FACTS, icon: Zap },
                      { type: Topic.CODE, icon: Code },
                      { type: Topic.JOKES, icon: Smile },
                      { type: Topic.QUOTES, icon: MessageSquare }
                    ].map((item) => (
                      <button
                        key={item.type}
                        onClick={() => setConfig({ ...config, topic: item.type })}
                        className={`p-4 h-24 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
                          config.topic === item.type
                            ? config.mode === GameMode.SURVIVAL ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-secondary/10 border-secondary text-secondary'
                            : 'bg-surface border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200'
                        }`}
                      >
                        <item.icon size={24} />
                        <span className="font-medium text-sm">{item.type}</span>
                      </button>
                    ))}
                 </div>
              </div>
            </div>

            <div className="mt-12 flex flex-col gap-4 items-center">
              <Button 
                 onClick={startGame} 
                 variant={config.mode === GameMode.SURVIVAL ? 'danger' : 'primary'}
                 className="w-full md:w-auto min-w-[200px] text-lg py-4 shadow-xl"
              >
                {config.mode === GameMode.SURVIVAL ? 'Start Survival Game' : 'Start Practice'}
              </Button>
              <Button onClick={openLeaderboard} variant="ghost" className="md:hidden text-gray-400">
                View Leaderboards
              </Button>
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {gameState === GameState.LOADING && (
          <Spinner />
        )}

        {/* LEADERBOARD STATE */}
        {gameState === GameState.LEADERBOARD && (
          <Leaderboard 
            initialConfig={config} 
            onBack={resetGame} 
          />
        )}

        {/* PLAYING STATE */}
        {gameState === GameState.PLAYING && (
          <div className="w-full animate-fade-in">
             <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className={`px-2 py-1 bg-surface rounded text-gray-300 border border-gray-700 ${config.mode === GameMode.SURVIVAL ? 'text-red-400 border-red-900/50' : ''}`}>
                    {config.mode}
                  </span>
                  <span className="px-2 py-1 bg-surface rounded text-gray-300">{config.topic}</span>
                  <span>•</span>
                  <span className="px-2 py-1 bg-surface rounded text-gray-300">{config.difficulty}</span>
                </div>
                <Button variant="ghost" onClick={resetGame} className="text-xs px-3 py-2">
                  Quit
                </Button>
             </div>
             
             {config.mode === GameMode.CLASSIC ? (
                <TypingArea text={content.text || ''} onFinish={handleFinish} />
             ) : (
                <SurvivalGame 
                  words={content.words || []} 
                  difficulty={config.difficulty} 
                  onFinish={handleFinish} 
                />
             )}
          </div>
        )}

        {/* FINISHED STATE */}
        {gameState === GameState.FINISHED && stats && (
          <ResultCard 
            stats={stats}
            config={config} 
            onRestart={restartSameSettings} 
            onMenu={resetGame} 
            onViewLeaderboard={openLeaderboard}
          />
        )}

      </main>
      
      {/* Footer */}
      {gameState === GameState.MENU && (
        <footer className="w-full p-6 text-center text-gray-600 text-sm">
          <p>Practice makes perfect. Challenge yourself daily.</p>
        </footer>
      )}
    </div>
  );
};

export default App;