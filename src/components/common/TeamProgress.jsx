import React from 'react';
import { Users, CheckCircle2, Clock } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { getPlayerCharacter } from '../../data/characters';

const TeamProgress = ({ label, completedPlayerIds = [], showNames = true }) => {
  const { gameState, playerId } = useGame();

  const allPlayers = Object.entries(gameState?.players || {});
  const totalPlayers = allPlayers.length;
  const completedCount = completedPlayerIds.length;
  const fraction = totalPlayers > 0 ? completedCount / totalPlayers : 0;

  // Find players who haven't completed
  const waitingPlayers = allPlayers.filter(
    ([pid]) => !completedPlayerIds.includes(pid)
  );

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-300">
            {label || 'Team Progress'}
          </span>
        </div>
        <span className={`text-sm font-bold ${
          fraction === 1 ? 'text-green-400' : 'text-amber-400'
        }`}>
          {completedCount}/{totalPlayers}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            fraction === 1 ? 'bg-green-500' : 'bg-cyan-500'
          }`}
          style={{ width: `${fraction * 100}%` }}
        />
      </div>

      {/* Player status */}
      {showNames && (
        <div className="flex flex-wrap gap-2">
          {allPlayers.map(([pid, playerData]) => {
            const isDone = completedPlayerIds.includes(pid);
            const isMe = pid === playerId;
            const character = getPlayerCharacter(pid, playerData?.functionalRole);

            return (
              <div
                key={pid}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${
                  isDone
                    ? 'bg-green-900/30 border border-green-600 text-green-300'
                    : 'bg-slate-700/50 border border-slate-600 text-slate-400'
                } ${isMe ? 'ring-1 ring-cyan-500' : ''}`}
              >
                <span>{character.emoji}</span>
                {isDone ? (
                  <CheckCircle2 className="w-3 h-3 text-green-400" />
                ) : (
                  <Clock className="w-3 h-3 text-slate-500 animate-pulse" />
                )}
                <span className="truncate max-w-[60px]">
                  {character.name.split(' ')[1] || character.name}
                </span>
                {isMe && <span className="text-cyan-400">(You)</span>}
              </div>
            );
          })}
        </div>
      )}

      {/* Waiting message */}
      {waitingPlayers.length > 0 && fraction < 1 && (
        <p className="text-xs text-slate-500 mt-2">
          Waiting for {waitingPlayers.length} crew member{waitingPlayers.length !== 1 ? 's' : ''}...
        </p>
      )}
    </div>
  );
};

export default TeamProgress;
