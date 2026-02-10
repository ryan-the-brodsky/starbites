import React, { useState } from 'react';
import { Users } from 'lucide-react';

const PullLever = ({ task, isCompleted, isPartialComplete, isDisabled, needsTeamwork, teamProgress, onActivate }) => {
  const [pulling, setPulling] = useState(false);

  const handleClick = () => {
    if (isCompleted || isDisabled) return;
    setPulling(true);
    setTimeout(() => {
      onActivate();
      setPulling(false);
    }, 300);
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
        <div className="w-20 h-32 bg-gradient-to-b from-slate-600 to-slate-700 rounded border-2 border-slate-500 relative overflow-hidden">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1">
            <div className={`w-2.5 h-2.5 rounded-full ${
              isCompleted ? 'bg-green-500' : isPartialComplete ? 'bg-cyan-500' : 'bg-slate-500'
            }`} />
            <div className={`w-2.5 h-2.5 rounded-full ${!isCompleted && !isPartialComplete ? 'bg-red-500' : 'bg-slate-500'}`} />
          </div>
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-8 transition-all duration-300 ${
              isCompleted || isPartialComplete || pulling ? 'top-16' : 'top-4'
            }`}
          >
            <div className="w-3 h-16 bg-gradient-to-b from-slate-400 to-slate-500 mx-auto rounded" />
            <div className={`w-8 h-5 rounded-full -mt-1 ${
              isCompleted ? 'bg-gradient-to-b from-green-500 to-green-700' :
              isPartialComplete ? 'bg-gradient-to-b from-cyan-500 to-cyan-700' :
              'bg-gradient-to-b from-orange-500 to-orange-700'
            }`} />
          </div>
        </div>
      </div>
      <div className="text-base text-cyan-400 font-mono mt-2">PULL</div>
      <div className={`text-base leading-tight text-center mt-1 max-w-32 ${
        isCompleted ? 'text-green-400' : isPartialComplete ? 'text-cyan-400' : isDisabled ? 'text-slate-600' : 'text-slate-400'
      }`}>
        {task.name}
      </div>
    </div>
  );
};

export default PullLever;
