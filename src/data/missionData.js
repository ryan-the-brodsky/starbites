// Mission Objective and Success Criteria Data
// This data simulates DFMEA and UX Pyramid inputs for Level 1

export const missionObjective = {
  title: "Successfully Complete Scale Trial of Star Bites",
  description: "Execute a production-scale trial run of Star Bites to validate manufacturing processes, ensure product quality meets specifications, and prepare for commercial launch.",
  context: "Your crew has been selected for Mission North Star - the critical scale-up trial that will determine if Star Bites is ready for full production. Use your DFMEA analysis and UX Pyramid insights to define what success looks like for this mission."
};

// Placeholder DFMEA Summary - represents key failure modes identified
export const dfmeaSummary = {
  title: "Design Failure Mode and Effects Analysis (DFMEA)",
  description: "Key failure modes identified during product development that must be monitored during the trial.",
  failureModes: [
    {
      id: 'fm1',
      mode: 'Gel does not set properly',
      cause: 'Incorrect temperature or timing during gelling phase',
      effect: 'Product texture is too soft or runny',
      rpn: 180, // Risk Priority Number
      control: 'Monitor gel temperature at 65-70°C for 45-60 seconds'
    },
    {
      id: 'fm2',
      mode: 'Uneven portioning',
      cause: 'Equipment calibration drift or material viscosity variation',
      effect: 'Inconsistent product weight and consumer experience',
      rpn: 160,
      control: 'Weight checks every 30 minutes, ±2g tolerance'
    },
    {
      id: 'fm3',
      mode: 'Off-flavors develop',
      cause: 'Ingredient degradation or contamination during mixing',
      effect: 'Consumer complaints and product rejection',
      rpn: 200,
      control: 'Sensory evaluation at multiple process points'
    },
    {
      id: 'fm4',
      mode: 'Packaging seal failure',
      cause: 'Seal temperature variance or film alignment issues',
      effect: 'Product leakage and shelf-life reduction',
      rpn: 140,
      control: 'Seal integrity testing on every batch'
    },
    {
      id: 'fm5',
      mode: 'Moisture content out of spec',
      cause: 'Hydration ratio errors or drying inconsistency',
      effect: 'Texture issues and potential microbial risk',
      rpn: 175,
      control: 'Moisture analysis at blending and post-cooling'
    }
  ]
};

// Placeholder UX Pyramid Summary - represents consumer needs hierarchy
export const uxPyramidSummary = {
  title: "UX Pyramid Consumer Needs Assessment",
  description: "Consumer needs hierarchy for Star Bites, from foundational requirements to delight factors.",
  levels: [
    {
      level: 'Foundation',
      name: 'Safety & Trust',
      needs: [
        'Product is safe to consume',
        'Package is tamper-evident',
        'Allergen information is clear'
      ]
    },
    {
      level: 'Functional',
      name: 'Core Performance',
      needs: [
        'Consistent taste across all units',
        'Appropriate texture (not too hard/soft)',
        'Easy to open packaging',
        'Portable and mess-free consumption'
      ]
    },
    {
      level: 'Usability',
      name: 'Ease of Use',
      needs: [
        'Clear nutrition labeling',
        'Appropriate portion size',
        'Shelf-stable for convenience'
      ]
    },
    {
      level: 'Delight',
      name: 'Exceeds Expectations',
      needs: [
        'Unique flavor profile',
        'Visually appealing appearance',
        'Sustainable packaging'
      ]
    }
  ]
};

// Success Criteria Options organized by functional role
// Each role has criteria specific to their domain
// Max 3 criteria can be selected per role

// Product Development criteria - focus on formula, ingredients, product performance
export const productDevCriteria = [
  {
    id: 'pd1',
    text: 'Achieve gel strength within target range (45-60 second set time) for 95% of units',
    source: 'dfmea',
    sourceRef: 'FM1: Gel setting failure',
    category: 'Process Control',
    role: 'productDev',
    requiredMeasurements: [
      { step: 'gelling', test: 'gel', description: 'Gel strength measurement' },
      { step: 'gelling', test: 'temp', description: 'Temperature during gelling' }
    ],
    targetSpec: { metric: 'gel_strength', min: 45, max: 60, unit: 'seconds' }
  },
  {
    id: 'pd2',
    text: 'Pass sensory evaluation with no off-flavors detected in any batch samples',
    source: 'both',
    sourceRef: 'FM3 + UX Functional: Consistent taste',
    category: 'Quality',
    role: 'productDev',
    requiredMeasurements: [
      { step: 'release', test: 'sensory', description: 'Sensory panel evaluation' },
      { step: 'mixing', test: 'temp', description: 'Mixing temperature control' }
    ],
    targetSpec: { metric: 'sensory_score', min: 4, max: 5, unit: 'rating' }
  },
  {
    id: 'pd3',
    text: 'Maintain moisture content within specification (12-16%) at all critical control points',
    source: 'dfmea',
    sourceRef: 'FM5: Moisture content out of spec',
    category: 'Process Control',
    role: 'productDev',
    requiredMeasurements: [
      { step: 'blending', test: 'moisture', description: 'Post-blending moisture' },
      { step: 'cooling', test: 'moisture', description: 'Post-cooling moisture' }
    ],
    targetSpec: { metric: 'moisture_content', min: 12, max: 16, unit: 'percent' }
  },
  {
    id: 'pd4',
    text: 'Achieve texture score of 4+ out of 5 in consumer panel evaluation',
    source: 'uxpyramid',
    sourceRef: 'UX Functional: Appropriate texture',
    category: 'Quality',
    role: 'productDev',
    requiredMeasurements: [
      { step: 'cooling', test: 'texture', description: 'Texture analysis' },
      { step: 'release', test: 'sensory', description: 'Sensory panel texture score' }
    ],
    targetSpec: { metric: 'texture_score', min: 4, max: 5, unit: 'rating' }
  },
  {
    id: 'pd5',
    text: 'Confirm viscosity remains stable (2500-3500 cP) throughout mixing process',
    source: 'dfmea',
    sourceRef: 'Process stability',
    category: 'Process Control',
    role: 'productDev',
    requiredMeasurements: [
      { step: 'mixing', test: 'viscosity', description: 'Viscosity monitoring' }
    ],
    targetSpec: { metric: 'viscosity', min: 2500, max: 3500, unit: 'cP' }
  }
];

// Package Development criteria - focus on packaging materials, design, compatibility
export const packageDevCriteria = [
  {
    id: 'pk1',
    text: 'Achieve <1% packaging seal failure rate across the trial run',
    source: 'dfmea',
    sourceRef: 'FM4: Packaging seal failure',
    category: 'Process Control',
    role: 'packageDev',
    requiredMeasurements: [
      { step: 'packaging', test: 'seal', description: 'Seal integrity test' }
    ],
    targetSpec: { metric: 'seal_failure_rate', min: 0, max: 1, unit: 'percent' }
  },
  {
    id: 'pk2',
    text: 'Verify package dimensions within ±1mm tolerance for shelf display compatibility',
    source: 'uxpyramid',
    sourceRef: 'UX Usability: Shelf-stable',
    category: 'Quality',
    role: 'packageDev',
    requiredMeasurements: [
      { step: 'packaging', test: 'dimensions', description: 'Package dimension check' }
    ],
    targetSpec: { metric: 'dimension_variance', min: -1, max: 1, unit: 'mm' }
  },
  {
    id: 'pk3',
    text: 'Confirm package tamper-evidence features function correctly on 100% of units',
    source: 'uxpyramid',
    sourceRef: 'UX Foundation: Package tamper-evident',
    category: 'Safety',
    role: 'packageDev',
    requiredMeasurements: [
      { step: 'packaging', test: 'visual', description: 'Tamper seal inspection' }
    ],
    targetSpec: { metric: 'tamper_compliance', min: 100, max: 100, unit: 'percent' }
  },
  {
    id: 'pk4',
    text: 'Validate film alignment accuracy within ±2mm for consistent branding appearance',
    source: 'uxpyramid',
    sourceRef: 'UX Delight: Visually appealing',
    category: 'Aesthetics',
    role: 'packageDev',
    requiredMeasurements: [
      { step: 'packaging', test: 'visual', description: 'Print registration check' }
    ],
    targetSpec: { metric: 'print_alignment', min: -2, max: 2, unit: 'mm' }
  },
  {
    id: 'pk5',
    text: 'Ensure package opening force is within consumer-friendly range (5-15N)',
    source: 'uxpyramid',
    sourceRef: 'UX Functional: Easy to open',
    category: 'Usability',
    role: 'packageDev',
    requiredMeasurements: [
      { step: 'packaging', test: 'seal', description: 'Opening force measurement' }
    ],
    targetSpec: { metric: 'opening_force', min: 5, max: 15, unit: 'N' }
  }
];

// Quality criteria - focus on testing standards, compliance, quality metrics
export const qualityCriteria = [
  {
    id: 'qa1',
    text: 'Complete all safety and allergen documentation with zero non-conformances',
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
    text: 'Maintain portion weight consistency within ±2g tolerance across all batches',
    source: 'dfmea',
    sourceRef: 'FM2: Uneven portioning',
    category: 'Process Control',
    role: 'quality',
    requiredMeasurements: [
      { step: 'portioning', test: 'weight', description: 'Unit weight measurement' }
    ],
    targetSpec: { metric: 'weight_variance', min: -2, max: 2, unit: 'grams' }
  },
  {
    id: 'qa3',
    text: 'Pass microbial testing with counts below regulatory limits on all batch samples',
    source: 'uxpyramid',
    sourceRef: 'UX Foundation: Safe to consume',
    category: 'Safety',
    role: 'quality',
    requiredMeasurements: [
      { step: 'release', test: 'micro', description: 'Microbial count analysis' }
    ],
    targetSpec: { metric: 'micro_count', min: 0, max: 100, unit: 'CFU/g' }
  },
  {
    id: 'qa4',
    text: 'Document all process parameters and deviations for future production reference',
    source: 'operational',
    sourceRef: 'Knowledge transfer requirement',
    category: 'Documentation',
    role: 'quality',
    requiredMeasurements: [
      { step: 'gelling', test: 'temp', description: 'Process temperature logging' },
      { step: 'mixing', test: 'viscosity', description: 'Viscosity monitoring' }
    ],
    targetSpec: { metric: 'parameters_logged', min: 100, max: 100, unit: 'percent' }
  },
  {
    id: 'qa5',
    text: 'Produce minimum of 500 units meeting all quality specifications',
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

// Combined list for backward compatibility and unified access
export const successCriteriaOptions = [
  ...productDevCriteria,
  ...packageDevCriteria,
  ...qualityCriteria
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
