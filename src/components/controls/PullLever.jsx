import React, { useState } from 'react';

const PullLever = ({ task, isCompleted, onActivate }) => {
  const [pulling, setPulling] = useState(false);

  const handleClick = () => {
    if (isCompleted) return;
    setPulling(true);
    setTimeout(() => {
      onActivate();
      setPulling(false);
    }, 300);
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative cursor-pointer select-none ${isCompleted ? 'opacity-60' : ''}`}
        onClick={handleClick}
      >
        <div className="w-14 h-24 bg-gradient-to-b from-slate-600 to-slate-700 rounded border-2 border-slate-500 relative overflow-hidden">
          <div className="absolute top-1 left-1/2 -translate-x-1/2 flex gap-0.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-slate-500'}`} />
            <div className={`w-1.5 h-1.5 rounded-full ${!isCompleted ? 'bg-red-500' : 'bg-slate-500'}`} />
          </div>
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-6 transition-all duration-300 ${
              isCompleted || pulling ? 'top-12' : 'top-3'
            }`}
          >
            <div className="w-2 h-12 bg-gradient-to-b from-slate-400 to-slate-500 mx-auto rounded" />
            <div className={`w-6 h-4 rounded-full -mt-1 ${
              isCompleted ? 'bg-gradient-to-b from-green-500 to-green-700' : 'bg-gradient-to-b from-orange-500 to-orange-700'
            }`} />
          </div>
        </div>
      </div>
      <div className="text-[10px] text-cyan-400 font-mono mt-1">PULL</div>
      <div className={`text-[10px] leading-tight text-center mt-1 max-w-24 ${isCompleted ? 'text-green-400' : 'text-slate-400'}`}>
        {task.name}
      </div>
    </div>
  );
};

export default PullLever;
