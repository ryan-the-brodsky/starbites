import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  createGameInDB,
  getGameFromDB,
  updateGameInDB,
  updateLevelInDB,
  updateLevelPathInDB,
  updateMetaInDB,
  addPlayerToDB,
  subscribeToGame,
  multiPathUpdate,
} from '../firebase';
import { useToast } from './ToastContext';

const GameContext = createContext(null);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

// Maximum players per team
const MAX_PLAYERS_PER_TEAM = 12;

// Generate a team ID from team name (sanitized, lowercase, no spaces)
const generateTeamId = (teamName) => {
  return teamName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
};

// Generate player ID
const generatePlayerId = () => {
  return 'player_' + Math.random().toString(36).substring(2, 10);
};

// Functional roles for players (separate from commander/crew game roles)
const FUNCTIONAL_ROLES = ['productDev', 'packageDev', 'quality', 'pim'];

// Initial game state structure
// 3 levels: Success Criteria, Sampling Plan, Mission Report
export const createInitialGameState = (teamId, teamName) => ({
  gameCode: teamId,
  teamId,
  meta: {
    teamName,
    createdAt: Date.now(),
    currentLevel: 0, // 0 = not started (show level select), 1-3 = active level
    highestUnlockedLevel: 1,
    totalScore: 0,
    isPaused: false,
    isLocked: false,
    gameStarted: false, // Commander must start the game after role selection
  },
  level1: {
    // Each role has their own criteria selections and consensus tracking
    roleSelections: {
      productDev: { playerSelections: {}, confirmedSelections: null, confirmedBy: [] },
      packageDev: { playerSelections: {}, confirmedSelections: null, confirmedBy: [] },
      quality: { playerSelections: {}, confirmedSelections: null, confirmedBy: [] },
      pim: { playerSelections: {}, confirmedSelections: null, confirmedBy: [] },
    },
    selectedCriteria: [], // Final merged criteria after all roles confirm
    score: 0,
    completedAt: null,
  },
  level2: {
    samplingPlan: null,
    score: 0,
    completedAt: null,
  },
  level3: {
    report: { summary: '', findings: '', recommendations: '' },
    score: 0,
    completedAt: null,
  },
  players: {},
  badges: [],
});

// Check if Firebase is configured
const isFirebaseConfigured = () => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  return apiKey && apiKey !== 'your-api-key-here' && apiKey.length > 10;
};

export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [role, setRole] = useState(null);
  const [useFirebase, setUseFirebase] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const unsubscribeRef = useRef(null);
  // Stale listener gating: skip Firebase listener updates shortly after local writes
  const lastLocalWriteRef = useRef(0);
  const { addToast } = useToast();

  // Handle Firebase errors with user-visible toast
  const handleFirebaseError = useCallback((error, retryFn) => {
    console.error('Firebase sync error:', error);
    addToast(
      'Changes may not have saved. Check your connection.',
      'warning',
      8000,
      retryFn ? { label: 'Retry', onClick: retryFn } : null
    );
  }, [addToast]);

  // Initialize player ID and check Firebase
  useEffect(() => {
    let storedPlayerId = localStorage.getItem('joybites_player_id');
    if (!storedPlayerId) {
      storedPlayerId = generatePlayerId();
      localStorage.setItem('joybites_player_id', storedPlayerId);
    }
    setPlayerId(storedPlayerId);

    // Check if Firebase is configured
    const firebaseEnabled = isFirebaseConfigured();
    setUseFirebase(firebaseEnabled);

    if (!firebaseEnabled) {
      // Fall back to localStorage
      const storedGameCode = localStorage.getItem('joybites_current_game');
      const storedRole = localStorage.getItem('joybites_role');
      if (storedGameCode) {
        const storedGame = localStorage.getItem(`joybites_game_${storedGameCode}`);
        if (storedGame) {
          setGameState(JSON.parse(storedGame));
          setRole(storedRole);
        }
      }
    }

    setIsLoading(false);
  }, []);

  // Persist game state to localStorage (fallback)
  const persistGameLocal = useCallback((state) => {
    if (state) {
      localStorage.setItem(`joybites_game_${state.gameCode}`, JSON.stringify(state));
      localStorage.setItem('joybites_current_game', state.gameCode);
    }
  }, []);

  // Persist game state to Firebase
  const persistGameFirebase = useCallback(async (state) => {
    if (state) {
      try {
        await updateGameInDB(state.gameCode, state);
      } catch (error) {
        console.error('Error persisting to Firebase:', error);
        // Fall back to localStorage
        persistGameLocal(state);
      }
    }
  }, [persistGameLocal]);

  // Unified persist function
  const persistGame = useCallback((state) => {
    if (useFirebase) {
      persistGameFirebase(state);
    } else {
      persistGameLocal(state);
    }
  }, [useFirebase, persistGameFirebase, persistGameLocal]);

  // Subscribe to game updates when joining/creating
  const subscribeToGameUpdates = useCallback((gameCode) => {
    if (!useFirebase) return;

    // Unsubscribe from previous game
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    // Subscribe to new game (with stale listener gating)
    unsubscribeRef.current = subscribeToGame(gameCode, (game) => {
      if (game) {
        // Skip listener updates if a local write happened recently to prevent stale overwrites
        if (Date.now() - lastLocalWriteRef.current < 500) {
          return;
        }
        setGameState(game);
      }
    });
  }, [useFirebase]);

  // Create new game (Commander)
  const createGame = useCallback(async (teamName) => {
    const teamId = generateTeamId(teamName);

    // Get player ID
    let currentPlayerId = playerId;
    if (!currentPlayerId) {
      currentPlayerId = localStorage.getItem('joybites_player_id');
      if (!currentPlayerId) {
        currentPlayerId = generatePlayerId();
        localStorage.setItem('joybites_player_id', currentPlayerId);
      }
      setPlayerId(currentPlayerId);
    }

    // Check if team already exists
    if (useFirebase) {
      try {
        const existingGame = await getGameFromDB(teamId);
        if (existingGame) {
          return { success: false, error: 'A team with this name already exists. Try a different name or join the existing team.' };
        }
      } catch (error) {
        console.error('Error checking existing game:', error);
      }
    } else {
      const existingGame = localStorage.getItem(`joybites_game_${teamId}`);
      if (existingGame) {
        return { success: false, error: 'A team with this name already exists. Try a different name or join the existing team.' };
      }
    }

    const newGame = createInitialGameState(teamId, teamName);

    // Add commander as first player
    newGame.players[currentPlayerId] = {
      role: 'commander',
      functionalRole: null, // Will be set during role selection
      joinedAt: Date.now(),
      lastActive: Date.now(),
    };

    // Save to database
    if (useFirebase) {
      try {
        await createGameInDB(teamId, newGame);
        subscribeToGameUpdates(teamId);
      } catch (error) {
        console.error('Error creating game in Firebase:', error);
        // Fall back to localStorage
        persistGameLocal(newGame);
      }
    } else {
      persistGameLocal(newGame);
    }

    setGameState(newGame);
    setRole('commander');
    localStorage.setItem('joybites_role', 'commander');
    localStorage.setItem('joybites_current_game', teamId);

    return { success: true, teamId };
  }, [playerId, useFirebase, persistGameLocal, subscribeToGameUpdates]);

  // Join existing game by team name (Crew)
  const joinGame = useCallback(async (teamName) => {
    const teamId = generateTeamId(teamName);

    // Get player ID
    let currentPlayerId = playerId;
    if (!currentPlayerId) {
      currentPlayerId = localStorage.getItem('joybites_player_id');
      if (!currentPlayerId) {
        currentPlayerId = generatePlayerId();
        localStorage.setItem('joybites_player_id', currentPlayerId);
      }
      setPlayerId(currentPlayerId);
    }

    let game = null;

    if (useFirebase) {
      try {
        game = await getGameFromDB(teamId);
      } catch (error) {
        console.error('Error getting game from Firebase:', error);
      }
    } else {
      const storedGame = localStorage.getItem(`joybites_game_${teamId}`);
      if (storedGame) {
        game = JSON.parse(storedGame);
      }
    }

    if (game) {
      // Check if already a member
      if (game.players && game.players[currentPlayerId]) {
        setGameState(game);
        setRole(game.players[currentPlayerId].role);
        localStorage.setItem('joybites_role', game.players[currentPlayerId].role);
        localStorage.setItem('joybites_current_game', teamId);

        if (useFirebase) {
          subscribeToGameUpdates(teamId);
        }

        return { success: true, teamId };
      }

      // Check if team is locked (full)
      const playerCount = Object.keys(game.players || {}).length;
      if (playerCount >= MAX_PLAYERS_PER_TEAM || game.meta?.isLocked) {
        return { success: false, error: `This team is full (${MAX_PLAYERS_PER_TEAM} players maximum). Try joining a different team.` };
      }

      // Add crew member
      const playerData = {
        role: 'crew',
        functionalRole: null, // Will be set during role selection
        joinedAt: Date.now(),
        lastActive: Date.now(),
      };

      if (!game.players) {
        game.players = {};
      }
      game.players[currentPlayerId] = playerData;

      // Lock team if now full
      if (Object.keys(game.players).length >= MAX_PLAYERS_PER_TEAM) {
        game.meta.isLocked = true;
      }

      // Save updates
      if (useFirebase) {
        try {
          await addPlayerToDB(teamId, currentPlayerId, playerData);
          if (game.meta.isLocked) {
            await updateMetaInDB(teamId, { isLocked: true });
          }
          subscribeToGameUpdates(teamId);
        } catch (error) {
          console.error('Error adding player to Firebase:', error);
          persistGameLocal(game);
        }
      } else {
        persistGameLocal(game);
      }

      setGameState(game);
      setRole('crew');
      localStorage.setItem('joybites_role', 'crew');
      localStorage.setItem('joybites_current_game', teamId);

      return { success: true, teamId };
    }

    // Team doesn't exist
    return {
      success: false,
      error: useFirebase
        ? 'No team found with that name. Check the spelling or create a new team.'
        : 'No team found with that name. Note: Teams can only be joined from the same browser where they were created. Check the spelling or create a new team.'
    };
  }, [playerId, useFirebase, persistGameLocal, subscribeToGameUpdates]);

  // Update game state
  const updateGameState = useCallback((updates) => {
    lastLocalWriteRef.current = Date.now();
    setGameState(prev => {
      if (!prev) return prev;
      const newState = { ...prev, ...updates };
      persistGame(newState);
      return newState;
    });
  }, [persistGame]);

  // Update level state
  const updateLevelState = useCallback((levelKey, updates) => {
    lastLocalWriteRef.current = Date.now();
    setGameState(prev => {
      if (!prev) return prev;
      const newState = {
        ...prev,
        [levelKey]: { ...prev[levelKey], ...updates },
      };

      if (useFirebase && prev.gameCode) {
        // Extract level number from levelKey (e.g., 'level1' -> 1)
        const levelNum = parseInt(levelKey.replace('level', ''));
        if (!isNaN(levelNum)) {
          updateLevelInDB(prev.gameCode, levelNum, updates).catch(err => handleFirebaseError(err));
        }
      } else {
        persistGameLocal(newState);
      }

      return newState;
    });
  }, [useFirebase, persistGameLocal]);

  // Complete a level (3 levels total)
  const completeLevel = useCallback((levelNum) => {
    const badges = {
      1: 'criteria-master',
      2: 'sampling-specialist',
      3: 'mission-commander',
    };

    lastLocalWriteRef.current = Date.now();
    setGameState(prev => {
      if (!prev) return prev;
      const currentBadges = prev.badges || [];
      const newBadges = currentBadges.includes(badges[levelNum])
        ? currentBadges
        : [...currentBadges, badges[levelNum]];

      const nextLevel = Math.min(levelNum + 1, 3);
      const newState = {
        ...prev,
        meta: {
          ...prev.meta,
          currentLevel: nextLevel,
          highestUnlockedLevel: Math.max(prev.meta.highestUnlockedLevel || 1, nextLevel),
        },
        [`level${levelNum}`]: {
          ...prev[`level${levelNum}`],
          completedAt: Date.now(),
        },
        badges: newBadges,
      };
      persistGame(newState);
      return newState;
    });
  }, [persistGame]);

  // Navigate to a specific level
  const navigateToLevel = useCallback((levelNum, force = false) => {
    lastLocalWriteRef.current = Date.now();
    setGameState(prev => {
      if (!prev) return prev;
      const highestUnlocked = prev.meta.highestUnlockedLevel || 1;
      if (levelNum < 0 || (levelNum > 0 && levelNum > highestUnlocked && !force)) {
        return prev;
      }
      const newState = {
        ...prev,
        meta: {
          ...prev.meta,
          currentLevel: levelNum,
        },
      };

      if (useFirebase && prev.gameCode) {
        updateMetaInDB(prev.gameCode, { currentLevel: levelNum }).catch(err => handleFirebaseError(err));
      } else {
        persistGameLocal(newState);
      }

      return newState;
    });
  }, [useFirebase, persistGameLocal]);

  // Update player's functional role (productDev, packageDev, quality)
  const updatePlayerRole = useCallback((functionalRole) => {
    if (!playerId || !gameState) return;

    lastLocalWriteRef.current = Date.now();
    setGameState(prev => {
      if (!prev || !prev.players[playerId]) return prev;

      const newState = {
        ...prev,
        players: {
          ...prev.players,
          [playerId]: {
            ...prev.players[playerId],
            functionalRole,
          },
        },
      };

      if (useFirebase && prev.gameCode) {
        addPlayerToDB(prev.gameCode, playerId, newState.players[playerId]).catch(err => handleFirebaseError(err));
      } else {
        persistGameLocal(newState);
      }

      // Also store in localStorage for quick access
      localStorage.setItem('joybites_functional_role', functionalRole);

      return newState;
    });
  }, [playerId, gameState, useFirebase, persistGameLocal]);

  // Start the game (Commander only)
  const startGame = useCallback(() => {
    if (!gameState || role !== 'commander') return;

    lastLocalWriteRef.current = Date.now();
    setGameState(prev => {
      if (!prev) return prev;

      const newState = {
        ...prev,
        meta: {
          ...prev.meta,
          gameStarted: true,
        },
      };

      if (useFirebase && prev.gameCode) {
        updateMetaInDB(prev.gameCode, { gameStarted: true }).catch(err => handleFirebaseError(err));
      } else {
        persistGameLocal(newState);
      }

      return newState;
    });
  }, [gameState, role, useFirebase, persistGameLocal]);

  // Get players grouped by functional role
  const getPlayersByRole = useCallback(() => {
    if (!gameState?.players) return { productDev: [], packageDev: [], quality: [], pim: [], unassigned: [] };

    const grouped = { productDev: [], packageDev: [], quality: [], pim: [], unassigned: [] };
    Object.entries(gameState.players).forEach(([id, player]) => {
      const roleKey = player.functionalRole || 'unassigned';
      if (grouped[roleKey]) {
        grouped[roleKey].push({ id, ...player });
      } else {
        grouped.unassigned.push({ id, ...player });
      }
    });
    return grouped;
  }, [gameState]);

  // Update player's criteria selections in real-time (for consensus tracking)
  const updatePlayerCriteriaSelections = useCallback((selectedCriteriaIds) => {
    if (!playerId || !gameState) return;

    // Get functional role from current game state
    const playerFunctionalRole = gameState?.players?.[playerId]?.functionalRole;
    if (!playerFunctionalRole) return;

    lastLocalWriteRef.current = Date.now();
    setGameState(prev => {
      if (!prev) return prev;

      const roleSelections = prev.level1?.roleSelections || {};
      const currentRoleData = roleSelections[playerFunctionalRole] || { playerSelections: {}, confirmedSelections: null, confirmedBy: [] };

      const newRoleSelections = {
        ...roleSelections,
        [playerFunctionalRole]: {
          ...currentRoleData,
          playerSelections: {
            ...currentRoleData.playerSelections,
            [playerId]: selectedCriteriaIds,
          },
        },
      };

      const newState = {
        ...prev,
        level1: {
          ...prev.level1,
          roleSelections: newRoleSelections,
        },
      };

      if (useFirebase && prev.gameCode) {
        // Use path-based update to avoid overwriting other players' selections
        const path = `roleSelections/${playerFunctionalRole}/playerSelections/${playerId}`;
        updateLevelPathInDB(prev.gameCode, 1, path, selectedCriteriaIds).catch(err => handleFirebaseError(err));
      } else {
        persistGameLocal(newState);
      }

      return newState;
    });
  }, [playerId, gameState, useFirebase, persistGameLocal]);

  // Confirm criteria selection (only works when all players in role have same selections)
  const confirmCriteriaSelection = useCallback((selectedCriteriaData) => {
    if (!playerId || !gameState) return false;

    // Get functional role from current game state
    const playerFunctionalRole = gameState?.players?.[playerId]?.functionalRole;
    if (!playerFunctionalRole) return false;

    lastLocalWriteRef.current = Date.now();
    setGameState(prev => {
      if (!prev) return prev;

      const roleSelections = prev.level1?.roleSelections || {};
      const currentRoleData = roleSelections[playerFunctionalRole] || { playerSelections: {}, confirmedSelections: null, confirmedBy: [] };

      const newConfirmedBy = [...(currentRoleData.confirmedBy || []).filter(id => id !== playerId), playerId];

      const newRoleSelections = {
        ...roleSelections,
        [playerFunctionalRole]: {
          ...currentRoleData,
          confirmedSelections: selectedCriteriaData,
          confirmedBy: newConfirmedBy,
        },
      };

      const newState = {
        ...prev,
        level1: {
          ...prev.level1,
          roleSelections: newRoleSelections,
        },
      };

      if (useFirebase && prev.gameCode) {
        // Atomic multi-path update for confirmedSelections and confirmedBy
        const basePath = `games/${prev.gameCode}/level1/roleSelections/${playerFunctionalRole}`;
        multiPathUpdate({
          [`${basePath}/confirmedSelections`]: selectedCriteriaData,
          [`${basePath}/confirmedBy`]: newConfirmedBy,
        }).catch(err => handleFirebaseError(err));
      } else {
        persistGameLocal(newState);
      }

      return newState;
    });

    return true;
  }, [playerId, gameState, useFirebase, persistGameLocal]);

  // Leave current game
  const leaveGame = useCallback(() => {
    // Unsubscribe from real-time updates
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    // Don't delete the game from database, just leave it
    // (Other players might still be playing)

    // Clear local state
    setGameState(null);
    setRole(null);
    localStorage.removeItem('joybites_current_game');
    localStorage.removeItem('joybites_role');
  }, []);

  // Get current player's functional role
  const functionalRole = gameState?.players?.[playerId]?.functionalRole || null;

  const value = {
    gameState,
    playerId,
    role,
    functionalRole,
    useFirebase,
    isLoading,
    createGame,
    joinGame,
    leaveGame,
    updateGameState,
    updateLevelState,
    completeLevel,
    navigateToLevel,
    updatePlayerRole,
    startGame,
    getPlayersByRole,
    updatePlayerCriteriaSelections,
    confirmCriteriaSelection,
    isInGame: !!gameState,
    isCommander: role === 'commander',
    isCrew: role === 'crew',
    gameStarted: gameState?.meta?.gameStarted || false,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export default GameContext;
