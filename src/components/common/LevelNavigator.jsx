import React from 'react';
import { Target, FlaskConical, FileText, Lock, CheckCircle2, Home, Shield, ShieldOff } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { useAuth } from '../../contexts/AuthContext';

const levelInfo = [
  { num: 1, name: 'Success Criteria', shortName: 'Criteria', icon: Target },
  { num: 2, name: 'Sampling Plan', shortName: 'Sampling', icon: FlaskConical },
  { num: 3, name: 'Mission Report', shortName: 'Report', icon: FileText },
];

// Map level numbers to explicit Tailwind classes
const activeClasses = {
  1: 'bg-cyan-900/50 border-cyan-500 text-cyan-300',
  2: 'bg-green-900/50 border-green-500 text-green-300',
  3: 'bg-amber-900/50 border-amber-500 text-amber-300',
};

const activeIconClasses = {
  1: 'text-cyan-400',
  2: 'text-green-400',
  3: 'text-amber-400',
};

const activeDotClasses = {
  1: 'bg-cyan-400',
  2: 'bg-green-400',
  3: 'bg-amber-400',
};

const LevelNavigator = ({ onNavigateToLevel }) => {
  const { gameState } = useGame();
  const { isTestMode, toggleTestMode } = useAuth();
  const highestUnlocked = gameState?.meta?.highestUnlockedLevel || 1;

  // Read the current view level from localStorage to highlight the active button
  const gameCode = gameState?.gameCode;
  const currentViewLevel = (() => {
    try {
      const saved = localStorage.getItem(`joybites_view_level_${gameCode}`);
      return saved ? parseInt(saved, 10) : (gameState?.meta?.currentLevel || 1);
    } catch {
      return gameState?.meta?.currentLevel || 1;
    }
  })();

  const isCompleted = (levelNum) => {
    return gameState?.[`level${levelNum}`]?.completedAt != null;
  };

  const handleNavigate = (levelNum) => {
    if (onNavigateToLevel) {
      onNavigateToLevel(levelNum);
    }
  };

  return (
    <div className="bg-slate-900/80 border-b border-slate-800 px-2 sm:px-4 py-2 sm:py-3">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto pb-1">
          {/* Back to Level Select Button */}
          <button
            onClick={() => handleNavigate(0)}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border bg-slate-800/50 border-slate-600 text-slate-400 cursor-pointer hover:border-slate-500 hover:bg-slate-700/50 transition-all flex-shrink-0"
          >
            <Home className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-medium">Levels</span>
          </button>

          {/* Level Buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {levelInfo.map((level) => {
              const isActive = currentViewLevel === level.num;
              const isUnlocked = isTestMode || level.num <= highestUnlocked; // Test mode unlocks all levels
              const completed = isCompleted(level.num);
              const Icon = level.icon;

              let buttonClasses = 'flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border transition-all flex-shrink-0 ';
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
                  onClick={() => isUnlocked && handleNavigate(level.num)}
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
                    <span className="text-[10px] sm:text-xs opacity-60">L{level.num}</span>
                    <span className="text-xs sm:text-sm font-medium whitespace-nowrap">{level.shortName}</span>
                    {/* Show confirmation fraction for Level 1 */}
                    {level.num === 1 && !completed && (() => {
                      const roleSelections = gameState?.level1?.roleSelections || {};
                      const totalPlayers = Object.keys(gameState?.players || {}).filter(
                        pid => gameState?.players?.[pid]?.functionalRole
                      ).length;
                      const confirmedCount = Object.values(roleSelections).reduce(
                        (sum, r) => sum + (r.confirmedBy?.length || 0), 0
                      );
                      if (totalPlayers === 0) return null;
                      return (
                        <span className="text-[10px] text-slate-500">
                          {confirmedCount}/{totalPlayers}
                        </span>
                      );
                    })()}
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
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border transition-all flex-shrink-0 ${
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
