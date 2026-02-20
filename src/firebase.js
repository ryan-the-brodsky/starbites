import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue, update, remove, push } from 'firebase/database';

// Firebase configuration - replace with your own config from Firebase Console
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if Firebase is actually configured with real values
const isConfigured = () => {
  const apiKey = firebaseConfig.apiKey;
  return apiKey && apiKey !== 'your-api-key-here' && apiKey.length > 10;
};

// Initialize Firebase only if configured
let app = null;
let database = null;

if (isConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
  }
}

// Database references - return null if database not initialized
export const gamesRef = () => database ? ref(database, 'games') : null;
export const gameRef = (gameCode) => database ? ref(database, `games/${gameCode}`) : null;
export const playersRef = (gameCode) => database ? ref(database, `games/${gameCode}/players`) : null;
export const playerRef = (gameCode, playerId) => database ? ref(database, `games/${gameCode}/players/${playerId}`) : null;
export const levelRef = (gameCode, levelNum) => database ? ref(database, `games/${gameCode}/level${levelNum}`) : null;
export const metaRef = (gameCode) => database ? ref(database, `games/${gameCode}/meta`) : null;

// Database operations - return early if database not initialized
export const createGameInDB = async (gameCode, gameData) => {
  const dbRef = gameRef(gameCode);
  if (!dbRef) throw new Error('Firebase not configured');
  await set(dbRef, gameData);
};

export const getGameFromDB = async (gameCode) => {
  const dbRef = gameRef(gameCode);
  if (!dbRef) return null;
  const snapshot = await get(dbRef);
  return snapshot.exists() ? snapshot.val() : null;
};

export const getLevelFromDB = async (gameCode, levelNum) => {
  const dbRef = levelRef(gameCode, levelNum);
  if (!dbRef) return null;
  const snapshot = await get(dbRef);
  return snapshot.exists() ? snapshot.val() : null;
};

export const updateGameInDB = async (gameCode, updates) => {
  const dbRef = gameRef(gameCode);
  if (!dbRef) throw new Error('Firebase not configured');
  await update(dbRef, updates);
};

export const updateLevelInDB = async (gameCode, levelNum, updates) => {
  const dbRef = levelRef(gameCode, levelNum);
  if (!dbRef) throw new Error('Firebase not configured');
  await update(dbRef, updates);
};

// Deep path update - allows updating nested paths without overwriting siblings
// Uses multi-path update to prevent overwriting sibling data when two players write simultaneously
// e.g., updateLevelPathInDB(gameCode, 1, 'roleSelections/productDev/playerSelections/player123', [1,2,3])
export const updateLevelPathInDB = async (gameCode, levelNum, path, value) => {
  if (!database) throw new Error('Firebase not configured');
  const fullPath = `games/${gameCode}/level${levelNum}/${path}`;
  await update(ref(database), { [fullPath]: value });
};

export const updateMetaInDB = async (gameCode, updates) => {
  const dbRef = metaRef(gameCode);
  if (!dbRef) throw new Error('Firebase not configured');
  await update(dbRef, updates);
};

export const addPlayerToDB = async (gameCode, playerId, playerData) => {
  const dbRef = playerRef(gameCode, playerId);
  if (!dbRef) throw new Error('Firebase not configured');
  await set(dbRef, playerData);
};

export const removeGameFromDB = async (gameCode) => {
  const dbRef = gameRef(gameCode);
  if (!dbRef) throw new Error('Firebase not configured');
  await remove(dbRef);
};

export const getAllGamesFromDB = async () => {
  const dbRef = gamesRef();
  if (!dbRef) return {};
  const snapshot = await get(dbRef);
  return snapshot.exists() ? snapshot.val() : {};
};

// Real-time listeners - return no-op function if database not initialized
export const subscribeToGame = (gameCode, callback) => {
  const dbRef = gameRef(gameCode);
  if (!dbRef) {
    callback(null);
    return () => {}; // Return no-op unsubscribe function
  }
  return onValue(dbRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null);
  });
};

// Scoped per-level listener - only receives updates for a specific level
export const subscribeToLevel = (gameCode, levelNum, callback) => {
  const dbRef = levelRef(gameCode, levelNum);
  if (!dbRef) {
    callback(null);
    return () => {};
  }
  return onValue(dbRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null);
  });
};

// Scoped meta listener - only receives updates for game meta
export const subscribeToMeta = (gameCode, callback) => {
  const dbRef = metaRef(gameCode);
  if (!dbRef) {
    callback(null);
    return () => {};
  }
  return onValue(dbRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null);
  });
};

// Scoped players listener - only receives updates for players
export const subscribeToPlayers = (gameCode, callback) => {
  const dbRef = playersRef(gameCode);
  if (!dbRef) {
    callback(null);
    return () => {};
  }
  return onValue(dbRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null);
  });
};

// Connection state monitoring
export const subscribeToConnectionState = (callback) => {
  if (!database) {
    callback(false);
    return () => {};
  }
  const connectedRef = ref(database, '.info/connected');
  return onValue(connectedRef, (snapshot) => {
    callback(snapshot.val() === true);
  });
};

export const subscribeToAllGames = (callback) => {
  const dbRef = gamesRef();
  if (!dbRef) {
    callback({});
    return () => {}; // Return no-op unsubscribe function
  }
  return onValue(dbRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : {});
  });
};

// Atomic multi-path update - updates multiple paths in a single operation
export const multiPathUpdate = async (updates) => {
  if (!database) throw new Error('Firebase not configured');
  await update(ref(database), updates);
};

export { database };
