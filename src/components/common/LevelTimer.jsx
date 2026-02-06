import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const LevelTimer = ({ timer }) => {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!timer?.isActive || !timer.startedAt || !timer.durationMinutes) {
      setRemaining(null);
      return;
    }

    const tick = () => {
      const elapsed = Date.now() - timer.startedAt;
      const totalMs = timer.durationMinutes * 60 * 1000;
      const left = Math.max(0, totalMs - elapsed);
      setRemaining(left);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  if (remaining === null || !timer?.isActive) return null;

  const totalMs = timer.durationMinutes * 60 * 1000;
  const fraction = remaining / totalMs;
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  // Color based on remaining time
  let colorClass = 'text-green-400 border-green-500 bg-green-900/30';
  let barColor = 'bg-green-500';
  if (fraction < 0.1) {
    colorClass = 'text-red-400 border-red-500 bg-red-900/30 animate-pulse';
    barColor = 'bg-red-500';
  } else if (fraction < 0.25) {
    colorClass = 'text-red-400 border-red-500 bg-red-900/30';
    barColor = 'bg-red-500';
  } else if (fraction < 0.5) {
    colorClass = 'text-amber-400 border-amber-500 bg-amber-900/30';
    barColor = 'bg-amber-500';
  }

  return (
    <div className={`fixed top-20 right-4 z-40 rounded-xl border p-3 ${colorClass} shadow-lg`}>
      <div className="flex items-center gap-2 mb-1">
        <Clock className="w-4 h-4" />
        <span className="text-sm font-medium">Level {timer.levelNum}</span>
      </div>
      <div className="text-2xl font-bold font-mono tabular-nums">
        {minutes}:{seconds.toString().padStart(2, '0')}
      </div>
      {/* Progress bar */}
      <div className="w-24 h-1.5 bg-slate-700 rounded-full mt-1 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
          style={{ width: `${fraction * 100}%` }}
        />
      </div>
    </div>
  );
};

export default LevelTimer;
