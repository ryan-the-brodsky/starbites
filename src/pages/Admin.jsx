import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Users, Trophy, Play, Pause, RefreshCw, Download,
  RotateCcw, Clock, Activity, ChevronDown, ChevronUp, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import PasswordGate from './PasswordGate';

const Admin = () => {
  const navigate = useNavigate();
  const { isAdmin, loginAdmin } = useAuth();
  const { allGames, leaderboard, toggleGlobalPause, resetTeamProgress } = useGame();
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showConfirm, setShowConfirm] = useState(null);

  // If not admin, show password gate
  if (!isAdmin) {
    return (
      <PasswordGate
        isAdminGate={true}
        onSuccess={() => {}}
      />
    );
  }

  const teams = Object.values(allGames);

  const handleTogglePause = () => {
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);
    toggleGlobalPause(newPausedState);
  };

  const handleResetTeam = (gameCode) => {
    resetTeamProgress(gameCode);
    setShowConfirm(null);
  };

  const exportCSV = () => {
    const headers = ['Team Name', 'Game Code', 'Current Level', 'Total Score', 'Players', 'Badges'];
    const rows = teams.map(team => [
      team.meta.teamName,
      team.gameCode,
      team.meta.currentLevel,
      team.meta.totalScore,
      Object.keys(team.players || {}).length,
      (team.badges || []).join('; '),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mission-north-star-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusColor = (team) => {
    const lastActive = Math.max(
      ...Object.values(team.players || {}).map(p => p.lastActive || 0)
    );
    const minutesAgo = (Date.now() - lastActive) / 60000;

    if (minutesAgo < 1) return 'bg-green-500';
    if (minutesAgo < 5) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="bg-slate-900/80 border-b border-amber-500/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Shield className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-amber-300">Mission Control</h1>
                <p className="text-slate-500 text-sm">Admin Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Global Pause Toggle */}
              <button
                onClick={handleTogglePause}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isPaused
                    ? 'bg-green-600 hover:bg-green-500 text-white'
                    : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                {isPaused ? (
                  <>
                    <Play className="w-4 h-4" />
                    Resume All
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause All
                  </>
                )}
              </button>

              {/* Export Button */}
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Users}
            label="Total Teams"
            value={teams.length}
            color="text-cyan-400"
          />
          <StatCard
            icon={Activity}
            label="Active Now"
            value={teams.filter(t => {
              const lastActive = Math.max(...Object.values(t.players || {}).map(p => p.lastActive || 0));
              return (Date.now() - lastActive) < 60000;
            }).length}
            color="text-green-400"
          />
          <StatCard
            icon={Trophy}
            label="Completed"
            value={teams.filter(t => t.badges?.length === 4).length}
            color="text-amber-400"
          />
          <StatCard
            icon={Clock}
            label="Average Score"
            value={teams.length > 0
              ? Math.round(teams.reduce((sum, t) => sum + (t.meta.totalScore || 0), 0) / teams.length)
              : 0
            }
            color="text-purple-400"
          />
        </div>

        {/* Pause Alert */}
        {isPaused && (
          <div className="bg-amber-900/50 border border-amber-500 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span className="text-amber-200">
              All games are currently paused. Players see a "Game Paused" overlay.
            </span>
          </div>
        )}

        {/* Teams Table */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold">All Teams</h2>
            <span className="text-slate-500 text-sm">
              {teams.length} team{teams.length !== 1 ? 's' : ''}
            </span>
          </div>

          {teams.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No teams have started yet
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {teams.map(team => (
                <div key={team.gameCode}>
                  {/* Team Row */}
                  <div
                    className="px-6 py-4 flex items-center gap-4 hover:bg-slate-800/50 cursor-pointer"
                    onClick={() => setExpandedTeam(expandedTeam === team.gameCode ? null : team.gameCode)}
                  >
                    {/* Status */}
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(team)}`} />

                    {/* Team Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">{team.meta.teamName}</div>
                      <div className="text-sm text-slate-500 font-mono">{team.gameCode}</div>
                    </div>

                    {/* Level */}
                    <div className="text-center">
                      <div className="text-sm text-slate-500">Level</div>
                      <div className="font-bold text-purple-400">{team.meta.currentLevel}/4</div>
                    </div>

                    {/* Score */}
                    <div className="text-center">
                      <div className="text-sm text-slate-500">Score</div>
                      <div className="font-bold text-cyan-400">{team.meta.totalScore}</div>
                    </div>

                    {/* Players */}
                    <div className="text-center">
                      <div className="text-sm text-slate-500">Players</div>
                      <div className="font-bold text-green-400">
                        {Object.keys(team.players || {}).length}
                      </div>
                    </div>

                    {/* Expand Icon */}
                    {expandedTeam === team.gameCode ? (
                      <ChevronUp className="w-5 h-5 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-500" />
                    )}
                  </div>

                  {/* Expanded Details */}
                  {expandedTeam === team.gameCode && (
                    <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-700">
                      <div className="grid grid-cols-3 gap-6">
                        {/* Level Scores */}
                        <div>
                          <h4 className="text-sm font-medium text-slate-400 mb-2">Level Scores</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Level 1:</span>
                              <span>{team.level1?.score || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Level 2:</span>
                              <span>{team.level2?.score || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Level 3:</span>
                              <span>{team.level3?.score || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Level 4:</span>
                              <span>{team.level4?.score || 0}</span>
                            </div>
                          </div>
                        </div>

                        {/* Badges */}
                        <div>
                          <h4 className="text-sm font-medium text-slate-400 mb-2">Badges</h4>
                          <div className="flex flex-wrap gap-2">
                            {(team.badges || []).length > 0 ? (
                              team.badges.map(badge => (
                                <span
                                  key={badge}
                                  className="bg-amber-900/50 text-amber-300 px-2 py-1 rounded text-xs"
                                >
                                  {badge}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-600 text-sm">None yet</span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div>
                          <h4 className="text-sm font-medium text-slate-400 mb-2">Actions</h4>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowConfirm(team.gameCode);
                              }}
                              className="flex items-center gap-1 bg-red-900/50 hover:bg-red-800/50 text-red-300 px-3 py-1 rounded text-sm"
                            >
                              <RotateCcw className="w-3 h-3" />
                              Reset
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leaderboard Section */}
        <div className="mt-8 bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Leaderboard
            </h2>
          </div>
          <div className="divide-y divide-slate-700">
            {leaderboard.slice(0, 10).map((team, index) => (
              <div key={team.teamName} className="px-6 py-3 flex items-center gap-4">
                <span className={`w-8 text-center font-bold ${
                  index === 0 ? 'text-amber-400' :
                  index === 1 ? 'text-slate-300' :
                  index === 2 ? 'text-orange-400' :
                  'text-slate-500'
                }`}>
                  {index + 1}
                </span>
                <span className="flex-1 text-white">{team.teamName}</span>
                <span className="text-slate-400">Level {team.currentLevel}</span>
                <span className="font-bold text-cyan-400">{team.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirm Reset Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-red-500/50">
            <h3 className="text-xl font-bold text-red-400 mb-4">Reset Team Progress?</h3>
            <p className="text-slate-400 mb-6">
              This will clear all progress for this team. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResetTeam(showConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-500 py-2 rounded-lg"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
    <div className="flex items-center gap-3">
      <Icon className={`w-8 h-8 ${color}`} />
      <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-sm text-slate-500">{label}</div>
      </div>
    </div>
  </div>
);

export default Admin;
