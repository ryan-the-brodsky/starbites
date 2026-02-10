import React, { useState, useMemo, useEffect } from 'react';
import {
  Shield, Users, Trophy, Play, Pause, RefreshCw, Download,
  RotateCcw, Clock, Activity, ChevronDown, ChevronUp, AlertTriangle,
  Monitor, Timer, FastForward, Plus, Trash2
} from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import ProjectorView from '../components/admin/ProjectorView';
import BatchTeamCreation from '../components/admin/BatchTeamCreation';
import ExportPanel from '../components/admin/ExportPanel';
import { LEVEL_TIMES } from '../config/levelConfig';

const Admin = () => {
  const {
    allGames, leaderboard, useFirebase,
    toggleGlobalPause, resetTeamProgress, restoreTeam,
    deleteAllTeams, advanceAllTeams, setGlobalTimer
  } = useAdmin();

  const [expandedTeam, setExpandedTeam] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showConfirm, setShowConfirm] = useState(null);
  const [undoState, setUndoState] = useState(null);
  const [showProjector, setShowProjector] = useState(false);
  const [showBatchCreate, setShowBatchCreate] = useState(false);
  const [timerLevel, setTimerLevel] = useState(null); // Active timer level
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  const teams = useMemo(() => Object.values(allGames), [allGames]);

  // Refresh time-dependent stats every 30 seconds
  const [, setRefreshTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setRefreshTick(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  // Memoized stats
  const activeTeamsCount = useMemo(() => {
    return teams.filter(t => {
      const players = Object.values(t.players || {});
      if (players.length === 0) return false;
      const lastActive = Math.max(...players.map(p => p.lastActive || 0));
      return (Date.now() - lastActive) < 60000;
    }).length;
  }, [teams]);

  const averageScore = useMemo(() => {
    if (teams.length === 0) return 0;
    return Math.round(teams.reduce((sum, t) => sum + (t.meta?.totalScore || 0), 0) / teams.length);
  }, [teams]);

  // Teams grouped by level for facilitator view
  const teamsByLevel = useMemo(() => {
    const grouped = { 0: [], 1: [], 2: [], 3: [], 4: [] };
    teams.forEach(t => {
      const lvl = t.meta?.currentLevel || 0;
      if (grouped[lvl]) grouped[lvl].push(t);
      else grouped[0].push(t);
    });
    return grouped;
  }, [teams]);

  const handleTogglePause = () => {
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);
    toggleGlobalPause(newPausedState);
  };

  const handleResetTeam = async (gameCode) => {
    const preResetState = await resetTeamProgress(gameCode);
    setShowConfirm(null);

    if (undoState?.timeoutId) {
      clearTimeout(undoState.timeoutId);
    }

    const timeoutId = setTimeout(() => {
      setUndoState(null);
    }, 10000);

    setUndoState({ gameCode, preResetState, timeoutId });
  };

  const handleUndo = async () => {
    if (!undoState) return;
    if (undoState.timeoutId) clearTimeout(undoState.timeoutId);
    await restoreTeam(undoState.gameCode, undoState.preResetState);
    setUndoState(null);
  };

  const handleStartTimer = async (levelNum) => {
    const duration = LEVEL_TIMES[levelNum]?.suggestedMinutes || 15;
    await setGlobalTimer(levelNum, duration);
    setTimerLevel(levelNum);
  };

  const handleStopTimer = async () => {
    await setGlobalTimer(null, null);
    setTimerLevel(null);
  };

  const handleAdvanceAll = async (targetLevel) => {
    await advanceAllTeams(targetLevel);
  };

  const handleDeleteAllTeams = async () => {
    await deleteAllTeams();
    setShowDeleteAllConfirm(false);
  };

  const getStatusColor = (team) => {
    const players = Object.values(team.players || {});
    if (players.length === 0) return 'bg-slate-500';
    const lastActive = Math.max(...players.map(p => p.lastActive || 0));
    const minutesAgo = (Date.now() - lastActive) / 60000;
    if (minutesAgo < 1) return 'bg-green-500';
    if (minutesAgo < 5) return 'bg-amber-500';
    return 'bg-red-500';
  };

  // Projector mode
  if (showProjector) {
    return (
      <ProjectorView
        allGames={allGames}
        leaderboard={leaderboard}
        onClose={() => setShowProjector(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="bg-slate-900/80 border-b border-amber-500/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Shield className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-amber-300">Mission Control</h1>
                <p className="text-slate-500 text-sm">Admin Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Projector Mode */}
              <button
                onClick={() => setShowProjector(true)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Monitor className="w-4 h-4" />
                Projector
              </button>

              {/* Global Pause */}
              <button
                onClick={handleTogglePause}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isPaused
                    ? 'bg-green-600 hover:bg-green-500 text-white'
                    : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                {isPaused ? (
                  <><Play className="w-4 h-4" /> Resume All</>
                ) : (
                  <><Pause className="w-4 h-4" /> Pause All</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Users} label="Total Teams" value={teams.length} color="text-cyan-400" />
          <StatCard icon={Activity} label="Active Now" value={activeTeamsCount} color="text-green-400" />
          <StatCard icon={Trophy} label="Completed" value={teams.filter(t => (t.badges?.length || 0) === 3).length} color="text-amber-400" />
          <StatCard icon={Clock} label="Average Score" value={averageScore} color="text-purple-400" />
        </div>

        {/* Pause Alert */}
        {isPaused && (
          <div className="bg-amber-900/50 border border-amber-500 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span className="text-amber-200">
              All games are currently paused. Players see a &quot;Game Paused&quot; overlay.
            </span>
          </div>
        )}

        {/* Timer & Advance Controls */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 mb-6">
          <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
            <Timer className="w-4 h-4 text-cyan-400" />
            Timer & Pacing Controls
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[1, 2, 3, 4].map(lvl => (
              <div key={lvl} className="flex flex-col gap-2">
                <div className="text-xs text-slate-400 text-center">
                  Level {lvl}: {LEVEL_TIMES[lvl]?.name} ({LEVEL_TIMES[lvl]?.suggestedMinutes}min)
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleStartTimer(lvl)}
                    disabled={timerLevel === lvl}
                    className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                      timerLevel === lvl
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                    }`}
                  >
                    <Timer className="w-3 h-3" />
                    {timerLevel === lvl ? 'Running' : 'Start'}
                  </button>
                  <button
                    onClick={() => handleAdvanceAll(lvl)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium bg-cyan-900/50 hover:bg-cyan-800/50 text-cyan-300 transition-colors"
                  >
                    <FastForward className="w-3 h-3" />
                    Unlock
                  </button>
                </div>
              </div>
            ))}
          </div>
          {timerLevel && (
            <button
              onClick={handleStopTimer}
              className="flex items-center gap-2 bg-red-900/50 hover:bg-red-800/50 text-red-300 px-3 py-1.5 rounded text-sm"
            >
              Stop Timer
            </button>
          )}
        </div>

        {/* Facilitator Dashboard - Team Grid */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 mb-6">
          <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-green-400" />
            Facilitator View - Teams by Level
          </h3>
          <div className="space-y-4">
            {[0, 1, 2, 3, 4].map(lvl => {
              const lvlTeams = teamsByLevel[lvl] || [];
              if (lvlTeams.length === 0) return null;
              const levelLabel = lvl === 0 ? 'Not Started' : `Level ${lvl}: ${LEVEL_TIMES[lvl]?.name || ''}`;
              return (
                <div key={lvl}>
                  <div className="text-xs text-slate-500 mb-2">
                    {levelLabel} ({lvlTeams.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {lvlTeams.map(team => (
                      <div
                        key={team.gameCode}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-600"
                      >
                        <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(team)}`} />
                        <span className="text-sm font-medium text-white truncate max-w-[120px]">
                          {team.meta?.teamName}
                        </span>
                        <span className="text-xs text-cyan-400">{team.meta?.totalScore || 0}</span>
                        <span className="text-xs text-slate-500">
                          {Object.keys(team.players || {}).length}p
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Batch Team Creation */}
        {showBatchCreate ? (
          <div className="mb-6">
            <BatchTeamCreation useFirebase={useFirebase} onTeamsCreated={() => {}} />
            <button
              onClick={() => setShowBatchCreate(false)}
              className="mt-2 text-sm text-slate-500 hover:text-slate-400"
            >
              Hide batch creation
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setShowBatchCreate(true)}
              className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 px-4 py-2 rounded-lg text-sm text-slate-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Batch Create Teams
            </button>

            {teams.length > 0 && !showDeleteAllConfirm && (
              <button
                onClick={() => setShowDeleteAllConfirm(true)}
                className="flex items-center gap-2 bg-red-900/30 hover:bg-red-900/50 border border-red-700 px-4 py-2 rounded-lg text-sm text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete All Teams
              </button>
            )}

            {showDeleteAllConfirm && (
              <div className="flex items-center gap-2 bg-red-900/50 border border-red-500 rounded-lg px-4 py-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-300">Delete all {teams.length} teams?</span>
                <button
                  onClick={handleDeleteAllTeams}
                  className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-sm font-medium"
                >
                  Yes, Delete All
                </button>
                <button
                  onClick={() => setShowDeleteAllConfirm(false)}
                  className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* Teams Table */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden mb-6">
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
                  <div
                    className="px-6 py-4 flex items-center gap-4 hover:bg-slate-800/50 cursor-pointer"
                    onClick={() => setExpandedTeam(expandedTeam === team.gameCode ? null : team.gameCode)}
                  >
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(team)}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">{team.meta?.teamName}</div>
                      <div className="text-sm text-slate-500 font-mono">{team.gameCode}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-slate-500">Level</div>
                      <div className="font-bold text-purple-400">{team.meta?.currentLevel || 0}/3</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-slate-500">Score</div>
                      <div className="font-bold text-cyan-400">{team.meta?.totalScore || 0}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-slate-500">Players</div>
                      <div className="font-bold text-green-400">
                        {Object.keys(team.players || {}).length}
                      </div>
                    </div>
                    {expandedTeam === team.gameCode ? (
                      <ChevronUp className="w-5 h-5 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-500" />
                    )}
                  </div>

                  {expandedTeam === team.gameCode && (
                    <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-700">
                      <div className="grid grid-cols-3 gap-6">
                        <div>
                          <h4 className="text-sm font-medium text-slate-400 mb-2">Level Scores</h4>
                          <div className="space-y-1 text-sm">
                            {[1, 2, 3, 4].map(lvl => (
                              <div key={lvl} className="flex justify-between">
                                <span className="text-slate-500">Level {lvl}:</span>
                                <span>{team[`level${lvl}`]?.score || 0}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-slate-400 mb-2">Badges</h4>
                          <div className="flex flex-wrap gap-2">
                            {(team.badges || []).length > 0 ? (
                              team.badges.map(badge => (
                                <span key={badge} className="bg-amber-900/50 text-amber-300 px-2 py-1 rounded text-xs">
                                  {badge}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-600 text-sm">None yet</span>
                            )}
                          </div>
                        </div>
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

        {/* Export Panel */}
        <div className="mb-6">
          <ExportPanel allGames={allGames} leaderboard={leaderboard} />
        </div>

        {/* Leaderboard Section */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
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
            {leaderboard.length === 0 && (
              <div className="p-8 text-center text-slate-500">No teams yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Reset Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-red-500/50">
            <h3 className="text-xl font-bold text-red-400 mb-4">Reset Team Progress?</h3>
            <p className="text-slate-400 mb-6">
              This will clear all progress for this team. You will have 10 seconds to undo.
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

      {/* Undo Toast */}
      {undoState && (
        <div className="fixed bottom-6 right-6 bg-amber-900/90 border border-amber-500 rounded-xl p-4 shadow-xl z-50 flex items-center gap-4 animate-slide-up">
          <div className="text-amber-200">
            <p className="font-medium">Team reset successfully</p>
            <p className="text-sm text-amber-300/70">Click undo to restore</p>
          </div>
          <button
            onClick={handleUndo}
            className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Undo
          </button>
          <button
            onClick={() => {
              if (undoState.timeoutId) clearTimeout(undoState.timeoutId);
              setUndoState(null);
            }}
            className="text-amber-400 hover:text-white transition-colors text-sm"
          >
            Dismiss
          </button>
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
