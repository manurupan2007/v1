import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TypingStats } from '../types';

interface TypingAreaProps {
  text: string;
  onFinish: (stats: TypingStats) => void;
}

export const TypingArea: React.FC<TypingAreaProps> = ({ text, onFinish }) => {
  const [typed, setTyped] = useState<string>('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [errors, setErrors] = useState<number>(0);
  const [wpm, setWpm] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus input on mount and keep focused
  useEffect(() => {
    const focusInput = () => inputRef.current?.focus();
    focusInput();
    window.addEventListener('click', focusInput);
    return () => window.removeEventListener('click', focusInput);
  }, []);

  // Timer logic for live WPM update
  useEffect(() => {
    let interval: number;
    if (startTime && typed.length < text.length) {
      interval = window.setInterval(() => {
        const timeNow = Date.now();
        const durationInMinutes = (timeNow - startTime) / 60000;
        // Standard WPM calculation: (characters / 5) / minutes
        const currentWpm = Math.round((typed.length / 5) / durationInMinutes);
        setWpm(currentWpm);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, typed.length, text.length]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    // Start timer on first keystroke
    if (!startTime) {
      setStartTime(Date.now());
    }

    // Prevent backspace from working if we want strict mode, but standard typing games allow backspace.
    // However, for simplicity and strict "flow", we'll only allow adding characters or backspacing locally.
    // Let's implement strict forward typing logic or standard logic. 
    // Standard: can backspace.
    
    // Check if the new character matches the target
    if (val.length > typed.length) {
      const newCharIndex = val.length - 1;
      const targetChar = text[newCharIndex];
      const typedChar = val[newCharIndex];
      
      if (typedChar !== targetChar) {
         setErrors(prev => prev + 1);
      }
    }

    setTyped(val);

    if (val.length === text.length) {
      const endTime = Date.now();
      const durationSeconds = (endTime - (startTime || endTime)) / 1000;
      const durationMinutes = durationSeconds / 60;
      const finalWpm = Math.round((val.length / 5) / durationMinutes);
      
      // Calculate correct chars
      let correctCount = 0;
      for (let i = 0; i < val.length; i++) {
        if (val[i] === text[i]) correctCount++;
      }
      
      const accuracy = Math.round((correctCount / val.length) * 100);

      onFinish({
        wpm: finalWpm,
        accuracy: isNaN(accuracy) ? 0 : accuracy,
        timeElapsed: Math.round(durationSeconds),
        errors: errors,
        totalChars: val.length,
        correctChars: correctCount
      });
    }
  };

  // Render text with styling
  const renderText = () => {
    return text.split('').map((char, index) => {
      let colorClass = "text-gray-500"; // Untyped
      let bgClass = "";
      
      if (index < typed.length) {
        if (typed[index] === char) {
          colorClass = "text-gray-100"; // Correct
        } else {
          colorClass = "text-red-400"; // Incorrect
          bgClass = "bg-red-500/20";
        }
      }

      const isCurrent = index === typed.length;

      return (
        <span key={index} className={`relative ${colorClass} ${bgClass}`}>
          {isCurrent && (
            <span className="absolute -left-[1px] top-0 bottom-0 w-[2px] bg-primary animate-cursor"></span>
          )}
          {char}
        </span>
      );
    });
  };

  const progress = Math.min(100, (typed.length / text.length) * 100);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* HUD */}
      <div className="w-full flex justify-between items-center mb-6 text-sm font-mono text-gray-400">
        <div>
           <span className="text-gray-600 mr-2">WPM:</span>
           <span className="text-primary text-xl font-bold">{wpm}</span>
        </div>
        <div>
           <span className="text-gray-600 mr-2">ERRORS:</span>
           <span className="text-red-400 text-xl font-bold">{errors}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-gray-800 rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Text Area */}
      <div 
        className="relative w-full bg-surface/50 border border-gray-700/50 rounded-2xl p-8 md:p-12 shadow-inner min-h-[200px] flex items-center justify-center cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Hidden Input */}
        <input
          ref={inputRef}
          type="text"
          value={typed}
          onChange={handleChange}
          className="absolute opacity-0 top-0 left-0 h-full w-full cursor-default"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          maxLength={text.length}
        />
        
        {/* Visual Text */}
        <p className="font-mono text-2xl md:text-3xl leading-relaxed tracking-wide select-none break-words whitespace-pre-wrap">
          {renderText()}
        </p>
      </div>

      <div className="mt-8 text-gray-500 text-sm flex gap-4">
        <span className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700 text-xs">TAB</kbd> to restart
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700 text-xs">ESC</kbd> to menu
        </span>
      </div>
    </div>
  );
};