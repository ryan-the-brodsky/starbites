import React, { useState, useMemo } from 'react';
import { CheckCircle2, FlaskConical, Clock, AlertTriangle, X, ArrowRight, Package, Shuffle, Droplets, Flame, Scale, Snowflake, Box, ClipboardCheck, Target, Info, Plus, Minus } from 'lucide-react';
import { useGame } from '../../../contexts/GameContext';

// Star Bites Process Flow Steps with icons and available tests
const processSteps = [
  { id: 'receiving', name: 'Raw Materials', description: 'Receiving & inspection', icon: Package, availableTests: ['temp', 'moisture', 'visual'] },
  { id: 'blending', name: 'Dry Blending', description: 'Ingredient mixing', icon: Shuffle, availableTests: ['moisture', 'particle', 'weight'] },
  { id: 'mixing', name: 'Hydration', description: 'Water & mixing', icon: Droplets, availableTests: ['temp', 'viscosity', 'moisture'] },
  { id: 'gelling', name: 'Heating/Gelling', description: 'Thermal processing', icon: Flame, availableTests: ['temp', 'gel', 'viscosity'] },
  { id: 'portioning', name: 'Portioning', description: 'Size & weight', icon: Scale, availableTests: ['weight', 'dimensions', 'visual'] },
  { id: 'cooling', name: 'Cooling', description: 'Set & stabilize', icon: Snowflake, availableTests: ['temp', 'texture', 'moisture'] },
  { id: 'packaging', name: 'Packaging', description: 'Seal & label', icon: Box, availableTests: ['seal', 'visual', 'weight'] },
  { id: 'release', name: 'QC Release', description: 'Final checks', icon: ClipboardCheck, availableTests: ['micro', 'sensory', 'visual'] },
];

const testOptions = {
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

const timePoints = [
  { id: 'beginning', name: 'Beginning', description: 'First 30 mins of production' },
  { id: 'middle', name: 'Middle', description: 'Mid-point of production' },
  { id: 'end', name: 'End', description: 'Final 30 mins of production' },
];

const MAX_SAMPLES = 300;

const Level2 = () => {
  const { gameState, updateLevelState, completeLevel } = useGame();
  // New structure: samplingPlan[stepId][testId][timePointId] = quantity
  const [samplingPlan, setSamplingPlan] = useState({});
  const [selectedStep, setSelectedStep] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Get selected criteria from Level 1
  const selectedCriteria = gameState?.level1?.selectedCriteria || [];

  // Calculate which step/test combinations are needed to cover success criteria
  const requiredMeasurements = useMemo(() => {
    const required = new Map();
    selectedCriteria.forEach(criteria => {
      if (criteria?.requiredMeasurements) {
        criteria.requiredMeasurements.forEach(m => {
          const key = `${m.step}-${m.test}`;
          if (!required.has(key)) {
            required.set(key, {
              step: m.step,
              test: m.test,
              criteria: [criteria.id],
              description: m.description
            });
          } else {
            required.get(key).criteria.push(criteria.id);
          }
        });
      }
    });
    return required;
  }, [selectedCriteria]);

  // Check if a step/test combination is required for success criteria
  const isRequired = (stepId, testId) => {
    return requiredMeasurements.has(`${stepId}-${testId}`);
  };

  // Count total samples used
  const getTotalSamples = () => {
    let total = 0;
    Object.values(samplingPlan).forEach(stepPlan => {
      Object.values(stepPlan).forEach(testPlan => {
        Object.values(testPlan).forEach(quantity => {
          total += quantity;
        });
      });
    });
    return total;
  };

  const samplesUsed = getTotalSamples();
  const samplesRemaining = MAX_SAMPLES - samplesUsed;

  // Calculate criteria coverage
  const getCriteriaCoverage = () => {
    const covered = new Set();

    Object.entries(samplingPlan).forEach(([stepId, stepPlan]) => {
      Object.entries(stepPlan).forEach(([testId, testPlan]) => {
        // Check if this test has any samples at any timepoint
        const hasAnySamples = Object.values(testPlan).some(qty => qty > 0);
        if (hasAnySamples) {
          const key = `${stepId}-${testId}`;
          if (requiredMeasurements.has(key)) {
            requiredMeasurements.get(key).criteria.forEach(criteriaId => {
              covered.add(criteriaId);
            });
          }
        }
      });
    });

    return {
      covered: covered.size,
      total: selectedCriteria.length,
      coveredIds: Array.from(covered)
    };
  };

  const coverage = getCriteriaCoverage();

  // Get the quantity for a specific step/test/timepoint combination
  const getSampleQuantity = (stepId, testId, timePointId) => {
    return samplingPlan[stepId]?.[testId]?.[timePointId] || 0;
  };

  // Update the quantity for a specific combination
  const updateSampleQuantity = (stepId, testId, timePointId, delta) => {
    setSamplingPlan(prev => {
      const currentQty = getSampleQuantity(stepId, testId, timePointId);
      const newQty = Math.max(0, currentQty + delta);

      // Check if we can add more samples
      if (delta > 0 && samplesUsed + delta > MAX_SAMPLES) {
        return prev;
      }

      const newPlan = { ...prev };
      if (!newPlan[stepId]) {
        newPlan[stepId] = {};
      }
      if (!newPlan[stepId][testId]) {
        newPlan[stepId][testId] = {};
      }

      if (newQty === 0) {
        delete newPlan[stepId][testId][timePointId];
        // Clean up empty objects
        if (Object.keys(newPlan[stepId][testId]).length === 0) {
          delete newPlan[stepId][testId];
        }
        if (Object.keys(newPlan[stepId]).length === 0) {
          delete newPlan[stepId];
        }
      } else {
        newPlan[stepId][testId][timePointId] = newQty;
      }

      return newPlan;
    });
  };

  // Set a specific quantity directly (used by input fields)
  const setSampleQuantity = (stepId, testId, timePointId, newQuantity) => {
    setSamplingPlan(prev => {
      // Calculate current total excluding this cell
      let totalExcludingThis = 0;
      Object.entries(prev).forEach(([sId, stepPlan]) => {
        Object.entries(stepPlan).forEach(([tId, testPlan]) => {
          Object.entries(testPlan).forEach(([tpId, qty]) => {
            if (!(sId === stepId && tId === testId && tpId === timePointId)) {
              totalExcludingThis += qty;
            }
          });
        });
      });

      // Clamp the new quantity to valid range
      let finalQty = Math.max(0, newQuantity);
      const maxAllowed = MAX_SAMPLES - totalExcludingThis;
      if (finalQty > maxAllowed) {
        finalQty = maxAllowed;
      }

      const newPlan = { ...prev };
      if (!newPlan[stepId]) {
        newPlan[stepId] = {};
      }
      if (!newPlan[stepId][testId]) {
        newPlan[stepId][testId] = {};
      }

      if (finalQty === 0) {
        delete newPlan[stepId][testId][timePointId];
        // Clean up empty objects
        if (Object.keys(newPlan[stepId][testId]).length === 0) {
          delete newPlan[stepId][testId];
        }
        if (Object.keys(newPlan[stepId]).length === 0) {
          delete newPlan[stepId];
        }
      } else {
        newPlan[stepId][testId][timePointId] = finalQty;
      }

      return newPlan;
    });
  };

  const getStepSampleCount = (stepId) => {
    let total = 0;
    const stepPlan = samplingPlan[stepId];
    if (!stepPlan) return 0;
    Object.values(stepPlan).forEach(testPlan => {
      Object.values(testPlan).forEach(quantity => {
        total += quantity;
      });
    });
    return total;
  };

  const canSubmit = () => {
    // Need at least 2 steps with samples
    const stepsWithSamples = Object.keys(samplingPlan).filter(
      stepId => getStepSampleCount(stepId) > 0
    );
    return stepsWithSamples.length >= 2;
  };

  const handleSubmit = () => {
    updateLevelState('level3', {
      samplingPlan,
      samplesUsed,
      criteriaCoverage: coverage,
      completedAt: Date.now(),
    });
    setIsSubmitted(true);
    setTimeout(() => completeLevel(3), 2500);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-950 to-slate-950 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-4">
          <div className="text-8xl mb-6">📊</div>
          <h2 className="text-4xl font-bold text-green-400 mb-4">SAMPLING PLAN COMPLETE!</h2>
          <p className="text-slate-300 mb-4">
            Coverage: {coverage.covered} of {coverage.total} success criteria can be measured
          </p>
          <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
            <p className="text-sm text-slate-400 mb-2">Samples used: {samplesUsed} / {MAX_SAMPLES}</p>
            {coverage.covered < coverage.total && (
              <p className="text-sm text-amber-400">
                Note: Some success criteria may not have sufficient data in the Mission Report
              </p>
            )}
          </div>
          <p className="text-slate-400">Proceeding to Mission Report...</p>
        </div>
      </div>
    );
  }

  const selectedStepData = selectedStep ? processSteps.find(s => s.id === selectedStep) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">Level 3: Sampling Plan</h1>
          <p className="text-slate-400">Design your sampling strategy to verify your success criteria</p>
        </div>

        {/* Success Criteria Reminder */}
        <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-xl p-4 border border-cyan-700/50 mb-6">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-cyan-300 mb-2">Your Success Criteria (from Level 1)</h3>
              <div className="grid md:grid-cols-2 gap-2">
                {selectedCriteria.map((criteria, i) => (
                  <div
                    key={criteria?.id || i}
                    className={`text-sm p-2 rounded-lg ${
                      coverage.coveredIds.includes(criteria?.id)
                        ? 'bg-green-900/30 border border-green-600'
                        : 'bg-slate-800/50 border border-slate-600'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {coverage.coveredIds.includes(criteria?.id) ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={coverage.coveredIds.includes(criteria?.id) ? 'text-green-300' : 'text-slate-300'}>
                        {criteria?.text || 'Unknown criteria'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {coverage.covered < coverage.total && (
                <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  {coverage.total - coverage.covered} criteria not yet covered by your sampling plan
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sample Budget */}
        <div className={`rounded-xl p-4 border mb-6 ${
          samplesRemaining === 0
            ? 'bg-red-900/30 border-red-500'
            : samplesRemaining <= 5
              ? 'bg-amber-900/30 border-amber-500'
              : 'bg-slate-800/50 border-slate-700'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <FlaskConical className={`w-6 h-6 ${
                samplesRemaining === 0 ? 'text-red-400' : samplesRemaining <= 5 ? 'text-amber-400' : 'text-cyan-400'
              }`} />
              <div>
                <h3 className="font-semibold">Sample Budget</h3>
                <p className="text-sm text-slate-400">Allocate samples across tests and timepoints</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${
                samplesRemaining === 0 ? 'text-red-400' : samplesRemaining <= 5 ? 'text-amber-400' : 'text-cyan-400'
              }`}>
                {samplesUsed} / {MAX_SAMPLES}
              </div>
              <div className="text-sm text-slate-500">samples used</div>
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
            <p className="text-sm text-slate-300">
              <span className="text-cyan-400 font-medium">Why the limit?</span> In real plant trials, resources are limited—lab capacity, technician time, and product availability all constrain how many samples you can collect. This simulation uses a budget of {MAX_SAMPLES} samples to mirror those real-world constraints, so you'll need to prioritize which tests and timepoints matter most for validating your success criteria.
            </p>
          </div>
        </div>

        {/* Process Flow Visualization */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-6">
          <h2 className="text-xl font-semibold mb-6 text-center">Star Bites Production Process</h2>

          {/* Process Flow - Two rows */}
          <div className="space-y-4">
            {/* Top row: steps 1-4 */}
            <div className="flex items-center justify-center gap-2">
              {processSteps.slice(0, 4).map((step, index) => {
                const Icon = step.icon;
                const sampleCount = getStepSampleCount(step.id);
                const isConfigured = sampleCount > 0;
                const hasRequiredTest = step.availableTests.some(t => isRequired(step.id, t));

                return (
                  <React.Fragment key={step.id}>
                    <button
                      onClick={() => setSelectedStep(step.id)}
                      className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all hover:scale-105 min-w-[100px] ${
                        selectedStep === step.id
                          ? 'border-cyan-400 bg-cyan-900/40 shadow-lg shadow-cyan-500/20'
                          : isConfigured
                            ? 'border-green-500 bg-green-900/30'
                            : hasRequiredTest
                              ? 'border-amber-500/50 bg-amber-900/20 hover:border-amber-400'
                              : 'border-slate-600 bg-slate-800/50 hover:border-slate-400'
                      }`}
                    >
                      {isConfigured && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">
                          {sampleCount}
                        </div>
                      )}
                      {hasRequiredTest && !isConfigured && (
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                          <Target className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className={`p-2 rounded-lg mb-2 ${
                        isConfigured ? 'bg-green-500/20' : hasRequiredTest ? 'bg-amber-500/20' : 'bg-slate-700'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          isConfigured ? 'text-green-400' : hasRequiredTest ? 'text-amber-400' : 'text-slate-400'
                        }`} />
                      </div>
                      <span className="text-xs font-medium text-center">{step.name}</span>
                      <span className="text-[10px] text-slate-500">{step.description}</span>
                    </button>
                    {index < 3 && (
                      <ArrowRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Connector arrow down */}
            <div className="flex justify-end pr-12">
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-4 bg-slate-500" />
                <ArrowRight className="w-5 h-5 text-slate-500 rotate-90" />
              </div>
            </div>

            {/* Bottom row: steps 5-8 (reversed for flow) */}
            <div className="flex items-center justify-center gap-2 flex-row-reverse">
              {processSteps.slice(4, 8).map((step, index) => {
                const Icon = step.icon;
                const sampleCount = getStepSampleCount(step.id);
                const isConfigured = sampleCount > 0;
                const hasRequiredTest = step.availableTests.some(t => isRequired(step.id, t));

                return (
                  <React.Fragment key={step.id}>
                    <button
                      onClick={() => setSelectedStep(step.id)}
                      className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all hover:scale-105 min-w-[100px] ${
                        selectedStep === step.id
                          ? 'border-cyan-400 bg-cyan-900/40 shadow-lg shadow-cyan-500/20'
                          : isConfigured
                            ? 'border-green-500 bg-green-900/30'
                            : hasRequiredTest
                              ? 'border-amber-500/50 bg-amber-900/20 hover:border-amber-400'
                              : 'border-slate-600 bg-slate-800/50 hover:border-slate-400'
                      }`}
                    >
                      {isConfigured && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">
                          {sampleCount}
                        </div>
                      )}
                      {hasRequiredTest && !isConfigured && (
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                          <Target className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className={`p-2 rounded-lg mb-2 ${
                        isConfigured ? 'bg-green-500/20' : hasRequiredTest ? 'bg-amber-500/20' : 'bg-slate-700'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          isConfigured ? 'text-green-400' : hasRequiredTest ? 'text-amber-400' : 'text-slate-400'
                        }`} />
                      </div>
                      <span className="text-xs font-medium text-center">{step.name}</span>
                      <span className="text-[10px] text-slate-500">{step.description}</span>
                    </button>
                    {index < 3 && (
                      <ArrowRight className="w-5 h-5 text-slate-500 flex-shrink-0 rotate-180" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-slate-500 text-center mt-4">
            <span className="inline-flex items-center gap-1">
              <Target className="w-3 h-3 text-amber-400" />
              Steps with amber indicators have tests that support your success criteria
            </span>
          </p>
        </div>

        {/* Configuration Panel */}
        {selectedStep && selectedStepData && (
          <div className="bg-slate-800/50 rounded-xl p-6 border border-cyan-500 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = selectedStepData.icon;
                  return <Icon className="w-6 h-6 text-cyan-400" />;
                })()}
                <div>
                  <h3 className="text-lg font-semibold text-cyan-300">{selectedStepData.name}</h3>
                  <p className="text-sm text-slate-400">{selectedStepData.description}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStep(null)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Sample Configuration Grid */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-3 px-2">
                      <div className="flex items-center gap-2">
                        <FlaskConical className="w-4 h-4 text-cyan-400" />
                        <span className="font-medium text-slate-300">Test</span>
                      </div>
                    </th>
                    {timePoints.map(tp => (
                      <th key={tp.id} className="text-center py-3 px-2 min-w-[120px]">
                        <div className="flex flex-col items-center">
                          <Clock className="w-4 h-4 text-purple-400 mb-1" />
                          <span className="font-medium text-slate-300">{tp.name}</span>
                          <span className="text-[10px] text-slate-500">{tp.description}</span>
                        </div>
                      </th>
                    ))}
                    <th className="text-center py-3 px-2 min-w-[80px]">
                      <span className="font-medium text-slate-300">Total</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStepData.availableTests.map(testId => {
                    const test = testOptions[testId];
                    const requiredForCriteria = isRequired(selectedStep, testId);
                    const testTotal = timePoints.reduce((sum, tp) =>
                      sum + getSampleQuantity(selectedStep, testId, tp.id), 0
                    );

                    return (
                      <tr key={testId} className={`border-b border-slate-700/50 ${
                        requiredForCriteria ? 'bg-amber-900/10' : ''
                      }`}>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-200">{test.name}</span>
                            {requiredForCriteria && (
                              <span className="text-xs bg-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded">
                                Recommended
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">{test.description}</div>
                        </td>
                        {timePoints.map(tp => {
                          const qty = getSampleQuantity(selectedStep, testId, tp.id);
                          return (
                            <td key={tp.id} className="py-3 px-2">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => updateSampleQuantity(selectedStep, testId, tp.id, -1)}
                                  disabled={qty === 0}
                                  className="w-8 h-8 flex items-center justify-center rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  max={MAX_SAMPLES}
                                  value={qty}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    setSampleQuantity(selectedStep, testId, tp.id, val);
                                  }}
                                  className="w-14 h-8 text-center bg-slate-900 border border-slate-600 rounded text-white focus:outline-none focus:border-cyan-400"
                                />
                                <button
                                  onClick={() => updateSampleQuantity(selectedStep, testId, tp.id, 1)}
                                  disabled={samplesRemaining === 0}
                                  className="w-8 h-8 flex items-center justify-center rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          );
                        })}
                        <td className="py-3 px-2 text-center">
                          <span className={`font-bold ${testTotal > 0 ? 'text-cyan-400' : 'text-slate-500'}`}>
                            {testTotal}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-600">
                    <td className="py-3 px-2 font-medium text-slate-300">Step Total</td>
                    {timePoints.map(tp => {
                      const tpTotal = selectedStepData.availableTests.reduce((sum, testId) =>
                        sum + getSampleQuantity(selectedStep, testId, tp.id), 0
                      );
                      return (
                        <td key={tp.id} className="py-3 px-2 text-center">
                          <span className={`font-bold ${tpTotal > 0 ? 'text-purple-400' : 'text-slate-500'}`}>
                            {tpTotal}
                          </span>
                        </td>
                      );
                    })}
                    <td className="py-3 px-2 text-center">
                      <span className={`text-lg font-bold ${getStepSampleCount(selectedStep) > 0 ? 'text-green-400' : 'text-slate-500'}`}>
                        {getStepSampleCount(selectedStep)}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Quick Add Buttons */}
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-xs text-slate-500 mb-2">Quick add to all timepoints:</p>
              <div className="flex flex-wrap gap-2">
                {selectedStepData.availableTests.map(testId => {
                  const test = testOptions[testId];
                  const requiredForCriteria = isRequired(selectedStep, testId);
                  return (
                    <button
                      key={testId}
                      onClick={() => {
                        timePoints.forEach(tp => {
                          if (getSampleQuantity(selectedStep, testId, tp.id) === 0) {
                            updateSampleQuantity(selectedStep, testId, tp.id, 1);
                          }
                        });
                      }}
                      disabled={samplesRemaining < timePoints.length}
                      className={`px-3 py-1.5 rounded text-sm transition-colors ${
                        requiredForCriteria
                          ? 'bg-amber-600/50 hover:bg-amber-600 text-amber-100 border border-amber-500'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                      } disabled:opacity-30 disabled:cursor-not-allowed`}
                    >
                      + {test.name} (all)
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* No step selected prompt */}
        {!selectedStep && (
          <div className="bg-slate-800/30 rounded-xl p-8 border border-dashed border-slate-600 mb-6 text-center">
            <FlaskConical className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400">Click on a process step above to configure sampling</p>
            <p className="text-xs text-slate-500 mt-2">Steps with amber indicators are recommended based on your success criteria</p>
          </div>
        )}

        {/* Sample limit warning */}
        {samplesRemaining === 0 && (
          <div className="flex items-center gap-2 text-red-400 text-sm mb-6 justify-center">
            <AlertTriangle className="w-4 h-4" />
            <span>Sample budget exhausted! Remove samples to add more.</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit()}
            className="bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
          >
            Submit Sampling Plan
          </button>
          {!canSubmit() && (
            <p className="text-slate-500 text-sm mt-2">
              Configure at least 2 process steps with samples
            </p>
          )}
          {canSubmit() && (
            <p className="text-sm mt-2">
              <span className={coverage.covered === coverage.total ? 'text-green-400' : 'text-amber-400'}>
                Coverage: {coverage.covered}/{coverage.total} success criteria
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Level2;
