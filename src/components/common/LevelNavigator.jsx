import React from 'react';
import { Target, Rocket, FlaskConical, FileText, Lock, CheckCircle2, Home, Shield, ShieldOff } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { useAuth } from '../../contexts/AuthContext';

const levelInfo = [
  { num: 1, name: 'Success Criteria', shortName: 'Criteria', icon: Target },
  { num: 2, name: 'Pretrial Checklist', shortName: 'Checklist', icon: Rocket },
  { num: 3, name: 'Sampling Plan', shortName: 'Sampling', icon: FlaskConical },
  { num: 4, name: 'Mission Report', shortName: 'Report', icon: FileText },
];

// Map level numbers to explicit Tailwind classes
const activeClasses = {
  1: 'bg-cyan-900/50 border-cyan-500 text-cyan-300',
  2: 'bg-orange-900/50 border-orange-500 text-orange-300',
  3: 'bg-green-900/50 border-green-500 text-green-300',
  4: 'bg-amber-900/50 border-amber-500 text-amber-300',
};

const activeIconClasses = {
  1: 'text-cyan-400',
  2: 'text-orange-400',
  3: 'text-green-400',
  4: 'text-amber-400',
};

const activeDotClasses = {
  1: 'bg-cyan-400',
  2: 'bg-orange-400',
  3: 'bg-green-400',
  4: 'bg-amber-400',
};

const LevelNavigator = () => {
  const { gameState, navigateToLevel } = useGame();
  const { isTestMode, toggleTestMode } = useAuth();
  const currentLevel = gameState?.meta?.currentLevel || 1;
  const highestUnlocked = gameState?.meta?.highestUnlockedLevel || 1;

  const isCompleted = (levelNum) => {
    return gameState?.[`level${levelNum}`]?.completedAt != null;
  };

  return (
    <div className="bg-slate-900/80 border-b border-slate-800 px-4 py-3">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
          {/* Back to Level Select Button */}
          <button
            onClick={() => navigateToLevel(0)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-slate-800/50 border-slate-600 text-slate-400 cursor-pointer hover:border-slate-500 hover:bg-slate-700/50 transition-all flex-shrink-0"
          >
            <Home className="w-4 h-4" />
            <span className="text-sm font-medium">Levels</span>
          </button>

          {/* Level Buttons */}
          <div className="flex items-center gap-2">
            {levelInfo.map((level) => {
              const isActive = currentLevel === level.num;
              const isUnlocked = isTestMode || level.num <= highestUnlocked; // Test mode unlocks all levels
              const completed = isCompleted(level.num);
              const Icon = level.icon;

              let buttonClasses = 'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all flex-shrink-0 ';
              if (isActive) {
                buttonClasses += activeClasses[level.num];
              } else if (!isUnlocked) {
                buttonClasses += 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed';
              } else if (completed) {
                buttonClasses += 'bg-green-900/30 border-green-600 text-green-400 cursor-pointer hover:bg-green-900/50';
              } else {
                buttonClasses += 'bg-slate-800/50 border-slate-600 text-slate-400 cursor-pointer hover:border-slate-500 hover:bg-slate-700/50';
              }

              return (
                <button
                  key={level.num}
                  onClick={() => isUnlocked && navigateToLevel(level.num, isTestMode)}
                  disabled={!isUnlocked}
                  className={buttonClasses}
                >
                  <div className="relative">
                    {!isUnlocked ? (
                      <Lock className="w-4 h-4" />
                    ) : completed && !isActive ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <Icon className={`w-4 h-4 ${isActive ? activeIconClasses[level.num] : ''}`} />
                    )}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs opacity-60">Level {level.num}</span>
                    <span className="text-sm font-medium whitespace-nowrap">{level.shortName}</span>
                  </div>
                  {isActive && (
                    <div className={`w-2 h-2 rounded-full animate-pulse ${activeDotClasses[level.num]}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Test Mode Toggle */}
          <button
            onClick={toggleTestMode}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all flex-shrink-0 ${
              isTestMode
                ? 'bg-purple-900/50 border-purple-500 text-purple-300'
                : 'bg-slate-800/50 border-slate-600 text-slate-400 hover:border-slate-500 hover:bg-slate-700/50'
            }`}
            title={isTestMode ? 'Test Mode ON - All levels unlocked' : 'Enable Test Mode'}
          >
            {isTestMode ? (
              <Shield className="w-4 h-4 text-purple-400" />
            ) : (
              <ShieldOff className="w-4 h-4" />
            )}
            <span className="text-xs font-medium">{isTestMode ? 'TEST' : 'Test'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelNavigator;
