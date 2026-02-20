import React, { useState, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Rocket, Star, Users, Trophy, BookOpen, LogOut, Menu, X } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { useAuth } from '../../contexts/AuthContext';
import ResourcesPanel from './ResourcesPanel';
import { getPlayerCharacter } from '../../data/characters';

const Leaderboard = lazy(() => import('../../pages/Leaderboard'));

const Header = () => {
  const navigate = useNavigate();
  const { gameState, leaveGame, role, playerId, functionalRole, isConnected, useFirebase } = useGame();
  const { logout } = useAuth();
  const [showResources, setShowResources] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Get player's character
  const character = getPlayerCharacter(playerId, functionalRole);

  const handleLeave = () => {
    leaveGame();
    logout();  // Also logout to return to password screen
    navigate('/');
  };

  const handleLogout = () => {
    leaveGame();
    logout();
    navigate('/');
  };

  const playerCount = gameState?.players ? Object.keys(gameState.players).length : 0;

  return (
    <>
      {/* Offline banner */}
      {useFirebase && !isConnected && (
        <div className="bg-amber-600 text-white text-center py-1.5 px-4 text-sm font-medium sticky top-0 z-50">
          Offline — changes will sync when reconnected
        </div>
      )}
      <header className="bg-slate-900/95 backdrop-blur border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="relative">
                <Rocket className="w-8 h-8 text-cyan-400 transform -rotate-45" />
                <Star className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1" />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-bold text-cyan-300">MISSION NORTH STAR</div>
                <div className="text-[10px] text-slate-500">Joy Bites Training</div>
              </div>
            </Link>

            {/* Game Info (when in game) */}
            {gameState && (
              <div className="flex items-center gap-4">
                {/* Team Name */}
                <div className="hidden md:block bg-slate-800 rounded px-3 py-1 border border-slate-700">
                  <div className="text-[10px] text-slate-500">TEAM</div>
                  <div className="text-sm text-white font-medium">{gameState.meta.teamName}</div>
                </div>

                {/* Game Code */}
                <div className="bg-slate-800 rounded px-3 py-1 border border-slate-700">
                  <div className="text-[10px] text-slate-500">CODE</div>
                  <div className="text-sm text-cyan-400 font-mono font-bold">{gameState.gameCode}</div>
                </div>

                {/* Players */}
                <div className="flex items-center gap-1 bg-slate-800 rounded px-3 py-1 border border-slate-700">
                  <Users className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-white">{playerCount}</span>
                </div>

                {/* Score */}
                <div className="bg-slate-800 rounded px-3 py-1 border border-slate-700">
                  <div className="text-[10px] text-slate-500">SCORE</div>
                  <div className="text-sm text-green-400 font-mono font-bold">{gameState.meta.totalScore}</div>
                </div>

                {/* Level */}
                <div className="hidden sm:block bg-slate-800 rounded px-3 py-1 border border-slate-700">
                  <div className="text-[10px] text-slate-500">LEVEL</div>
                  <div className="text-sm text-purple-400 font-bold">{gameState.meta.currentLevel}/3</div>
                </div>

                {/* Player Identity Badge */}
                {functionalRole && (
                  <div className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-cyan-900/50 to-slate-800 rounded-lg px-3 py-1 border border-cyan-700/50">
                    <span className="text-xl">{character.emoji}</span>
                    <div>
                      <div className="text-xs text-cyan-400 font-medium">{character.name}</div>
                      <div className="text-[10px] text-slate-500">{character.title}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Resources Button */}
              <button
                onClick={() => setShowResources(true)}
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 rounded px-3 py-2 border border-slate-700 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline text-sm text-slate-300">Resources</span>
              </button>

              {/* Leaderboard Button */}
              <button
                onClick={() => setShowLeaderboard(true)}
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 rounded px-3 py-2 border border-slate-700 transition-colors"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline text-sm text-slate-300">Leaderboard</span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="sm:hidden bg-slate-800 hover:bg-slate-700 rounded p-2 border border-slate-700"
              >
                {showMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Leave/Logout (desktop) */}
              <div className="hidden sm:flex items-center gap-2">
                {gameState && (
                  <button
                    onClick={handleLeave}
                    className="flex items-center gap-1 bg-red-900/50 hover:bg-red-800/50 rounded px-3 py-2 border border-red-700 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-red-300">Leave</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMenu && (
            <div className="sm:hidden mt-3 pt-3 border-t border-slate-700 space-y-2">
              {gameState && (
                <>
                  {/* Character Identity on Mobile */}
                  {functionalRole && (
                    <div className="flex items-center gap-3 bg-cyan-900/30 rounded-lg p-2 border border-cyan-700/50 mb-3">
                      <span className="text-2xl">{character.emoji}</span>
                      <div>
                        <div className="text-sm text-cyan-400 font-medium">{character.name}</div>
                        <div className="text-xs text-slate-500">{character.title}</div>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Team:</span>
                    <span className="text-white">{gameState.meta.teamName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Level:</span>
                    <span className="text-purple-400">{gameState.meta.currentLevel}/3</span>
                  </div>
                  <button
                    onClick={handleLeave}
                    className="w-full flex items-center justify-center gap-2 bg-red-900/50 hover:bg-red-800/50 rounded px-3 py-2 border border-red-700"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span className="text-red-300">Leave Mission</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Resources Panel Modal */}
      <ResourcesPanel isOpen={showResources} onClose={() => setShowResources(false)} />

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowLeaderboard(false)} />
          <div className="relative min-h-screen">
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
              </div>
            }>
              <Leaderboard onClose={() => setShowLeaderboard(false)} />
            </Suspense>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
