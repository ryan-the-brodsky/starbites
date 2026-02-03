import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, Users } from 'lucide-react';

const HoldButton = ({ task, isCompleted, isPartialComplete, isDisabled, needsTeamwork, teamProgress, onActivate }) => {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const intervalRef = useRef(null);
  const progressRef = useRef(0);

  const startHold = (e) => {
    e.preventDefault();
    if (isCompleted || isDisabled) return;
    setHolding(true);
    progressRef.current = 0;

    intervalRef.current = setInterval(() => {
      progressRef.current += 4;
      setProgress(progressRef.current);

      if (progressRef.current >= 100) {
        clearInterval(intervalRef.current);
        setProgress(100);
        onActivate();
      }
    }, 40);
  };

  const endHold = () => {
    setHolding(false);
    clearInterval(intervalRef.current);
    if (progressRef.current < 100 && !isCompleted && !isPartialComplete) {
      progressRef.current = 0;
      setProgress(0);
    }
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  // Reset progress display when task completes
  useEffect(() => {
    if (isCompleted || isPartialComplete) {
      setProgress(100);
    }
  }, [isCompleted, isPartialComplete]);

  return (
    <div className="flex flex-col items-center">
      {/* Teamwork indicator */}
      {needsTeamwork && teamProgress && (
        <div className="flex items-center gap-1 mb-1 text-sm text-cyan-400">
          <Users className="w-4 h-4" />
          <span>{teamProgress.completed}/{teamProgress.total}</span>
        </div>
      )}
      <div
        className={`relative cursor-pointer select-none ${isCompleted ? 'opacity-60' : ''} ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
        onMouseDown={startHold}
        onMouseUp={endHold}
        onMouseLeave={endHold}
        onTouchStart={startHold}
        onTouchEnd={endHold}
      >
        <div className="w-24 h-24 bg-gradient-to-b from-slate-600 to-slate-700 rounded-lg border-2 border-slate-500 p-1.5 relative">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="48" cy="48" r="40" fill="none" stroke="#334155" strokeWidth="4" />
            <circle
              cx="48" cy="48" r="40" fill="none"
              stroke={isCompleted ? "#22c55e" : isPartialComplete ? "#06b6d4" : "#f59e0b"}
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
              className="transition-all duration-75"
            />
          </svg>
          <div
            className={`absolute inset-3 rounded-full flex items-center justify-center transition-all ${
              isCompleted
                ? 'bg-gradient-to-b from-green-600 to-green-800'
                : isPartialComplete
                  ? 'bg-gradient-to-b from-cyan-600 to-cyan-800'
                  : holding
                    ? 'bg-gradient-to-b from-amber-600 to-amber-800 scale-95'
                    : 'bg-gradient-to-b from-amber-500 to-amber-700'
            }`}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-8 h-8 text-green-300" />
            ) : isPartialComplete ? (
              <span className="text-cyan-200 text-base font-bold">✓</span>
            ) : (
              <span className="text-white font-bold text-base">{Math.round(progress)}%</span>
            )}
          </div>
        </div>
      </div>
      <div className="text-base text-cyan-400 font-mono mt-2">HOLD</div>
      <div className={`text-base leading-tight text-center mt-1 max-w-32 ${
        isCompleted ? 'text-green-400' : isPartialComplete ? 'text-cyan-400' : isDisabled ? 'text-slate-600' : 'text-slate-400'
      }`}>
        {task.name}
      </div>
    </div>
  );
};

export default HoldButton;
