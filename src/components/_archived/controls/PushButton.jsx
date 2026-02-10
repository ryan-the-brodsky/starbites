import React, { useState } from 'react';
import { CheckCircle2, Users } from 'lucide-react';

const PushButton = ({ task, isCompleted, isPartialComplete, isDisabled, needsTeamwork, teamProgress, onActivate }) => {
  const [pressed, setPressed] = useState(false);

  const handleClick = () => {
    if (isCompleted || isDisabled) return;
    setPressed(true);
    setTimeout(() => setPressed(false), 150);
    onActivate();
  };

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
        onClick={handleClick}
      >
        <div className="absolute inset-0 top-2 bg-slate-950 rounded-full" />
        <div
          className={`relative w-24 h-24 rounded-full border-4 transition-all duration-100 flex items-center justify-center
            ${isCompleted
              ? 'bg-green-700 border-green-500 translate-y-2'
              : isPartialComplete
                ? 'bg-cyan-700 border-cyan-500 translate-y-1'
                : isDisabled
                  ? 'bg-slate-700 border-slate-500'
                  : pressed
                    ? 'bg-red-700 border-red-400 translate-y-2'
                    : 'bg-gradient-to-b from-red-500 to-red-700 border-red-400 hover:from-red-400 hover:to-red-600'
            }`}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-8 h-8 text-green-300" />
          ) : isPartialComplete ? (
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-cyan-200 text-base font-bold">✓</span>
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-red-400/30 border-2 border-red-300/50" />
          )}
        </div>
      </div>
      <div className="text-base text-cyan-400 font-mono mt-2">PUSH</div>
      <div className={`text-base leading-tight text-center mt-1 max-w-32 ${
        isCompleted ? 'text-green-400' : isPartialComplete ? 'text-cyan-400' : isDisabled ? 'text-slate-600' : 'text-slate-400'
      }`}>
        {task.name}
      </div>
    </div>
  );
};

export default PushButton;
