import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  getAllGamesFromDB,
  updateGameInDB,
  updateMetaInDB,
  removeGameFromDB,
  subscribeToAllGames,
  multiPathUpdate,
} from '../firebase';
import { createInitialGameState } from './GameContext';

const AdminContext = createContext(null);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

// Check if Firebase is configured
const isFirebaseConfigured = () => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  return apiKey && apiKey !== 'your-api-key-here' && apiKey.length > 10;
};

export const AdminProvider = ({ children }) => {
  const [allGames, setAllGames] = useState({});
  const useFirebase = isFirebaseConfigured();

  // Subscribe to all games only when admin page is mounted
  useEffect(() => {
    if (useFirebase) {
      const unsubscribe = subscribeToAllGames((games) => {
        setAllGames(games || {});
      });
      return () => unsubscribe();
    } else {
      // Load from localStorage
      const allStoredGames = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('joybites_game_')) {
          try {
            const game = JSON.parse(localStorage.getItem(key));
            allStoredGames[game.gameCode] = game;
          } catch (e) {
            // Skip invalid entries
          }
        }
      }
      setAllGames(allStoredGames);
    }
  }, [useFirebase]);

  // Derived leaderboard data (memoized)
  const leaderboard = useMemo(() => {
    return Object.values(allGames)
      .map(game => ({
        teamName: game.meta?.teamName || 'Unknown',
        score: game.meta?.totalScore || 0,
        currentLevel: game.meta?.currentLevel || 0,
      }))
      .sort((a, b) => b.score - a.score);
  }, [allGames]);

  // Pause/Resume all games (batched for Firebase)
  const toggleGlobalPause = useCallback(async (isPaused) => {
    if (useFirebase) {
      const games = await getAllGamesFromDB();
      const gameCodes = Object.keys(games);
      const BATCH_SIZE = 50;
      for (let i = 0; i < gameCodes.length; i += BATCH_SIZE) {
        const batch = gameCodes.slice(i, i + BATCH_SIZE);
        const updates = {};
        batch.forEach(code => {
          updates[`games/${code}/meta/isPaused`] = isPaused;
        });
        await multiPathUpdate(updates);
      }
    } else {
      setAllGames(prev => {
        const updated = {};
        Object.keys(prev).forEach(code => {
          updated[code] = {
            ...prev[code],
            meta: { ...prev[code].meta, isPaused },
          };
          localStorage.setItem(`joybites_game_${code}`, JSON.stringify(updated[code]));
        });
        return updated;
      });
    }
  }, [useFirebase]);

  // Reset team progress
  const resetTeamProgress = useCallback(async (gameCode) => {
    const game = allGames[gameCode];
    if (!game) return null;

    // Return pre-reset state for undo
    const preResetState = JSON.parse(JSON.stringify(game));

    const resetGame = createInitialGameState(gameCode, game.meta.teamName);
    resetGame.players = game.players;

    if (useFirebase) {
      await updateGameInDB(gameCode, resetGame);
    } else {
      localStorage.setItem(`joybites_game_${gameCode}`, JSON.stringify(resetGame));
      setAllGames(prev => ({ ...prev, [gameCode]: resetGame }));
    }

    return preResetState;
  }, [allGames, useFirebase]);

  // Undo reset (restore pre-reset state)
  const restoreTeam = useCallback(async (gameCode, preResetState) => {
    if (useFirebase) {
      await updateGameInDB(gameCode, preResetState);
    } else {
      localStorage.setItem(`joybites_game_${gameCode}`, JSON.stringify(preResetState));
      setAllGames(prev => ({ ...prev, [gameCode]: preResetState }));
    }
  }, [useFirebase]);

  // Delete team
  const deleteTeam = useCallback(async (gameCode) => {
    if (useFirebase) {
      await removeGameFromDB(gameCode);
    } else {
      localStorage.removeItem(`joybites_game_${gameCode}`);
      setAllGames(prev => {
        const updated = { ...prev };
        delete updated[gameCode];
        return updated;
      });
    }
  }, [useFirebase]);

  // Delete all teams (batched in groups of 50 for Firebase)
  const deleteAllTeams = useCallback(async () => {
    const gameCodes = Object.keys(allGames);
    if (useFirebase) {
      // Batch deletes in groups of 50 using multi-path updates
      const BATCH_SIZE = 50;
      for (let i = 0; i < gameCodes.length; i += BATCH_SIZE) {
        const batch = gameCodes.slice(i, i + BATCH_SIZE);
        const updates = {};
        batch.forEach(code => {
          updates[`games/${code}`] = null;
        });
        await multiPathUpdate(updates);
      }
    } else {
      gameCodes.forEach(code => localStorage.removeItem(`joybites_game_${code}`));
      setAllGames({});
    }
  }, [allGames, useFirebase]);

  // Advance all teams to a target level (batched for Firebase)
  const advanceAllTeams = useCallback(async (targetLevel) => {
    if (useFirebase) {
      const eligibleCodes = Object.entries(allGames)
        .filter(([, game]) => targetLevel > (game.meta?.highestUnlockedLevel || 1))
        .map(([code]) => code);
      const BATCH_SIZE = 50;
      for (let i = 0; i < eligibleCodes.length; i += BATCH_SIZE) {
        const batch = eligibleCodes.slice(i, i + BATCH_SIZE);
        const updates = {};
        batch.forEach(code => {
          updates[`games/${code}/meta/highestUnlockedLevel`] = targetLevel;
        });
        await multiPathUpdate(updates);
      }
    } else {
      Object.entries(allGames).forEach(([gameCode, game]) => {
        const currentHighest = game.meta?.highestUnlockedLevel || 1;
        if (targetLevel > currentHighest) {
          const updated = {
            ...game,
            meta: { ...game.meta, highestUnlockedLevel: targetLevel },
          };
          localStorage.setItem(`joybites_game_${gameCode}`, JSON.stringify(updated));
          setAllGames(prev => ({ ...prev, [gameCode]: updated }));
        }
      });
    }
  }, [allGames, useFirebase]);

  // Start/stop timer for all teams (batched for Firebase)
  const setGlobalTimer = useCallback(async (levelNum, durationMinutes) => {
    const timerData = durationMinutes
      ? { isActive: true, startedAt: Date.now(), durationMinutes, levelNum }
      : { isActive: false, startedAt: null, durationMinutes: null, levelNum: null };

    if (useFirebase) {
      const gameCodes = Object.keys(allGames);
      const BATCH_SIZE = 50;
      for (let i = 0; i < gameCodes.length; i += BATCH_SIZE) {
        const batch = gameCodes.slice(i, i + BATCH_SIZE);
        const updates = {};
        batch.forEach(code => {
          updates[`games/${code}/meta/timer`] = timerData;
        });
        await multiPathUpdate(updates);
      }
    } else {
      setAllGames(prev => {
        const updated = {};
        Object.entries(prev).forEach(([code, game]) => {
          updated[code] = { ...game, meta: { ...game.meta, timer: timerData } };
          localStorage.setItem(`joybites_game_${code}`, JSON.stringify(updated[code]));
        });
        return updated;
      });
    }
  }, [allGames, useFirebase]);

  // Pagination: visible count with "Load More" pattern
  const [visibleCount, setVisibleCount] = useState(50);

  // Sorted games by createdAt descending
  const sortedGameCodes = useMemo(() => {
    return Object.keys(allGames).sort((a, b) => {
      return (allGames[b]?.meta?.createdAt || 0) - (allGames[a]?.meta?.createdAt || 0);
    });
  }, [allGames]);

  const visibleGames = useMemo(() => {
    const codes = sortedGameCodes.slice(0, visibleCount);
    const result = {};
    codes.forEach(code => { result[code] = allGames[code]; });
    return result;
  }, [allGames, sortedGameCodes, visibleCount]);

  const hasMore = sortedGameCodes.length > visibleCount;

  const loadMore = useCallback(() => {
    setVisibleCount(prev => prev + 50);
  }, []);

  const value = {
    allGames: visibleGames,
    totalGameCount: sortedGameCodes.length,
    hasMore,
    loadMore,
    leaderboard,
    useFirebase,
    toggleGlobalPause,
    resetTeamProgress,
    restoreTeam,
    deleteTeam,
    deleteAllTeams,
    advanceAllTeams,
    setGlobalTimer,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export default AdminContext;
