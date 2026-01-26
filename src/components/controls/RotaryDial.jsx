import React, { useState, useRef } from 'react';
import { CheckCircle2 } from 'lucide-react';

const RotaryDial = ({ task, isCompleted, onActivate }) => {
  const [rotation, setRotation] = useState(0);
  const clickCountRef = useRef(0);

  const handleClick = () => {
    if (isCompleted) return;
    clickCountRef.current += 1;
    setRotation(clickCountRef.current * 90);

    if (clickCountRef.current >= 3) {
      onActivate();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative cursor-pointer select-none ${isCompleted ? 'opacity-60' : ''}`}
        onClick={handleClick}
      >
        <div className="w-16 h-16 bg-gradient-to-b from-slate-600 to-slate-700 rounded-lg border-2 border-slate-500 p-1">
          <div className="w-full h-full rounded-full bg-slate-800 relative border-2 border-slate-600">
            {[0, 90, 180, 270].map(deg => (
              <div
                key={deg}
                className="absolute w-0.5 h-1.5 bg-slate-500 left-1/2 -translate-x-1/2"
                style={{ transform: `rotate(${deg}deg)`, transformOrigin: '50% 400%', top: '2px' }}
              />
            ))}
            <div
              className={`absolute inset-1.5 rounded-full transition-transform duration-200 ${
                isCompleted ? 'bg-gradient-to-br from-green-600 to-green-800' : 'bg-gradient-to-br from-cyan-600 to-cyan-800'
              }`}
              style={{ transform: `rotate(${isCompleted ? 270 : rotation}deg)` }}
            >
              <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-2.5 bg-white rounded-full" />
            </div>
            {isCompleted && <CheckCircle2 className="absolute inset-0 m-auto w-4 h-4 text-green-300" />}
          </div>
        </div>
        {/* Click counter indicator */}
        {!isCompleted && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${clickCountRef.current >= i ? 'bg-cyan-400' : 'bg-slate-600'}`}
              />
            ))}
          </div>
        )}
      </div>
      <div className="text-[10px] text-cyan-400 font-mono mt-2">TURN ×3</div>
      <div className={`text-[10px] leading-tight text-center mt-1 max-w-24 ${isCompleted ? 'text-green-400' : 'text-slate-400'}`}>
        {task.name}
      </div>
    </div>
  );
};

export default RotaryDial;
