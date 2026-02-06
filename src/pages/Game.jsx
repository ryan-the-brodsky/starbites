import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Target, Rocket, FlaskConical, FileText, Lock, CheckCircle2, Shield, ShieldOff, ChevronLeft } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/common/Header';
import RoleSelection from '../components/RoleSelection/RoleSelection';
import CrewIntro from '../components/CrewIntro/CrewIntro';
import SuccessCriteria from '../components/levels/SuccessCriteria/SuccessCriteria';
import Level1 from '../components/levels/Level1/Level1'; // Pretrial Checklist (Level 2)
import LevelTimer from '../components/common/LevelTimer';
import Level2 from '../components/levels/Level2/Level2'; // Sampling Plan (Level 3)
import Level4 from '../components/levels/Level4/Level4'; // Mission Report (Level 4)
import Certificate from '../components/common/Certificate';
import LevelNavigator from '../components/common/LevelNavigator';

// Level information for the level select screen
const levelInfo = [
  { num: 1, name: 'Success Criteria', description: 'Define what success looks like', icon: Target, color: 'cyan' },
  { num: 2, name: 'Pretrial Checklist', description: 'Commander & Crew coordination', icon: Rocket, color: 'orange' },
  { num: 3, name: 'Sampling Plan', description: 'Design your sampling strategy', icon: FlaskConical, color: 'green' },
  { num: 4, name: 'Mission Report', description: 'Transmit final report to HQ', icon: FileText, color: 'amber' },
];

// Color classes for each level
const colorClasses = {
  cyan: { bg: 'bg-cyan-900/30', border: 'border-cyan-500', text: 'text-cyan-400', hoverBg: 'hover:bg-cyan-900/50' },
  orange: { bg: 'bg-orange-900/30', border: 'border-orange-500', text: 'text-orange-400', hoverBg: 'hover:bg-orange-900/50' },
  green: { bg: 'bg-green-900/30', border: 'border-green-500', text: 'text-green-400', hoverBg: 'hover:bg-green-900/50' },
  amber: { bg: 'bg-amber-900/30', border: 'border-amber-500', text: 'text-amber-400', hoverBg: 'hover:bg-amber-900/50' },
};

const LevelSelectScreen = ({ gameState, onSelectLevel, isTestMode, onToggleTestMode }) => {
  const highestUnlocked = gameState?.meta?.highestUnlockedLevel || 1;

  const isCompleted = (levelNum) => {
    return gameState?.[`level${levelNum}`]?.completedAt != null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-cyan-400 mb-2">Mission Levels</h1>
          <p className="text-slate-400">Select a level to view</p>
          <p className="text-sm text-slate-500 mt-2">
            Team: <span className="text-cyan-300">{gameState?.meta?.teamName}</span>
            {' | '}
            Code: <span className="font-mono text-cyan-300">{gameState?.gameCode}</span>
          </p>
        </div>

        {/* Test Mode Toggle */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={onToggleTestMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              isTestMode
                ? 'bg-purple-900/50 border-purple-500 text-purple-300'
                : 'bg-slate-800/50 border-slate-600 text-slate-400 hover:border-slate-500 hover:bg-slate-700/50'
            }`}
          >
            {isTestMode ? (
              <Shield className="w-5 h-5 text-purple-400" />
            ) : (
              <ShieldOff className="w-5 h-5" />
            )}
            <span className="font-medium">{isTestMode ? 'Test Mode ON - All levels unlocked' : 'Enable Test Mode'}</span>
          </button>
        </div>

        {/* Level Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {levelInfo.map((level) => {
            const isUnlocked = isTestMode || level.num <= highestUnlocked;
            const completed = isCompleted(level.num);
            const colors = colorClasses[level.color];
            const Icon = level.icon;

            return (
              <button
                key={level.num}
                onClick={() => isUnlocked && onSelectLevel(level.num)}
                disabled={!isUnlocked}
                className={`relative p-6 rounded-xl border-2 text-left transition-all ${
                  isUnlocked
                    ? `${colors.bg} ${colors.border} ${colors.hoverBg} cursor-pointer`
                    : 'bg-slate-800/50 border-slate-700 cursor-not-allowed opacity-60'
                }`}
              >
                {/* Completed badge */}
                {completed && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  </div>
                )}

                {/* Lock overlay */}
                {!isUnlocked && (
                  <div className="absolute top-3 right-3">
                    <Lock className="w-6 h-6 text-slate-500" />
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${isUnlocked ? colors.bg : 'bg-slate-700'}`}>
                    <Icon className={`w-8 h-8 ${isUnlocked ? colors.text : 'text-slate-500'}`} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Level {level.num}</div>
                    <h3 className={`text-xl font-bold mb-1 ${isUnlocked ? colors.text : 'text-slate-500'}`}>
                      {level.name}
                    </h3>
                    <p className="text-sm text-slate-400">{level.description}</p>
                    {completed && (
                      <p className="text-xs text-green-400 mt-2">
                        Score: {gameState?.[`level${level.num}`]?.score || 0} pts
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Total Score */}
        <div className="mt-8 text-center">
          <div className="inline-block bg-slate-800/50 rounded-xl px-8 py-4 border border-slate-700">
            <div className="text-sm text-slate-400">Total Score</div>
            <div className="text-3xl font-bold text-cyan-400">{gameState?.meta?.totalScore || 0} PTS</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Back to Level Select button component
const BackToLevelSelect = ({ onBack }) => (
  <button
    onClick={onBack}
    className="fixed bottom-4 left-4 z-40 flex items-center gap-2 px-4 py-2 bg-slate-800/90 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-300 text-sm transition-all hover:scale-105"
  >
    <ChevronLeft className="w-4 h-4" />
    Level Select
  </button>
);

const Game = () => {
  const { gameCode } = useParams();
  const navigate = useNavigate();
  const { gameState, joinGame, isInGame, gameStarted } = useGame();
  const { isTestMode, toggleTestMode } = useAuth();

  // Local state for which level THIS player is viewing
  // This is independent of other players
  const [playerViewLevel, setPlayerViewLevel] = useState(0);

  // Track if player has seen the crew intro
  const [hasSeenCrewIntro, setHasSeenCrewIntro] = useState(false);

  // Join game if not already in one
  useEffect(() => {
    if (!isInGame && gameCode) {
      joinGame(gameCode);
    }
  }, [gameCode, isInGame, joinGame]);

  // Redirect if no game state
  useEffect(() => {
    if (!gameState && !gameCode) {
      navigate('/');
    }
  }, [gameState, gameCode, navigate]);

  // Load saved view level and crew intro state from localStorage on mount
  useEffect(() => {
    const savedLevel = localStorage.getItem(`joybites_view_level_${gameCode}`);
    if (savedLevel) {
      setPlayerViewLevel(parseInt(savedLevel, 10));
    }
    const seenIntro = localStorage.getItem(`joybites_seen_intro_${gameCode}`);
    if (seenIntro === 'true') {
      setHasSeenCrewIntro(true);
    }
  }, [gameCode]);

  // Handler for continuing past crew intro
  const handleCrewIntroContinue = () => {
    setHasSeenCrewIntro(true);
    localStorage.setItem(`joybites_seen_intro_${gameCode}`, 'true');
  };

  // Handler for selecting a level to view (also handles 0 for level select screen)
  const handleSelectLevel = (levelNum) => {
    setPlayerViewLevel(levelNum);
    localStorage.setItem(`joybites_view_level_${gameCode}`, levelNum.toString());
  };

  // Handler for going back to level select
  const handleBackToLevelSelect = () => {
    setPlayerViewLevel(0);
    localStorage.setItem(`joybites_view_level_${gameCode}`, '0');
  };

  if (!gameState) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Connecting to mission...</p>
        </div>
      </div>
    );
  }

  // Show paused overlay
  if (gameState.meta?.isPaused) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="text-center bg-slate-800 rounded-xl p-8 border border-amber-500">
            <div className="text-4xl mb-4">⏸️</div>
            <h2 className="text-2xl font-bold text-amber-400 mb-2">Mission Paused</h2>
            <p className="text-slate-400">
              Waiting for Mission Control to resume...
            </p>
          </div>
        </div>
      </>
    );
  }

  // Check if all levels complete - show certificate (4 badges)
  const badges = gameState.badges || [];
  const allLevelsComplete = badges.length === 4;
  if (allLevelsComplete) {
    return (
      <>
        <Header />
        <Certificate />
      </>
    );
  }

  // Show role selection if game hasn't started yet
  if (!gameStarted) {
    return (
      <>
        <Header />
        <RoleSelection />
      </>
    );
  }

  // Show crew intro after game starts (once per player per game)
  if (!hasSeenCrewIntro) {
    return <CrewIntro onContinue={handleCrewIntroContinue} />;
  }

  // Use player's local view level (independent navigation)
  const currentViewLevel = playerViewLevel;

  // Level 0 = show level select screen
  if (currentViewLevel === 0) {
    return (
      <>
        <Header />
        <LevelSelectScreen
          gameState={gameState}
          onSelectLevel={handleSelectLevel}
          isTestMode={isTestMode}
          onToggleTestMode={toggleTestMode}
        />
      </>
    );
  }

  // Check if this level is unlocked (for safety)
  const highestUnlocked = gameState.meta?.highestUnlockedLevel || 1;
  const isLevelUnlocked = isTestMode || currentViewLevel <= highestUnlocked;

  if (!isLevelUnlocked) {
    // If they somehow navigated to a locked level, send them back
    handleBackToLevelSelect();
    return null;
  }

  return (
    <>
      <Header />
      {/* Level Navigator - always show when in a level */}
      <LevelNavigator onNavigateToLevel={handleSelectLevel} />
      {/* Timer display */}
      <LevelTimer timer={gameState.meta?.timer} />
      {/* Back to Level Select button */}
      <BackToLevelSelect onBack={handleBackToLevelSelect} />
      <main>
        {currentViewLevel === 1 && <SuccessCriteria onNavigateToLevel={handleSelectLevel} />}
        {currentViewLevel === 2 && <Level1 onNavigateToLevel={handleSelectLevel} />}
        {currentViewLevel === 3 && <Level2 onNavigateToLevel={handleSelectLevel} />}
        {currentViewLevel === 4 && <Level4 onNavigateToLevel={handleSelectLevel} />}
      </main>
    </>
  );
};

export default Game;
