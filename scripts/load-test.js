#!/usr/bin/env node

/**
 * Firebase Realtime Database Load Test for Mission North Star (Joy Bites)
 *
 * Simulates multiple teams playing the game concurrently to measure
 * Firebase performance under load.
 *
 * Usage:
 *   node scripts/load-test.js                     # Default: 30 teams, 10 players
 *   node scripts/load-test.js --teams=3 --players=3  # Small test: 3 teams, 3 players
 *   node scripts/load-test.js --teams=5 --players=5 --stagger=500  # With 500ms stagger
 *   node scripts/load-test.js --cleanup-only       # Only clean up leftover test data
 *   node scripts/load-test.js --no-cleanup          # Skip cleanup after test
 *
 * Prerequisites:
 *   npm install dotenv   (if not already installed)
 *
 * Environment variables are read from the project .env file (VITE_ prefixed).
 */

import { initializeApp, deleteApp } from 'firebase/app';
import { getDatabase, ref, set, get, update, onValue, off, remove } from 'firebase/database';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ---------------------------------------------------------------------------
// Resolve paths
// ---------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Parse .env manually (avoid needing dotenv as a dependency)
// ---------------------------------------------------------------------------
function loadEnv() {
  try {
    const envPath = resolve(PROJECT_ROOT, '.env');
    const content = readFileSync(envPath, 'utf-8');
    const vars = {};
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      // Strip surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      vars[key] = val;
    }
    return vars;
  } catch (err) {
    console.error('Could not read .env file. Make sure it exists at the project root.');
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------
function parseArgs() {
  const args = {
    teams: 30,
    players: 10,
    stagger: 200,       // ms between team starts
    cleanupOnly: false,
    noCleanup: false,
  };

  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--teams=')) args.teams = parseInt(arg.split('=')[1], 10);
    else if (arg.startsWith('--players=')) args.players = parseInt(arg.split('=')[1], 10);
    else if (arg.startsWith('--stagger=')) args.stagger = parseInt(arg.split('=')[1], 10);
    else if (arg === '--cleanup-only') args.cleanupOnly = true;
    else if (arg === '--no-cleanup') args.noCleanup = true;
    else if (arg === '--help' || arg === '-h') {
      console.log(`
Firebase Load Test for Mission North Star

Usage:
  node scripts/load-test.js [options]

Options:
  --teams=N        Number of teams to simulate (default: 30)
  --players=N      Number of players per team (default: 10)
  --stagger=MS     Milliseconds between team starts (default: 200)
  --cleanup-only   Only remove leftover test data, do not run test
  --no-cleanup     Skip cleanup after the test finishes
  --help, -h       Show this help message
`);
      process.exit(0);
    }
  }

  return args;
}

// ---------------------------------------------------------------------------
// Metrics collector
// ---------------------------------------------------------------------------
class MetricsCollector {
  constructor() {
    /** @type {Map<string, number[]>} */
    this.latencies = new Map();
    this.errors = [];
    this.listenerPropagations = [];
    this.dataTransferred = 0; // rough byte estimate
    this.peakConnections = 0;
    this.currentConnections = 0;
    this.operationCounts = new Map();
  }

  recordLatency(operation, ms) {
    if (!this.latencies.has(operation)) this.latencies.set(operation, []);
    this.latencies.get(operation).push(ms);
    this.operationCounts.set(operation, (this.operationCounts.get(operation) || 0) + 1);
  }

  recordError(operation, error) {
    this.errors.push({ operation, message: error.message || String(error), timestamp: Date.now() });
  }

  recordListenerPropagation(ms) {
    this.listenerPropagations.push(ms);
  }

  addDataTransferred(bytes) {
    this.dataTransferred += bytes;
  }

  connectionOpened() {
    this.currentConnections++;
    if (this.currentConnections > this.peakConnections) {
      this.peakConnections = this.currentConnections;
    }
  }

  connectionClosed() {
    this.currentConnections--;
  }

  percentile(arr, p) {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, idx)];
  }

  getReport() {
    const report = {
      operations: {},
      listenerPropagation: {},
      errors: { count: this.errors.length, types: {} },
      connections: { peak: this.peakConnections },
      dataTransferred: this.dataTransferred,
    };

    for (const [op, times] of this.latencies.entries()) {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      report.operations[op] = {
        count: times.length,
        avg: Math.round(avg * 100) / 100,
        p50: Math.round(this.percentile(times, 50) * 100) / 100,
        p95: Math.round(this.percentile(times, 95) * 100) / 100,
        p99: Math.round(this.percentile(times, 99) * 100) / 100,
        min: Math.round(Math.min(...times) * 100) / 100,
        max: Math.round(Math.max(...times) * 100) / 100,
      };
    }

    if (this.listenerPropagations.length > 0) {
      const lp = this.listenerPropagations;
      const avg = lp.reduce((a, b) => a + b, 0) / lp.length;
      report.listenerPropagation = {
        count: lp.length,
        avg: Math.round(avg * 100) / 100,
        p50: Math.round(this.percentile(lp, 50) * 100) / 100,
        p95: Math.round(this.percentile(lp, 95) * 100) / 100,
        p99: Math.round(this.percentile(lp, 99) * 100) / 100,
        min: Math.round(Math.min(...lp) * 100) / 100,
        max: Math.round(Math.max(...lp) * 100) / 100,
      };
    }

    for (const err of this.errors) {
      const key = `${err.operation}: ${err.message}`;
      report.errors.types[key] = (report.errors.types[key] || 0) + 1;
    }

    return report;
  }
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------
const TEST_PREFIX = 'loadtest_';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function generateTeamName(index) {
  return `${TEST_PREFIX}team_${String(index).padStart(3, '0')}`;
}

function generateTeamId(teamName) {
  return teamName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
}

function generatePlayerId(teamIndex, playerIndex) {
  return `${TEST_PREFIX}player_t${teamIndex}_p${playerIndex}`;
}

function estimateBytes(obj) {
  return new TextEncoder().encode(JSON.stringify(obj)).length;
}

/** Time an async operation and record it in metrics. */
async function timed(metrics, operationName, fn) {
  const start = performance.now();
  try {
    const result = await fn();
    const elapsed = performance.now() - start;
    metrics.recordLatency(operationName, elapsed);
    return result;
  } catch (err) {
    const elapsed = performance.now() - start;
    metrics.recordLatency(operationName, elapsed);
    metrics.recordError(operationName, err);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Game state factory (mirrors src/contexts/GameContext.jsx)
// ---------------------------------------------------------------------------
const FUNCTIONAL_ROLES = ['productDev', 'packageDev', 'quality', 'pim'];

function createInitialGameState(teamId, teamName) {
  return {
    gameCode: teamId,
    teamId,
    meta: {
      teamName,
      createdAt: Date.now(),
      currentLevel: 0,
      highestUnlockedLevel: 1,
      totalScore: 0,
      isPaused: false,
      isLocked: false,
      gameStarted: false,
    },
    level1: {
      roleSelections: {
        productDev: { playerSelections: {}, confirmedSelections: null, confirmedBy: [] },
        packageDev: { playerSelections: {}, confirmedSelections: null, confirmedBy: [] },
        quality: { playerSelections: {}, confirmedSelections: null, confirmedBy: [] },
        pim: { playerSelections: {}, confirmedSelections: null, confirmedBy: [] },
      },
      selectedCriteria: [],
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
  };
}

// ---------------------------------------------------------------------------
// Simulated criteria data (mirrors src/data/missionData.js IDs)
// ---------------------------------------------------------------------------
const CRITERIA_BY_ROLE = {
  productDev: ['pd1', 'pd2', 'pd3', 'pd4', 'pd5'],
  packageDev: ['pk1', 'pk2', 'pk3', 'pk4', 'pk5'],
  quality: ['qa1', 'qa2', 'qa3', 'qa4', 'qa5'],
  pim: ['pim1', 'pim2', 'pim3', 'pim4', 'pim5'],
};

function pickRandom(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ---------------------------------------------------------------------------
// Team simulation
// ---------------------------------------------------------------------------
async function simulateTeam(teamIndex, numPlayers, db, metrics) {
  const teamName = generateTeamName(teamIndex);
  const teamId = generateTeamId(teamName);
  const commanderId = generatePlayerId(teamIndex, 0);
  const crewIds = Array.from({ length: numPlayers - 1 }, (_, i) => generatePlayerId(teamIndex, i + 1));
  const allPlayerIds = [commanderId, ...crewIds];

  // Track connections
  metrics.connectionOpened(); // commander

  // -----------------------------------------------------------------------
  // Step 1: Commander creates game
  // -----------------------------------------------------------------------
  const gameState = createInitialGameState(teamId, teamName);
  gameState.players[commanderId] = {
    role: 'commander',
    functionalRole: null,
    joinedAt: Date.now(),
    lastActive: Date.now(),
  };

  const gameData = gameState;
  metrics.addDataTransferred(estimateBytes(gameData));

  await timed(metrics, 'createGame', async () => {
    await set(ref(db, `games/${teamId}`), gameData);
  });

  // -----------------------------------------------------------------------
  // Step 2: Set up a listener on the game (simulates all players subscribing)
  // -----------------------------------------------------------------------
  let listenerCallCount = 0;
  let lastListenerWrite = 0;
  const listenerUnsubscribes = [];

  // Commander listener
  const commanderUnsub = onValue(ref(db, `games/${teamId}`), () => {
    listenerCallCount++;
    if (lastListenerWrite > 0) {
      const propagation = performance.now() - lastListenerWrite;
      // Only record realistic propagation times (ignore initial subscription callbacks)
      if (propagation < 30000) {
        metrics.recordListenerPropagation(propagation);
      }
      lastListenerWrite = 0; // reset so we don't double-count
    }
  });
  listenerUnsubscribes.push(commanderUnsub);

  // -----------------------------------------------------------------------
  // Step 3: Crew members join (staggered slightly)
  // -----------------------------------------------------------------------
  for (let i = 0; i < crewIds.length; i++) {
    const crewId = crewIds[i];
    metrics.connectionOpened();

    const playerData = {
      role: 'crew',
      functionalRole: null,
      joinedAt: Date.now(),
      lastActive: Date.now(),
    };
    metrics.addDataTransferred(estimateBytes(playerData));

    await timed(metrics, 'playerJoin', async () => {
      await set(ref(db, `games/${teamId}/players/${crewId}`), playerData);
    });

    // Each crew member subscribes
    const unsub = onValue(ref(db, `games/${teamId}`), () => {});
    listenerUnsubscribes.push(unsub);

    // Small stagger between joins
    if (i < crewIds.length - 1) {
      await sleep(20 + Math.random() * 30);
    }
  }

  // -----------------------------------------------------------------------
  // Step 4: All players select functional roles
  // -----------------------------------------------------------------------
  const roleAssignments = {};
  for (let i = 0; i < allPlayerIds.length; i++) {
    const pid = allPlayerIds[i];
    const funcRole = FUNCTIONAL_ROLES[i % FUNCTIONAL_ROLES.length];
    roleAssignments[pid] = funcRole;

    const updateData = { functionalRole: funcRole, lastActive: Date.now() };
    metrics.addDataTransferred(estimateBytes(updateData));

    await timed(metrics, 'selectFunctionalRole', async () => {
      await update(ref(db, `games/${teamId}/players/${pid}`), updateData);
    });
  }

  // -----------------------------------------------------------------------
  // Step 5: Commander starts game
  // -----------------------------------------------------------------------
  lastListenerWrite = performance.now();
  metrics.addDataTransferred(estimateBytes({ gameStarted: true }));

  await timed(metrics, 'startGame', async () => {
    await update(ref(db, `games/${teamId}/meta`), { gameStarted: true });
  });

  // Brief pause to let listeners fire
  await sleep(100);

  // -----------------------------------------------------------------------
  // Step 6: Level 1 - Success Criteria
  // -----------------------------------------------------------------------

  // 6a: Each player selects criteria for their functional role
  for (const pid of allPlayerIds) {
    const funcRole = roleAssignments[pid];
    const availableCriteria = CRITERIA_BY_ROLE[funcRole];
    const selected = pickRandom(availableCriteria, 3);

    metrics.addDataTransferred(estimateBytes(selected));

    await timed(metrics, 'level1_playerSelection', async () => {
      await set(
        ref(db, `games/${teamId}/level1/roleSelections/${funcRole}/playerSelections/${pid}`),
        selected
      );
    });
  }

  // 6b: Confirm selections for each role
  for (const funcRole of FUNCTIONAL_ROLES) {
    const criteria = pickRandom(CRITERIA_BY_ROLE[funcRole], 3);
    const playersInRole = allPlayerIds.filter(pid => roleAssignments[pid] === funcRole);

    const confirmData = {
      confirmedSelections: criteria,
      confirmedBy: playersInRole,
    };
    metrics.addDataTransferred(estimateBytes(confirmData));

    const updates = {};
    updates[`games/${teamId}/level1/roleSelections/${funcRole}/confirmedSelections`] = criteria;
    updates[`games/${teamId}/level1/roleSelections/${funcRole}/confirmedBy`] = playersInRole;

    await timed(metrics, 'level1_confirmRole', async () => {
      await update(ref(db), updates);
    });
  }

  // 6c: Complete level 1
  const allSelectedCriteria = FUNCTIONAL_ROLES.flatMap(role => pickRandom(CRITERIA_BY_ROLE[role], 3));

  const level1CompleteData = {
    selectedCriteria: allSelectedCriteria,
    score: Math.floor(Math.random() * 500) + 500,
    completedAt: Date.now(),
  };
  metrics.addDataTransferred(estimateBytes(level1CompleteData));

  lastListenerWrite = performance.now();
  await timed(metrics, 'level1_complete', async () => {
    await update(ref(db, `games/${teamId}/level1`), level1CompleteData);
    await update(ref(db, `games/${teamId}/meta`), {
      currentLevel: 2,
      highestUnlockedLevel: 2,
      totalScore: level1CompleteData.score,
    });
  });

  await sleep(50);

  // -----------------------------------------------------------------------
  // Step 7: Level 2 - Sampling Plan
  // -----------------------------------------------------------------------

  // Players collaboratively build a sampling plan
  const samplingPlanData = {
    samplingPlan: {
      sampleSize: Math.floor(Math.random() * 50) + 10,
      samplingMethod: 'stratified',
      steps: [
        { step: 'receiving', tests: ['visual', 'weight'], frequency: 'every_batch' },
        { step: 'mixing', tests: ['temp', 'viscosity'], frequency: 'every_15min' },
        { step: 'blending', tests: ['moisture', 'homogeneity'], frequency: 'every_30min' },
        { step: 'gelling', tests: ['gel', 'temp'], frequency: 'continuous' },
        { step: 'cooling', tests: ['temp', 'texture', 'moisture'], frequency: 'every_batch' },
        { step: 'portioning', tests: ['weight'], frequency: 'every_100units' },
        { step: 'packaging', tests: ['seal', 'visual', 'dimensions'], frequency: 'every_batch' },
        { step: 'release', tests: ['micro', 'sensory', 'visual'], frequency: 'per_batch' },
      ],
      totalSampleCost: Math.floor(Math.random() * 200) + 50,
      budget: 300,
      confirmedBy: allPlayerIds.slice(0, Math.min(3, allPlayerIds.length)),
    },
  };

  // Simulate individual player contributions to sampling plan
  for (let i = 0; i < Math.min(allPlayerIds.length, 5); i++) {
    const pid = allPlayerIds[i];
    const stepUpdate = {
      [`step_${i}_assignee`]: pid,
      [`step_${i}_confirmed`]: true,
    };
    metrics.addDataTransferred(estimateBytes(stepUpdate));

    await timed(metrics, 'level2_playerUpdate', async () => {
      await update(ref(db, `games/${teamId}/level2/samplingPlan`), stepUpdate);
    });
  }

  // Complete level 2
  const level2Score = Math.floor(Math.random() * 400) + 300;
  const level2CompleteData = {
    ...samplingPlanData,
    score: level2Score,
    completedAt: Date.now(),
  };
  metrics.addDataTransferred(estimateBytes(level2CompleteData));

  lastListenerWrite = performance.now();
  await timed(metrics, 'level2_complete', async () => {
    await update(ref(db, `games/${teamId}/level2`), level2CompleteData);
    await update(ref(db, `games/${teamId}/meta`), {
      currentLevel: 3,
      highestUnlockedLevel: 3,
      totalScore: level1CompleteData.score + level2Score,
    });
  });

  await sleep(50);

  // -----------------------------------------------------------------------
  // Step 8: Level 3 - Mission Report
  // -----------------------------------------------------------------------

  // Players submit report parts
  const reportParts = {
    summary: `Team ${teamName} completed the Joy Bites scale trial. All critical success criteria were met with a total score of ${level1CompleteData.score + level2Score}.`,
    findings: `Key findings: Flavor familiarity scored 4.2/5. Zero particle release in microgravity simulation. Package opening force at 12N. Line efficiency at 89%.`,
    recommendations: `Recommendations: 1) Proceed to full production run. 2) Monitor gelling temperature closely. 3) Schedule operator refresher training before next batch.`,
  };

  // Each section written by different players
  const reportSections = ['summary', 'findings', 'recommendations'];
  for (let i = 0; i < reportSections.length; i++) {
    const section = reportSections[i];
    const pid = allPlayerIds[i % allPlayerIds.length];
    const sectionData = { [section]: reportParts[section] };
    metrics.addDataTransferred(estimateBytes(sectionData));

    await timed(metrics, 'level3_reportSection', async () => {
      await update(ref(db, `games/${teamId}/level3/report`), sectionData);
    });
  }

  // Complete level 3
  const level3Score = Math.floor(Math.random() * 300) + 200;
  const totalScore = level1CompleteData.score + level2Score + level3Score;

  const level3CompleteData = {
    score: level3Score,
    completedAt: Date.now(),
  };
  metrics.addDataTransferred(estimateBytes(level3CompleteData));

  lastListenerWrite = performance.now();
  await timed(metrics, 'level3_complete', async () => {
    await update(ref(db, `games/${teamId}/level3`), level3CompleteData);
    await update(ref(db, `games/${teamId}/meta`), {
      currentLevel: 3,
      totalScore,
    });
    await update(ref(db, `games/${teamId}`), {
      badges: ['criteria-master', 'sampling-specialist', 'mission-commander'],
    });
  });

  // -----------------------------------------------------------------------
  // Step 9: Final read to verify state
  // -----------------------------------------------------------------------
  await timed(metrics, 'finalRead', async () => {
    const snapshot = await get(ref(db, `games/${teamId}`));
    if (snapshot.exists()) {
      metrics.addDataTransferred(estimateBytes(snapshot.val()));
    }
  });

  // -----------------------------------------------------------------------
  // Cleanup listeners & connections
  // -----------------------------------------------------------------------
  for (const unsub of listenerUnsubscribes) {
    unsub();
  }
  // Close connections for all players in this team
  for (let i = 0; i < allPlayerIds.length; i++) {
    metrics.connectionClosed();
  }

  return teamId;
}

// ---------------------------------------------------------------------------
// Cleanup function
// ---------------------------------------------------------------------------
async function cleanupTestData(db, metrics) {
  console.log('\nCleaning up test data...');

  try {
    const snapshot = await get(ref(db, 'games'));
    if (!snapshot.exists()) {
      console.log('  No games found in database.');
      return;
    }

    const games = snapshot.val();
    const testGameCodes = Object.keys(games).filter(code => code.startsWith(TEST_PREFIX));

    if (testGameCodes.length === 0) {
      console.log('  No test data found to clean up.');
      return;
    }

    console.log(`  Found ${testGameCodes.length} test games to remove.`);

    // Remove in batches of 10 to avoid overwhelming the database
    const batchSize = 10;
    for (let i = 0; i < testGameCodes.length; i += batchSize) {
      const batch = testGameCodes.slice(i, i + batchSize);
      const updates = {};
      for (const code of batch) {
        updates[`games/${code}`] = null;
      }

      await update(ref(db), updates);
      console.log(`  Removed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(testGameCodes.length / batchSize)} (${batch.length} games)`);
    }

    console.log(`  Cleanup complete. Removed ${testGameCodes.length} test games.`);
  } catch (err) {
    console.error('  Cleanup error:', err.message);
  }
}

// ---------------------------------------------------------------------------
// Report printer
// ---------------------------------------------------------------------------
function printReport(metrics, totalTime, numTeams, numPlayers) {
  const report = metrics.getReport();

  const divider = '='.repeat(72);
  const thinDivider = '-'.repeat(72);

  console.log('\n' + divider);
  console.log('  FIREBASE LOAD TEST REPORT - Mission North Star');
  console.log(divider);

  console.log(`\n  Test Configuration:`);
  console.log(`    Teams:              ${numTeams}`);
  console.log(`    Players per team:   ${numPlayers}`);
  console.log(`    Total connections:   ${numTeams * numPlayers}`);
  console.log(`    Total test time:     ${(totalTime / 1000).toFixed(2)}s`);

  console.log(`\n  Connection Metrics:`);
  console.log(`    Peak connections:    ${report.connections.peak}`);
  console.log(`    Data transferred:    ${(report.dataTransferred / 1024).toFixed(1)} KB (estimated)`);

  console.log(`\n${thinDivider}`);
  console.log('  WRITE LATENCY BY OPERATION (milliseconds)');
  console.log(thinDivider);
  console.log(
    '  ' +
    'Operation'.padEnd(28) +
    'Count'.padStart(7) +
    'Avg'.padStart(9) +
    'P50'.padStart(9) +
    'P95'.padStart(9) +
    'P99'.padStart(9) +
    'Min'.padStart(9) +
    'Max'.padStart(9)
  );
  console.log('  ' + '-'.repeat(70));

  const opOrder = [
    'createGame',
    'playerJoin',
    'selectFunctionalRole',
    'startGame',
    'level1_playerSelection',
    'level1_confirmRole',
    'level1_complete',
    'level2_playerUpdate',
    'level2_complete',
    'level3_reportSection',
    'level3_complete',
    'finalRead',
  ];

  for (const op of opOrder) {
    const data = report.operations[op];
    if (!data) continue;
    console.log(
      '  ' +
      op.padEnd(28) +
      String(data.count).padStart(7) +
      data.avg.toFixed(1).padStart(9) +
      data.p50.toFixed(1).padStart(9) +
      data.p95.toFixed(1).padStart(9) +
      data.p99.toFixed(1).padStart(9) +
      data.min.toFixed(1).padStart(9) +
      data.max.toFixed(1).padStart(9)
    );
  }

  // Any operations not in the predefined order
  for (const [op, data] of Object.entries(report.operations)) {
    if (opOrder.includes(op)) continue;
    console.log(
      '  ' +
      op.padEnd(28) +
      String(data.count).padStart(7) +
      data.avg.toFixed(1).padStart(9) +
      data.p50.toFixed(1).padStart(9) +
      data.p95.toFixed(1).padStart(9) +
      data.p99.toFixed(1).padStart(9) +
      data.min.toFixed(1).padStart(9) +
      data.max.toFixed(1).padStart(9)
    );
  }

  if (report.listenerPropagation.count) {
    console.log(`\n${thinDivider}`);
    console.log('  LISTENER PROPAGATION (milliseconds)');
    console.log(thinDivider);
    const lp = report.listenerPropagation;
    console.log(`    Samples:  ${lp.count}`);
    console.log(`    Avg:      ${lp.avg.toFixed(1)} ms`);
    console.log(`    P50:      ${lp.p50.toFixed(1)} ms`);
    console.log(`    P95:      ${lp.p95.toFixed(1)} ms`);
    console.log(`    P99:      ${lp.p99.toFixed(1)} ms`);
    console.log(`    Min:      ${lp.min.toFixed(1)} ms`);
    console.log(`    Max:      ${lp.max.toFixed(1)} ms`);
  }

  console.log(`\n${thinDivider}`);
  console.log('  ERRORS');
  console.log(thinDivider);
  if (report.errors.count === 0) {
    console.log('    No errors recorded.');
  } else {
    console.log(`    Total errors: ${report.errors.count}`);
    for (const [type, count] of Object.entries(report.errors.types)) {
      console.log(`      [${count}x] ${type}`);
    }
  }

  // -----------------------------------------------------------------------
  // Bottleneck analysis and recommendations
  // -----------------------------------------------------------------------
  console.log(`\n${thinDivider}`);
  console.log('  BOTTLENECK ANALYSIS');
  console.log(thinDivider);

  const bottlenecks = [];

  // Find slowest operations
  let slowestOp = null;
  let slowestP95 = 0;
  for (const [op, data] of Object.entries(report.operations)) {
    if (data.p95 > slowestP95) {
      slowestP95 = data.p95;
      slowestOp = op;
    }
  }
  if (slowestOp) {
    bottlenecks.push(`Slowest operation (P95): "${slowestOp}" at ${slowestP95.toFixed(1)}ms`);
  }

  // Check for high variance operations
  for (const [op, data] of Object.entries(report.operations)) {
    if (data.p99 > data.p50 * 5 && data.count > 5) {
      bottlenecks.push(`High variance: "${op}" P99 (${data.p99.toFixed(1)}ms) is ${(data.p99 / data.p50).toFixed(1)}x the P50 (${data.p50.toFixed(1)}ms)`);
    }
  }

  // Check listener propagation
  if (report.listenerPropagation.p95 > 500) {
    bottlenecks.push(`Listener propagation P95 (${report.listenerPropagation.p95.toFixed(1)}ms) exceeds 500ms threshold`);
  }

  // Check error rate
  const totalOps = Object.values(report.operations).reduce((sum, d) => sum + d.count, 0);
  const errorRate = totalOps > 0 ? (report.errors.count / totalOps) * 100 : 0;
  if (errorRate > 1) {
    bottlenecks.push(`Error rate ${errorRate.toFixed(2)}% exceeds 1% threshold (${report.errors.count} errors in ${totalOps} operations)`);
  }

  if (bottlenecks.length === 0) {
    console.log('    No significant bottlenecks detected.');
  } else {
    for (const b of bottlenecks) {
      console.log(`    * ${b}`);
    }
  }

  console.log(`\n${thinDivider}`);
  console.log('  RECOMMENDATIONS');
  console.log(thinDivider);

  const recommendations = [];

  // Based on metrics
  if (slowestP95 > 1000) {
    recommendations.push('CRITICAL: P95 latency exceeds 1 second. Consider enabling Firebase connection multiplexing or reducing write granularity.');
  }
  if (slowestP95 > 500) {
    recommendations.push('WARNING: P95 latency exceeds 500ms. Consider batching writes with multi-path updates to reduce round trips.');
  }
  if (report.errors.count > 0) {
    recommendations.push(`Address ${report.errors.count} errors. Common causes: rate limiting, network timeouts, or security rules rejecting writes.`);
  }
  if (report.connections.peak > 100) {
    recommendations.push(`Peak concurrent connections (${report.connections.peak}) is high. Firebase Realtime Database allows 200K concurrent connections on Blaze plan. Ensure your plan supports this.`);
  }
  if (report.listenerPropagation.p95 > 300) {
    recommendations.push('Listener propagation is slow. Consider using more granular subscriptions (e.g., subscribe to specific paths rather than the whole game object).');
  }
  if (report.dataTransferred > 5 * 1024 * 1024) {
    recommendations.push(`High data transfer (${(report.dataTransferred / (1024 * 1024)).toFixed(1)}MB). Consider restructuring data to reduce payload sizes.`);
  }

  // General recommendations
  recommendations.push('Consider using Firebase security rules to limit read/write sizes and prevent abuse.');
  recommendations.push('For production, enable Firebase App Check to prevent unauthorized access.');

  if (numTeams >= 30 && numPlayers >= 10) {
    recommendations.push('At 300+ connections, monitor Firebase dashboard for concurrent connection limits and bandwidth quotas.');
  }

  for (const r of recommendations) {
    console.log(`    - ${r}`);
  }

  console.log('\n' + divider);
  console.log('  END OF REPORT');
  console.log(divider + '\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const args = parseArgs();
  const envVars = loadEnv();

  // Build Firebase config from env vars (strip VITE_ prefix)
  const firebaseConfig = {
    apiKey: envVars.VITE_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY,
    authDomain: envVars.VITE_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: envVars.VITE_FIREBASE_DATABASE_URL || process.env.VITE_FIREBASE_DATABASE_URL,
    projectId: envVars.VITE_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: envVars.VITE_FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: envVars.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: envVars.VITE_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID,
  };

  // Validate config
  if (!firebaseConfig.apiKey || !firebaseConfig.databaseURL) {
    console.error('ERROR: Firebase configuration is missing. Ensure .env file has VITE_FIREBASE_API_KEY and VITE_FIREBASE_DATABASE_URL.');
    process.exit(1);
  }

  // Initialize Firebase with a unique app name to avoid conflicts
  const appName = `load-test-${Date.now()}`;
  const app = initializeApp(firebaseConfig, appName);
  const db = getDatabase(app);

  const metrics = new MetricsCollector();

  console.log('Firebase Load Test - Mission North Star');
  console.log(`Database: ${firebaseConfig.databaseURL}`);

  // Handle cleanup-only mode
  if (args.cleanupOnly) {
    await cleanupTestData(db, metrics);
    await deleteApp(app);
    process.exit(0);
  }

  console.log(`\nConfiguration: ${args.teams} teams x ${args.players} players = ${args.teams * args.players} total connections`);
  console.log(`Stagger: ${args.stagger}ms between team starts\n`);

  const testStart = performance.now();

  // Run teams with stagger
  const teamPromises = [];
  const completedTeams = [];
  const failedTeams = [];

  for (let i = 0; i < args.teams; i++) {
    const teamIndex = i;

    const promise = simulateTeam(teamIndex, args.players, db, metrics)
      .then(teamId => {
        completedTeams.push(teamId);
        const pct = ((completedTeams.length + failedTeams.length) / args.teams * 100).toFixed(0);
        process.stdout.write(`\r  Progress: ${completedTeams.length + failedTeams.length}/${args.teams} teams (${pct}%) | OK: ${completedTeams.length} | FAIL: ${failedTeams.length}`);
      })
      .catch(err => {
        failedTeams.push({ team: teamIndex, error: err.message });
        metrics.recordError('team_simulation', err);
        const pct = ((completedTeams.length + failedTeams.length) / args.teams * 100).toFixed(0);
        process.stdout.write(`\r  Progress: ${completedTeams.length + failedTeams.length}/${args.teams} teams (${pct}%) | OK: ${completedTeams.length} | FAIL: ${failedTeams.length}`);
      });

    teamPromises.push(promise);

    // Stagger team starts
    if (i < args.teams - 1) {
      await sleep(args.stagger);
    }
  }

  // Wait for all teams to finish
  await Promise.all(teamPromises);

  const totalTime = performance.now() - testStart;

  console.log('\n'); // Clear progress line

  if (failedTeams.length > 0) {
    console.log(`  Failed teams:`);
    for (const ft of failedTeams.slice(0, 10)) {
      console.log(`    Team ${ft.team}: ${ft.error}`);
    }
    if (failedTeams.length > 10) {
      console.log(`    ... and ${failedTeams.length - 10} more`);
    }
  }

  // Print the report
  printReport(metrics, totalTime, args.teams, args.players);

  // Cleanup test data unless --no-cleanup was specified
  if (!args.noCleanup) {
    await cleanupTestData(db, metrics);
  } else {
    console.log('Skipping cleanup (--no-cleanup specified). Run with --cleanup-only to remove test data later.');
  }

  // Shut down Firebase
  await deleteApp(app);

  // Exit cleanly (Firebase keeps background connections otherwise)
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
