import { Package, Shuffle, Droplets, Flame, Scale, Snowflake, Box, ClipboardCheck, MessageCircle, TestTube } from 'lucide-react';

// Joy Bites Process Flow Steps with icons and available tests
export const processSteps = [
  { id: 'receiving', name: 'Raw Materials', description: 'Receiving & inspection', icon: Package, availableTests: ['temp', 'moisture', 'visual'] },
  { id: 'blending', name: 'Dry Blending', description: 'Ingredient mixing', icon: Shuffle, availableTests: ['moisture', 'particle', 'weight'] },
  { id: 'mixing', name: 'Hydration', description: 'Water & mixing', icon: Droplets, availableTests: ['temp', 'viscosity', 'moisture'] },
  { id: 'gelling', name: 'Heating/Gelling', description: 'Thermal processing', icon: Flame, availableTests: ['temp', 'gel', 'viscosity'] },
  { id: 'portioning', name: 'Portioning', description: 'Size & weight', icon: Scale, availableTests: ['weight', 'dimensions', 'visual'] },
  { id: 'cooling', name: 'Cooling', description: 'Set & stabilize', icon: Snowflake, availableTests: ['temp', 'texture', 'moisture'] },
  { id: 'packaging', name: 'Packaging', description: 'Seal & label', icon: Box, availableTests: ['seal', 'visual', 'weight', 'dimensions'] },
  { id: 'release', name: 'QC Release', description: 'Final checks', icon: ClipboardCheck, availableTests: ['micro', 'sensory', 'visual'] },
];

export const testOptions = {
  temp: { name: 'Temperature', description: 'Process temperature monitoring' },
  moisture: { name: 'Moisture', description: 'Water content analysis' },
  weight: { name: 'Weight', description: 'Mass measurement' },
  viscosity: { name: 'Viscosity', description: 'Flow characteristics' },
  gel: { name: 'Gel Strength', description: 'Gel set time and firmness' },
  micro: { name: 'Microbial', description: 'Microbiological testing' },
  seal: { name: 'Seal Integrity', description: 'Package seal testing' },
  sensory: { name: 'Sensory', description: 'Taste/texture evaluation' },
  particle: { name: 'Particle Size', description: 'Particle distribution' },
  texture: { name: 'Texture', description: 'Mechanical texture analysis' },
  dimensions: { name: 'Dimensions', description: 'Physical measurements' },
  visual: { name: 'Visual', description: 'Visual inspection' },
};

export const timePoints = [
  { id: 'beginning', name: 'Beginning', description: 'First 30 mins of production' },
  { id: 'middle', name: 'Middle', description: 'Mid-point of production' },
  { id: 'end', name: 'End', description: 'Final 30 mins of production' },
];

// Alternate validation paths for criteria that can't be fully addressed in the main process flow
// These appear as dotted-line branches off the main flow
export const alternateValidationPaths = [
  {
    id: 'operator-conversation',
    name: 'Operator Conversation',
    description: 'Ask questions to plant operators about the trial run',
    icon: MessageCircle,
    connectsAfter: 'gelling', // Appears as a branch after this step
    availableTests: [], // Uses question-based UI instead of test/timepoint grid
    isAlternate: true,
    isConversational: true,
  },
  {
    id: 'shelf-life-validation',
    name: 'Shelf Life Validation',
    description: 'Accelerated shelf life study',
    icon: TestTube,
    connectsAfter: 'release', // Appears as a branch after QC Release
    availableTests: ['moisture', 'visual', 'sensory', 'micro'],
    isAlternate: true,
  },
];
