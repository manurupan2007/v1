import React, { useEffect, useRef, useState } from 'react';
import { TypingStats, GameMode, Difficulty } from '../types';
import { Heart, Trophy } from 'lucide-react';

interface SurvivalGameProps {
  words: string[];
  difficulty: Difficulty;
  onFinish: (stats: TypingStats) => void;
}

interface FallingWord {
  id: number;
  text: string;
  x: number;
  y: number;
  speed: number;
  typedIndex: number; // How many chars have been typed
  isTarget: boolean;  // Is this the word currently being typed?
}

export const SurvivalGame: React.FC<SurvivalGameProps> = ({ words, difficulty, onFinish }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Game State Refs (for Loop)
  const gameState = useRef({
    activeWords: [] as FallingWord[],
    wordPool: [...words],
    lastSpawnTime: 0,
    spawnInterval: difficulty === Difficulty.HARD ? 1200 : difficulty === Difficulty.MEDIUM ? 1800 : 2500,
    baseSpeed: difficulty === Difficulty.HARD ? 1.5 : difficulty === Difficulty.MEDIUM ? 1.0 : 0.6,
    score: 0,
    lives: 5,
    startTime: Date.now(),
    totalChars: 0,
    correctChars: 0,
    errors: 0,
    gameOver: false,
    particles: [] as {x: number, y: number, vx: number, vy: number, life: number, color: string}[]
  });

  // React State for HUD
  const [hud, setHud] = useState({ lives: 5, score: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Resize handling
    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Key Handler
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.current.gameOver) return;
      
      const key = e.key;
      // Ignore modifier keys
      if (key.length > 1) return;

      const state = gameState.current;
      let targetWord = state.activeWords.find(w => w.isTarget);

      // If no target, try to find one starting with this key
      if (!targetWord) {
        // Filter words that start with the key
        const potentialTargets = state.activeWords.filter(w => w.text[0].toLowerCase() === key.toLowerCase());
        
        if (potentialTargets.length > 0) {
          // Pick the one closest to bottom (highest Y)
          potentialTargets.sort((a, b) => b.y - a.y);
          targetWord = potentialTargets[0];
          targetWord.isTarget = true;
          targetWord.typedIndex = 1; // First char typed
          
          state.correctChars++;
          state.totalChars++;
          createExplosion(targetWord.x + 10, targetWord.y, '#6366f1'); // visual feedback
        } else {
          state.errors++;
          state.totalChars++;
        }
      } else {
        // We have a target, check next char
        const nextChar = targetWord.text[targetWord.typedIndex];
        if (key.toLowerCase() === nextChar.toLowerCase()) {
          targetWord.typedIndex++;
          state.correctChars++;
          state.totalChars++;
          
          if (targetWord.typedIndex === targetWord.text.length) {
            // Word Complete
            state.score += targetWord.text.length * 10;
            state.activeWords = state.activeWords.filter(w => w.id !== targetWord!.id);
            setHud(prev => ({ ...prev, score: state.score }));
            createExplosion(targetWord.x + (targetWord.text.length * 10), targetWord.y, '#10b981');
          }
        } else {
          state.errors++;
          state.totalChars++;
          // Optional: penalty or shake effect
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Particle System
    const createExplosion = (x: number, y: number, color: string) => {
      for (let i = 0; i < 8; i++) {
        gameState.current.particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 5,
          life: 1.0,
          color
        });
      }
    };

    // Game Loop
    let animationFrameId: number;
    const loop = (timestamp: number) => {
      if (gameState.current.gameOver) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const state = gameState.current;
      const width = canvas.width;
      const height = canvas.height;

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // Spawning Logic
      if (timestamp - state.lastSpawnTime > state.spawnInterval) {
        if (state.wordPool.length > 0) {
          // Recycle words if pool is low? For now, just endless loop from pool or random
          const wordText = state.wordPool[Math.floor(Math.random() * state.wordPool.length)];
          const margin = 100;
          const x = margin + Math.random() * (width - margin * 2);
          
          state.activeWords.push({
            id: Date.now() + Math.random(),
            text: wordText,
            x,
            y: -30,
            speed: state.baseSpeed + (Math.random() * 0.5),
            typedIndex: 0,
            isTarget: false
          });
          state.lastSpawnTime = timestamp;
          
          // Difficulty ramp up
          state.spawnInterval = Math.max(800, state.spawnInterval * 0.995);
        }
      }

      // Update & Draw Words
      ctx.font = 'bold 24px "JetBrains Mono"';
      
      // We iterate backwards to allow removal
      for (let i = state.activeWords.length - 1; i >= 0; i--) {
        const word = state.activeWords[i];
        word.y += word.speed;

        // Draw Word
        const text = word.text;
        const typed = text.substring(0, word.typedIndex);
        const remaining = text.substring(word.typedIndex);

        // Measure text for centering if needed, but x is left-aligned
        const typedWidth = ctx.measureText(typed).width;

        // Draw Typed Part
        ctx.fillStyle = word.isTarget ? '#10b981' : '#a5b4fc'; // Green if target, else light indigo
        ctx.fillText(typed, word.x, word.y);

        // Draw Remaining Part
        ctx.fillStyle = word.isTarget ? '#ffffff' : '#94a3b8'; // White if target, else slate-400
        ctx.fillText(remaining, word.x + typedWidth, word.y);

        // Cursor
        if (word.isTarget) {
          ctx.fillStyle = '#10b981';
          ctx.fillRect(word.x + typedWidth, word.y - 20, 2, 24);
        }

        // Check Collision with bottom
        if (word.y > height) {
          state.lives--;
          state.activeWords.splice(i, 1);
          setHud(prev => ({ ...prev, lives: state.lives }));
          
          // Check Game Over
          if (state.lives <= 0) {
            state.gameOver = true;
            finishGame();
          }
        }
      }

      // Update & Draw Particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
        
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        if (p.life <= 0) state.particles.splice(i, 1);
      }

      if (!state.gameOver) {
        animationFrameId = requestAnimationFrame(loop);
      }
    };

    animationFrameId = requestAnimationFrame(loop);

    const finishGame = () => {
      const state = gameState.current;
      const durationSeconds = (Date.now() - state.startTime) / 1000;
      const wpm = Math.round((state.correctChars / 5) / (durationSeconds / 60));
      const accuracy = state.totalChars > 0 ? Math.round((state.correctChars / state.totalChars) * 100) : 0;

      onFinish({
        wpm: wpm || 0,
        accuracy,
        timeElapsed: Math.round(durationSeconds),
        errors: state.errors,
        totalChars: state.totalChars,
        correctChars: state.correctChars,
        score: state.score,
        mode: GameMode.SURVIVAL
      });
    };

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(animationFrameId);
    };
  }, [words, difficulty, onFinish]);

  return (
    <div className="relative w-full h-[600px] bg-dark rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
      {/* HUD Layer */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-10">
        <div className="flex gap-2">
           {Array.from({ length: 5 }).map((_, i) => (
             <Heart 
               key={i} 
               className={`w-8 h-8 transition-all duration-300 ${i < hud.lives ? 'text-red-500 fill-red-500' : 'text-gray-800'}`} 
             />
           ))}
        </div>
        <div className="bg-surface/80 backdrop-blur border border-gray-700 rounded-xl px-6 py-3 flex items-center gap-3">
           <Trophy className="text-yellow-400" size={20} />
           <span className="text-2xl font-mono font-bold text-white">{hud.score}</span>
        </div>
      </div>

      {/* Game Canvas */}
      <div ref={containerRef} className="w-full h-full">
        <canvas ref={canvasRef} className="block" />
      </div>

      {/* Start Overlay / Hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gray-500 text-sm font-mono opacity-50 pointer-events-none">
        Type the falling words before they hit the bottom!
      </div>
    </div>
  );
};