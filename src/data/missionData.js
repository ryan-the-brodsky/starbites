// Mission Objective and Success Criteria Data
// This data simulates DFMEA and UX Pyramid inputs for Level 1
// Joy Bites: A Taste of Home, Even in Orbit

export const missionObjective = {
  title: "Successfully Complete Scale Trial of Joy Bites",
  description: "Execute a production-scale trial run of Joy Bites to validate manufacturing processes, ensure product quality delivers emotional comfort and familiar flavors, and prepare for commercial launch to space missions.",
  context: "Your crew has been selected for Mission North Star - the critical scale-up trial that will determine if Joy Bites is ready for full production. Joy Bites are designed to spark joy in space, delivering familiar flavors, mood-lifting sensory experiences, and emotional comfort in microgravity. Use your DFMEA analysis and UX Pyramid insights to define what success looks like for this mission."
};

// DFMEA Summary - failure modes focused on Joy Bites concept
export const dfmeaSummary = {
  title: "Design Failure Mode and Effects Analysis (DFMEA)",
  description: "Key failure modes identified during product development that must be monitored during the trial. Focus areas include emotional comfort delivery, familiar flavor preservation, and microgravity optimization.",
  failureModes: [
    {
      id: 'fm1',
      mode: 'Flavor profile loses familiarity',
      cause: 'Temperature variations during processing alter aromatic compounds',
      effect: 'Product fails to evoke intended emotional comfort and home-like experience',
      rpn: 200,
      control: 'Monitor processing temperature at 65-70°C; sensory panel validates familiar flavor notes'
    },
    {
      id: 'fm2',
      mode: 'Texture inconsistency in microgravity conditions',
      cause: 'Gel structure not optimized for zero-G consumption',
      effect: 'Crumbly or messy texture creates debris hazard in spacecraft',
      rpn: 190,
      control: 'Cohesion testing under simulated microgravity; particle release validation'
    },
    {
      id: 'fm3',
      mode: 'Color/appearance degradation',
      cause: 'Oxidation or light exposure during storage affects mood-lifting visual appeal',
      effect: 'Dull appearance fails to spark joy and delight',
      rpn: 160,
      control: 'Color stability testing; packaging light barrier validation'
    },
    {
      id: 'fm4',
      mode: 'Packaging not microgravity-friendly',
      cause: 'Package design creates difficulty in zero-G opening or product containment',
      effect: 'Poor user experience; product escape in spacecraft environment',
      rpn: 185,
      control: 'Single-hand opening force test; containment validation under simulated conditions'
    },
    {
      id: 'fm5',
      mode: 'Sensory variety diminished',
      cause: 'Processing flattens texture contrast or flavor complexity',
      effect: 'Product becomes monotonous; fails to provide sensory lift',
      rpn: 175,
      control: 'Texture analysis for variety; flavor complexity scoring by trained panel'
    }
  ]
};

// UX Pyramid Summary - consumer needs for Joy Bites
export const uxPyramidSummary = {
  title: "UX Pyramid Consumer Needs Assessment",
  description: "Consumer needs hierarchy for Joy Bites, designed to bring emotional comfort and spark joy for astronauts far from home.",
  levels: [
    {
      level: 'Foundation',
      name: 'Safety & Trust',
      needs: [
        'Product is safe for space consumption',
        'Package is tamper-evident and pressure-stable',
        'Allergen information is clear for crew safety'
      ]
    },
    {
      level: 'Functional',
      name: 'Microgravity Performance',
      needs: [
        'Mess-free consumption in zero gravity',
        'No crumb or debris generation',
        'Easy single-hand opening',
        'Compact storage footprint'
      ]
    },
    {
      level: 'Usability',
      name: 'Comfort & Convenience',
      needs: [
        'Familiar flavors that evoke home memories',
        'Appropriate portion for a mood-lifting moment',
        'Long shelf life for extended missions',
        'Quick consumption without prep'
      ]
    },
    {
      level: 'Delight',
      name: 'Joy & Emotional Lift',
      needs: [
        'Fun, vibrant colors that brighten the day',
        'Delightful textures with sensory variety',
        'Taste that sparks happy memories',
        'Small burst of joy in routine days'
      ]
    }
  ]
};

// Product Development criteria - focus on emotional comfort, familiar flavors, sensory delight
export const productDevCriteria = [
  {
    id: 'pd1',
    text: 'Achieve familiar flavor recognition score of 4+ out of 5 in sensory panel (evokes "taste of home")',
    source: 'both',
    sourceRef: 'FM1 + UX Delight: Familiar flavors',
    category: 'Emotional Comfort',
    role: 'productDev',
    requiredMeasurements: [
      { step: 'release', test: 'sensory', description: 'Familiar flavor sensory evaluation' },
      { step: 'mixing', test: 'temp', description: 'Processing temperature control' }
    ],
    targetSpec: { metric: 'flavor_familiarity', min: 4, max: 5, unit: 'rating' }
  },
  {
    id: 'pd2',
    text: 'Pass cohesion testing with zero particle release under simulated microgravity conditions',
    source: 'dfmea',
    sourceRef: 'FM2: Texture inconsistency in microgravity',
    category: 'Microgravity Safety',
    role: 'productDev',
    requiredMeasurements: [
      { step: 'cooling', test: 'texture', description: 'Cohesion/particle release test' },
      { step: 'gelling', test: 'gel', description: 'Gel strength measurement' }
    ],
    targetSpec: { metric: 'particle_release', min: 0, max: 0, unit: 'count' }
  },
  {
    id: 'pd3',
    text: 'Maintain vibrant color score of 4+ out of 5 after 30-day accelerated shelf life test',
    source: 'both',
    sourceRef: 'FM3 + UX Delight: Visual appeal',
    category: 'Sensory Delight',
    role: 'productDev',
    requiredMeasurements: [
      { step: 'release', test: 'visual', description: 'Color vibrancy assessment' },
      { step: 'cooling', test: 'temp', description: 'Post-cooling temperature stability' }
    ],
    targetSpec: { metric: 'color_score', min: 4, max: 5, unit: 'rating' }
  },
  {
    id: 'pd4',
    text: 'Achieve texture variety score of 4+ demonstrating sensory contrast (soft center, gentle exterior)',
    source: 'both',
    sourceRef: 'FM5 + UX Delight: Sensory variety',
    category: 'Sensory Delight',
    role: 'productDev',
    requiredMeasurements: [
      { step: 'cooling', test: 'texture', description: 'Texture contrast analysis' },
      { step: 'release', test: 'sensory', description: 'Sensory panel texture score' }
    ],
    targetSpec: { metric: 'texture_variety', min: 4, max: 5, unit: 'rating' }
  },
  {
    id: 'pd5',
    text: 'Confirm moisture content within 12-16% to ensure optimal texture and shelf stability',
    source: 'dfmea',
    sourceRef: 'Process stability for extended missions',
    category: 'Process Control',
    role: 'productDev',
    requiredMeasurements: [
      { step: 'blending', test: 'moisture', description: 'Post-blending moisture' },
      { step: 'cooling', test: 'moisture', description: 'Post-cooling moisture' }
    ],
    targetSpec: { metric: 'moisture_content', min: 12, max: 16, unit: 'percent' }
  }
];

// Package Development criteria - focus on microgravity usability
export const packageDevCriteria = [
  {
    id: 'pk1',
    text: 'Achieve single-hand opening within 5-15N force range for zero-G usability',
    source: 'both',
    sourceRef: 'FM4 + UX Functional: Single-hand opening',
    category: 'Microgravity Usability',
    role: 'packageDev',
    requiredMeasurements: [
      { step: 'packaging', test: 'seal', description: 'Opening force measurement' }
    ],
    targetSpec: { metric: 'opening_force', min: 5, max: 15, unit: 'N' }
  },
  {
    id: 'pk2',
    text: 'Pass containment validation with 100% product retention during simulated microgravity handling',
    source: 'dfmea',
    sourceRef: 'FM4: Microgravity containment',
    category: 'Microgravity Safety',
    role: 'packageDev',
    requiredMeasurements: [
      { step: 'packaging', test: 'seal', description: 'Containment integrity test' },
      { step: 'packaging', test: 'visual', description: 'Product retention inspection' }
    ],
    targetSpec: { metric: 'containment_rate', min: 100, max: 100, unit: 'percent' }
  },
  {
    id: 'pk3',
    text: 'Verify package light barrier maintains <1% light transmission for color stability',
    source: 'dfmea',
    sourceRef: 'FM3: Color degradation prevention',
    category: 'Product Protection',
    role: 'packageDev',
    requiredMeasurements: [
      { step: 'packaging', test: 'visual', description: 'Light barrier testing' }
    ],
    targetSpec: { metric: 'light_transmission', min: 0, max: 1, unit: 'percent' }
  },
  {
    id: 'pk4',
    text: 'Confirm package dimensions fit within ISS food storage module constraints (max 35mm thickness)',
    source: 'uxpyramid',
    sourceRef: 'UX Functional: Compact storage',
    category: 'Space Compatibility',
    role: 'packageDev',
    requiredMeasurements: [
      { step: 'packaging', test: 'dimensions', description: 'Package dimension check' }
    ],
    targetSpec: { metric: 'package_thickness', min: 0, max: 35, unit: 'mm' }
  },
  {
    id: 'pk5',
    text: 'Achieve <1% packaging seal failure rate for extended mission shelf life requirements',
    source: 'uxpyramid',
    sourceRef: 'UX Usability: Long shelf life',
    category: 'Quality',
    role: 'packageDev',
    requiredMeasurements: [
      { step: 'packaging', test: 'seal', description: 'Seal integrity test' }
    ],
    targetSpec: { metric: 'seal_failure_rate', min: 0, max: 1, unit: 'percent' }
  }
];

// Quality criteria - focus on safety, consistency, and emotional impact
export const qualityCriteria = [
  {
    id: 'qa1',
    text: 'Complete all safety and allergen documentation with zero non-conformances for crew safety',
    source: 'uxpyramid',
    sourceRef: 'UX Foundation: Safety & Trust',
    category: 'Compliance',
    role: 'quality',
    requiredMeasurements: [
      { step: 'receiving', test: 'visual', description: 'Incoming material inspection' },
      { step: 'release', test: 'micro', description: 'Microbial testing' }
    ],
    targetSpec: { metric: 'documentation_complete', min: 100, max: 100, unit: 'percent' }
  },
  {
    id: 'qa2',
    text: 'Maintain portion weight consistency within ±2g tolerance for predictable crew nutrition',
    source: 'dfmea',
    sourceRef: 'FM2: Portioning consistency',
    category: 'Process Control',
    role: 'quality',
    requiredMeasurements: [
      { step: 'portioning', test: 'weight', description: 'Unit weight measurement' }
    ],
    targetSpec: { metric: 'weight_variance', min: -2, max: 2, unit: 'grams' }
  },
  {
    id: 'qa3',
    text: 'Pass microbial testing with counts below space food safety limits on all batch samples',
    source: 'uxpyramid',
    sourceRef: 'UX Foundation: Safe for space consumption',
    category: 'Safety',
    role: 'quality',
    requiredMeasurements: [
      { step: 'release', test: 'micro', description: 'Microbial count analysis' }
    ],
    targetSpec: { metric: 'micro_count', min: 0, max: 100, unit: 'CFU/g' }
  },
  {
    id: 'qa4',
    text: 'Achieve "joy index" score of 4+ in blind taste test measuring emotional response',
    source: 'uxpyramid',
    sourceRef: 'UX Delight: Spark joy',
    category: 'Emotional Impact',
    role: 'quality',
    requiredMeasurements: [
      { step: 'release', test: 'sensory', description: 'Joy/emotional response panel' }
    ],
    targetSpec: { metric: 'joy_index', min: 4, max: 5, unit: 'rating' }
  },
  {
    id: 'qa5',
    text: 'Produce minimum of 500 units meeting all quality specifications for pilot crew testing',
    source: 'operational',
    sourceRef: 'Scale trial requirement',
    category: 'Output',
    role: 'quality',
    requiredMeasurements: [
      { step: 'portioning', test: 'weight', description: 'Unit count and weight' },
      { step: 'packaging', test: 'visual', description: 'Final product inspection' }
    ],
    targetSpec: { metric: 'units_produced', min: 500, max: null, unit: 'units' }
  }
];

// PIM (Plant Industrialization Manager) criteria - focus on plant operations
export const pimCriteria = [
  {
    id: 'pim1',
    text: 'Achieve line efficiency of 85%+ with minimal unplanned downtime during trial run',
    source: 'operational',
    sourceRef: 'Plant runnability requirement',
    category: 'Line Efficiency',
    role: 'pim',
    requiredMeasurements: [
      { step: 'mixing', test: 'temp', description: 'Equipment uptime monitoring' },
      { step: 'packaging', test: 'visual', description: 'Line speed verification' }
    ],
    targetSpec: { metric: 'line_efficiency', min: 85, max: 100, unit: 'percent' }
  },
  {
    id: 'pim2',
    text: 'Complete successful translation of batch sheets to floor documents with zero safety incidents',
    source: 'operational',
    sourceRef: 'Operator safety requirement',
    category: 'Safety',
    role: 'pim',
    requiredMeasurements: [
      { step: 'receiving', test: 'visual', description: 'Document verification' },
      { step: 'mixing', test: 'temp', description: 'Process parameter logging' }
    ],
    targetSpec: { metric: 'safety_incidents', min: 0, max: 0, unit: 'count' }
  },
  {
    id: 'pim3',
    text: 'Validate equipment compatibility and changeover time within target (under 30 minutes)',
    source: 'operational',
    sourceRef: 'Equipment validation',
    category: 'Equipment',
    role: 'pim',
    requiredMeasurements: [
      { step: 'mixing', test: 'viscosity', description: 'Mixer compatibility check' },
      { step: 'gelling', test: 'temp', description: 'Temperature system validation' }
    ],
    targetSpec: { metric: 'changeover_time', min: 0, max: 30, unit: 'minutes' }
  },
  {
    id: 'pim4',
    text: 'Achieve operator training sign-off for all critical process steps before trial start',
    source: 'operational',
    sourceRef: 'Operator readiness',
    category: 'Training',
    role: 'pim',
    requiredMeasurements: [
      { step: 'receiving', test: 'visual', description: 'Training documentation review' }
    ],
    targetSpec: { metric: 'training_complete', min: 100, max: 100, unit: 'percent' }
  },
  {
    id: 'pim5',
    text: 'Document all equipment parameters for scale-up to full production with <5% variance',
    source: 'operational',
    sourceRef: 'Scale-up documentation',
    category: 'Documentation',
    role: 'pim',
    requiredMeasurements: [
      { step: 'gelling', test: 'gel', description: 'Process parameter documentation' },
      { step: 'cooling', test: 'temp', description: 'Cooling system parameters' }
    ],
    targetSpec: { metric: 'parameter_variance', min: 0, max: 5, unit: 'percent' }
  }
];

// Combined list for backward compatibility and unified access
export const successCriteriaOptions = [
  ...productDevCriteria,
  ...packageDevCriteria,
  ...qualityCriteria,
  ...pimCriteria
];

// Helper to get criteria by role
export const getCriteriaByRole = (role) => {
  switch (role) {
    case 'productDev':
      return productDevCriteria;
    case 'packageDev':
      return packageDevCriteria;
    case 'quality':
      return qualityCriteria;
    case 'pim':
      return pimCriteria;
    default:
      return [];
  }
};

// Maximum criteria selections per role
export const MAX_CRITERIA_PER_ROLE = 3;

// Penalty for missing roles (per missing role)
export const MISSING_ROLE_PENALTY = 500;

// Badge for Level 1
export const level1Badge = {
  id: 'mission-planner',
  name: 'Mission Planner',
  description: 'Defined clear objectives and success criteria for the mission'
};

export default {
  missionObjective,
  dfmeaSummary,
  uxPyramidSummary,
  successCriteriaOptions,
  level1Badge
};
