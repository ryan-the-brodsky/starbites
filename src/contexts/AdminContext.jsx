import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  getAllGamesFromDB,
  updateGameInDB,
  updateMetaInDB,
  removeGameFromDB,
  subscribeToAllGames,
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

  // Pause/Resume all games
  const toggleGlobalPause = useCallback(async (isPaused) => {
    if (useFirebase) {
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

  // Advance all teams to a target level
  const advanceAllTeams = useCallback(async (targetLevel) => {
    for (const [gameCode, game] of Object.entries(allGames)) {
      const currentHighest = game.meta?.highestUnlockedLevel || 1;
      if (targetLevel > currentHighest) {
        if (useFirebase) {
          await updateMetaInDB(gameCode, { highestUnlockedLevel: targetLevel });
        } else {
          const updated = {
            ...game,
            meta: { ...game.meta, highestUnlockedLevel: targetLevel },
          };
          localStorage.setItem(`joybites_game_${gameCode}`, JSON.stringify(updated));
          setAllGames(prev => ({ ...prev, [gameCode]: updated }));
        }
      }
    }
  }, [allGames, useFirebase]);

  // Start/stop timer for all teams
  const setGlobalTimer = useCallback(async (levelNum, durationMinutes) => {
    const timerData = durationMinutes
      ? { isActive: true, startedAt: Date.now(), durationMinutes, levelNum }
      : { isActive: false, startedAt: null, durationMinutes: null, levelNum: null };

    for (const gameCode of Object.keys(allGames)) {
      if (useFirebase) {
        await updateMetaInDB(gameCode, { timer: timerData });
      } else {
        const game = allGames[gameCode];
        const updated = { ...game, meta: { ...game.meta, timer: timerData } };
        localStorage.setItem(`joybites_game_${gameCode}`, JSON.stringify(updated));
      }
    }

    if (!useFirebase) {
      setAllGames(prev => {
        const updated = {};
        Object.entries(prev).forEach(([code, game]) => {
          updated[code] = { ...game, meta: { ...game.meta, timer: timerData } };
        });
        return updated;
      });
    }
  }, [allGames, useFirebase]);

  const value = {
    allGames,
    leaderboard,
    useFirebase,
    toggleGlobalPause,
    resetTeamProgress,
    restoreTeam,
    deleteTeam,
    advanceAllTeams,
    setGlobalTimer,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export default AdminContext;
