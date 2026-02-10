import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Star, Users, Plus, LogIn, AlertTriangle } from 'lucide-react';
import { useGame } from '../contexts/GameContext';

const Home = () => {
  const navigate = useNavigate();
  const { createGame, joinGame } = useGame();
  const [mode, setMode] = useState(null); // 'create' or 'join'
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState('');

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      setError('Please enter a team name');
      return;
    }
    try {
      const result = await createGame(teamName.trim());
      if (result.success) {
        navigate(`/game/${result.teamId}`);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error creating team:', err);
      setError('Failed to create team. Please try again.');
    }
  };

  const handleJoinTeam = async () => {
    if (teamName.trim().length < 2) {
      setError('Please enter the team name');
      return;
    }
    try {
      const result = await joinGame(teamName.trim());
      if (result.success) {
        navigate(`/game/${result.teamId}`);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error joining team:', err);
      setError('Failed to join team. Please try again.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'create') {
      handleCreateTeam();
    } else if (mode === 'join') {
      handleJoinTeam();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white p-4 sm:p-6">
      {/* Stars background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(80)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.8 + 0.2
            }}
          />
        ))}
      </div>

      <div className="max-w-lg mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="relative">
              <Rocket className="w-14 h-14 sm:w-20 sm:h-20 text-cyan-400 transform -rotate-45" />
              <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 absolute -top-1 sm:-top-2 -right-1 sm:-right-2 animate-pulse" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            MISSION NORTH STAR
          </h1>
          <p className="text-lg sm:text-xl text-cyan-300">Joy Bites Production Training</p>
          <p className="text-sm sm:text-base text-slate-400 mt-2">A Taste of Home, Even in Orbit</p>
        </div>

        {/* Team Selection */}
        {!mode ? (
          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3"
            >
              <Plus className="w-6 h-6" />
              Create New Team
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3"
            >
              <LogIn className="w-6 h-6" />
              Join Existing Team
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className={`bg-gradient-to-br ${mode === 'create' ? 'from-amber-900/50 to-orange-900/50 border-amber-500' : 'from-cyan-900/50 to-blue-900/50 border-cyan-500'} border-2 rounded-2xl p-4 sm:p-6`}>
              <div className="flex items-center gap-3 mb-4">
                {mode === 'create' ? (
                  <Plus className="w-8 h-8 text-amber-400" />
                ) : (
                  <Users className="w-8 h-8 text-cyan-400" />
                )}
                <div>
                  <h2 className={`text-2xl font-bold ${mode === 'create' ? 'text-amber-300' : 'text-cyan-300'}`}>
                    {mode === 'create' ? 'Create New Team' : 'Join Team'}
                  </h2>
                  <p className="text-slate-400 text-sm">
                    {mode === 'create' ? 'Choose a unique team name' : 'Enter the team name to join'}
                  </p>
                </div>
              </div>

              <input
                type="text"
                placeholder="Enter team name"
                value={teamName}
                onChange={(e) => {
                  setTeamName(e.target.value);
                  setError('');
                }}
                className={`w-full bg-slate-800 border ${mode === 'create' ? 'border-amber-600 focus:border-amber-400' : 'border-cyan-600 focus:border-cyan-400'} rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none text-lg mb-4`}
                autoFocus
              />

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm mb-4">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMode(null);
                    setTeamName('');
                    setError('');
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 py-3 rounded-lg font-semibold transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={teamName.trim().length < 2}
                  className={`flex-1 ${mode === 'create' ? 'bg-amber-600 hover:bg-amber-500' : 'bg-cyan-600 hover:bg-cyan-500'} disabled:bg-slate-600 py-3 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed`}
                >
                  {mode === 'create' ? 'Create Team' : 'Join Team'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Info Section */}
        <div className="mt-6 sm:mt-8 bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-3">How to Play</h3>
          <ol className="text-sm text-slate-400 space-y-2">
            <li><span className="text-cyan-400 font-mono">1.</span> Create a team or join an existing one (up to 12 players per team)</li>
            <li><span className="text-cyan-400 font-mono">2.</span> Work through all 3 mission levels together</li>
            <li><span className="text-cyan-400 font-mono">3.</span> Define success criteria, design sampling plans, and analyze trial data</li>
          </ol>
        </div>

        {/* Game Levels Preview */}
        <div className="mt-4 sm:mt-6 bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-3">Mission Levels</h3>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { num: 1, name: 'Success Criteria', icon: '🎯' },
              { num: 2, name: 'Sampling Plan', icon: '📊' },
              { num: 3, name: 'Mission Report', icon: '📝' },
            ].map(level => (
              <div key={level.num} className="bg-slate-900/50 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">{level.icon}</div>
                <div className="text-xs text-slate-500">Level {level.num}</div>
                <div className="text-sm text-slate-300">{level.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
