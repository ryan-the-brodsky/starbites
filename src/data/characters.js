// Space-themed character names and avatars for each functional role
// Each role has a pool of characters to choose from

// Astronaut avatar components - simple cute astronaut designs
// Using a combination of elements to create unique looks
export const ASTRONAUT_STYLES = {
  productDev: {
    helmet: 'bg-cyan-400',
    suit: 'bg-cyan-600',
    visor: 'bg-slate-800',
    accent: 'bg-cyan-300',
  },
  packageDev: {
    helmet: 'bg-orange-400',
    suit: 'bg-orange-600',
    visor: 'bg-slate-800',
    accent: 'bg-orange-300',
  },
  quality: {
    helmet: 'bg-green-400',
    suit: 'bg-green-600',
    visor: 'bg-slate-800',
    accent: 'bg-green-300',
  },
};

// Different face expressions for variety
export const FACE_EXPRESSIONS = [
  { eyes: '◠ ◠', mouth: '‿' },   // Happy
  { eyes: '● ●', mouth: '◡' },   // Excited
  { eyes: '◠ ◠', mouth: '○' },   // Surprised
  { eyes: '◕ ◕', mouth: '‿' },   // Curious
  { eyes: '◠ ◠', mouth: '▽' },   // Big smile
  { eyes: '● ●', mouth: '‿' },   // Focused
  { eyes: '◕ ◕', mouth: '◡' },   // Cheerful
  { eyes: '◠ ◠', mouth: '∪' },   // Grinning
];

// Different helmet decorations/badges
export const HELMET_BADGES = [
  '⭐', '✦', '◆', '●', '★', '◇', '▲', '♦'
];

export const CHARACTER_POOLS = {
  productDev: [
    { name: 'Dr. Beaker', emoji: '🧪', title: 'Formula Wizard', faceIdx: 0, badgeIdx: 0 },
    { name: 'Professor Molecule', emoji: '⚗️', title: 'Compound Commander', faceIdx: 1, badgeIdx: 1 },
    { name: 'Captain Catalyst', emoji: '🔬', title: 'Reaction Master', faceIdx: 2, badgeIdx: 2 },
    { name: 'Nova Neutron', emoji: '⚛️', title: 'Atomic Ace', faceIdx: 3, badgeIdx: 3 },
    { name: 'Stella Synthesis', emoji: '✨', title: 'Creation Specialist', faceIdx: 4, badgeIdx: 4 },
    { name: 'Dr. Emulsion', emoji: '🫧', title: 'Blend Expert', faceIdx: 5, badgeIdx: 5 },
    { name: 'Cosmo Chemist', emoji: '🧫', title: 'Lab Legend', faceIdx: 6, badgeIdx: 6 },
    { name: 'Luna Lipid', emoji: '🌙', title: 'Formulation Pro', faceIdx: 7, badgeIdx: 7 },
  ],
  packageDev: [
    { name: 'Box Nebula', emoji: '📦', title: 'Container Captain', faceIdx: 0, badgeIdx: 0 },
    { name: 'Captain Carton', emoji: '🎁', title: 'Packaging Pioneer', faceIdx: 1, badgeIdx: 1 },
    { name: 'Seal Master Zyx', emoji: '🔒', title: 'Closure Commander', faceIdx: 2, badgeIdx: 2 },
    { name: 'Flex Foilsworth', emoji: '🪩', title: 'Material Maven', faceIdx: 3, badgeIdx: 3 },
    { name: 'Astro Wrapper', emoji: '🌯', title: 'Enclosure Expert', faceIdx: 4, badgeIdx: 4 },
    { name: 'Orbit O-Ring', emoji: '⭕', title: 'Seal Specialist', faceIdx: 5, badgeIdx: 5 },
    { name: 'Cosmo Container', emoji: '🥡', title: 'Box Boss', faceIdx: 6, badgeIdx: 6 },
    { name: 'Galaxy Gasket', emoji: '🛸', title: 'Barrier Builder', faceIdx: 7, badgeIdx: 7 },
  ],
  quality: [
    { name: 'Inspector Quasar', emoji: '🔍', title: 'Quality Guardian', faceIdx: 0, badgeIdx: 0 },
    { name: 'Commander Comply', emoji: '✅', title: 'Standards Sentinel', faceIdx: 1, badgeIdx: 1 },
    { name: 'Spec Checker 9000', emoji: '📋', title: 'Precision Pro', faceIdx: 2, badgeIdx: 2 },
    { name: 'Admiral Audit', emoji: '🎖️', title: 'Review Ranger', faceIdx: 3, badgeIdx: 3 },
    { name: 'Major Metric', emoji: '📊', title: 'Data Defender', faceIdx: 4, badgeIdx: 4 },
    { name: 'Captain Calibrate', emoji: '⚖️', title: 'Balance Boss', faceIdx: 5, badgeIdx: 5 },
    { name: 'Lieutenant Limits', emoji: '📏', title: 'Tolerance Tracker', faceIdx: 6, badgeIdx: 6 },
    { name: 'Sergeant Spec', emoji: '🎯', title: 'Target Tester', faceIdx: 7, badgeIdx: 7 },
  ],
};

// Get a character for a player based on their role and a seed (player index or ID hash)
export const getCharacterForPlayer = (functionalRole, seed) => {
  const pool = CHARACTER_POOLS[functionalRole];
  if (!pool || pool.length === 0) {
    return {
      name: 'Space Cadet',
      emoji: '🚀',
      title: 'Crew Member',
      faceIdx: 0,
      badgeIdx: 0,
      style: ASTRONAUT_STYLES.productDev,
    };
  }

  // Use seed to deterministically pick a character
  const index = Math.abs(seed) % pool.length;
  const character = pool[index];

  return {
    ...character,
    style: ASTRONAUT_STYLES[functionalRole],
    face: FACE_EXPRESSIONS[character.faceIdx],
    badge: HELMET_BADGES[character.badgeIdx],
  };
};

// Generate a numeric seed from a player ID string
export const playerIdToSeed = (playerId) => {
  if (!playerId) return 0;
  let hash = 0;
  for (let i = 0; i < playerId.length; i++) {
    const char = playerId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

// Get character for a player by their ID and role
export const getPlayerCharacter = (playerId, functionalRole) => {
  if (!functionalRole) {
    return {
      name: 'Recruit',
      emoji: '👤',
      title: 'Awaiting Assignment',
      faceIdx: 0,
      badgeIdx: 0,
      style: { helmet: 'bg-slate-400', suit: 'bg-slate-600', visor: 'bg-slate-800', accent: 'bg-slate-300' },
      face: FACE_EXPRESSIONS[0],
      badge: '?',
    };
  }
  const seed = playerIdToSeed(playerId);
  return getCharacterForPlayer(functionalRole, seed);
};
