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
    },
    {
      id: 'fm6',
      mode: 'Gellan gum dosing variance destabilizes gel network',
      cause: 'At 0.15% concentration, minor weighing errors (±0.02%) critically alter gel strength and suspension stability',
      effect: 'Product is too soft/runny or too firm; orange flavor particles settle out of suspension',
      rpn: 210,
      control: 'Precision gravimetric dosing with ±0.005% tolerance; in-line viscosity monitoring during gelling'
    },
    {
      id: 'fm7',
      mode: 'Sugar crystallization during temperature cycling',
      cause: 'Combined 33% sugar load (28% cane + 5% invert) undergoes crystallization when exposed to temperature swings in spacecraft storage',
      effect: 'Gritty mouthfeel; loss of smooth texture; reduced emotional comfort from familiar candy experience',
      rpn: 180,
      control: 'Accelerated temperature cycling test (-18°C to 40°C); crystal formation monitoring via polarized light microscopy'
    },
    {
      id: 'fm8',
      mode: 'Natural orange flavor volatile loss during processing',
      cause: 'Heat-sensitive aromatic compounds in natural orange flavor (1.2%) and vanilla extract (0.3%) degrade above 70°C during mixing/gelling',
      effect: 'Product loses signature orange burst and familiar warmth; fails sensory identity targets',
      rpn: 195,
      control: 'Flavor addition at ≤55°C post-gelling; headspace GC analysis for key volatiles (limonene, linalool, vanillin)'
    },
    {
      id: 'fm9',
      mode: 'Soluble fiber syrup hygroscopic moisture migration',
      cause: 'Soluble fiber syrup (22%) absorbs ambient moisture over extended storage, especially in variable humidity spacecraft environments',
      effect: 'Surface becomes tacky/sticky; product adheres to packaging; texture softens beyond specification',
      rpn: 170,
      control: 'Water activity (aw) monitoring at 0.55-0.65 target; moisture barrier packaging validation over 12-month shelf life'
    },
    {
      id: 'fm10',
      mode: 'Modified tapioca starch retrogradation',
      cause: 'Starch molecules (6%) re-crystallize over extended shelf life, accelerated by temperature fluctuations in space',
      effect: 'Product becomes progressively harder and less chewy; texture diverges from initial quality over mission duration',
      rpn: 165,
      control: 'Texture profile analysis at 0, 3, 6, 12 months; starch modification grade selection for retrogradation resistance'
    },
    {
      id: 'fm11',
      mode: 'Sunflower lecithin emulsion breakdown',
      cause: 'Sunflower lecithin (0.4%) concentration insufficient to maintain stable emulsion under microgravity fluid dynamics',
      effect: 'Phase separation; oil droplets coalesce on surface; unappetizing appearance and mouthfeel',
      rpn: 155,
      control: 'Emulsion stability index testing under simulated microgravity; lecithin concentration optimization study'
    },
    {
      id: 'fm12',
      mode: 'Coloring food juice degradation from UV/light exposure',
      cause: 'Natural juice-based colorants (0.5%) are highly sensitive to light and oxidation, accelerated by mixed tocopherols interaction',
      effect: 'Color fades from vibrant orange to dull brown/yellow; fails visual joy and delight expectations',
      rpn: 185,
      control: 'Accelerated photostability testing; opaque packaging with <0.1% UV transmission; color delta-E monitoring'
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
    importanceWeight: 80,
    measurementType: 'instrumental',
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
    importanceWeight: 90,
    measurementType: 'instrumental',
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
    importanceWeight: 40,
    measurementType: 'instrumental',
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
    importanceWeight: 50,
    measurementType: 'instrumental',
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
    importanceWeight: 70,
    measurementType: 'instrumental',
    requiredMeasurements: [
      { step: 'blending', test: 'moisture', description: 'Post-blending moisture' },
      { step: 'cooling', test: 'moisture', description: 'Post-cooling moisture' }
    ],
    targetSpec: { metric: 'moisture_content', min: 12, max: 16, unit: 'percent' }
  },
  {
    id: 'pd6',
    text: 'Verify gellan gum dosing precision within ±0.005% to maintain consistent gel network strength',
    source: 'dfmea',
    sourceRef: 'FM6: Gellan gum dosing variance',
    category: 'Process Control',
    role: 'productDev',
    importanceWeight: 85,
    measurementType: 'instrumental',
    requiredMeasurements: [
      { step: 'blending', test: 'weight', description: 'Gellan gum gravimetric dosing verification' },
      { step: 'gelling', test: 'gel', description: 'In-line viscosity during gelling' }
    ],
    targetSpec: { metric: 'gellan_dosing_accuracy', min: 0.145, max: 0.155, unit: 'percent' }
  },
  {
    id: 'pd7',
    text: 'Pass accelerated temperature cycling test with zero sugar crystallization detected over simulated 6-month mission',
    source: 'dfmea',
    sourceRef: 'FM7: Sugar crystallization',
    category: 'Shelf Stability',
    role: 'productDev',
    importanceWeight: 75,
    measurementType: 'instrumental',
    requiredMeasurements: [
      { step: 'cooling', test: 'texture', description: 'Crystal formation check via polarized light microscopy' },
      { step: 'release', test: 'sensory', description: 'Texture grittiness evaluation post-cycling' }
    ],
    targetSpec: { metric: 'crystal_count', min: 0, max: 0, unit: 'count' }
  },
  {
    id: 'pd8',
    text: 'Retain ≥85% of key orange flavor volatiles (limonene, linalool) through processing by adding flavor post-gelling at ≤55°C',
    source: 'dfmea',
    sourceRef: 'FM8: Natural orange flavor volatile loss',
    category: 'Flavor Integrity',
    role: 'productDev',
    importanceWeight: 80,
    measurementType: 'instrumental',
    requiredMeasurements: [
      { step: 'mixing', test: 'temp', description: 'Flavor addition temperature verification' },
      { step: 'release', test: 'sensory', description: 'Headspace GC volatile retention analysis' }
    ],
    targetSpec: { metric: 'volatile_retention', min: 85, max: 100, unit: 'percent' }
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
    importanceWeight: 75,
    measurementType: 'instrumental',
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
    importanceWeight: 95,
    measurementType: 'instrumental',
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
    importanceWeight: 45,
    measurementType: 'instrumental',
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
    importanceWeight: 60,
    measurementType: 'instrumental',
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
    importanceWeight: 85,
    measurementType: 'instrumental',
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
    importanceWeight: 90,
    measurementType: 'instrumental',
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
    importanceWeight: 65,
    measurementType: 'instrumental',
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
    importanceWeight: 95,
    measurementType: 'instrumental',
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
    importanceWeight: 35,
    measurementType: 'instrumental',
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
    importanceWeight: 55,
    measurementType: 'instrumental',
    requiredMeasurements: [
      { step: 'portioning', test: 'weight', description: 'Unit count and weight' },
      { step: 'packaging', test: 'visual', description: 'Final product inspection' }
    ],
    targetSpec: { metric: 'units_produced', min: 500, max: null, unit: 'units' }
  }
];

// PIM (Plant Industrialization Manager) criteria - focus on plant operations
// PIM criteria use conversational measurement - talking to operators instead of instruments
export const pimCriteria = [
  {
    id: 'pim1',
    text: 'Achieve line efficiency of 85%+ with minimal unplanned downtime during trial run',
    source: 'operational',
    sourceRef: 'Plant runnability requirement',
    category: 'Line Efficiency',
    role: 'pim',
    importanceWeight: 70,
    measurementType: 'conversational',
    requiredMeasurements: [
      { step: 'operator-conversation', question: 'line_efficiency', description: 'Ask about line efficiency during trial' },
      { step: 'operator-conversation', question: 'downtime_events', description: 'Ask about unplanned downtime events' }
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
    importanceWeight: 85,
    measurementType: 'conversational',
    requiredMeasurements: [
      { step: 'operator-conversation', question: 'safety_incidents', description: 'Ask about safety incidents and batch sheet clarity' }
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
    importanceWeight: 60,
    measurementType: 'conversational',
    requiredMeasurements: [
      { step: 'operator-conversation', question: 'changeover_time', description: 'Ask about changeover time and equipment issues' },
      { step: 'operator-conversation', question: 'cleaning_difficulty', description: 'Ask about changeover cleanup process' }
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
    importanceWeight: 75,
    measurementType: 'conversational',
    requiredMeasurements: [
      { step: 'operator-conversation', question: 'operator_readiness', description: 'Ask about operator preparedness and training' }
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
    importanceWeight: 50,
    measurementType: 'conversational',
    requiredMeasurements: [
      { step: 'operator-conversation', question: 'scale_up_params', description: 'Ask about equipment parameter documentation' }
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

// Operator Questions - questions PIM players can ask during operator conversation step
export const operatorQuestions = [
  {
    id: 'line_efficiency',
    question: 'What was the line efficiency during the trial run? How many units per hour were you hitting?',
    relatedCriteria: ['pim1'],
    sampleCost: 5,
    category: 'Line Efficiency'
  },
  {
    id: 'downtime_events',
    question: 'Were there any unplanned downtime events? What caused them and how long did they last?',
    relatedCriteria: ['pim1', 'pim3'],
    sampleCost: 5,
    category: 'Line Efficiency'
  },
  {
    id: 'safety_incidents',
    question: 'Were there any safety incidents during the run? Was the batch sheet clear and easy to follow?',
    relatedCriteria: ['pim2'],
    sampleCost: 5,
    category: 'Safety'
  },
  {
    id: 'changeover_time',
    question: 'How long did the changeover take? Were there any equipment compatibility issues?',
    relatedCriteria: ['pim3'],
    sampleCost: 5,
    category: 'Equipment'
  },
  {
    id: 'cleaning_difficulty',
    question: 'How difficult was the changeover cleanup process? Any residue or contamination concerns?',
    relatedCriteria: ['pim3'],
    sampleCost: 5,
    category: 'Equipment'
  },
  {
    id: 'operator_readiness',
    question: 'Did operators feel prepared for this trial? Was the training adequate for the new product?',
    relatedCriteria: ['pim4'],
    sampleCost: 5,
    category: 'Training'
  },
  {
    id: 'scale_up_params',
    question: 'Were all equipment parameters documented during the run? Any variance from the lab specs?',
    relatedCriteria: ['pim5'],
    sampleCost: 5,
    category: 'Documentation'
  },
  {
    id: 'overall_impression',
    question: 'Overall, how did the trial run go from the plant floor perspective? Anything surprising?',
    relatedCriteria: ['pim1', 'pim2', 'pim3', 'pim4', 'pim5'],
    sampleCost: 10,
    category: 'General'
  }
];

// Operator Quote Bank - quotes shown in Level 4 results for conversational criteria
// Each question has met (positive) and notMet (negative) quotes
export const operatorQuoteBank = {
  line_efficiency: {
    met: [
      { speaker: 'Maria, Line Lead', quote: 'We hit 91% efficiency on the main line. Really smooth run once we got past the first hour of warmup.' },
      { speaker: 'James, Shift Supervisor', quote: 'Line was running at 88% overall. The gelling station kept pace nicely and we had minimal stoppages.' },
      { speaker: 'Priya, Operations Tech', quote: 'Efficiency was solid at 87%. The cooling tunnel was the bottleneck but we managed around it.' }
    ],
    notMet: [
      { speaker: 'Maria, Line Lead', quote: 'We only hit about 72% efficiency. The mixer kept jamming with the new formulation viscosity.' },
      { speaker: 'James, Shift Supervisor', quote: 'Rough day - 68% efficiency. We had three unplanned stops for the portioning heads clogging.' },
      { speaker: 'Priya, Operations Tech', quote: 'Line efficiency was around 74%. The product was too sticky and kept fouling the conveyor.' }
    ]
  },
  downtime_events: {
    met: [
      { speaker: 'Carlos, Maintenance Tech', quote: 'Just one minor stop for 8 minutes to clear a sensor alarm. Nothing that impacted the batch quality.' },
      { speaker: 'Maria, Line Lead', quote: 'No significant downtime. We had a brief pause to adjust the fill weight but that was planned.' },
      { speaker: 'Tony, Equipment Engineer', quote: 'Clean run. The preventive maintenance we did last week really paid off - zero breakdowns.' }
    ],
    notMet: [
      { speaker: 'Carlos, Maintenance Tech', quote: 'We lost 45 minutes when the gelling pump seized. Had to pull it apart and clean the impeller.' },
      { speaker: 'Maria, Line Lead', quote: 'Three separate stops totaling over an hour. The cooling system kept tripping on high temperature.' },
      { speaker: 'Tony, Equipment Engineer', quote: 'Major downtime event - the mixer shaft coupling failed. Took 90 minutes to get a replacement.' }
    ]
  },
  safety_incidents: {
    met: [
      { speaker: 'Aisha, Safety Coordinator', quote: 'Zero incidents reported. The batch sheet was well-organized and operators followed every step correctly.' },
      { speaker: 'James, Shift Supervisor', quote: 'No safety concerns at all. The new floor documents translated well from the batch record.' },
      { speaker: 'Lin, QA Tech', quote: 'Everything was clean from a safety standpoint. Allergen controls were tight and well-documented.' }
    ],
    notMet: [
      { speaker: 'Aisha, Safety Coordinator', quote: 'We had a near-miss at the mixing station. The batch sheet had confusing units - Celsius was written where Fahrenheit should have been.' },
      { speaker: 'James, Shift Supervisor', quote: 'One operator slipped on spilled gel near the gelling station. The floor document did not call out the slip hazard.' },
      { speaker: 'Lin, QA Tech', quote: 'The allergen changeover step was missing from the translated batch sheet. We caught it but it could have been serious.' }
    ]
  },
  changeover_time: {
    met: [
      { speaker: 'Tony, Equipment Engineer', quote: 'Changeover took 22 minutes. All the fittings were compatible and the CIP cycle ran without issues.' },
      { speaker: 'Carlos, Maintenance Tech', quote: 'We got it done in 25 minutes. The new product runs on the same tooling as the previous SKU.' },
      { speaker: 'Maria, Line Lead', quote: 'Quick changeover - about 18 minutes. The team knew exactly what to swap out and everything fit.' }
    ],
    notMet: [
      { speaker: 'Tony, Equipment Engineer', quote: 'Changeover was 55 minutes. The mixing blade from the previous product does not fit the new recipe needs.' },
      { speaker: 'Carlos, Maintenance Tech', quote: 'Took us 42 minutes. The gelling station nozzles had to be swapped and we did not have the right gaskets ready.' },
      { speaker: 'Maria, Line Lead', quote: 'Over 50 minutes for changeover. The CIP validation took three cycles before we passed.' }
    ]
  },
  cleaning_difficulty: {
    met: [
      { speaker: 'Sarah, Sanitation Lead', quote: 'Cleanup was straightforward. The gel formula releases easily from stainless surfaces - single CIP pass was enough.' },
      { speaker: 'Carlos, Maintenance Tech', quote: 'No issues with cleaning. Residue came off easily and we verified with ATP swabs on first attempt.' },
      { speaker: 'Tony, Equipment Engineer', quote: 'The formulation is much easier to clean than our chocolate line. No baked-on residue at all.' }
    ],
    notMet: [
      { speaker: 'Sarah, Sanitation Lead', quote: 'The gel residue is really stubborn in the heat exchanger plates. Took three CIP cycles and manual scrubbing.' },
      { speaker: 'Carlos, Maintenance Tech', quote: 'Cleanup was a nightmare. The cooling tunnel had residue baked onto the conveyor belt that would not come off.' },
      { speaker: 'Tony, Equipment Engineer', quote: 'We failed ATP verification twice. The portioning nozzles need to be disassembled for proper cleaning.' }
    ]
  },
  operator_readiness: {
    met: [
      { speaker: 'James, Shift Supervisor', quote: 'The team felt well-prepared. Training covered all the critical steps and the operators were confident on the new controls.' },
      { speaker: 'Maria, Line Lead', quote: 'Everyone was trained up. We did a dry run last week and it really helped the team know what to expect.' },
      { speaker: 'Aisha, Safety Coordinator', quote: 'All sign-offs were completed before the trial. Operators could explain the critical control points without looking at the documents.' }
    ],
    notMet: [
      { speaker: 'James, Shift Supervisor', quote: 'Honestly, the training was rushed. Two operators were not sure how to set the gelling temperature parameters.' },
      { speaker: 'Maria, Line Lead', quote: 'We had three new temps on the line who had never run this type of product. They struggled with the cooling controls.' },
      { speaker: 'Aisha, Safety Coordinator', quote: 'Only half the team completed the training sign-off. The others were pulled from a different line at the last minute.' }
    ]
  },
  scale_up_params: {
    met: [
      { speaker: 'Lin, QA Tech', quote: 'All parameters were documented in real-time. Mixing speed, temperatures, hold times - everything matched the lab specs within 3% variance.' },
      { speaker: 'Tony, Equipment Engineer', quote: 'We logged every parameter. The scale-up factor from lab to plant was consistent and well within the 5% tolerance.' },
      { speaker: 'Priya, Operations Tech', quote: 'Documentation was thorough. I recorded all the equipment settings and they tracked closely to what R&D specified.' }
    ],
    notMet: [
      { speaker: 'Lin, QA Tech', quote: 'We had to adjust the mixing speed significantly - about 12% higher than lab spec to get the right consistency at scale.' },
      { speaker: 'Tony, Equipment Engineer', quote: 'The gelling temperature needed to be 8 degrees higher than specified. That is a big variance from the lab parameters.' },
      { speaker: 'Priya, Operations Tech', quote: 'Several parameters drifted during the run and were not caught until batch review. Documentation gaps on the cooling profile.' }
    ]
  },
  overall_impression: {
    met: [
      { speaker: 'James, Shift Supervisor', quote: 'Good trial overall. The product looks great, the line ran well, and the team is confident we can run this at full scale.' },
      { speaker: 'Maria, Line Lead', quote: 'One of the smoother trial runs we have had. A few minor hiccups but nothing that would hold up production.' },
      { speaker: 'Tony, Equipment Engineer', quote: 'From an equipment standpoint, this product is a good fit for our line. I would be comfortable running a full production batch.' }
    ],
    notMet: [
      { speaker: 'James, Shift Supervisor', quote: 'I have concerns. The line was not ready for this product and we need to solve the equipment issues before scaling up.' },
      { speaker: 'Maria, Line Lead', quote: 'Challenging trial. Between the downtime and the training gaps, I would want another trial run before full production.' },
      { speaker: 'Tony, Equipment Engineer', quote: 'We need modifications to the gelling station and cooling tunnel before this is production-ready. Too many workarounds today.' }
    ]
  }
};

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
