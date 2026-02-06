import React, { useMemo } from 'react';
import { Trophy, Users, Activity, X } from 'lucide-react';

const ProjectorView = ({ allGames, leaderboard, onClose }) => {
  const teams = useMemo(() => Object.values(allGames), [allGames]);

  const getStatusColor = (team) => {
    const players = Object.values(team.players || {});
    if (players.length === 0) return 'bg-slate-500';
    const lastActive = Math.max(...players.map(p => p.lastActive || 0));
    const minutesAgo = (Date.now() - lastActive) / 60000;
    if (minutesAgo < 1) return 'bg-green-500';
    if (minutesAgo < 5) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const levelColors = {
    0: 'text-slate-400',
    1: 'text-cyan-400',
    2: 'text-orange-400',
    3: 'text-green-400',
    4: 'text-amber-400',
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white overflow-auto">
      {/* Close button */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-50 bg-slate-800 hover:bg-slate-700 p-2 rounded-lg border border-slate-600"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-cyan-400 mb-2">MISSION NORTH STAR</h1>
          <p className="text-2xl text-slate-400">Live Mission Status</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 text-center">
            <Users className="w-10 h-10 text-cyan-400 mx-auto mb-2" />
            <div className="text-4xl font-bold">{teams.length}</div>
            <div className="text-slate-400 text-lg">Teams</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 text-center">
            <Activity className="w-10 h-10 text-green-400 mx-auto mb-2" />
            <div className="text-4xl font-bold">
              {teams.filter(t => {
                const players = Object.values(t.players || {});
                if (players.length === 0) return false;
                const lastActive = Math.max(...players.map(p => p.lastActive || 0));
                return (Date.now() - lastActive) < 60000;
              }).length}
            </div>
            <div className="text-slate-400 text-lg">Active</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 text-center">
            <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-2" />
            <div className="text-4xl font-bold">
              {teams.filter(t => (t.badges?.length || 0) === 4).length}
            </div>
            <div className="text-slate-400 text-lg">Completed</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Team Status Grid */}
          <div>
            <h2 className="text-2xl font-bold text-slate-300 mb-4">Team Status</h2>
            <div className="grid grid-cols-2 gap-4">
              {teams.map(team => (
                <div
                  key={team.gameCode}
                  className="bg-slate-800/50 rounded-xl p-5 border border-slate-700"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-4 h-4 rounded-full ${getStatusColor(team)}`} />
                    <span className="text-2xl font-bold text-white truncate">
                      {team.meta?.teamName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 text-lg">Level </span>
                      <span className={`text-2xl font-bold ${levelColors[team.meta?.currentLevel || 0]}`}>
                        {team.meta?.currentLevel || 0}/4
                      </span>
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-cyan-400">{team.meta?.totalScore || 0}</span>
                      <span className="text-slate-500 text-lg"> pts</span>
                    </div>
                  </div>
                  {/* Level progress bar */}
                  <div className="mt-3 flex gap-1">
                    {[1, 2, 3, 4].map(lvl => (
                      <div
                        key={lvl}
                        className={`h-2 flex-1 rounded-full ${
                          team[`level${lvl}`]?.completedAt
                            ? 'bg-green-500'
                            : (team.meta?.currentLevel || 0) === lvl
                              ? 'bg-cyan-500 animate-pulse'
                              : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div>
            <h2 className="text-2xl font-bold text-slate-300 mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" />
              Leaderboard
            </h2>
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              {leaderboard.slice(0, 10).map((team, index) => (
                <div
                  key={team.teamName}
                  className={`px-6 py-4 flex items-center gap-4 ${
                    index < leaderboard.length - 1 ? 'border-b border-slate-700' : ''
                  }`}
                >
                  <span className={`text-3xl font-bold w-12 text-center ${
                    index === 0 ? 'text-amber-400' :
                    index === 1 ? 'text-slate-300' :
                    index === 2 ? 'text-orange-400' :
                    'text-slate-500'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="flex-1 text-xl text-white font-medium">{team.teamName}</span>
                  <span className="text-lg text-slate-400">Level {team.currentLevel}</span>
                  <span className="text-2xl font-bold text-cyan-400">{team.score}</span>
                </div>
              ))}
              {leaderboard.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xl">
                  No teams yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectorView;
