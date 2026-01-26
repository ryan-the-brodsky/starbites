import React from 'react';
import { CheckCircle2, ChevronRight } from 'lucide-react';

const LevelComplete = ({ level, score, onContinue }) => {
  const levelNames = {
    1: 'Pretrial Checklist',
    2: 'Sampling Plan',
    3: 'Data Analysis',
    4: 'Mission Report',
  };

  const badges = {
    1: { name: 'Launch Engineer', emoji: '🚀' },
    2: { name: 'Calibration Specialist', emoji: '📊' },
    3: { name: 'Data Analyst', emoji: '📈' },
    4: { name: 'Mission Commander', emoji: '🎖️' },
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border border-green-500/50 p-8 max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12 text-green-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-green-400 mb-2">
          Level {level} Complete!
        </h2>
        <p className="text-slate-400 mb-6">{levelNames[level]}</p>

        {/* Score */}
        <div className="bg-slate-900/50 rounded-xl p-4 mb-6">
          <p className="text-slate-500 text-sm">Level Score</p>
          <p className="text-4xl font-bold text-cyan-400">{score}</p>
        </div>

        {/* Badge Earned */}
        <div className="bg-amber-900/30 border border-amber-500/50 rounded-xl p-4 mb-6">
          <p className="text-amber-300 text-sm mb-2">Badge Earned</p>
          <div className="text-4xl mb-2">{badges[level].emoji}</div>
          <p className="text-white font-medium">{badges[level].name}</p>
        </div>

        {/* Continue Button */}
        {level < 4 ? (
          <button
            onClick={onContinue}
            className="w-full bg-cyan-600 hover:bg-cyan-500 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            Continue to Level {level + 1}
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={onContinue}
            className="w-full bg-amber-600 hover:bg-amber-500 py-3 rounded-lg font-semibold transition-colors"
          >
            View Certificate
          </button>
        )}
      </div>
    </div>
  );
};

export default LevelComplete;
