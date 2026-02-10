import React, { useState } from 'react';
import { Package, FlaskConical, ShieldCheck, Users, Rocket, CheckCircle2, Factory, Copy } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { getPlayerCharacter } from '../../data/characters';

// Role definitions with icons and descriptions
const ROLES = [
  {
    id: 'productDev',
    name: 'Product Developer',
    icon: FlaskConical,
    color: 'cyan',
    description: 'Focus on formula, ingredients, and product performance criteria',
    avatar: '/avatars/product-dev.png', // placeholder for future
  },
  {
    id: 'packageDev',
    name: 'Package Developer',
    icon: Package,
    color: 'orange',
    description: 'Focus on packaging materials, design, and compatibility criteria',
    avatar: '/avatars/package-dev.png',
  },
  {
    id: 'quality',
    name: 'Quality',
    icon: ShieldCheck,
    color: 'green',
    description: 'Focus on testing standards, compliance, and quality metrics',
    avatar: '/avatars/quality.png',
  },
  {
    id: 'pim',
    name: 'PIM',
    icon: Factory,
    color: 'purple',
    description: 'Focus on plant runnability, operations, and equipment compatibility',
    avatar: '/avatars/pim.png',
  },
];

// Color classes for each role
const colorClasses = {
  cyan: {
    bg: 'bg-cyan-900/30',
    bgSelected: 'bg-cyan-800/50',
    border: 'border-cyan-500',
    borderHover: 'hover:border-cyan-400',
    text: 'text-cyan-400',
    badge: 'bg-cyan-500/20 text-cyan-300',
  },
  orange: {
    bg: 'bg-orange-900/30',
    bgSelected: 'bg-orange-800/50',
    border: 'border-orange-500',
    borderHover: 'hover:border-orange-400',
    text: 'text-orange-400',
    badge: 'bg-orange-500/20 text-orange-300',
  },
  green: {
    bg: 'bg-green-900/30',
    bgSelected: 'bg-green-800/50',
    border: 'border-green-500',
    borderHover: 'hover:border-green-400',
    text: 'text-green-400',
    badge: 'bg-green-500/20 text-green-300',
  },
  purple: {
    bg: 'bg-purple-900/30',
    bgSelected: 'bg-purple-800/50',
    border: 'border-purple-500',
    borderHover: 'hover:border-purple-400',
    text: 'text-purple-400',
    badge: 'bg-purple-500/20 text-purple-300',
  },
};

const RoleSelection = () => {
  const {
    gameState,
    playerId,
    functionalRole,
    isCommander,
    updatePlayerRole,
    startGame,
    getPlayersByRole,
  } = useGame();

  const [selectedRole, setSelectedRole] = useState(functionalRole);
  const [isConfirmed, setIsConfirmed] = useState(!!functionalRole);

  const playersByRole = getPlayersByRole();
  const totalPlayers = Object.keys(gameState?.players || {}).length;
  const playersWithRoles = totalPlayers - (playersByRole.unassigned?.length || 0);

  const handleSelectRole = (roleId) => {
    if (!isConfirmed) {
      setSelectedRole(roleId);
    }
  };

  const handleConfirmRole = () => {
    if (selectedRole) {
      updatePlayerRole(selectedRole);
      setIsConfirmed(true);
    }
  };

  const handleStartGame = () => {
    startGame();
  };

  // Check if all players have selected roles
  const allPlayersReady = playersByRole.unassigned?.length === 0 && totalPlayers > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-cyan-400 mb-3">Select Your Role</h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Each role represents a function in the plant trial. Pick the one you'll represent during this simulation.
          </p>
          <p className="text-sm text-slate-500 mt-4">
            Team: <span className="text-cyan-300">{gameState?.meta?.teamName}</span>
            {' | '}
            Players: <span className="text-cyan-300">{totalPlayers}</span>
          </p>
        </div>

        {/* Team Code - large display for sharing */}
        {isCommander && (
          <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-cyan-500/50 text-center">
            <p className="text-xs text-slate-400 mb-1">Share this team name with your crew:</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl font-bold font-mono text-cyan-400 tracking-wider">
                {gameState?.meta?.teamName}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(gameState?.meta?.teamName || '');
                }}
                className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
                title="Copy team name"
              >
                <Copy className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Teammates join at: {window.location.origin}
            </p>
          </div>
        )}

        {/* Player Tally Summary */}
        <div className="mb-8 flex justify-center gap-4 flex-wrap">
          {ROLES.map((role) => {
            const colors = colorClasses[role.color];
            const count = playersByRole[role.id]?.length || 0;
            return (
              <div
                key={role.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${colors.badge}`}
              >
                <role.icon className="w-4 h-4" />
                <span className="font-medium">{role.name}:</span>
                <span className="font-bold">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {ROLES.map((role) => {
            const colors = colorClasses[role.color];
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            const count = playersByRole[role.id]?.length || 0;

            return (
              <button
                key={role.id}
                onClick={() => handleSelectRole(role.id)}
                disabled={isConfirmed}
                className={`relative p-6 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? `${colors.bgSelected} ${colors.border} ring-2 ring-offset-2 ring-offset-slate-900 ring-${role.color}-500/50`
                    : `${colors.bg} border-slate-600 ${!isConfirmed ? colors.borderHover : ''}`
                } ${isConfirmed && !isSelected ? 'opacity-50' : ''} ${!isConfirmed ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
              >
                {/* Selected checkmark */}
                {isSelected && isConfirmed && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  </div>
                )}

                {/* Player count badge */}
                <div className={`absolute top-3 right-3 ${isSelected && isConfirmed ? 'top-10' : ''}`}>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${colors.badge}`}>
                    <Users className="w-3 h-3" />
                    <span>{count}</span>
                  </div>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className={`p-4 rounded-full mb-4 ${colors.bg} border ${colors.border}`}>
                    <Icon className={`w-10 h-10 ${colors.text}`} />
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${colors.text}`}>
                    {role.name}
                  </h3>
                  <p className="text-sm text-slate-400">{role.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Confirm Role Button */}
        {!isConfirmed && selectedRole && (
          <div className="text-center mb-8">
            <button
              onClick={handleConfirmRole}
              className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold text-lg transition-all hover:scale-105"
            >
              Confirm Role Selection
            </button>
          </div>
        )}

        {/* Character Assignment & Ready Status */}
        {isConfirmed && (
          <div className="text-center mb-8">
            {/* Character Card */}
            {(() => {
              const character = getPlayerCharacter(playerId, functionalRole);
              const role = ROLES.find(r => r.id === functionalRole);
              const colors = colorClasses[role?.color || 'cyan'];
              return (
                <div className={`inline-block ${colors.bg} border-2 ${colors.border} rounded-2xl p-6 mb-4`}>
                  <div className="text-6xl mb-3">{character.emoji}</div>
                  <h2 className={`text-2xl font-bold ${colors.text} mb-1`}>{character.name}</h2>
                  <p className="text-sm text-slate-400 mb-2">{character.title}</p>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${colors.badge}`}>
                    {role && <role.icon className="w-4 h-4" />}
                    <span className="text-sm font-medium">{role?.name}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-3">This is your identity for this mission!</p>
                </div>
              );
            })()}

            <div className="bg-slate-800/50 rounded-xl px-8 py-4 border border-slate-700 inline-block">
              <div className="flex items-center gap-3 justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
                <span className="text-green-400 font-medium">Role Confirmed!</span>
              </div>
              <p className="text-sm text-slate-400 mt-2">
                {allPlayersReady
                  ? isCommander
                    ? 'All players ready! You can now start the mission below.'
                    : 'All players ready! Waiting for Commander to start the mission...'
                  : `Waiting for all players to select a role... (${playersWithRoles}/${totalPlayers} ready)`}
              </p>
            </div>
          </div>
        )}

        {/* Commander Start Button */}
        {isCommander && isConfirmed && (
          <div className="text-center">
            {!allPlayersReady ? (
              <div className="bg-amber-900/20 border border-amber-500/50 rounded-xl p-4 mb-4 max-w-md mx-auto">
                <div className="flex items-center justify-center gap-2 text-amber-400 mb-2">
                  <Users className="w-5 h-5" />
                  <span className="font-bold">Waiting for your crew</span>
                </div>
                <p className="text-sm text-amber-300/80">
                  {playersByRole.unassigned?.length || 0} player{(playersByRole.unassigned?.length || 0) !== 1 ? 's' : ''} still
                  {' '}selecting a role. Once everyone has confirmed, you'll be able to start the mission.
                </p>
                <div className="mt-3 text-xs text-slate-400">
                  {playersWithRoles} of {totalPlayers} players ready
                </div>
              </div>
            ) : (
              <div className="bg-green-900/20 border border-green-500/50 rounded-xl p-4 mb-4 max-w-md mx-auto">
                <div className="flex items-center justify-center gap-2 text-green-400 mb-1">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-bold">All {totalPlayers} player{totalPlayers !== 1 ? 's' : ''} ready!</span>
                </div>
                <p className="text-sm text-green-300/80">
                  As Commander, hit the button below to begin the mission.
                </p>
              </div>
            )}
            <button
              onClick={handleStartGame}
              disabled={!allPlayersReady}
              className={`px-10 py-4 rounded-xl font-bold text-xl transition-all flex items-center gap-3 mx-auto ${
                allPlayersReady
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 hover:scale-105'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Rocket className="w-6 h-6" />
              Start Mission
            </button>
          </div>
        )}

        {/* Players List */}
        <div className="mt-10 pt-6 border-t border-slate-700">
          <h3 className="text-lg font-semibold text-slate-300 mb-4 text-center">Team Roster</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROLES.map((role) => {
              const colors = colorClasses[role.color];
              const players = playersByRole[role.id] || [];
              const Icon = role.icon;

              return (
                <div key={role.id} className={`p-4 rounded-lg ${colors.bg} border border-slate-700`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={`w-4 h-4 ${colors.text}`} />
                    <span className={`font-medium ${colors.text}`}>{role.name}</span>
                  </div>
                  {players.length > 0 ? (
                    <ul className="space-y-2">
                      {players.map((player) => {
                        const character = getPlayerCharacter(player.id, role.id);
                        return (
                          <li key={player.id} className="text-sm text-slate-300 flex items-center gap-2">
                            <span className="text-lg">{character.emoji}</span>
                            <span className="font-medium">{character.name}</span>
                            {player.role === 'commander' && (
                              <span className="text-xs text-amber-400 bg-amber-900/30 px-1.5 py-0.5 rounded">Cmdr</span>
                            )}
                            {player.id === playerId && (
                              <span className="text-xs text-cyan-400 bg-cyan-900/30 px-1.5 py-0.5 rounded">You</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No players yet</p>
                  )}
                </div>
              );
            })}

            {/* Unassigned players */}
            {playersByRole.unassigned?.length > 0 && (
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-slate-400">Choosing...</span>
                </div>
                <ul className="space-y-2">
                  {playersByRole.unassigned.map((player) => {
                    const character = getPlayerCharacter(player.id, null);
                    return (
                      <li key={player.id} className="text-sm text-slate-500 flex items-center gap-2">
                        <span className="text-lg">{character.emoji}</span>
                        <span>{character.name}</span>
                        {player.role === 'commander' && (
                          <span className="text-xs text-amber-400 bg-amber-900/30 px-1.5 py-0.5 rounded">Cmdr</span>
                        )}
                        {player.id === playerId && (
                          <span className="text-xs text-cyan-400 bg-cyan-900/30 px-1.5 py-0.5 rounded">You</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
