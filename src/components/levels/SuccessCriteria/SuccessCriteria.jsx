import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Target, FileText, CheckCircle2, AlertTriangle, Triangle, ChevronDown, ChevronUp, FlaskConical, Info, Users, Package, ShieldCheck, AlertOctagon, Factory } from 'lucide-react';
import { useGame } from '../../../contexts/GameContext';
import {
  dfmeaSummary,
  uxPyramidSummary,
  getCriteriaByRole,
  MAX_CRITERIA_PER_ROLE,
  MISSING_ROLE_PENALTY,
  successCriteriaOptions
} from '../../../data/missionData';
import { getPlayerCharacter } from '../../../data/characters';
import LevelComplete from '../../common/LevelComplete';

// Role display information
const ROLE_INFO = {
  productDev: {
    name: 'Product Developer',
    icon: FlaskConical,
    color: 'cyan',
    description: 'Focus on formula, ingredients, and product performance'
  },
  packageDev: {
    name: 'Package Developer',
    icon: Package,
    color: 'orange',
    description: 'Focus on packaging materials, design, and compatibility'
  },
  quality: {
    name: 'Quality',
    icon: ShieldCheck,
    color: 'green',
    description: 'Focus on testing standards, compliance, and quality metrics'
  },
  pim: {
    name: 'PIM',
    icon: Factory,
    color: 'purple',
    description: 'Focus on plant runnability, operations, and equipment compatibility'
  }
};

const colorClasses = {
  cyan: { bg: 'bg-cyan-900/30', border: 'border-cyan-500', text: 'text-cyan-400', badge: 'bg-cyan-500/20 text-cyan-300' },
  orange: { bg: 'bg-orange-900/30', border: 'border-orange-500', text: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-300' },
  green: { bg: 'bg-green-900/30', border: 'border-green-500', text: 'text-green-400', badge: 'bg-green-500/20 text-green-300' },
  purple: { bg: 'bg-purple-900/30', border: 'border-purple-500', text: 'text-purple-400', badge: 'bg-purple-500/20 text-purple-300' },
};

const SuccessCriteria = ({ onNavigateToLevel }) => {
  const {
    gameState,
    playerId,
    functionalRole,
    updateLevelState,
    completeLevel,
    getPlayersByRole,
    updatePlayerCriteriaSelections,
    confirmCriteriaSelection,
    isCommander
  } = useGame();

  const [selectedCriteria, setSelectedCriteria] = useState([]);
  const [expandedDfmea, setExpandedDfmea] = useState(false);
  const [expandedUx, setExpandedUx] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);

  // Get role-specific criteria
  const myCriteria = getCriteriaByRole(functionalRole);
  const playersByRole = getPlayersByRole();
  const roleInfo = ROLE_INFO[functionalRole] || {};
  const colors = colorClasses[roleInfo.color] || colorClasses.cyan;

  // Get current role selections from game state
  const roleSelections = gameState?.level1?.roleSelections || {};
  const myRoleSelections = roleSelections[functionalRole] || { playerSelections: {}, confirmedSelections: null, confirmedBy: [] };

  // Check if current player has already confirmed
  const playerHasConfirmed = myRoleSelections.confirmedBy?.includes(playerId);

  // Get teammates in the same role (excluding self)
  const teammates = (playersByRole[functionalRole] || []).filter(p => p.id !== playerId);

  // Get each teammate's current selections
  const teammateSelections = myRoleSelections.playerSelections || {};

  // Check if all players in role have identical selections (memoized to prevent re-render loops)
  const hasConsensus = useMemo(() => {
    const playersInRole = playersByRole[functionalRole] || [];
    if (playersInRole.length <= 1) return true; // Only one player, no consensus needed

    const allSelections = playersInRole.map(p => {
      const selections = teammateSelections[p.id] || [];
      return [...selections].sort().join(',');
    });

    // Check if all players have made selections and they're identical
    const hasAllSelected = allSelections.every(s => s.length > 0);
    if (!hasAllSelected) return false;

    const firstSelection = allSelections[0];
    return allSelections.every(s => s === firstSelection);
  }, [playersByRole, functionalRole, teammateSelections]);

  // Check consensus status for all roles
  const getRoleConsensusStatus = (role) => {
    const players = playersByRole[role] || [];
    const selections = roleSelections[role] || { playerSelections: {}, confirmedSelections: null, confirmedBy: [] };
    const totalPlayers = players.length;
    const confirmedPlayers = selections.confirmedBy?.length || 0;
    return {
      total: totalPlayers,
      confirmed: confirmedPlayers,
      hasConsensus: totalPlayers > 0 && confirmedPlayers === totalPlayers,
      isEmpty: totalPlayers === 0,
      criteria: selections.confirmedSelections || []
    };
  };

  // Check which roles are missing
  const missingRoles = Object.keys(ROLE_INFO).filter(role => {
    const players = playersByRole[role] || [];
    return players.length === 0;
  });

  // Calculate penalty for missing roles
  const missingRolePenalty = missingRoles.length * MISSING_ROLE_PENALTY;

  // Check if all represented roles have consensus
  const allRolesHaveConsensus = Object.keys(ROLE_INFO)
    .filter(role => (playersByRole[role]?.length || 0) > 0)
    .every(role => getRoleConsensusStatus(role).hasConsensus);

  // Refs to prevent re-render loops
  const initializedFromState = useRef(false);
  const lastSyncedSelections = useRef(null);

  // Initialize selected criteria from game state (player's individual selections)
  useEffect(() => {
    if (initializedFromState.current) return;
    const mySelections = teammateSelections[playerId];
    if (mySelections?.length > 0) {
      setSelectedCriteria(mySelections);
      lastSyncedSelections.current = [...mySelections].sort().join(',');
      initializedFromState.current = true;
    }
    if (playerHasConfirmed) {
      setHasConfirmed(true);
    }
  }, [teammateSelections, playerId, playerHasConfirmed]);

  // Sync local selections to game state in real-time (with dedup to prevent loops)
  useEffect(() => {
    if (hasConfirmed) return;
    if (selectedCriteria.length === 0) return;
    const sortedKey = [...selectedCriteria].sort().join(',');
    if (sortedKey === lastSyncedSelections.current) return;
    lastSyncedSelections.current = sortedKey;
    updatePlayerCriteriaSelections(selectedCriteria);
  }, [selectedCriteria, hasConfirmed, updatePlayerCriteriaSelections]);

  const toggleCriteria = (criteriaId) => {
    if (hasConfirmed) return;

    setSelectedCriteria(prev => {
      if (prev.includes(criteriaId)) {
        return prev.filter(id => id !== criteriaId);
      }
      if (prev.length >= MAX_CRITERIA_PER_ROLE) {
        return prev;
      }
      return [...prev, criteriaId];
    });
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'dfmea':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'uxpyramid':
        return <Triangle className="w-4 h-4 text-purple-400" />;
      case 'both':
        return (
          <div className="flex gap-1">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <Triangle className="w-4 h-4 text-purple-400" />
          </div>
        );
      default:
        return <Target className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getSourceLabel = (source) => {
    switch (source) {
      case 'dfmea': return 'DFMEA';
      case 'uxpyramid': return 'UX Pyramid';
      case 'both': return 'DFMEA + UX';
      default: return 'Operational';
    }
  };

  const handleConfirmSelection = () => {
    if (!hasConsensus && teammates.length > 0) {
      // Can't confirm without consensus when there are teammates
      return;
    }

    const selectedCriteriaData = selectedCriteria.map(id =>
      myCriteria.find(c => c.id === id)
    ).filter(Boolean);

    // Use the context function to confirm
    confirmCriteriaSelection(selectedCriteriaData);
    setHasConfirmed(true);
  };

  const handleCompleteLevel = () => {
    // Show level complete screen first
    setShowLevelComplete(true);
  };

  const handleLevelCompleteContinue = () => {
    // Merge all confirmed criteria from all roles
    const allSelectedCriteria = [];
    Object.keys(ROLE_INFO).forEach(role => {
      const status = getRoleConsensusStatus(role);
      if (status.criteria.length > 0) {
        allSelectedCriteria.push(...status.criteria);
      }
    });

    // Calculate score using hidden importance weights (base points minus penalties)
    const baseScore = allSelectedCriteria.reduce((sum, c) => sum + (c.importanceWeight || 50), 0);
    const finalScore = Math.max(0, baseScore - missingRolePenalty);

    updateLevelState('level1', {
      selectedCriteria: allSelectedCriteria,
      score: finalScore,
      missingRoles: missingRoles,
      missingRolePenalty: missingRolePenalty,
      completedAt: Date.now(),
    });

    completeLevel(1);
    setShowLevelComplete(false);
  };

  // Calculate level 1 score for display (uses hidden importance weights)
  const calculateLevel1Score = () => {
    let total = 0;
    Object.keys(ROLE_INFO).forEach(role => {
      const status = getRoleConsensusStatus(role);
      total += status.criteria.reduce((sum, c) => sum + (c.importanceWeight || 50), 0);
    });
    return Math.max(0, total - missingRolePenalty);
  };

  // Handle proceed to next level (Sampling Plan)
  const handleProceedToNextLevel = () => {
    if (onNavigateToLevel) {
      onNavigateToLevel(2);
    }
  };

  // Show level complete transition screen
  if (showLevelComplete) {
    return (
      <LevelComplete
        level={1}
        score={calculateLevel1Score()}
        onContinue={handleLevelCompleteContinue}
      />
    );
  }

  // Show completion screen
  if (gameState?.level1?.completedAt) {
    const allCriteria = gameState.level1.selectedCriteria || [];
    const penalty = gameState.level1.missingRolePenalty || 0;
    const missing = gameState.level1.missingRoles || [];

    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-950 to-slate-950 flex items-center justify-center p-3 sm:p-4">
        <div className="text-center max-w-3xl mx-auto w-full">
          <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">🎯</div>
          <h2 className="text-2xl sm:text-4xl font-bold text-cyan-400 mb-3 sm:mb-4">SUCCESS CRITERIA SET!</h2>

          {missing.length > 0 && (
            <div className="bg-red-900/30 border border-red-500 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-red-400 mb-2">
                <AlertOctagon className="w-6 h-6" />
                <span className="font-bold">MISSION ALERT: Crew Incomplete!</span>
              </div>
              <p className="text-red-300 text-sm mb-2">
                Your crew launched without specialists in: {missing.map(r => ROLE_INFO[r]?.name).join(', ')}
              </p>
              <p className="text-red-400 font-bold">
                Penalty: -{penalty} points (Mission Control does not approve of leaving team members behind!)
              </p>
            </div>
          )}

          <div className="bg-slate-800/50 rounded-xl p-4 mb-6 text-left">
            <h3 className="text-sm text-slate-400 mb-3 text-center">
              Team Success Criteria ({allCriteria.length} total):
            </h3>
            <div className="space-y-4">
              {Object.keys(ROLE_INFO).map(role => {
                const roleCriteria = allCriteria.filter(c => c.role === role);
                const info = ROLE_INFO[role];
                const roleColors = colorClasses[info.color];
                if (roleCriteria.length === 0) return null;

                return (
                  <div key={role} className={`p-3 rounded-lg ${roleColors.bg} border ${roleColors.border}`}>
                    <div className={`font-medium ${roleColors.text} mb-2 flex items-center gap-2`}>
                      <info.icon className="w-4 h-4" />
                      {info.name}
                    </div>
                    <ul className="space-y-1">
                      {roleCriteria.map((c, i) => (
                        <li key={c.id} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className={`${roleColors.text} font-mono flex-shrink-0`}>•</span>
                          <span>{c.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Proceed Button */}
          <button
            onClick={handleProceedToNextLevel}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 px-6 sm:px-10 py-4 sm:py-5 rounded-xl font-bold text-lg sm:text-xl transition-all hover:scale-105 shadow-lg"
          >
            Continue to Sampling Plan
          </button>
        </div>
      </div>
    );
  }

  // No role assigned - show error
  if (!functionalRole) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-red-950 flex items-center justify-center">
        <div className="text-center">
          <AlertOctagon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-400 mb-2">Role Not Assigned</h2>
          <p className="text-slate-400">You must select a functional role before defining success criteria.</p>
        </div>
      </div>
    );
  }

  const RoleIcon = roleInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-cyan-950 text-white p-3 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-1 sm:mb-2">Level 1: Define Success Criteria</h1>
          <p className="text-sm sm:text-base text-slate-400">Work with your function to select criteria that define mission success</p>
        </div>

        {/* Your Role Banner */}
        <div className={`${colors.bg} border ${colors.border} rounded-xl p-3 sm:p-4 mb-4 sm:mb-6`}>
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <RoleIcon className={`w-6 h-6 sm:w-8 sm:h-8 ${colors.text}`} />
            <div className="text-center">
              <h2 className={`text-lg sm:text-xl font-bold ${colors.text}`}>{roleInfo.name}</h2>
              <p className="text-xs sm:text-sm text-slate-400">{roleInfo.description}</p>
            </div>
          </div>
        </div>

        {/* Missing Roles Warning */}
        {missingRoles.length > 0 && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertOctagon className="w-6 h-6 text-red-400 flex-shrink-0" />
              <div>
                <p className="text-red-300 font-medium">Stellar Navigation Warning!</p>
                <p className="text-sm text-red-400/80">
                  Your crew is missing: {missingRoles.map(r => ROLE_INFO[r]?.name).join(', ')}.
                  Without all functions represented, your mission will face a <strong>-{missingRolePenalty} point penalty</strong>.
                  A ship without all its crew members is a ship destined to drift!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Team Consensus Status */}
        <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-slate-700">
          <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Team Consensus Status
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {Object.entries(ROLE_INFO).map(([roleKey, info]) => {
              const status = getRoleConsensusStatus(roleKey);
              const roleColors = colorClasses[info.color];
              const Icon = info.icon;
              const playersInRole = playersByRole[roleKey] || [];
              const roleSelectionsData = roleSelections[roleKey] || { playerSelections: {}, confirmedBy: [] };
              const roleCriteria = getCriteriaByRole(roleKey);

              return (
                <div key={roleKey} className={`p-3 rounded-lg ${roleColors.bg} border border-slate-600`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${roleColors.text}`} />
                    <span className={`text-sm font-medium ${roleColors.text}`}>{info.name}</span>
                  </div>
                  {status.isEmpty ? (
                    <p className="text-xs text-red-400">No crew assigned</p>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400">
                          {status.confirmed}/{status.total} confirmed
                        </span>
                        {status.hasConsensus ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <span className="text-xs text-amber-400">In progress...</span>
                        )}
                      </div>
                      {/* Show individual player selections with their actual criteria */}
                      <div className="space-y-2 pt-2 border-t border-slate-600/50">
                        {playersInRole.map((player) => {
                          const playerSels = roleSelectionsData.playerSelections?.[player.id] || [];
                          const isMe = player.id === playerId;
                          const hasConfirmedRole = (roleSelectionsData.confirmedBy || []).includes(player.id);
                          const character = getPlayerCharacter(player.id, roleKey);
                          return (
                            <div key={player.id} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <div className={`flex items-center gap-1 ${isMe ? 'text-cyan-300' : 'text-slate-400'}`}>
                                  <span>{character.emoji}</span>
                                  <span className="truncate max-w-[80px]">{character.name.split(' ')[1] || character.name}</span>
                                  {isMe && <span className="text-cyan-400">(You)</span>}
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className={playerSels.length > 0 ? roleColors.text : 'text-slate-500'}>
                                    {playerSels.length}/{MAX_CRITERIA_PER_ROLE}
                                  </span>
                                  {hasConfirmedRole && <CheckCircle2 className="w-3 h-3 text-green-400" />}
                                </div>
                              </div>
                              {/* Show actual criteria selected */}
                              {playerSels.length > 0 && (
                                <ul className="text-[10px] text-slate-500 ml-5 space-y-0.5">
                                  {playerSels.map(selId => {
                                    const criteria = roleCriteria.find(c => c.id === selId);
                                    return criteria ? (
                                      <li key={selId} className="truncate" title={criteria.text}>
                                        • {criteria.text.substring(0, 40)}...
                                      </li>
                                    ) : null;
                                  })}
                                </ul>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                  {status.criteria.length > 0 && (
                    <p className="text-xs text-slate-500 mt-1">
                      {status.criteria.length} criteria locked
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-xl p-4 border border-cyan-700/50 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-cyan-200">
                <strong>Your Mission:</strong> Select up to {MAX_CRITERIA_PER_ROLE} success criteria for your function.
                {teammates.length > 0 ? (
                  <> All {roleInfo.name}s must agree on the <strong>exact same criteria</strong> before anyone can confirm. Coordinate with your teammates!</>
                ) : (
                  <> Review the DFMEA risks and UX Pyramid priorities to make informed decisions.</>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Teammate Selections Panel - only show if there are teammates */}
        {teammates.length > 0 && !hasConfirmed && (
          <div className={`rounded-xl p-4 border-2 mb-6 ${
            hasConsensus
              ? 'bg-green-900/20 border-green-500'
              : 'bg-amber-900/20 border-amber-500'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <Users className={`w-5 h-5 ${hasConsensus ? 'text-green-400' : 'text-amber-400'}`} />
              <h3 className={`font-medium ${hasConsensus ? 'text-green-300' : 'text-amber-300'}`}>
                {hasConsensus ? 'Consensus Reached!' : 'Coordinate with Your Teammates'}
              </h3>
            </div>

            {hasConsensus ? (
              <p className="text-sm text-green-200 mb-3">
                All {roleInfo.name}s have selected the same criteria. You can now confirm your selection!
              </p>
            ) : (
              <p className="text-sm text-amber-200 mb-3">
                All {roleInfo.name}s must select the <strong>identical criteria</strong> before anyone can confirm.
                Discuss with your teammates to reach agreement.
              </p>
            )}

            <div className="space-y-3">
              {/* My selections */}
              {(() => {
                const myCharacter = getPlayerCharacter(playerId, functionalRole);
                return (
                  <div className="bg-slate-800/50 rounded-lg p-3 border border-cyan-500">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{myCharacter.emoji}</span>
                      <span className="text-sm font-medium text-cyan-300">{myCharacter.name}</span>
                      <span className="text-xs text-cyan-400 bg-cyan-900/30 px-1.5 py-0.5 rounded">You</span>
                      <span className="text-xs text-slate-500 ml-auto">({selectedCriteria.length}/{MAX_CRITERIA_PER_ROLE})</span>
                    </div>
                    {selectedCriteria.length > 0 ? (
                      <ul className="text-xs text-slate-400 space-y-1 ml-7">
                        {selectedCriteria.map(id => {
                          const c = myCriteria.find(c => c.id === id);
                          return c ? <li key={id}>• {c.text.substring(0, 60)}...</li> : null;
                        })}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-500 ml-7">No criteria selected yet</p>
                    )}
                  </div>
                );
              })()}

              {/* Teammate selections */}
              {teammates.map(teammate => {
                const theirSelections = teammateSelections[teammate.id] || [];
                const selectionsMatch = [...theirSelections].sort().join(',') === [...selectedCriteria].sort().join(',');
                const teammateCharacter = getPlayerCharacter(teammate.id, functionalRole);

                return (
                  <div key={teammate.id} className={`bg-slate-800/50 rounded-lg p-3 border ${
                    selectionsMatch && theirSelections.length > 0 && selectedCriteria.length > 0
                      ? 'border-green-500'
                      : theirSelections.length > 0
                        ? 'border-amber-500/50'
                        : 'border-slate-600'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{teammateCharacter.emoji}</span>
                      <span className="text-sm font-medium text-slate-300">{teammateCharacter.name}</span>
                      {teammate.role === 'commander' && (
                        <span className="text-xs text-amber-400 bg-amber-900/30 px-1.5 py-0.5 rounded">Cmdr</span>
                      )}
                      <span className="text-xs text-slate-500 ml-auto">({theirSelections.length}/{MAX_CRITERIA_PER_ROLE})</span>
                      {selectionsMatch && theirSelections.length > 0 && selectedCriteria.length > 0 && (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                    {theirSelections.length > 0 ? (
                      <ul className="text-xs text-slate-400 space-y-1 ml-4">
                        {theirSelections.map(id => {
                          const c = myCriteria.find(c => c.id === id);
                          const isMatching = selectedCriteria.includes(id);
                          return c ? (
                            <li key={id} className={isMatching ? 'text-green-400' : 'text-amber-400'}>
                              {isMatching ? '✓' : '✗'} {c.text.substring(0, 60)}...
                            </li>
                          ) : null;
                        })}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-500 ml-4">Waiting for selection...</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* DFMEA Summary Panel */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            <button
              onClick={() => setExpandedDfmea(!expandedDfmea)}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
                <div className="text-left">
                  <h3 className="font-semibold text-amber-300">{dfmeaSummary.title}</h3>
                  <p className="text-sm text-slate-400">{dfmeaSummary.failureModes.length} failure modes identified</p>
                </div>
              </div>
              {expandedDfmea ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {expandedDfmea && (
              <div className="p-4 pt-0 space-y-3">
                <p className="text-sm text-slate-400 mb-3">{dfmeaSummary.description}</p>
                {dfmeaSummary.failureModes.map((fm) => (
                  <div key={fm.id} className="bg-slate-900/50 rounded-lg p-3 border border-amber-900/30">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-amber-200">{fm.mode}</span>
                      <span className="text-xs bg-amber-900/50 text-amber-300 px-2 py-0.5 rounded">RPN: {fm.rpn}</span>
                    </div>
                    <p className="text-sm text-slate-400">Cause: {fm.cause}</p>
                    <p className="text-sm text-slate-400">Effect: {fm.effect}</p>
                    <p className="text-xs text-cyan-400 mt-1">Control: {fm.control}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* UX Pyramid Summary Panel */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            <button
              onClick={() => setExpandedUx(!expandedUx)}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Triangle className="w-6 h-6 text-purple-400" />
                <div className="text-left">
                  <h3 className="font-semibold text-purple-300">{uxPyramidSummary.title}</h3>
                  <p className="text-sm text-slate-400">{uxPyramidSummary.levels.length} levels of consumer needs</p>
                </div>
              </div>
              {expandedUx ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {expandedUx && (
              <div className="p-4 pt-0 space-y-3">
                <p className="text-sm text-slate-400 mb-3">{uxPyramidSummary.description}</p>
                {uxPyramidSummary.levels.map((level, index) => (
                  <div key={level.level} className="bg-slate-900/50 rounded-lg p-3 border border-purple-900/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        index === 0 ? 'bg-green-900/50 text-green-300' :
                        index === 1 ? 'bg-blue-900/50 text-blue-300' :
                        index === 2 ? 'bg-yellow-900/50 text-yellow-300' :
                        'bg-pink-900/50 text-pink-300'
                      }`}>
                        {level.level}
                      </span>
                      <span className="font-medium text-purple-200">{level.name}</span>
                    </div>
                    <ul className="text-sm text-slate-400 space-y-1">
                      {level.needs.map((need, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-purple-400 mt-1">•</span>
                          {need}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Success Criteria Selection */}
        <div className={`rounded-xl p-3 sm:p-6 border-2 ${colors.border} ${colors.bg}`}>
          <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <FileText className={`w-5 h-5 sm:w-6 sm:h-6 ${colors.text} flex-shrink-0`} />
              <div className="min-w-0">
                <h3 className="text-base sm:text-xl font-semibold truncate">Your {roleInfo.name} Criteria</h3>
                <p className="text-xs sm:text-sm text-slate-400">Select up to {MAX_CRITERIA_PER_ROLE} criteria</p>
              </div>
            </div>
            <div className={`text-sm sm:text-lg font-bold px-2 sm:px-4 py-1 sm:py-2 rounded-lg flex-shrink-0 ${
              selectedCriteria.length === MAX_CRITERIA_PER_ROLE
                ? 'bg-green-900/50 text-green-300'
                : selectedCriteria.length > 0
                  ? 'bg-amber-900/50 text-amber-300'
                  : 'bg-slate-700 text-slate-300'
            }`}>
              {selectedCriteria.length} / {MAX_CRITERIA_PER_ROLE} selected
            </div>
          </div>

          {hasConfirmed ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-400 mb-2">Selection Confirmed!</h3>
              <p className="text-slate-400">
                Waiting for all {roleInfo.name}s to confirm their selections...
              </p>
              <div className="mt-4 bg-slate-800/50 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-slate-400 mb-2">Your selected criteria:</p>
                <ul className="text-sm text-left space-y-1">
                  {selectedCriteria.map(id => {
                    const c = myCriteria.find(c => c.id === id);
                    return c ? (
                      <li key={id} className={`${colors.text}`}>• {c.text}</li>
                    ) : null;
                  })}
                </ul>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-1 gap-3">
              {myCriteria.map((criteria) => {
                const isSelected = selectedCriteria.includes(criteria.id);
                const isDisabled = !isSelected && selectedCriteria.length >= MAX_CRITERIA_PER_ROLE;

                return (
                  <div
                    key={criteria.id}
                    onClick={() => !isDisabled && toggleCriteria(criteria.id)}
                    className={`p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? `${colors.border} ${colors.bg}`
                        : isDisabled
                          ? 'border-slate-700 bg-slate-900/30 opacity-50 cursor-not-allowed'
                          : 'border-slate-700 bg-slate-900/50 hover:border-slate-500 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? `${colors.border} ${colors.bg}` : 'border-slate-500'
                      }`}>
                        {isSelected && <CheckCircle2 className={`w-4 h-4 ${colors.text}`} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm mb-2">{criteria.text}</p>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            {getSourceIcon(criteria.source)}
                            <span className="text-xs text-slate-500">{getSourceLabel(criteria.source)}</span>
                          </div>
                          <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">{criteria.category}</span>
                        </div>
                        {isSelected && criteria.requiredMeasurements && (
                          <div className="mt-2 pt-2 border-t border-slate-700">
                            <div className="flex items-center gap-1 text-xs text-green-400 mb-1">
                              <FlaskConical className="w-3 h-3" />
                              <span>Required measurements:</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {criteria.requiredMeasurements.map((m, i) => (
                                <span key={i} className="text-xs bg-green-900/30 text-green-300 px-1.5 py-0.5 rounded">
                                  {m.description}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 sm:mt-8 pb-16 sm:pb-8 text-center">
          {!hasConfirmed ? (
            <>
              <button
                onClick={handleConfirmSelection}
                disabled={selectedCriteria.length === 0 || (teammates.length > 0 && !hasConsensus)}
                className={`${colors.bg} hover:opacity-80 border-2 ${colors.border} disabled:bg-slate-600 disabled:border-slate-600 disabled:cursor-not-allowed px-8 py-3 rounded-lg font-semibold text-lg transition-colors`}
              >
                {teammates.length > 0 && !hasConsensus ? 'Waiting for Consensus...' : 'Confirm My Selection'}
              </button>
              {selectedCriteria.length === 0 ? (
                <p className="text-slate-500 text-sm mt-2">
                  Select at least 1 criteria to continue
                </p>
              ) : teammates.length > 0 && !hasConsensus ? (
                <p className="text-amber-400 text-sm mt-2">
                  All {roleInfo.name}s must select identical criteria before confirming
                </p>
              ) : null}
            </>
          ) : allRolesHaveConsensus ? (
            <button
              onClick={handleCompleteLevel}
              className="bg-green-600 hover:bg-green-500 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              Complete Level - Launch Criteria
            </button>
          ) : (
            <div className="bg-slate-800/50 rounded-lg px-6 py-4 inline-block">
              <p className="text-amber-400">
                Waiting for all team members to confirm their selections...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuccessCriteria;
