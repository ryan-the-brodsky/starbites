import React, { useState, useRef } from 'react';
import { CheckCircle2, Users } from 'lucide-react';

const RotaryDial = ({ task, isCompleted, isPartialComplete, isDisabled, needsTeamwork, teamProgress, onActivate }) => {
  const [rotation, setRotation] = useState(0);
  const clickCountRef = useRef(0);

  const handleClick = () => {
    if (isCompleted || isDisabled) return;
    clickCountRef.current += 1;
    setRotation(clickCountRef.current * 90);

    if (clickCountRef.current >= 3) {
      onActivate();
    }
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
        <div className="w-24 h-24 bg-gradient-to-b from-slate-600 to-slate-700 rounded-lg border-2 border-slate-500 p-1.5">
          <div className="w-full h-full rounded-full bg-slate-800 relative border-2 border-slate-600">
            {[0, 90, 180, 270].map(deg => (
              <div
                key={deg}
                className="absolute w-1 h-2 bg-slate-500 left-1/2 -translate-x-1/2"
                style={{ transform: `rotate(${deg}deg)`, transformOrigin: '50% 400%', top: '3px' }}
              />
            ))}
            <div
              className={`absolute inset-2 rounded-full transition-transform duration-200 ${
                isCompleted ? 'bg-gradient-to-br from-green-600 to-green-800' :
                isPartialComplete ? 'bg-gradient-to-br from-cyan-500 to-cyan-700' :
                'bg-gradient-to-br from-cyan-600 to-cyan-800'
              }`}
              style={{ transform: `rotate(${isCompleted || isPartialComplete ? 270 : rotation}deg)` }}
            >
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-4 bg-white rounded-full" />
            </div>
            {isCompleted && <CheckCircle2 className="absolute inset-0 m-auto w-6 h-6 text-green-300" />}
            {isPartialComplete && !isCompleted && <span className="absolute inset-0 m-auto w-6 h-6 flex items-center justify-center text-cyan-200 text-base font-bold">✓</span>}
          </div>
        </div>
        {/* Click counter indicator */}
        {!isCompleted && !isPartialComplete && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1.5">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${clickCountRef.current >= i ? 'bg-cyan-400' : 'bg-slate-600'}`}
              />
            ))}
          </div>
        )}
      </div>
      <div className="text-base text-cyan-400 font-mono mt-2">TURN ×3</div>
      <div className={`text-base leading-tight text-center mt-1 max-w-32 ${
        isCompleted ? 'text-green-400' : isPartialComplete ? 'text-cyan-400' : isDisabled ? 'text-slate-600' : 'text-slate-400'
      }`}>
        {task.name}
      </div>
    </div>
  );
};

export default RotaryDial;
