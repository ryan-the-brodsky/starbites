import React from 'react';
import { Users } from 'lucide-react';

const ToggleSwitch = ({ task, isCompleted, isPartialComplete, isDisabled, needsTeamwork, teamProgress, onActivate }) => {
  const handleClick = () => {
    if (isCompleted || isDisabled) return;
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
        className={`relative cursor-pointer select-none ${isCompleted ? '' : 'hover:scale-105'} transition-transform ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
        onClick={handleClick}
      >
        <div className="w-16 h-28 bg-gradient-to-b from-slate-600 to-slate-700 rounded border-2 border-slate-500 p-1.5 flex flex-col justify-between">
          <div className={`w-3 h-3 rounded-full mx-auto ${
            isCompleted ? 'bg-green-500 shadow-green-500/50 shadow-lg' :
            isPartialComplete ? 'bg-cyan-500 shadow-cyan-500/50 shadow-lg' : 'bg-slate-500'
          }`} />
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-16 bg-slate-800 rounded relative">
              <div
                className={`absolute left-0.5 w-7 h-7 rounded transition-all duration-200 ${
                  isCompleted
                    ? 'top-0.5 bg-gradient-to-b from-green-400 to-green-600'
                    : isPartialComplete
                      ? 'top-0.5 bg-gradient-to-b from-cyan-400 to-cyan-600'
                      : 'top-8 bg-gradient-to-b from-slate-400 to-slate-500'
                }`}
              />
            </div>
          </div>
          <div className={`w-3 h-3 rounded-full mx-auto ${!isCompleted && !isPartialComplete ? 'bg-amber-500' : 'bg-slate-500'}`} />
        </div>
      </div>
      <div className="text-base text-cyan-400 font-mono mt-2">FLIP</div>
      <div className={`text-base leading-tight text-center mt-1 max-w-32 ${
        isCompleted ? 'text-green-400' : isPartialComplete ? 'text-cyan-400' : isDisabled ? 'text-slate-600' : 'text-slate-400'
      }`}>
        {task.name}
      </div>
    </div>
  );
};

export default ToggleSwitch;
