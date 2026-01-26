import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

const PushButton = ({ task, isCompleted, onActivate }) => {
  const [pressed, setPressed] = useState(false);

  const handleClick = () => {
    if (isCompleted) return;
    setPressed(true);
    setTimeout(() => setPressed(false), 150);
    onActivate();
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative cursor-pointer select-none ${isCompleted ? 'opacity-60' : ''}`}
        onClick={handleClick}
      >
        <div className="absolute inset-0 top-2 bg-slate-950 rounded-full" />
        <div
          className={`relative w-16 h-16 rounded-full border-4 transition-all duration-100 flex items-center justify-center
            ${isCompleted
              ? 'bg-green-700 border-green-500 translate-y-2'
              : pressed
                ? 'bg-red-700 border-red-400 translate-y-2'
                : 'bg-gradient-to-b from-red-500 to-red-700 border-red-400 hover:from-red-400 hover:to-red-600'
            }`}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-6 h-6 text-green-300" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-red-400/30 border-2 border-red-300/50" />
          )}
        </div>
      </div>
      <div className="text-[10px] text-cyan-400 font-mono mt-1">PUSH</div>
      <div className={`text-[10px] leading-tight text-center mt-1 max-w-24 ${isCompleted ? 'text-green-400' : 'text-slate-400'}`}>
        {task.name}
      </div>
    </div>
  );
};

export default PushButton;
