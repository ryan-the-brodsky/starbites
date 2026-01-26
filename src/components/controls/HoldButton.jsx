import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

const HoldButton = ({ task, isCompleted, onActivate }) => {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const intervalRef = useRef(null);
  const progressRef = useRef(0);

  const startHold = (e) => {
    e.preventDefault();
    if (isCompleted) return;
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
    if (progressRef.current < 100 && !isCompleted) {
      progressRef.current = 0;
      setProgress(0);
    }
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  // Reset progress display when task completes
  useEffect(() => {
    if (isCompleted) {
      setProgress(100);
    }
  }, [isCompleted]);

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative cursor-pointer select-none ${isCompleted ? 'opacity-60' : ''}`}
        onMouseDown={startHold}
        onMouseUp={endHold}
        onMouseLeave={endHold}
        onTouchStart={startHold}
        onTouchEnd={endHold}
      >
        <div className="w-16 h-16 bg-gradient-to-b from-slate-600 to-slate-700 rounded-lg border-2 border-slate-500 p-1 relative">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="32" cy="32" r="26" fill="none" stroke="#334155" strokeWidth="3" />
            <circle
              cx="32" cy="32" r="26" fill="none"
              stroke={isCompleted ? "#22c55e" : "#f59e0b"}
              strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 26}`}
              strokeDashoffset={`${2 * Math.PI * 26 * (1 - progress / 100)}`}
              className="transition-all duration-75"
            />
          </svg>
          <div
            className={`absolute inset-2 rounded-full flex items-center justify-center transition-all ${
              isCompleted
                ? 'bg-gradient-to-b from-green-600 to-green-800'
                : holding
                  ? 'bg-gradient-to-b from-amber-600 to-amber-800 scale-95'
                  : 'bg-gradient-to-b from-amber-500 to-amber-700'
            }`}
          >
            {isCompleted ? <CheckCircle2 className="w-5 h-5 text-green-300" /> : (
              <span className="text-white font-bold text-xs">{Math.round(progress)}%</span>
            )}
          </div>
        </div>
      </div>
      <div className="text-[10px] text-cyan-400 font-mono mt-1">HOLD</div>
      <div className={`text-[10px] leading-tight text-center mt-1 max-w-24 ${isCompleted ? 'text-green-400' : 'text-slate-400'}`}>
        {task.name}
      </div>
    </div>
  );
};

export default HoldButton;
