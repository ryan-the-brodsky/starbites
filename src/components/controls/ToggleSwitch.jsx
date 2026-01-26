import React from 'react';

const ToggleSwitch = ({ task, isCompleted, onActivate }) => {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative cursor-pointer select-none ${isCompleted ? '' : 'hover:scale-105'} transition-transform`}
        onClick={() => !isCompleted && onActivate()}
      >
        <div className="w-12 h-20 bg-gradient-to-b from-slate-600 to-slate-700 rounded border-2 border-slate-500 p-1 flex flex-col justify-between">
          <div className={`w-2 h-2 rounded-full mx-auto ${isCompleted ? 'bg-green-500 shadow-green-500/50 shadow-lg' : 'bg-slate-500'}`} />
          <div className="flex-1 flex items-center justify-center">
            <div className="w-6 h-12 bg-slate-800 rounded relative">
              <div
                className={`absolute left-0.5 w-5 h-5 rounded transition-all duration-200 ${
                  isCompleted
                    ? 'top-0.5 bg-gradient-to-b from-green-400 to-green-600'
                    : 'top-6 bg-gradient-to-b from-slate-400 to-slate-500'
                }`}
              />
            </div>
          </div>
          <div className={`w-2 h-2 rounded-full mx-auto ${!isCompleted ? 'bg-amber-500' : 'bg-slate-500'}`} />
        </div>
      </div>
      <div className="text-[10px] text-cyan-400 font-mono mt-1">FLIP</div>
      <div className={`text-[10px] leading-tight text-center mt-1 max-w-24 ${isCompleted ? 'text-green-400' : 'text-slate-400'}`}>
        {task.name}
      </div>
    </div>
  );
};

export default ToggleSwitch;
