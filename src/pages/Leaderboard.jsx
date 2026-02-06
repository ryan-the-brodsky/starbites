import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, ArrowLeft, Medal, Star, Rocket } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { getAllGamesFromDB } from '../firebase';

const Leaderboard = () => {
  const { gameState } = useGame();
  const [leaderboard, setLeaderboard] = useState([]);

  // Poll for leaderboard data every 15 seconds
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const games = await getAllGamesFromDB();
        const data = Object.values(games || {})
          .map(game => ({
            teamName: game.meta?.teamName || 'Unknown',
            score: game.meta?.totalScore || 0,
            currentLevel: game.meta?.currentLevel || 0,
          }))
          .sort((a, b) => b.score - a.score);
        setLeaderboard(data);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      }
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 15000);
    return () => clearInterval(interval);
  }, []);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <span className="text-2xl">🥇</span>;
      case 2:
        return <span className="text-2xl">🥈</span>;
      case 3:
        return <span className="text-2xl">🥉</span>;
      default:
        return <span className="text-lg text-slate-500 font-mono w-6 text-center">{rank}</span>;
    }
  };

  const isCurrentTeam = (team) => {
    return gameState?.meta?.teamName === team.teamName;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white">
      {/* Header */}
      <div className="bg-slate-900/80 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Mission
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/20 rounded-xl">
              <Trophy className="w-10 h-10 text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Mission Leaderboard
              </h1>
              <p className="text-slate-400">Top performing teams</p>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* 2nd Place */}
          <div className="mt-8">
            {leaderboard[1] && (
              <PodiumCard team={leaderboard[1]} rank={2} isCurrentTeam={isCurrentTeam(leaderboard[1])} />
            )}
          </div>

          {/* 1st Place */}
          <div>
            {leaderboard[0] && (
              <PodiumCard team={leaderboard[0]} rank={1} isCurrentTeam={isCurrentTeam(leaderboard[0])} />
            )}
          </div>

          {/* 3rd Place */}
          <div className="mt-12">
            {leaderboard[2] && (
              <PodiumCard team={leaderboard[2]} rank={3} isCurrentTeam={isCurrentTeam(leaderboard[2])} />
            )}
          </div>
        </div>

        {/* Rest of Rankings */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-slate-200">All Teams</h2>
          </div>

          <div className="divide-y divide-slate-700/50">
            {leaderboard.map((team, index) => (
              <div
                key={team.teamName}
                className={`px-6 py-4 flex items-center gap-4 ${
                  isCurrentTeam(team)
                    ? 'bg-cyan-900/30 border-l-4 border-cyan-400'
                    : 'hover:bg-slate-800/50'
                }`}
              >
                {/* Rank */}
                <div className="w-10 flex justify-center">
                  {getRankIcon(index + 1)}
                </div>

                {/* Team Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white truncate">
                      {team.teamName}
                    </span>
                    {isCurrentTeam(team) && (
                      <span className="text-xs bg-cyan-500 text-white px-2 py-0.5 rounded">
                        Your Team
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Rocket className="w-3 h-3" />
                      Level {team.currentLevel}
                    </span>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  {index < 3 ? (
                    <div className="text-xl font-bold text-amber-400">
                      {team.score.toLocaleString()}
                    </div>
                  ) : (
                    <div className="text-lg text-slate-500">&mdash;</div>
                  )}
                  <div className="text-xs text-slate-500">
                    {index < 3 ? 'points' : 'rank hidden'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-slate-800/30 rounded-lg p-4 border border-slate-700">
          <p className="text-sm text-slate-400 text-center">
            Only top 3 teams display their exact scores.
            Keep completing levels to climb the ranks!
          </p>
        </div>
      </div>
    </div>
  );
};

const PodiumCard = ({ team, rank, isCurrentTeam }) => {
  const getBgGradient = () => {
    switch (rank) {
      case 1:
        return 'from-amber-900/50 to-amber-800/30 border-amber-500/50';
      case 2:
        return 'from-slate-700/50 to-slate-600/30 border-slate-500/50';
      case 3:
        return 'from-orange-900/50 to-orange-800/30 border-orange-600/50';
      default:
        return 'from-slate-800/50 to-slate-700/30 border-slate-600/50';
    }
  };

  const getRankEmoji = () => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  return (
    <div
      className={`bg-gradient-to-b ${getBgGradient()} rounded-xl border p-4 text-center ${
        isCurrentTeam ? 'ring-2 ring-cyan-400' : ''
      }`}
    >
      <div className="text-3xl mb-2">{getRankEmoji()}</div>
      <div className="font-bold text-white truncate mb-1">{team.teamName}</div>
      <div className="text-2xl font-bold text-amber-400">{team.score.toLocaleString()}</div>
      <div className="text-xs text-slate-400 mt-1">Level {team.currentLevel}</div>
      {isCurrentTeam && (
        <div className="mt-2 text-xs bg-cyan-500 text-white px-2 py-0.5 rounded inline-block">
          Your Team
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
