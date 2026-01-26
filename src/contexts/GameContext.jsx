import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  createGameInDB,
  getGameFromDB,
  updateGameInDB,
  updateLevelInDB,
  updateMetaInDB,
  addPlayerToDB,
  removeGameFromDB,
  getAllGamesFromDB,
  subscribeToGame,
  subscribeToAllGames,
} from '../firebase';

const GameContext = createContext(null);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

// Maximum players per team
const MAX_PLAYERS_PER_TEAM = 4;

// Generate a team ID from team name (sanitized, lowercase, no spaces)
const generateTeamId = (teamName) => {
  return teamName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
};

// Generate player ID
const generatePlayerId = () => {
  return 'player_' + Math.random().toString(36).substring(2, 10);
};

// Initial game state structure
// 4 levels: Success Criteria, Pretrial Checklist, Sampling Plan, Mission Report
const createInitialGameState = (teamId, teamName) => ({
  gameCode: teamId,
  teamId,
  meta: {
    teamName,
    createdAt: Date.now(),
    currentLevel: 0, // 0 = not started (show level select), 1-4 = active level
    highestUnlockedLevel: 1,
    totalScore: 0,
    isPaused: false,
    isLocked: false,
  },
  level1: {
    selectedCriteria: [],
    score: 0,
    completedAt: null,
  },
  level2: {
    currentPhase: 1,
    currentTaskIndex: 0,
    completedTasks: [],
    score: 0,
    penalties: 0,
    startedAt: null,
    completedAt: null,
  },
  level3: {
    samplingPlan: null,
    score: 0,
    completedAt: null,
  },
  level4: {
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
  const [leaderboard, setLeaderboard] = useState([]);
  const [allGames, setAllGames] = useState({});
  const [useFirebase, setUseFirebase] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const unsubscribeRef = useRef(null);

  // Initialize player ID and check Firebase
  useEffect(() => {
    let storedPlayerId = localStorage.getItem('starbites_player_id');
    if (!storedPlayerId) {
      storedPlayerId = generatePlayerId();
      localStorage.setItem('starbites_player_id', storedPlayerId);
    }
    setPlayerId(storedPlayerId);

    // Check if Firebase is configured
    const firebaseEnabled = isFirebaseConfigured();
    setUseFirebase(firebaseEnabled);

    if (!firebaseEnabled) {
      // Fall back to localStorage
      const storedGameCode = localStorage.getItem('starbites_current_game');
      const storedRole = localStorage.getItem('starbites_role');
      if (storedGameCode) {
        const storedGame = localStorage.getItem(`starbites_game_${storedGameCode}`);
        if (storedGame) {
          setGameState(JSON.parse(storedGame));
          setRole(storedRole);
        }
      }
      // Load all games for admin
      const allStoredGames = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('starbites_game_')) {
          const game = JSON.parse(localStorage.getItem(key));
          allStoredGames[game.gameCode] = game;
        }
      }
      setAllGames(allStoredGames);
    }

    setIsLoading(false);
  }, []);

  // Subscribe to all games for admin/leaderboard when using Firebase
  useEffect(() => {
    if (!useFirebase) return;

    const unsubscribe = subscribeToAllGames((games) => {
      setAllGames(games || {});
      // Update leaderboard from all games
      const leaderboardData = Object.values(games || {})
        .map(game => ({
          teamName: game.meta?.teamName || 'Unknown',
          score: game.meta?.totalScore || 0,
          currentLevel: game.meta?.currentLevel || 0,
        }))
        .sort((a, b) => b.score - a.score);
      setLeaderboard(leaderboardData);
    });

    return () => unsubscribe();
  }, [useFirebase]);

  // Persist game state to localStorage (fallback)
  const persistGameLocal = useCallback((state) => {
    if (state) {
      localStorage.setItem(`starbites_game_${state.gameCode}`, JSON.stringify(state));
      localStorage.setItem('starbites_current_game', state.gameCode);
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

    // Subscribe to new game
    unsubscribeRef.current = subscribeToGame(gameCode, (game) => {
      if (game) {
        setGameState(game);
        // Update local leaderboard entry
        setLeaderboard(current => {
          const existing = current.find(t => t.teamName === game.meta?.teamName);
          if (existing) {
            return current.map(t =>
              t.teamName === game.meta?.teamName
                ? { ...t, score: game.meta?.totalScore || 0, currentLevel: game.meta?.currentLevel || 0 }
                : t
            ).sort((a, b) => b.score - a.score);
          }
          return [...current, {
            teamName: game.meta?.teamName || 'Unknown',
            score: game.meta?.totalScore || 0,
            currentLevel: game.meta?.currentLevel || 0,
          }].sort((a, b) => b.score - a.score);
        });
      }
    });
  }, [useFirebase]);

  // Create new game (Commander)
  const createGame = useCallback(async (teamName) => {
    const teamId = generateTeamId(teamName);

    // Get player ID
    let currentPlayerId = playerId;
    if (!currentPlayerId) {
      currentPlayerId = localStorage.getItem('starbites_player_id');
      if (!currentPlayerId) {
        currentPlayerId = generatePlayerId();
        localStorage.setItem('starbites_player_id', currentPlayerId);
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
      const existingGame = localStorage.getItem(`starbites_game_${teamId}`);
      if (existingGame) {
        return { success: false, error: 'A team with this name already exists. Try a different name or join the existing team.' };
      }
    }

    const newGame = createInitialGameState(teamId, teamName);

    // Add commander as first player
    newGame.players[currentPlayerId] = {
      role: 'commander',
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
    localStorage.setItem('starbites_role', 'commander');
    localStorage.setItem('starbites_current_game', teamId);

    return { success: true, teamId };
  }, [playerId, useFirebase, persistGameLocal, subscribeToGameUpdates]);

  // Join existing game by team name (Crew)
  const joinGame = useCallback(async (teamName) => {
    const teamId = generateTeamId(teamName);

    // Get player ID
    let currentPlayerId = playerId;
    if (!currentPlayerId) {
      currentPlayerId = localStorage.getItem('starbites_player_id');
      if (!currentPlayerId) {
        currentPlayerId = generatePlayerId();
        localStorage.setItem('starbites_player_id', currentPlayerId);
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
      const storedGame = localStorage.getItem(`starbites_game_${teamId}`);
      if (storedGame) {
        game = JSON.parse(storedGame);
      }
    }

    if (game) {
      // Check if already a member
      if (game.players && game.players[currentPlayerId]) {
        setGameState(game);
        setRole(game.players[currentPlayerId].role);
        localStorage.setItem('starbites_role', game.players[currentPlayerId].role);
        localStorage.setItem('starbites_current_game', teamId);

        if (useFirebase) {
          subscribeToGameUpdates(teamId);
        }

        return { success: true, teamId };
      }

      // Check if team is locked (full)
      const playerCount = Object.keys(game.players || {}).length;
      if (playerCount >= MAX_PLAYERS_PER_TEAM || game.meta?.isLocked) {
        return { success: false, error: 'This team is full (4 players maximum). Try joining a different team.' };
      }

      // Add crew member
      const playerData = {
        role: 'crew',
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
      localStorage.setItem('starbites_role', 'crew');
      localStorage.setItem('starbites_current_game', teamId);

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
    setGameState(prev => {
      if (!prev) return prev;
      const newState = { ...prev, ...updates };
      persistGame(newState);
      return newState;
    });
  }, [persistGame]);

  // Update level state
  const updateLevelState = useCallback((levelKey, updates) => {
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
          updateLevelInDB(prev.gameCode, levelNum, updates).catch(console.error);
        }
      } else {
        persistGameLocal(newState);
      }

      return newState;
    });
  }, [useFirebase, persistGameLocal]);

  // Complete a task in Level 2 (Pretrial Checklist)
  const completeTask = useCallback((taskId, points) => {
    setGameState(prev => {
      if (!prev) return prev;
      const level2 = prev.level2 || { completedTasks: [], score: 0, currentTaskIndex: 0 };
      const newCompletedTasks = [...(level2.completedTasks || []), taskId];
      const newScore = (level2.score || 0) + points;
      const newTotalScore = (prev.meta?.totalScore || 0) + points;

      const newState = {
        ...prev,
        meta: { ...prev.meta, totalScore: newTotalScore },
        level2: {
          ...level2,
          completedTasks: newCompletedTasks,
          score: newScore,
          currentTaskIndex: (level2.currentTaskIndex || 0) + 1,
        },
      };
      persistGame(newState);
      return newState;
    });
  }, [persistGame]);

  // Apply penalty for Level 2
  const applyPenalty = useCallback((amount) => {
    setGameState(prev => {
      if (!prev) return prev;
      const level2 = prev.level2 || { score: 0, penalties: 0 };
      const newState = {
        ...prev,
        meta: { ...prev.meta, totalScore: Math.max(0, (prev.meta?.totalScore || 0) - amount) },
        level2: {
          ...level2,
          score: Math.max(0, (level2.score || 0) - amount),
          penalties: (level2.penalties || 0) + 1,
        },
      };
      persistGame(newState);
      return newState;
    });
  }, [persistGame]);

  // Complete a level (4 levels total)
  const completeLevel = useCallback((levelNum) => {
    const badges = {
      1: 'criteria-master',
      2: 'launch-engineer',
      3: 'sampling-specialist',
      4: 'mission-commander',
    };

    setGameState(prev => {
      if (!prev) return prev;
      const currentBadges = prev.badges || [];
      const newBadges = currentBadges.includes(badges[levelNum])
        ? currentBadges
        : [...currentBadges, badges[levelNum]];

      const nextLevel = Math.min(levelNum + 1, 4);
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

      // Update leaderboard
      setLeaderboard(current => {
        const existing = current.find(t => t.teamName === prev.meta.teamName);
        if (existing) {
          return current.map(t =>
            t.teamName === prev.meta.teamName
              ? { ...t, score: newState.meta.totalScore, currentLevel: newState.meta.currentLevel }
              : t
          ).sort((a, b) => b.score - a.score);
        }
        return [...current, {
          teamName: prev.meta.teamName,
          score: newState.meta.totalScore,
          currentLevel: newState.meta.currentLevel,
        }].sort((a, b) => b.score - a.score);
      });

      return newState;
    });
  }, [persistGame]);

  // Navigate to a specific level
  const navigateToLevel = useCallback((levelNum, force = false) => {
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
        updateMetaInDB(prev.gameCode, { currentLevel: levelNum }).catch(console.error);
      } else {
        persistGameLocal(newState);
      }

      return newState;
    });
  }, [useFirebase, persistGameLocal]);

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
    localStorage.removeItem('starbites_current_game');
    localStorage.removeItem('starbites_role');
  }, []);

  // Admin: Pause/Resume all games
  const toggleGlobalPause = useCallback(async (isPaused) => {
    if (useFirebase) {
      // Update all games in Firebase
      const games = await getAllGamesFromDB();
      for (const gameCode of Object.keys(games)) {
        await updateMetaInDB(gameCode, { isPaused });
      }
    } else {
      setAllGames(prev => {
        const updated = {};
        Object.keys(prev).forEach(code => {
          updated[code] = {
            ...prev[code],
            meta: { ...prev[code].meta, isPaused },
          };
          localStorage.setItem(`starbites_game_${code}`, JSON.stringify(updated[code]));
        });
        return updated;
      });
    }

    if (gameState) {
      setGameState(prev => ({
        ...prev,
        meta: { ...prev.meta, isPaused },
      }));
    }
  }, [useFirebase, gameState]);

  // Admin: Reset team progress
  const resetTeamProgress = useCallback(async (gameCode) => {
    const game = allGames[gameCode];
    if (game) {
      const resetGame = createInitialGameState(gameCode, game.meta.teamName);
      resetGame.players = game.players;

      if (useFirebase) {
        await updateGameInDB(gameCode, resetGame);
      } else {
        localStorage.setItem(`starbites_game_${gameCode}`, JSON.stringify(resetGame));
        setAllGames(prev => ({ ...prev, [gameCode]: resetGame }));
      }

      if (gameState?.gameCode === gameCode) {
        setGameState(resetGame);
      }
    }
  }, [allGames, gameState, useFirebase]);

  // Admin: Delete team
  const deleteTeam = useCallback(async (gameCode) => {
    if (useFirebase) {
      await removeGameFromDB(gameCode);
    } else {
      localStorage.removeItem(`starbites_game_${gameCode}`);
      setAllGames(prev => {
        const updated = { ...prev };
        delete updated[gameCode];
        return updated;
      });
    }

    if (gameState?.gameCode === gameCode) {
      setGameState(null);
      setRole(null);
      localStorage.removeItem('starbites_current_game');
      localStorage.removeItem('starbites_role');
    }
  }, [gameState, useFirebase]);

  const value = {
    gameState,
    playerId,
    role,
    leaderboard,
    allGames,
    useFirebase,
    isLoading,
    createGame,
    joinGame,
    leaveGame,
    updateGameState,
    updateLevelState,
    completeTask,
    applyPenalty,
    completeLevel,
    navigateToLevel,
    toggleGlobalPause,
    resetTeamProgress,
    deleteTeam,
    isInGame: !!gameState,
    isCommander: role === 'commander',
    isCrew: role === 'crew',
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export default GameContext;
