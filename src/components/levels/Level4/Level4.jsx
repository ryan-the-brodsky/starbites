import React, { useState, useMemo } from 'react';
import { FileText, Send, Eye, CheckCircle2, XCircle, AlertTriangle, Target, BarChart3, FlaskConical, ChevronDown, ChevronUp, HelpCircle, RotateCcw, Award, ArrowLeft } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Legend } from 'recharts';
import { useGame } from '../../../contexts/GameContext';
import { successCriteriaOptions } from '../../../data/missionData';

// Minimum sample count for statistical validity (internal policy)
const MIN_SAMPLES_FOR_STATISTICAL_VALIDITY = 30;

// Test specifications for generating fake data
const testSpecs = {
  temp: { unit: '°C', nominal: 68, variance: 5, failRange: 15 },
  moisture: { unit: '%', nominal: 14, variance: 2, failRange: 4 },
  weight: { unit: 'g', nominal: 25, variance: 1.5, failRange: 3 },
  viscosity: { unit: 'cP', nominal: 450, variance: 50, failRange: 100 },
  gel: { unit: 'sec', nominal: 52, variance: 5, failRange: 12 },
  micro: { unit: 'CFU/g', nominal: 100, variance: 50, failRange: 500 },
  seal: { unit: '%', nominal: 99, variance: 0.5, failRange: 2 },
  sensory: { unit: '/5', nominal: 4.2, variance: 0.3, failRange: 1 },
  particle: { unit: 'μm', nominal: 150, variance: 20, failRange: 50 },
  texture: { unit: '/5', nominal: 4.0, variance: 0.4, failRange: 1 },
  dimensions: { unit: 'mm', nominal: 30, variance: 2, failRange: 5 },
  visual: { unit: '%', nominal: 98, variance: 1, failRange: 5 },
};

// Production disaster scenarios - what goes wrong when assessments are incorrect
const productionDisasters = {
  // When user said "Met" but it was actually "Not Met" (false positive - most dangerous!)
  falsePositive: {
    temp: {
      headline: "🔥 PRODUCT RECALL: Thermal Processing Failure",
      description: "Star Bites shipped to retailers with improper gelling. Products are liquefying on shelves, causing $2.3M in recall costs and retailer relationship damage.",
      severity: "critical"
    },
    moisture: {
      headline: "🦠 FDA WARNING: Moisture Levels Enable Microbial Growth",
      description: "Excess moisture in Star Bites allowed mold growth. 12,000 units quarantined, facility inspection triggered. Production halted for 2 weeks.",
      severity: "critical"
    },
    weight: {
      headline: "⚖️ CONSUMER COMPLAINTS: Underweight Products",
      description: "Retail partners report consistent underweight packages. Class action lawsuit filed for deceptive packaging. Legal fees estimated at $500K.",
      severity: "major"
    },
    viscosity: {
      headline: "💧 PRODUCTION LINE DOWN: Viscosity Out of Control",
      description: "Inconsistent viscosity caused portioning equipment to jam. 8 hours of unplanned downtime, 15,000 units scrapped.",
      severity: "major"
    },
    gel: {
      headline: "🫠 SOCIAL MEDIA DISASTER: 'Star Bites Turned to Soup'",
      description: "Without proper gel strength monitoring, products shipped with inconsistent texture. Viral TikTok of 'soupy Star Bites' gets 5M views. Brand reputation severely damaged.",
      severity: "critical"
    },
    micro: {
      headline: "☣️ URGENT RECALL: Microbial Contamination Detected",
      description: "Post-market testing reveals elevated bacterial counts. Voluntary recall of 3 production lots. FDA issues Form 483 with 4 observations.",
      severity: "critical"
    },
    seal: {
      headline: "📦 SHELF LIFE FAILURE: Package Integrity Issues",
      description: "Weak seals allowed oxygen ingress. Products spoiling before expiration date. 40% of production lot returned from retailers.",
      severity: "major"
    },
    sensory: {
      headline: "😤 RETAILER DELISTING: 'Tastes Wrong'",
      description: "Major grocery chain removes Star Bites after consumer complaints about off-flavors. Lost $1.2M in annual revenue from that channel.",
      severity: "major"
    },
    particle: {
      headline: "🔬 TEXTURE COMPLAINTS: 'Gritty' Product",
      description: "Improper particle size distribution led to gritty mouthfeel. Product reviews plummet to 2.1 stars. Sales down 35%.",
      severity: "moderate"
    },
    texture: {
      headline: "👅 CONSUMER REJECTION: Unacceptable Texture",
      description: "Products too firm/soft for consumer expectations. Market research shows 68% of trial users won't repurchase.",
      severity: "moderate"
    },
    dimensions: {
      headline: "📐 PACKAGING FAILURE: Products Don't Fit",
      description: "Oversized pieces jam automated packaging. 3% of production damaged or scrapped daily.",
      severity: "moderate"
    },
    visual: {
      headline: "👁️ QUALITY COMPLAINTS: Visible Defects",
      description: "Products with discoloration and inclusions reaching consumers. Social media posts about 'disgusting' appearance going viral.",
      severity: "moderate"
    }
  },
  // When user said "Met" but there was insufficient data (assumed success without evidence)
  assumedSuccess: {
    temp: {
      headline: "❓ PROCESS VALIDATION VOID: No Temperature Records",
      description: "Auditor discovers no temperature data during trial. Entire batch quarantined pending investigation. 3-week production delay while process is revalidated.",
      severity: "critical"
    },
    moisture: {
      headline: "📋 AUDIT FAILURE: Missing Moisture Documentation",
      description: "Customer audit finds no moisture testing records. Contract terminated. $800K annual business lost.",
      severity: "major"
    },
    gel: {
      headline: "🎲 QUALITY RUSSIAN ROULETTE: Gel Strength Unknown",
      description: "Without gel strength data, 1 in 5 production batches ships with texture defects. Intermittent consumer complaints impossible to root-cause.",
      severity: "major"
    },
    micro: {
      headline: "🚨 REGULATORY ACTION: Inadequate Micro Testing",
      description: "FDA inspection reveals insufficient microbiological testing during validation. Warning Letter issued. Facility must implement enhanced testing program.",
      severity: "critical"
    },
    weight: {
      headline: "📊 COMPLIANCE GAP: No Weight Verification",
      description: "State Weights & Measures audit finds no weight documentation. $25K fine and mandatory monthly audits for 1 year.",
      severity: "moderate"
    },
    seal: {
      headline: "🔍 SHELF LIFE STUDY INVALID: No Seal Data",
      description: "Shelf life claims unsupported due to missing seal integrity data. All marketing claims must be revised. Legal review required.",
      severity: "moderate"
    },
    sensory: {
      headline: "🤷 LAUNCH GAMBLE: Sensory Profile Unknown",
      description: "Product launched without sensory baseline. Consumer feedback all over the map. No way to tell if complaints are valid or process-related.",
      severity: "moderate"
    },
    default: {
      headline: "⚠️ DATA GAP: Critical Information Missing",
      description: "This criteria was marked as 'Met' but no supporting data was collected. In production, this assumption could lead to undetected quality issues.",
      severity: "moderate"
    }
  },
  // When user said "Met" but sample size was too small for statistical validity
  statisticallyUnsound: {
    temp: {
      headline: "📊 VALIDATION REJECTED: Insufficient Temperature Data",
      description: "Customer audit found only limited temperature measurements. With fewer than 30 data points, the process capability cannot be statistically validated. Full revalidation required with proper sample size.",
      severity: "major"
    },
    moisture: {
      headline: "📊 PROCESS HOLD: Moisture Data Not Statistically Valid",
      description: "QA review identified that moisture testing sample size (n<30) is insufficient to establish process capability. Production held pending expanded sampling study.",
      severity: "major"
    },
    gel: {
      headline: "📊 SPECIFICATION CHALLENGE: Gel Strength Data Inconclusive",
      description: "With limited data points, natural variation cannot be distinguished from process problems. Customer rejected specification approval, requiring 6-week delay for proper sampling study.",
      severity: "major"
    },
    micro: {
      headline: "📊 REGULATORY CONCERN: Micro Testing Sample Size Inadequate",
      description: "FDA inspector noted microbiological sampling does not meet statistical requirements for validation. Additional 30-day sampling program mandated before release.",
      severity: "critical"
    },
    weight: {
      headline: "📊 COMPLIANCE RISK: Weight Variation Unknown",
      description: "Without adequate sample size (n≥30), process capability for fill weight cannot be demonstrated. State inspector may require extended monitoring program.",
      severity: "moderate"
    },
    sensory: {
      headline: "📊 CONSUMER INSIGHT GAP: Sensory Panel Too Small",
      description: "Marketing questioned product launch with sensory data from insufficient panelists. Brand team requires expanded consumer testing before go-to-market.",
      severity: "moderate"
    },
    default: {
      headline: "📊 STATISTICAL WARNING: Sample Size Below Minimum",
      description: "This criteria was evaluated with fewer than 30 data points. Per internal policy, a minimum of 30 samples are required for each measurement to establish statistical confidence. The conclusion may not be reliable.",
      severity: "moderate"
    }
  },
  // When user said "Not Met" but it was actually "Met" (false negative - overly cautious)
  falseNegative: {
    headline: "🐢 UNNECESSARY DELAY: Overcautious Assessment",
    description: "Product launch delayed by 4 weeks for additional testing that was already covered. Competitor launched first. Estimated lost market share: 15%.",
    severity: "minor"
  },
  // When user said "Insufficient Data" but actually there was enough
  missedData: {
    headline: "📉 MISSED OPPORTUNITY: Data Was Available",
    description: "The sampling plan actually captured the needed data, but it wasn't properly analyzed. Additional testing cost $12K and delayed launch by 1 week.",
    severity: "minor"
  }
};

const timePointLabels = {
  beginning: 'Beginning (0-30 min)',
  middle: 'Middle (60-90 min)',
  end: 'End (150-180 min)',
};

// Helper to get the disaster scenario for a given assessment error
const getDisasterForError = (userAnswer, correctAnswer, criteria) => {
  // User said "Met" but it was "Not Met" - false positive (most dangerous)
  if (userAnswer === 'yes' && correctAnswer.met === 'no') {
    // Find which test(s) failed
    const failedTests = correctAnswer.anomaliesFound?.map(a => a.test) || [];
    const primaryTest = failedTests[0];
    if (primaryTest && productionDisasters.falsePositive[primaryTest]) {
      return { ...productionDisasters.falsePositive[primaryTest], type: 'falsePositive' };
    }
    // Default disaster for false positive
    return {
      headline: "🚨 QUALITY ESCAPE: Defective Product Shipped",
      description: "Products that didn't meet specifications were approved and shipped. Customer complaints and potential recall situation.",
      severity: "major",
      type: 'falsePositive'
    };
  }

  // User said "Met" but there was insufficient data - assumed success
  if (userAnswer === 'yes' && correctAnswer.met === 'insufficient') {
    // Find which test(s) were required but not collected
    const missingTests = correctAnswer.requiredTests?.map(t => t.test) || [];
    const primaryMissing = missingTests[0];
    if (primaryMissing && productionDisasters.assumedSuccess[primaryMissing]) {
      return { ...productionDisasters.assumedSuccess[primaryMissing], type: 'assumedSuccess' };
    }
    return { ...productionDisasters.assumedSuccess.default, type: 'assumedSuccess' };
  }

  // User said "Met" but the sample size was too small for statistical validity
  if (userAnswer === 'yes' && correctAnswer.met === 'yes' && !correctAnswer.statisticallySound) {
    // Find which test(s) had insufficient samples
    const undersampledTests = correctAnswer.sampleDetails?.filter(s => s.count < MIN_SAMPLES_FOR_STATISTICAL_VALIDITY) || [];
    const primaryTest = undersampledTests[0]?.test;
    if (primaryTest && productionDisasters.statisticallyUnsound[primaryTest]) {
      return { ...productionDisasters.statisticallyUnsound[primaryTest], type: 'statisticallyUnsound', sampleDetails: undersampledTests };
    }
    return { ...productionDisasters.statisticallyUnsound.default, type: 'statisticallyUnsound', sampleDetails: undersampledTests };
  }

  // User said "Not Met" but it was actually "Met" - false negative
  if (userAnswer === 'no' && correctAnswer.met === 'yes') {
    return { ...productionDisasters.falseNegative, type: 'falseNegative' };
  }

  // User said "Insufficient Data" but there was enough data
  if (userAnswer === 'insufficient' && (correctAnswer.met === 'yes' || correctAnswer.met === 'no')) {
    return { ...productionDisasters.missedData, type: 'missedData' };
  }

  return null;
};

// Severity colors for disasters
const severityStyles = {
  critical: { bg: 'bg-red-900/40', border: 'border-red-500', text: 'text-red-300', badge: 'bg-red-600' },
  major: { bg: 'bg-orange-900/40', border: 'border-orange-500', text: 'text-orange-300', badge: 'bg-orange-600' },
  moderate: { bg: 'bg-amber-900/40', border: 'border-amber-500', text: 'text-amber-300', badge: 'bg-amber-600' },
  minor: { bg: 'bg-slate-800/40', border: 'border-slate-500', text: 'text-slate-300', badge: 'bg-slate-600' },
};

// Time point x-axis positions for scatter plot
const timePointXPositions = {
  beginning: 15, // 0-30 min, centered at 15
  middle: 75,    // 60-90 min, centered at 75
  end: 165,      // 150-180 min, centered at 165
};

// Generate fake data based on sampling plan
// New structure: samplingPlan[stepId][testId][timePointId] = quantity
// Now generates individual sample points for scatter plots
const generateFakeData = (samplingPlan, successCriteria, seed = 42) => {
  const data = {};
  const scatterData = {}; // New: individual points for scatter plots
  const anomalies = [];

  // Seeded random for consistency
  let randomState = seed;
  const seededRandom = () => {
    randomState = (randomState * 1103515245 + 12345) & 0x7fffffff;
    return randomState / 0x7fffffff;
  };

  // Determine which tests should have anomalies based on criteria
  // About 20% of tests will have issues, more likely if not properly covered
  const uncoveredCriteria = successCriteria.filter(c => {
    if (!c?.requiredMeasurements) return false;
    return !c.requiredMeasurements.some(m => {
      const stepPlan = samplingPlan[m.step];
      if (!stepPlan) return false;
      const testPlan = stepPlan[m.test];
      if (!testPlan) return false;
      // Check if any timepoint has samples > 0
      return Object.values(testPlan).some(qty => qty > 0);
    });
  });

  Object.entries(samplingPlan).forEach(([stepId, stepPlan]) => {
    if (!stepPlan || typeof stepPlan !== 'object') return;

    data[stepId] = {};
    scatterData[stepId] = {};

    Object.entries(stepPlan).forEach(([testId, testPlan]) => {
      if (!testPlan || typeof testPlan !== 'object') return;

      const spec = testSpecs[testId];
      if (!spec) return;

      data[stepId][testId] = {};
      scatterData[stepId][testId] = [];

      Object.entries(testPlan).forEach(([tp, quantity]) => {
        if (quantity <= 0) return;

        const baseX = timePointXPositions[tp] || 90;
        const samples = [];
        let hasAnomalyInGroup = false;
        let anomalyValue = null;

        // Generate individual sample points
        for (let i = 0; i < quantity; i++) {
          // Determine if this sample is an anomaly (15% chance per sample, but cap per group)
          const isAnomaly = !hasAnomalyInGroup && seededRandom() < 0.15;
          let value;

          if (isAnomaly) {
            hasAnomalyInGroup = true;
            // Generate out-of-spec value
            const direction = seededRandom() > 0.5 ? 1 : -1;
            value = spec.nominal + direction * (spec.variance + seededRandom() * spec.failRange * 0.5);
            anomalyValue = value;
          } else {
            // Normal value within spec with some natural variation
            value = spec.nominal + (seededRandom() - 0.5) * spec.variance * 2;
          }

          // Add slight x-jitter for visibility (spread samples within timepoint)
          const xJitter = (seededRandom() - 0.5) * 20; // +/- 10 min jitter

          samples.push({
            x: baseX + xJitter,
            y: parseFloat(value.toFixed(2)),
            timePoint: tp,
            inSpec: !isAnomaly,
            sampleIndex: i + 1,
          });
        }

        // Add to scatter data
        scatterData[stepId][testId].push(...samples);

        // Calculate average for summary table
        const avgValue = samples.reduce((sum, s) => sum + s.y, 0) / samples.length;
        const anyOutOfSpec = samples.some(s => !s.inSpec);

        if (anyOutOfSpec && anomalyValue !== null) {
          anomalies.push({
            step: stepId,
            test: testId,
            timePoint: tp,
            value: anomalyValue.toFixed(1),
            expected: `${(spec.nominal - spec.variance).toFixed(1)} - ${(spec.nominal + spec.variance).toFixed(1)}`,
            unit: spec.unit,
            severity: Math.abs(anomalyValue - spec.nominal) > spec.failRange ? 'critical' : 'warning',
            sampleCount: quantity
          });
        }

        data[stepId][testId][tp] = {
          value: parseFloat(avgValue.toFixed(1)),
          unit: spec.unit,
          inSpec: !anyOutOfSpec,
          expected: `${(spec.nominal - spec.variance).toFixed(1)} - ${(spec.nominal + spec.variance).toFixed(1)}`,
          sampleCount: quantity,
          samples: samples // Store individual samples
        };
      });
    });
  });

  return { data, scatterData, anomalies, uncoveredCriteria };
};

// Custom tooltip for scatter plot
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const point = payload[0].payload;
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm">
        <p className="text-slate-300">
          Time: <span className="text-cyan-400">{Math.round(point.x)} min</span>
        </p>
        <p className="text-slate-300">
          Value: <span className={point.inSpec ? 'text-green-400' : 'text-red-400'}>{point.y}</span>
        </p>
        <p className="text-slate-400 text-xs">
          Sample #{point.sampleIndex} ({point.timePoint})
        </p>
      </div>
    );
  }
  return null;
};

// Scatter plot component for a single test
const TestScatterPlot = ({ testId, scatterPoints, spec }) => {
  if (!scatterPoints || scatterPoints.length === 0) return null;

  const specMin = spec.nominal - spec.variance;
  const specMax = spec.nominal + spec.variance;

  // Calculate y-axis domain with padding
  const allValues = scatterPoints.map(p => p.y);
  const minVal = Math.min(...allValues, specMin);
  const maxVal = Math.max(...allValues, specMax);
  const padding = (maxVal - minVal) * 0.2;
  const yMin = minVal - padding;
  const yMax = maxVal + padding;

  // Split points into in-spec and out-of-spec for different colors
  const inSpecPoints = scatterPoints.filter(p => p.inSpec);
  const outOfSpecPoints = scatterPoints.filter(p => !p.inSpec);

  return (
    <div className="h-72">
      {/* Spec limits legend - shown above chart */}
      <div className="flex items-center justify-center gap-4 mb-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-0.5 bg-amber-500" style={{ borderStyle: 'dashed' }} />
          <span className="text-amber-400">Spec: {specMin} - {specMax} {spec.unit}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-0.5 bg-cyan-500 opacity-50" />
          <span className="text-cyan-400">Target: {spec.nominal}</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="90%">
        <ScatterChart margin={{ top: 10, right: 30, bottom: 30, left: 50 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            type="number"
            dataKey="x"
            domain={[0, 180]}
            tickFormatter={(val) => `${val}`}
            stroke="#9ca3af"
            fontSize={11}
            ticks={[0, 30, 60, 90, 120, 150, 180]}
          >
            <text x="50%" y={28} textAnchor="middle" fill="#9ca3af" fontSize={10}>
              Time (min)
            </text>
          </XAxis>
          <YAxis
            type="number"
            dataKey="y"
            domain={[yMin, yMax]}
            stroke="#9ca3af"
            fontSize={11}
            width={45}
            tickFormatter={(val) => val.toFixed(1)}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Spec limit lines - no labels (shown in legend above) */}
          <ReferenceLine
            y={specMax}
            stroke="#f59e0b"
            strokeDasharray="5 5"
            strokeWidth={2}
          />
          <ReferenceLine
            y={specMin}
            stroke="#f59e0b"
            strokeDasharray="5 5"
            strokeWidth={2}
          />
          <ReferenceLine
            y={spec.nominal}
            stroke="#06b6d4"
            strokeDasharray="2 2"
            strokeOpacity={0.5}
          />

          {/* Time point dividers */}
          <ReferenceLine x={30} stroke="#475569" strokeDasharray="2 2" />
          <ReferenceLine x={60} stroke="#475569" strokeDasharray="2 2" />
          <ReferenceLine x={90} stroke="#475569" strokeDasharray="2 2" />
          <ReferenceLine x={120} stroke="#475569" strokeDasharray="2 2" />
          <ReferenceLine x={150} stroke="#475569" strokeDasharray="2 2" />

          {/* In-spec points (green) */}
          {inSpecPoints.length > 0 && (
            <Scatter
              name="In Spec"
              data={inSpecPoints}
              fill="#22c55e"
              shape="circle"
            />
          )}

          {/* Out-of-spec points (red) */}
          {outOfSpecPoints.length > 0 && (
            <Scatter
              name="Out of Spec"
              data={outOfSpecPoints}
              fill="#ef4444"
              shape="diamond"
            />
          )}

          <Legend
            verticalAlign="bottom"
            height={24}
            wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
            formatter={(value) => <span style={{ color: '#9ca3af', marginRight: '12px' }}>{value}</span>}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

const Level4 = () => {
  const { gameState, updateLevelState, completeLevel, navigateToLevel } = useGame();
  const [criteriaAssessments, setCriteriaAssessments] = useState({});
  const [showData, setShowData] = useState(true);
  const [showPreviousWork, setShowPreviousWork] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Get data from previous levels
  const selectedCriteria = gameState?.level1?.selectedCriteria || [];
  const samplingPlan = gameState?.level3?.samplingPlan || {};

  // Generate fake data based on sampling plan
  const { data: generatedData, scatterData, anomalies, uncoveredCriteria } = useMemo(() => {
    return generateFakeData(samplingPlan, selectedCriteria, gameState?.gameCode?.charCodeAt(0) || 42);
  }, [samplingPlan, selectedCriteria, gameState?.gameCode]);

  // Determine the "correct" answers based on data with detailed explanations
  const correctAnswers = useMemo(() => {
    const answers = {};

    selectedCriteria.forEach(criteria => {
      if (!criteria?.id || !criteria?.requiredMeasurements) {
        answers[criteria?.id] = {
          met: 'insufficient',
          reason: 'No measurement data available',
          details: 'This criteria has no defined required measurements, so no data could be collected to evaluate it.',
          requiredTests: [],
          collectedTests: [],
          anomaliesFound: [],
          statisticallySound: false,
          totalSamples: 0,
          sampleDetails: []
        };
        return;
      }

      // Get the required tests for this criteria
      const requiredTests = criteria.requiredMeasurements.map(m => ({
        step: m.step,
        test: m.test,
        description: m.description
      }));

      // Check which tests were actually collected and count samples per test
      const sampleDetails = [];
      let totalSamples = 0;

      criteria.requiredMeasurements.forEach(m => {
        const stepData = generatedData[m.step];
        if (!stepData) return;

        const testData = stepData[m.test];
        if (!testData) return;

        // Count samples across all time points for this test
        let testSampleCount = 0;
        Object.values(testData).forEach(tpData => {
          if (tpData?.sampleCount) {
            testSampleCount += tpData.sampleCount;
          }
        });

        if (testSampleCount > 0) {
          sampleDetails.push({
            step: m.step,
            test: m.test,
            description: m.description,
            count: testSampleCount,
            meetsMinimum: testSampleCount >= MIN_SAMPLES_FOR_STATISTICAL_VALIDITY
          });
          totalSamples += testSampleCount;
        }
      });

      const collectedTests = sampleDetails.map(s => ({
        step: s.step,
        test: s.test,
        description: s.description
      }));

      // Check if we have data for this criteria
      const hasData = collectedTests.length > 0;

      if (!hasData) {
        answers[criteria.id] = {
          met: 'insufficient',
          reason: 'Sampling plan did not cover required measurements',
          details: `To evaluate this criteria, you needed data from: ${requiredTests.map(t => t.description).join(', ')}. Your sampling plan did not include any of these measurements.`,
          requiredTests,
          collectedTests: [],
          anomaliesFound: [],
          statisticallySound: false,
          totalSamples: 0,
          sampleDetails: []
        };
        return;
      }

      // Check statistical validity - ALL tests need at least 30 samples
      const allTestsMeetMinimum = sampleDetails.every(s => s.meetsMinimum);
      const statisticallySound = allTestsMeetMinimum && sampleDetails.length > 0;

      // Check if any relevant anomalies exist
      const relevantAnomalies = anomalies.filter(a => {
        return criteria.requiredMeasurements.some(m => m.step === a.step && m.test === a.test);
      });

      // Separate critical from minor anomalies
      const criticalAnomalies = relevantAnomalies.filter(a => a.severity === 'critical');
      const minorAnomalies = relevantAnomalies.filter(a => a.severity === 'warning');

      // Only CRITICAL anomalies cause failure - minor deviations are acceptable with a note
      if (criticalAnomalies.length > 0) {
        const anomalyDetails = criticalAnomalies.map(a =>
          `${a.step} ${a.test}: ${a.value}${a.unit} (expected ${a.expected})`
        );

        answers[criteria.id] = {
          met: 'no',
          reason: `Critical out-of-spec values detected (${criticalAnomalies.length} critical anomalies)`,
          details: `The data shows critical failures that indicate this criteria was NOT met. Critical anomalies found: ${anomalyDetails.join('; ')}`,
          requiredTests,
          collectedTests,
          anomaliesFound: criticalAnomalies,
          minorAnomalies,
          statisticallySound,
          totalSamples,
          sampleDetails
        };
      } else {
        // No critical anomalies - criteria can be marked as MET
        // Build notes for any minor deviations and statistical warnings
        let notes = [];

        if (minorAnomalies.length > 0) {
          const minorDetails = minorAnomalies.map(a =>
            `${a.step} ${a.test}: ${a.value}${a.unit} (expected ${a.expected})`
          );
          notes.push(`Minor deviations noted (within acceptable range): ${minorDetails.join('; ')}`);
        }

        if (!statisticallySound) {
          const undersampledTests = sampleDetails.filter(s => !s.meetsMinimum);
          const undersampledDescriptions = undersampledTests.map(s =>
            `${s.description} (n=${s.count}, need ${MIN_SAMPLES_FOR_STATISTICAL_VALIDITY})`
          );
          notes.push(`Sample sizes below minimum for statistical validity: ${undersampledDescriptions.join('; ')}`);
        }

        const hasNotes = notes.length > 0;
        const notesText = hasNotes ? ` Notes: ${notes.join('. ')}` : '';

        answers[criteria.id] = {
          met: 'yes',
          reason: hasNotes
            ? (minorAnomalies.length > 0
                ? 'Met with minor deviations noted'
                : 'Met but sample size below minimum (n<30)')
            : 'All measurements within specification',
          details: `All collected data for this criteria (${collectedTests.map(t => t.description).join(', ')}) was within acceptable ranges. The criteria was MET.${notesText}`,
          requiredTests,
          collectedTests,
          anomaliesFound: [],
          minorAnomalies,
          statisticallySound,
          totalSamples,
          sampleDetails,
          hasMinorDeviations: minorAnomalies.length > 0
        };
      }
    });

    return answers;
  }, [selectedCriteria, generatedData, anomalies]);

  const handleAssessmentChange = (criteriaId, value) => {
    setCriteriaAssessments(prev => ({
      ...prev,
      [criteriaId]: value
    }));
  };

  const allCriteriaAssessed = selectedCriteria.every(c => criteriaAssessments[c?.id]);

  const calculateScore = () => {
    let score = 0;
    let correctCount = 0;

    selectedCriteria.forEach(criteria => {
      if (!criteria?.id) return;
      const userAnswer = criteriaAssessments[criteria.id];
      const correct = correctAnswers[criteria.id];

      // Points for attempting
      score += 50;

      // Check if answer matches
      if (userAnswer === correct.met) {
        score += 150; // Correct assessment
        correctCount++;
      } else if (userAnswer === 'insufficient' && correct.met === 'insufficient') {
        score += 150; // Correctly identified insufficient data
        correctCount++;
      } else if (
        (userAnswer === 'yes' && correct.met === 'yes') ||
        (userAnswer === 'no' && correct.met === 'no')
      ) {
        score += 150;
        correctCount++;
      }
    });

    // Bonus for good sampling plan coverage
    const coverageBonus = Math.floor((selectedCriteria.length - uncoveredCriteria.length) / selectedCriteria.length * 200);
    score += coverageBonus;

    return { score: Math.min(score, 1000), correctCount };
  };

  const handleSubmit = () => {
    const { score, correctCount } = calculateScore();

    updateLevelState('level4', {
      criteriaAssessments,
      correctAnswers,
      score,
      correctCount,
      completedAt: Date.now(),
    });
    setIsSubmitted(true);
    // Don't auto-redirect - let user review results and decide
  };

  const handleReturnToSampling = () => {
    // Reset submission state and navigate back to Level 3 (sampling plan)
    setIsSubmitted(false);
    setCriteriaAssessments({});
    navigateToLevel(3);
  };

  const handleCompleteGame = () => {
    completeLevel(4);
  };

  if (isSubmitted) {
    const { score, correctCount } = calculateScore();

    // Collect all disasters for incorrect answers AND statistically unsound conclusions
    const disasters = [];
    selectedCriteria.forEach(criteria => {
      if (!criteria?.id) return;
      const userAnswer = criteriaAssessments[criteria.id];
      const correct = correctAnswers[criteria.id];
      const isCorrect = userAnswer === correct.met;

      if (!isCorrect) {
        const disaster = getDisasterForError(userAnswer, correct, criteria);
        if (disaster) {
          disasters.push({ criteria, disaster, userAnswer, correct });
        }
      } else if (userAnswer === 'yes' && correct.met === 'yes' && !correct.statisticallySound) {
        // User correctly said "Met" but without statistically valid data
        const disaster = getDisasterForError(userAnswer, correct, criteria);
        if (disaster) {
          disasters.push({ criteria, disaster, userAnswer, correct, isStatisticalWarning: true });
        }
      }
    });

    // Count disasters by severity
    const criticalCount = disasters.filter(d => d.disaster.severity === 'critical').length;
    const majorCount = disasters.filter(d => d.disaster.severity === 'major').length;
    const statisticalWarningCount = disasters.filter(d => d.isStatisticalWarning).length;
    const actualErrorCount = disasters.length - statisticalWarningCount;
    const hasSerious = criticalCount > 0 || majorCount > 0;
    const onlyStatisticalWarnings = statisticalWarningCount > 0 && actualErrorCount === 0;

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header - changes based on performance */}
          <div className="text-center mb-8">
            {disasters.length === 0 ? (
              <>
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-4xl font-bold text-green-400 mb-2">Perfect Assessment!</h2>
                <p className="text-slate-400">Star Bites production can proceed safely</p>
              </>
            ) : onlyStatisticalWarnings ? (
              <>
                <div className="text-6xl mb-4">📊</div>
                <h2 className="text-4xl font-bold text-purple-400 mb-2">Assessments Correct, But...</h2>
                <p className="text-purple-300">Your assessments were right, but sample sizes are too small for statistical confidence</p>
              </>
            ) : criticalCount > 0 ? (
              <>
                <div className="text-6xl mb-4">💥</div>
                <h2 className="text-4xl font-bold text-red-400 mb-2">Production Crisis!</h2>
                <p className="text-red-300">Your assessment errors would cause serious problems in production</p>
              </>
            ) : majorCount > 0 ? (
              <>
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-4xl font-bold text-orange-400 mb-2">Quality Issues Detected</h2>
                <p className="text-orange-300">Your assessment would lead to significant production problems</p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">📋</div>
                <h2 className="text-4xl font-bold text-amber-400 mb-2">Assessment Complete</h2>
                <p className="text-slate-400">Some minor issues would impact production efficiency</p>
              </>
            )}
          </div>

          {/* Score Summary */}
          <div className={`rounded-xl p-6 border mb-6 text-center ${
            disasters.length === 0
              ? 'bg-green-900/20 border-green-600'
              : onlyStatisticalWarnings
                ? 'bg-purple-900/20 border-purple-600'
                : hasSerious
                  ? 'bg-red-900/20 border-red-600'
                  : 'bg-slate-800/50 border-slate-700'
          }`}>
            <div className="flex items-center justify-center gap-8 flex-wrap">
              <div>
                <div className="text-sm text-slate-400">Correct Assessments</div>
                <div className={`text-3xl font-bold ${
                  correctCount === selectedCriteria.length ? 'text-green-400' : 'text-cyan-400'
                }`}>{correctCount} / {selectedCriteria.length}</div>
              </div>
              <div className="w-px h-12 bg-slate-700 hidden sm:block" />
              <div>
                <div className="text-sm text-slate-400">Level Score</div>
                <div className="text-3xl font-bold text-cyan-400">{score} PTS</div>
              </div>
              {actualErrorCount > 0 && (
                <>
                  <div className="w-px h-12 bg-slate-700 hidden sm:block" />
                  <div>
                    <div className="text-sm text-slate-400">Production Issues</div>
                    <div className="text-3xl font-bold text-red-400">{actualErrorCount}</div>
                  </div>
                </>
              )}
              {statisticalWarningCount > 0 && (
                <>
                  <div className="w-px h-12 bg-slate-700 hidden sm:block" />
                  <div>
                    <div className="text-sm text-slate-400">Statistical Warnings</div>
                    <div className="text-3xl font-bold text-purple-400">{statisticalWarningCount}</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Production Disasters Section */}
          {disasters.length > 0 && (
            <div className="bg-red-950/30 rounded-xl p-6 border border-red-800 mb-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-red-300">
                <AlertTriangle className="w-6 h-6" />
                What Would Happen in Production
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Based on your assessments, here's what would likely happen when Star Bites goes into full production.
                {disasters.some(d => d.isStatisticalWarning) && (
                  <span className="text-purple-400"> Note: Some criteria were assessed correctly but lack statistical confidence (n&lt;{MIN_SAMPLES_FOR_STATISTICAL_VALIDITY} samples per measurement).</span>
                )}
              </p>
              <div className="space-y-4">
                {disasters.map(({ criteria, disaster, userAnswer, correct, isStatisticalWarning }, index) => {
                  const styles = severityStyles[disaster.severity] || severityStyles.moderate;
                  return (
                    <div
                      key={criteria.id}
                      className={`${styles.bg} border ${styles.border} rounded-lg p-4`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className={`font-bold ${styles.text}`}>{disaster.headline}</h4>
                        <div className="flex gap-2 flex-shrink-0">
                          {isStatisticalWarning && (
                            <span className="text-xs px-2 py-1 rounded bg-purple-600 text-white uppercase">
                              n&lt;30
                            </span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded ${styles.badge} text-white uppercase`}>
                            {disaster.severity}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-300 mb-3">{disaster.description}</p>

                      {/* Show sample size details for statistical warnings */}
                      {isStatisticalWarning && correct.sampleDetails?.length > 0 && (
                        <div className="bg-purple-900/30 border border-purple-700/50 rounded p-2 mb-3">
                          <p className="text-xs text-purple-300 font-medium mb-1">
                            📊 Sample Size Details (Minimum required: {MIN_SAMPLES_FOR_STATISTICAL_VALIDITY})
                          </p>
                          <div className="text-xs space-y-0.5">
                            {correct.sampleDetails.map((s, i) => (
                              <p key={i} className={s.meetsMinimum ? 'text-green-400' : 'text-red-400'}>
                                • {s.description}: n={s.count} {s.meetsMinimum ? '✓' : `⚠️ (need ${MIN_SAMPLES_FOR_STATISTICAL_VALIDITY - s.count} more)`}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="bg-slate-900/50 rounded p-2 text-xs">
                        <p className="text-slate-400 mb-1">
                          <strong>Criteria:</strong> {criteria.text}
                        </p>
                        <p className="text-slate-500">
                          You said: <span className={userAnswer === 'yes' ? 'text-green-400' : userAnswer === 'no' ? 'text-red-400' : 'text-amber-400'}>
                            {userAnswer === 'yes' ? 'Met' : userAnswer === 'no' ? 'Not Met' : 'Insufficient Data'}
                          </span>
                          {isStatisticalWarning ? (
                            <span className="text-purple-400"> → Answer correct but data not statistically valid</span>
                          ) : (
                            <>
                              {' → '}
                              Correct: <span className="text-cyan-400">
                                {correct.met === 'yes' ? 'Met' : correct.met === 'no' ? 'Not Met' : 'Insufficient Data'}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Detailed Results */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              Detailed Assessment Results
            </h3>
            <div className="space-y-4">
              {selectedCriteria.map((criteria, index) => {
                if (!criteria?.id) return null;
                const userAnswer = criteriaAssessments[criteria.id];
                const correct = correctAnswers[criteria.id];
                const isCorrect = userAnswer === correct.met;

                return (
                  <div
                    key={criteria.id}
                    className={`p-4 rounded-lg border ${
                      isCorrect
                        ? 'bg-green-900/20 border-green-600'
                        : 'bg-red-900/20 border-red-600'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {isCorrect ? (
                          <CheckCircle2 className="w-6 h-6 text-green-400" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <p className="text-sm text-slate-200 font-medium">
                            <span className="text-cyan-400 font-mono mr-2">{index + 1}.</span>
                            {criteria.text}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded flex-shrink-0 ${
                            isCorrect ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                          }`}>
                            {isCorrect ? 'CORRECT' : 'INCORRECT'}
                          </span>
                        </div>

                        {/* Answer comparison */}
                        <div className="grid md:grid-cols-2 gap-2 mb-3 text-sm">
                          <div className={`p-2 rounded ${isCorrect ? 'bg-green-900/30' : 'bg-slate-900/50'}`}>
                            <span className="text-slate-400">Your answer: </span>
                            <span className={isCorrect ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                              {userAnswer === 'yes' ? '✓ Met' : userAnswer === 'no' ? '✗ Not Met' : '? Insufficient Data'}
                            </span>
                          </div>
                          {!isCorrect && (
                            <div className="p-2 rounded bg-cyan-900/30">
                              <span className="text-slate-400">Correct answer: </span>
                              <span className="text-cyan-400 font-medium">
                                {correct.met === 'yes' ? '✓ Met' : correct.met === 'no' ? '✗ Not Met' : '? Insufficient Data'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Detailed explanation */}
                        <div className="bg-slate-900/50 rounded-lg p-3">
                          <p className="text-xs text-slate-400 mb-1 font-medium">Why this is the correct answer:</p>
                          <p className="text-sm text-slate-300">{correct.details}</p>

                          {/* Show what data was needed vs collected */}
                          {correct.requiredTests?.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-700">
                              <p className="text-xs text-slate-500">
                                Required tests: {correct.requiredTests.map(t => t.description).join(', ')}
                              </p>
                              {correct.collectedTests?.length > 0 ? (
                                <p className="text-xs text-green-500">
                                  Collected: {correct.collectedTests.map(t => t.description).join(', ')}
                                </p>
                              ) : (
                                <p className="text-xs text-amber-500">
                                  No data was collected for this criteria
                                </p>
                              )}

                              {/* Sample size details */}
                              {correct.sampleDetails?.length > 0 && (
                                <div className="mt-2">
                                  <p className={`text-xs font-medium ${correct.statisticallySound ? 'text-green-500' : 'text-purple-400'}`}>
                                    {correct.statisticallySound
                                      ? `✓ Statistically valid (total n=${correct.totalSamples})`
                                      : `⚠️ Sample size below minimum (total n=${correct.totalSamples}, need n≥${MIN_SAMPLES_FOR_STATISTICAL_VALIDITY} per test)`
                                    }
                                  </p>
                                  {!correct.statisticallySound && (
                                    <div className="mt-1 space-y-0.5">
                                      {correct.sampleDetails.map((s, i) => (
                                        <p key={i} className={`text-xs ${s.meetsMinimum ? 'text-slate-500' : 'text-red-400'}`}>
                                          • {s.description}: n={s.count} {s.meetsMinimum ? '' : `(need ${MIN_SAMPLES_FOR_STATISTICAL_VALIDITY - s.count} more)`}
                                        </p>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Minor deviations note */}
                              {correct.minorAnomalies?.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium text-amber-400">
                                    ⚠️ Minor deviations noted ({correct.minorAnomalies.length}):
                                  </p>
                                  <div className="mt-1 space-y-0.5">
                                    {correct.minorAnomalies.map((a, i) => (
                                      <p key={i} className="text-xs text-amber-300">
                                        • {a.step} {a.test}: {a.value}{a.unit} (expected {a.expected})
                                      </p>
                                    ))}
                                  </div>
                                  <p className="text-xs text-slate-500 mt-1 italic">
                                    These minor variations are within acceptable tolerances and don't affect the "Met" determination.
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleReturnToSampling}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Revise Sampling Plan & Try Again
            </button>
            <button
              onClick={handleCompleteGame}
              className={`flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-lg transition-colors ${
                hasSerious
                  ? 'bg-orange-600 hover:bg-orange-500'
                  : 'bg-green-600 hover:bg-green-500'
              }`}
            >
              <Award className="w-5 h-5" />
              {hasSerious ? 'Accept Results & Complete' : 'Complete Mission'}
            </button>
          </div>

          <p className="text-center text-slate-500 text-sm mt-4">
            {hasSerious
              ? 'Consider revising your sampling plan to avoid these production issues, or accept the results and complete the mission.'
              : 'Click "Revise Sampling Plan" to improve your score, or "Complete Mission" to finish.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">Level 4: Mission Report</h1>
          <p className="text-slate-400">Analyze your trial data and determine if success criteria were met</p>
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-xl p-4 border border-amber-700/50 mb-6">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-200">
                <strong>Your task:</strong> Review the production data generated from your sampling plan.
                For each success criteria, determine if the data supports that the criteria was met,
                not met, or if there's insufficient data to determine.
              </p>
            </div>
          </div>
        </div>

        {/* View Previous Work Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowPreviousWork(!showPreviousWork)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 rounded-lg px-4 py-2 border border-slate-700 transition-colors"
          >
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>{showPreviousWork ? 'Hide' : 'View'} Previous Level Work</span>
            {showPreviousWork ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Previous Work Panel */}
        {showPreviousWork && (
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-6">
            <h3 className="text-lg font-semibold mb-4">Your Previous Work</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Level 1 - Success Criteria */}
              <div className="bg-slate-900/50 rounded-lg p-4">
                <h4 className="font-medium text-cyan-400 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Level 1: Success Criteria
                </h4>
                <ul className="text-sm text-slate-400 space-y-1">
                  {selectedCriteria.map((c, i) => (
                    <li key={c?.id || i} className="flex items-start gap-2">
                      <span className="text-cyan-500 font-mono">{i + 1}.</span>
                      <span className="text-slate-300">{c?.text || 'Unknown'}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Level 3 - Sampling Plan */}
              <div className="bg-slate-900/50 rounded-lg p-4">
                <h4 className="font-medium text-cyan-400 mb-2 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4" />
                  Level 3: Sampling Plan
                </h4>
                <div className="text-sm text-slate-400 space-y-1">
                  <p>Samples Used: {gameState?.level3?.samplesUsed || 0} / 300</p>
                  <p>Criteria Coverage: {gameState?.level3?.criteriaCoverage?.covered || 0} / {selectedCriteria.length}</p>
                  {uncoveredCriteria.length > 0 && (
                    <p className="text-amber-400">
                      ⚠ {uncoveredCriteria.length} criteria not covered by sampling plan
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generated Data Display */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-cyan-400" />
              <div>
                <h2 className="text-xl font-semibold">Trial Production Data</h2>
                <p className="text-sm text-slate-400">Generated from your sampling plan</p>
              </div>
            </div>
            <button
              onClick={() => setShowData(!showData)}
              className="text-sm text-slate-400 hover:text-white flex items-center gap-1"
            >
              {showData ? 'Hide' : 'Show'} Data
              {showData ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showData && (
            <div className="space-y-6">
              {Object.entries(generatedData).map(([stepId, stepData]) => (
                <div key={stepId} className="bg-slate-900/50 rounded-lg p-4">
                  <h3 className="font-medium text-cyan-300 mb-3 capitalize">{stepId.replace(/([A-Z])/g, ' $1')}</h3>

                  {/* Summary Table */}
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-slate-400">
                          <th className="text-left pb-2">Test</th>
                          {Object.keys(Object.values(stepData)[0] || {}).map(tp => (
                            <th key={tp} className="text-center pb-2">{timePointLabels[tp] || tp}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(stepData).map(([testId, testData]) => (
                          <tr key={testId} className="border-t border-slate-700">
                            <td className="py-2 font-medium text-slate-300 capitalize">
                              {testId.replace(/([A-Z])/g, ' $1')}
                            </td>
                            {Object.entries(testData).map(([tp, result]) => (
                              <td key={tp} className="py-2 text-center">
                                <span className={`px-2 py-1 rounded ${
                                  result.inSpec
                                    ? 'bg-green-900/30 text-green-300'
                                    : 'bg-red-900/30 text-red-300'
                                }`}>
                                  {result.value} {result.unit}
                                </span>
                                <div className="text-xs text-slate-500 mt-1">
                                  n={result.sampleCount}
                                  {!result.inSpec && ` • Expected: ${result.expected}`}
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Scatter Plots for each test */}
                  <div className="space-y-4 mt-4 pt-4 border-t border-slate-700">
                    <h4 className="text-sm font-medium text-slate-400">Sample Data Plots</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {Object.entries(stepData).map(([testId, testData]) => {
                        const scatterPoints = scatterData[stepId]?.[testId] || [];
                        const spec = testSpecs[testId];
                        if (!spec || scatterPoints.length === 0) return null;

                        return (
                          <div key={testId} className="bg-slate-800/50 rounded-lg p-3">
                            <h5 className="text-sm font-medium text-slate-300 mb-2 capitalize flex items-center gap-2">
                              {testId.replace(/([A-Z])/g, ' $1')}
                              <span className="text-xs text-slate-500">
                                ({scatterPoints.length} samples)
                              </span>
                            </h5>
                            <TestScatterPlot
                              testId={testId}
                              scatterPoints={scatterPoints}
                              spec={spec}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {Object.keys(generatedData).length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No sampling data available</p>
                  <p className="text-sm">Your sampling plan didn't collect any data</p>
                </div>
              )}

              {/* Anomaly Summary */}
              {anomalies.length > 0 && (
                <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                  <h4 className="font-medium text-red-300 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Detected Anomalies ({anomalies.length})
                  </h4>
                  <ul className="text-sm space-y-1">
                    {anomalies.map((a, i) => (
                      <li key={i} className={`flex items-center gap-2 ${a.severity === 'critical' ? 'text-red-300' : 'text-amber-300'}`}>
                        {a.severity === 'critical' ? '🔴' : '🟡'}
                        <span className="capitalize">{a.step}</span> - {a.test}: {a.value} {a.unit}
                        <span className="text-slate-500">(expected {a.expected}, n={a.sampleCount})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Success Criteria Assessment */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-6 h-6 text-cyan-400" />
            <div>
              <h2 className="text-xl font-semibold">Success Criteria Assessment</h2>
              <p className="text-sm text-slate-400">Based on the data, determine if each criteria was met</p>
            </div>
          </div>

          <div className="space-y-4">
            {selectedCriteria.map((criteria, index) => {
              if (!criteria?.id) return null;
              const assessment = criteriaAssessments[criteria.id];
              const isUncovered = uncoveredCriteria.some(c => c?.id === criteria.id);
              const correctData = correctAnswers[criteria.id];
              const hasInsufficientSamples = correctData && !correctData.statisticallySound && correctData.sampleDetails?.length > 0;

              return (
                <div
                  key={criteria.id}
                  className={`p-4 rounded-lg border ${
                    assessment
                      ? 'border-cyan-600 bg-cyan-900/20'
                      : 'border-slate-600 bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-cyan-400 font-mono">{index + 1}.</span>
                    <div className="flex-1">
                      <p className="text-sm text-slate-300">{criteria.text}</p>
                      {isUncovered && (
                        <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Your sampling plan did not cover the required measurements for this criteria
                        </p>
                      )}
                      {!isUncovered && hasInsufficientSamples && (
                        <div className="mt-1">
                          <p className="text-xs text-purple-400 flex items-center gap-1">
                            📊 Sample size below minimum (n&lt;{MIN_SAMPLES_FOR_STATISTICAL_VALIDITY} per test)
                          </p>
                          <div className="text-xs text-slate-500 ml-4">
                            {correctData.sampleDetails.map((s, i) => (
                              <span key={i} className={s.meetsMinimum ? '' : 'text-purple-400'}>
                                {s.description}: n={s.count}
                                {i < correctData.sampleDetails.length - 1 ? ' • ' : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {!isUncovered && correctData?.statisticallySound && correctData?.sampleDetails?.length > 0 && (
                        <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                          ✓ Statistically valid (total n={correctData.totalSamples})
                        </p>
                      )}
                      {!isUncovered && correctData?.minorAnomalies?.length > 0 && (
                        <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                          ⚠️ Minor deviations noted ({correctData.minorAnomalies.length}) - within acceptable tolerances
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 ml-6">
                    {['yes', 'no', 'insufficient'].map(option => (
                      <button
                        key={option}
                        onClick={() => handleAssessmentChange(criteria.id, option)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          assessment === option
                            ? option === 'yes'
                              ? 'bg-green-600 text-white'
                              : option === 'no'
                                ? 'bg-red-600 text-white'
                                : 'bg-amber-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {option === 'yes' && '✓ Met'}
                        {option === 'no' && '✗ Not Met'}
                        {option === 'insufficient' && '? Insufficient Data'}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={!allCriteriaAssessed}
            className="flex items-center gap-2 mx-auto bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
          >
            <Send className="w-5 h-5" />
            Submit Final Assessment
          </button>
          {!allCriteriaAssessed && (
            <p className="text-slate-500 text-sm mt-2">
              Assess all {selectedCriteria.length} success criteria to submit
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Level4;
