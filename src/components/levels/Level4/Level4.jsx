import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { FileText, Send, Eye, CheckCircle2, XCircle, AlertTriangle, Target, BarChart3, FlaskConical, ChevronDown, ChevronUp, HelpCircle, RotateCcw, Award, ArrowLeft, Users, X, Check, Trophy, MessageCircle } from 'lucide-react';
import { useGame } from '../../../contexts/GameContext';
import { successCriteriaOptions, operatorQuestions, operatorQuoteBank } from '../../../data/missionData';
import { getPlayerCharacter } from '../../../data/characters';
import { processSteps, testOptions, alternateValidationPaths } from '../../../data/processDefinitions';
import ProcessFlowDataViewer from './ProcessFlowDataViewer';
import LevelComplete from '../../common/LevelComplete';

// Minimum sample count for statistical validity (internal policy)
// Applies to ALL steps - a minimum of 30 samples is required for statistical confidence
const MIN_SAMPLES_FOR_STATISTICAL_VALIDITY = 30;

// Functional role descriptions for missing crew consequences
const FUNCTIONAL_ROLE_INFO = {
  productDev: {
    name: 'Product Development',
    focus: 'flavor, texture, moisture, and sensory quality',
    consequence: 'Product formulation was not validated. Flavor and texture defects went undetected, resulting in a product that fails to deliver the intended sensory experience. Consumer complaints about taste and texture forced a reformulation delay of 8 weeks.',
  },
  packageDev: {
    name: 'Package Development',
    focus: 'seal integrity, dimensions, containment, and shelf life',
    consequence: 'Package design was not validated for microgravity conditions. Seal failures in zero-G caused product leakage, contaminating spacecraft equipment. Emergency package redesign required, delaying launch by 3 months.',
  },
  quality: {
    name: 'Quality',
    focus: 'microbial safety, weight consistency, documentation, and sensory scoring',
    consequence: 'Critical quality checks were skipped. Microbial contamination was not caught during the trial, leading to a batch recall after distribution. FDA issued a warning letter, and the facility required a complete quality system overhaul.',
  },
  pim: {
    name: 'Plant Industrialization',
    focus: 'line efficiency, safety incidents, equipment compatibility, and operator training',
    consequence: 'Plant scale-up parameters were not documented. When full production began, equipment incompatibilities caused 40% downtime. Untrained operators made critical errors, resulting in 2 safety incidents and production losses of $1.5M.',
  },
};

// Test specifications for generating fake data
const testSpecs = {
  temp: { unit: 'C', nominal: 68, variance: 5, failRange: 15 },
  moisture: { unit: '%', nominal: 14, variance: 2, failRange: 4 },
  weight: { unit: 'g', nominal: 25, variance: 1.5, failRange: 3 },
  viscosity: { unit: 'cP', nominal: 450, variance: 50, failRange: 100 },
  gel: { unit: 'sec', nominal: 52, variance: 5, failRange: 12 },
  micro: { unit: 'CFU/g', nominal: 100, variance: 50, failRange: 500 },
  seal: { unit: '%', nominal: 99, variance: 0.5, failRange: 2 },
  sensory: { unit: '/5', nominal: 4.2, variance: 0.3, failRange: 1 },
  particle: { unit: 'um', nominal: 150, variance: 20, failRange: 50 },
  texture: { unit: '/5', nominal: 4.0, variance: 0.4, failRange: 1 },
  dimensions: { unit: 'mm', nominal: 30, variance: 2, failRange: 5 },
  visual: { unit: '%', nominal: 98, variance: 1, failRange: 5 },
};

// Production disaster scenarios - what goes wrong when assessments are incorrect
const productionDisasters = {
  // When user said "Met" but it was actually "Not Met" (false positive - most dangerous!)
  falsePositive: {
    temp: {
      headline: "PRODUCT RECALL: Thermal Processing Failure",
      description: "Joy Bites shipped to retailers with improper gelling. Products are liquefying on shelves, causing $2.3M in recall costs and retailer relationship damage.",
      severity: "critical"
    },
    moisture: {
      headline: "FDA WARNING: Moisture Levels Enable Microbial Growth",
      description: "Excess moisture in Joy Bites allowed mold growth. 12,000 units quarantined, facility inspection triggered. Production halted for 2 weeks.",
      severity: "critical"
    },
    weight: {
      headline: "CONSUMER COMPLAINTS: Underweight Products",
      description: "Retail partners report consistent underweight packages. Class action lawsuit filed for deceptive packaging. Legal fees estimated at $500K.",
      severity: "major"
    },
    viscosity: {
      headline: "PRODUCTION LINE DOWN: Viscosity Out of Control",
      description: "Inconsistent viscosity caused portioning equipment to jam. 8 hours of unplanned downtime, 15,000 units scrapped.",
      severity: "major"
    },
    gel: {
      headline: "SOCIAL MEDIA DISASTER: 'Joy Bites Turned to Soup'",
      description: "Without proper gel strength monitoring, products shipped with inconsistent texture. Viral TikTok of 'soupy Joy Bites' gets 5M views. Brand reputation severely damaged.",
      severity: "critical"
    },
    micro: {
      headline: "URGENT RECALL: Microbial Contamination Detected",
      description: "Post-market testing reveals elevated bacterial counts. Voluntary recall of 3 production lots. FDA issues Form 483 with 4 observations.",
      severity: "critical"
    },
    seal: {
      headline: "SHELF LIFE FAILURE: Package Integrity Issues",
      description: "Weak seals allowed oxygen ingress. Products spoiling before expiration date. 40% of production lot returned from retailers.",
      severity: "major"
    },
    sensory: {
      headline: "RETAILER DELISTING: 'Tastes Wrong'",
      description: "Major grocery chain removes Joy Bites after consumer complaints about off-flavors. Lost $1.2M in annual revenue from that channel.",
      severity: "major"
    },
    particle: {
      headline: "TEXTURE COMPLAINTS: 'Gritty' Product",
      description: "Improper particle size distribution led to gritty mouthfeel. Product reviews plummet to 2.1 stars. Sales down 35%.",
      severity: "moderate"
    },
    texture: {
      headline: "CONSUMER REJECTION: Unacceptable Texture",
      description: "Products too firm/soft for consumer expectations. Market research shows 68% of trial users won't repurchase.",
      severity: "moderate"
    },
    dimensions: {
      headline: "PACKAGING FAILURE: Products Don't Fit",
      description: "Oversized pieces jam automated packaging. 3% of production damaged or scrapped daily.",
      severity: "moderate"
    },
    visual: {
      headline: "QUALITY COMPLAINTS: Visible Defects",
      description: "Products with discoloration and inclusions reaching consumers. Social media posts about 'disgusting' appearance going viral.",
      severity: "moderate"
    },
    // Conversational (PIM) false positives
    line_efficiency: {
      headline: "PRODUCTION LOSSES: Line Efficiency Far Below Target",
      description: "Full production launched at expected 85%+ efficiency but actual line ran at 68%. Missed delivery commitments to 3 retail partners, causing contract penalties of $400K.",
      severity: "critical"
    },
    safety_incidents: {
      headline: "OSHA INVESTIGATION: Unreported Safety Hazards",
      description: "Safety issues reported by operators were dismissed during trial. Same hazards caused 2 recordable incidents in full production. OSHA investigation and $150K fine.",
      severity: "critical"
    },
    changeover_time: {
      headline: "SCHEDULING DISASTER: Changeover Takes 3x Longer Than Planned",
      description: "Equipment compatibility issues identified by operators were ignored. Full production changeovers taking 90+ minutes instead of 30, destroying the production schedule.",
      severity: "major"
    },
    operator_readiness: {
      headline: "TRAINING GAP: Operators Not Prepared for Full Production",
      description: "Operators flagged inadequate training during trial but concerns were dismissed. Critical errors in full production led to 15% scrap rate in first week.",
      severity: "major"
    },
    scale_up_params: {
      headline: "SCALE-UP FAILURE: Parameters Don't Transfer to Full Production",
      description: "Equipment parameter variances noted during trial were not documented. Full production batch failed quality checks, requiring complete process revalidation.",
      severity: "major"
    },
    downtime_events: {
      headline: "UNPLANNED DOWNTIME: Equipment Issues Persist",
      description: "Recurring equipment failures identified in trial were not addressed. Production line down 30% of scheduled time in first month.",
      severity: "major"
    },
    cleaning_difficulty: {
      headline: "CONTAMINATION RISK: Inadequate Cleaning Procedures",
      description: "Cleaning difficulties reported by operators were not resolved. Cross-contamination detected in subsequent product run, triggering allergen recall.",
      severity: "critical"
    },
    overall_impression: {
      headline: "PLANT REJECTION: Operations Team Refuses Full Production",
      description: "Plant operations team refused to run full production citing unresolved concerns from trial. 6-week delay while issues are addressed.",
      severity: "major"
    }
  },
  // When user said "Met" but there was insufficient data (assumed success without evidence)
  assumedSuccess: {
    temp: {
      headline: "PROCESS VALIDATION VOID: No Temperature Records",
      description: "Auditor discovers no temperature data during trial. Entire batch quarantined pending investigation. 3-week production delay while process is revalidated.",
      severity: "critical"
    },
    moisture: {
      headline: "AUDIT FAILURE: Missing Moisture Documentation",
      description: "Customer audit finds no moisture testing records. Contract terminated. $800K annual business lost.",
      severity: "major"
    },
    gel: {
      headline: "QUALITY RUSSIAN ROULETTE: Gel Strength Unknown",
      description: "Without gel strength data, 1 in 5 production batches ships with texture defects. Intermittent consumer complaints impossible to root-cause.",
      severity: "major"
    },
    micro: {
      headline: "REGULATORY ACTION: Inadequate Micro Testing",
      description: "FDA inspection reveals insufficient microbiological testing during validation. Warning Letter issued. Facility must implement enhanced testing program.",
      severity: "critical"
    },
    weight: {
      headline: "COMPLIANCE GAP: No Weight Verification",
      description: "State Weights & Measures audit finds no weight documentation. $25K fine and mandatory monthly audits for 1 year.",
      severity: "moderate"
    },
    seal: {
      headline: "SHELF LIFE STUDY INVALID: No Seal Data",
      description: "Shelf life claims unsupported due to missing seal integrity data. All marketing claims must be revised. Legal review required.",
      severity: "moderate"
    },
    sensory: {
      headline: "LAUNCH GAMBLE: Sensory Profile Unknown",
      description: "Product launched without sensory baseline. Consumer feedback all over the map. No way to tell if complaints are valid or process-related.",
      severity: "moderate"
    },
    default: {
      headline: "DATA GAP: Critical Information Missing",
      description: "This criteria was marked as 'Met' but no supporting data was collected. In production, this assumption could lead to undetected quality issues.",
      severity: "moderate"
    }
  },
  // When user said "Met" but sample size was too small for statistical validity
  statisticallyUnsound: {
    temp: {
      headline: "VALIDATION REJECTED: Insufficient Temperature Data",
      description: "Customer audit found only limited temperature measurements. With fewer than 30 data points, the process capability cannot be statistically validated. Full revalidation required with proper sample size.",
      severity: "major"
    },
    moisture: {
      headline: "PROCESS HOLD: Moisture Data Not Statistically Valid",
      description: "QA review identified that moisture testing sample size (n<30) is insufficient to establish process capability. Production held pending expanded sampling study.",
      severity: "major"
    },
    gel: {
      headline: "SPECIFICATION CHALLENGE: Gel Strength Data Inconclusive",
      description: "With limited data points, natural variation cannot be distinguished from process problems. Customer rejected specification approval, requiring 6-week delay for proper sampling study.",
      severity: "major"
    },
    micro: {
      headline: "REGULATORY CONCERN: Micro Testing Sample Size Inadequate",
      description: "FDA inspector noted microbiological sampling does not meet statistical requirements for validation. Additional 30-day sampling program mandated before release.",
      severity: "critical"
    },
    weight: {
      headline: "COMPLIANCE RISK: Weight Variation Unknown",
      description: "Without adequate sample size (n>=30), process capability for fill weight cannot be demonstrated. State inspector may require extended monitoring program.",
      severity: "moderate"
    },
    sensory: {
      headline: "CONSUMER INSIGHT GAP: Sensory Panel Too Small",
      description: "Marketing questioned product launch with sensory data from insufficient panelists. Brand team requires expanded consumer testing before go-to-market.",
      severity: "moderate"
    },
    default: {
      headline: "STATISTICAL WARNING: Sample Size Below Minimum",
      description: "This criteria was evaluated with fewer than 30 data points. Per internal policy, a minimum of 30 samples are required for each measurement to establish statistical confidence. The conclusion may not be reliable.",
      severity: "moderate"
    }
  },
  // When user said "Not Met" but it was actually "Met" (false negative - overly cautious)
  falseNegative: {
    headline: "UNNECESSARY DELAY: Overcautious Assessment",
    description: "Product launch delayed by 4 weeks for additional testing that was already covered. Competitor launched first. Estimated lost market share: 15%.",
    severity: "minor"
  },
  // When user said "Insufficient Data" but actually there was enough
  missedData: {
    headline: "MISSED OPPORTUNITY: Data Was Available",
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
      headline: "QUALITY ESCAPE: Defective Product Shipped",
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

  // User said "Not Met" but it was actually "Met" - being cautious is fine, no penalty
  // We don't want to punish players for erring on the side of caution.

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
// Uses team seed for randomization that's consistent within a game session
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
    // For conversational criteria, check if relevant questions were asked
    if (c.measurementType === 'conversational') {
      return !c.requiredMeasurements.some(m => {
        if (m.step === 'operator-conversation' && m.question) {
          return samplingPlan['operator-conversation']?.[m.question]?.asked;
        }
        return false;
      });
    }
    // For instrumental criteria, check step/test/timepoint
    return !c.requiredMeasurements.some(m => {
      const stepPlan = samplingPlan[m.step];
      if (!stepPlan) return false;
      const testPlan = stepPlan[m.test];
      if (!testPlan) return false;
      // Check if any timepoint has samples > 0
      return Object.values(testPlan).some(qty => qty > 0);
    });
  });

  // Determine which step/test combos should systematically fail (not just outliers).
  // Use the seed to pick ~25% of covered criteria to have failing data,
  // so that the trial realistically has some tests that don't pass.
  const failingTests = new Set();
  const coveredCriteria = successCriteria.filter(c => {
    if (!c?.requiredMeasurements || c.measurementType === 'conversational') return false;
    return c.requiredMeasurements.some(m => {
      const stepPlan = samplingPlan[m.step];
      if (!stepPlan) return false;
      const testPlan = stepPlan[m.test];
      if (!testPlan) return false;
      return Object.values(testPlan).some(qty => qty > 0);
    });
  });

  // Pick criteria to fail — use seeded random so it's deterministic per game
  coveredCriteria.forEach(c => {
    if (seededRandom() < 0.25) {
      // Pick one required measurement from this criteria to fail
      const measurements = c.requiredMeasurements.filter(m =>
        m.step !== 'operator-conversation' && m.test && testSpecs[m.test]
      );
      if (measurements.length > 0) {
        const failIdx = Math.floor(seededRandom() * measurements.length);
        const m = measurements[failIdx];
        failingTests.add(`${m.step}-${m.test}`);
      }
    }
  });

  // Ensure at least one test fails if there are any covered criteria
  if (failingTests.size === 0 && coveredCriteria.length > 0) {
    const fallbackCriteria = coveredCriteria[Math.floor(seededRandom() * coveredCriteria.length)];
    const measurements = fallbackCriteria.requiredMeasurements.filter(m =>
      m.step !== 'operator-conversation' && m.test && testSpecs[m.test]
    );
    if (measurements.length > 0) {
      const m = measurements[Math.floor(seededRandom() * measurements.length)];
      failingTests.add(`${m.step}-${m.test}`);
    }
  }

  Object.entries(samplingPlan).forEach(([stepId, stepPlan]) => {
    if (!stepPlan || typeof stepPlan !== 'object') return;

    // Skip operator-conversation - handled separately as conversational data
    if (stepId === 'operator-conversation') return;

    data[stepId] = {};
    scatterData[stepId] = {};

    Object.entries(stepPlan).forEach(([testId, testPlan]) => {
      if (!testPlan || typeof testPlan !== 'object') return;

      const spec = testSpecs[testId];
      if (!spec) return;

      data[stepId][testId] = {};
      scatterData[stepId][testId] = [];

      // Check if this step/test combination should systematically fail
      const isFailingTest = failingTests.has(`${stepId}-${testId}`);

      // For failing tests, shift the entire distribution so most data is out of spec
      const failShift = isFailingTest
        ? (seededRandom() > 0.5 ? 1 : -1) * (spec.failRange + spec.variance * 0.5)
        : 0;

      Object.entries(testPlan).forEach(([tp, quantity]) => {
        if (quantity <= 0) return;

        const baseX = timePointXPositions[tp] || 90;
        const samples = [];
        let hasAnomalyInGroup = false;
        let anomalyValue = null;

        // Generate individual sample points
        for (let i = 0; i < quantity; i++) {
          let value;
          let isOutOfSpec = false;

          if (isFailingTest) {
            // Systematically shifted data — most points are out of spec
            // ~70% of points clearly out of spec, ~30% borderline/in-spec
            const r = seededRandom();
            if (r < 0.70) {
              // Out of spec — shifted from nominal
              value = spec.nominal + failShift + (seededRandom() - 0.5) * spec.variance * 1.5;
              isOutOfSpec = true;
            } else {
              // Some points closer to nominal (realistic — not every single point fails)
              value = spec.nominal + (seededRandom() - 0.5) * spec.variance * 2;
              isOutOfSpec = Math.abs(value - spec.nominal) > spec.variance;
            }
          } else {
            // Normal test — occasional individual anomalies
            const isAnomaly = !hasAnomalyInGroup && seededRandom() < 0.15;

            if (isAnomaly) {
              hasAnomalyInGroup = true;
              // Generate out-of-spec value — can be warning or critical severity
              const direction = seededRandom() > 0.5 ? 1 : -1;
              // ~40% of anomalies will be critical (deviation > failRange)
              const severityRoll = seededRandom();
              const deviation = severityRoll < 0.4
                ? spec.failRange + seededRandom() * spec.failRange * 0.5  // Critical: exceeds failRange
                : spec.variance + seededRandom() * (spec.failRange - spec.variance) * 0.8; // Warning: within failRange
              value = spec.nominal + direction * deviation;
              anomalyValue = value;
              isOutOfSpec = true;
            } else {
              // Normal value within spec with some natural variation
              value = spec.nominal + (seededRandom() - 0.5) * spec.variance * 2;
            }
          }

          // Add slight x-jitter for visibility (spread samples within timepoint)
          const xJitter = (seededRandom() - 0.5) * 20; // +/- 10 min jitter

          samples.push({
            x: baseX + xJitter,
            y: parseFloat(value.toFixed(2)),
            timePoint: tp,
            inSpec: !isOutOfSpec,
            sampleIndex: i + 1,
          });
        }

        // Add to scatter data
        scatterData[stepId][testId].push(...samples);

        // Calculate average for summary table
        const avgValue = samples.reduce((sum, s) => sum + s.y, 0) / samples.length;
        const anyOutOfSpec = samples.some(s => !s.inSpec);

        // For failing tests, record the worst out-of-spec value as the anomaly
        if (isFailingTest) {
          const outOfSpecSamples = samples.filter(s => !s.inSpec);
          if (outOfSpecSamples.length > 0) {
            const worstSample = outOfSpecSamples.reduce((worst, s) =>
              Math.abs(s.y - spec.nominal) > Math.abs(worst.y - spec.nominal) ? s : worst
            );
            anomalies.push({
              step: stepId,
              test: testId,
              timePoint: tp,
              value: worstSample.y.toFixed(1),
              expected: `${(spec.nominal - spec.variance).toFixed(1)} - ${(spec.nominal + spec.variance).toFixed(1)}`,
              unit: spec.unit,
              severity: 'critical',
              sampleCount: quantity
            });
          }
        } else if (anyOutOfSpec && anomalyValue !== null) {
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

  // Guarantee at least one critical anomaly exists so teams must think critically
  const hasCritical = anomalies.some(a => a.severity === 'critical');
  if (!hasCritical && anomalies.length > 0) {
    // Promote the first anomaly to critical by recalculating its value
    const target = anomalies[0];
    const spec = testSpecs[target.test];
    if (spec) {
      const direction = parseFloat(target.value) >= spec.nominal ? 1 : -1;
      const criticalValue = spec.nominal + direction * (spec.failRange + spec.failRange * 0.3);
      target.value = criticalValue.toFixed(1);
      target.severity = 'critical';

      // Update the corresponding scatter data point and summary
      const stepScatter = scatterData[target.step]?.[target.test];
      if (stepScatter) {
        const outOfSpecPoint = stepScatter.find(p => !p.inSpec);
        if (outOfSpecPoint) {
          outOfSpecPoint.y = parseFloat(criticalValue.toFixed(2));
        }
      }
      const tpData = data[target.step]?.[target.test]?.[target.timePoint];
      if (tpData?.samples) {
        const outOfSpecSample = tpData.samples.find(s => !s.inSpec);
        if (outOfSpecSample) {
          outOfSpecSample.y = parseFloat(criticalValue.toFixed(2));
        }
        // Recalculate average
        const avg = tpData.samples.reduce((sum, s) => sum + s.y, 0) / tpData.samples.length;
        tpData.value = parseFloat(avg.toFixed(1));
      }
    }
  }

  return { data, scatterData, anomalies, uncoveredCriteria };
};

// Crew Agreement Status Panel component
const CrewAgreementPanel = ({ players, agreements, playerId, onAgree, hasAgreed, allAgreed, gameState }) => {
  const allPlayers = Object.entries(players || {});

  return (
    <div className={`rounded-xl p-4 border mb-6 ${
      allAgreed
        ? 'bg-green-900/20 border-green-600'
        : 'bg-slate-800/50 border-slate-700'
    }`}>
      <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
        <Users className="w-4 h-4" />
        Crew Agreement Status
        {allAgreed && (
          <span className="text-green-400 text-xs ml-2">All crew members have agreed!</span>
        )}
      </h3>

      <div className="flex flex-wrap justify-center gap-3 mb-4">
        {allPlayers.map(([pid, playerData]) => {
          const hasPlayerAgreed = agreements?.[pid] === true;
          const isMe = pid === playerId;
          const character = getPlayerCharacter(pid, playerData?.functionalRole, gameState?.players || players);

          return (
            <div
              key={pid}
              className={`px-3 py-2 rounded-lg border flex items-center gap-2 transition-all ${
                hasPlayerAgreed
                  ? 'bg-green-900/30 border-green-500 text-green-300'
                  : 'bg-slate-700/50 border-slate-600 text-slate-400'
              } ${isMe ? 'ring-2 ring-cyan-500' : ''}`}
            >
              <span className="text-lg">{character.emoji}</span>
              <span className="text-sm font-medium">{character.name}</span>
              {isMe && <span className="text-xs text-cyan-400">(You)</span>}
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                hasPlayerAgreed ? 'bg-green-500' : 'bg-slate-600'
              }`}>
                {hasPlayerAgreed ? (
                  <Check className="w-3 h-3 text-white" />
                ) : (
                  <X className="w-3 h-3 text-slate-400" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-500 text-center mb-4">
        {Object.values(agreements || {}).filter(Boolean).length}/{allPlayers.length} crew members have agreed
      </p>

      {!hasAgreed && (
        <div className="text-center">
          <button
            onClick={onAgree}
            className="bg-green-600 hover:bg-green-500 px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
          >
            <Check className="w-4 h-4" />
            I Agree with These Assessments
          </button>
          <p className="text-xs text-slate-500 mt-2">
            Click to confirm you agree with the team's criteria assessments
          </p>
        </div>
      )}

      {hasAgreed && !allAgreed && (
        <p className="text-center text-amber-400 text-sm">
          Waiting for other crew members to agree...
        </p>
      )}
    </div>
  );
};

const Level4 = ({ onNavigateToLevel }) => {
  const { gameState, updateLevelState, completeLevel, navigateToLevel, playerId } = useGame();
  const [showPreviousWork, setShowPreviousWork] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [expandedAssessments, setExpandedAssessments] = useState({});
  const [expandedDisasters, setExpandedDisasters] = useState({});
  const [expandedMissingRoles, setExpandedMissingRoles] = useState({});

  // Track if we're currently in editing mode (returning from sampling plan)
  const [isEditingMode, setIsEditingMode] = useState(false);

  // Get data from previous levels
  // Firebase Realtime Database may convert arrays to objects with numeric keys.
  // Normalize to a proper array so .forEach/.map/.some/.every/.length work.
  const selectedCriteria = useMemo(() => {
    const raw = gameState?.level1?.selectedCriteria;
    if (!raw) return [];
    const arr = Array.isArray(raw) ? raw : Object.values(raw);
    return arr.map(c => {
      if (c && c.requiredMeasurements && !Array.isArray(c.requiredMeasurements)) {
        return { ...c, requiredMeasurements: Object.values(c.requiredMeasurements) };
      }
      return c;
    });
  }, [gameState?.level1?.selectedCriteria]);
  const samplingPlan = gameState?.level2?.samplingPlan || {};

  // Get synced state from Firebase
  const level3State = gameState?.level3 || {};
  const syncedAssessments = level3State.criteriaAssessments || {};
  const syncedAgreements = level3State.playerAgreements || {};
  const trialDataSeed = level3State.trialDataSeed;

  // Local state for assessments - sync with Firebase
  const [localAssessments, setLocalAssessments] = useState(syncedAssessments);

  // Check if current player has agreed
  const hasAgreed = syncedAgreements[playerId] === true;

  // Check if all players have agreed
  const allPlayers = Object.keys(gameState?.players || {});
  const allAgreed = allPlayers.length > 0 && allPlayers.every(pid => syncedAgreements[pid] === true);

  // Generate a consistent seed for this game's trial data
  // Use the team creation timestamp + game code to ensure uniqueness per game
  const gameSeed = useMemo(() => {
    if (trialDataSeed) {
      // Use the seed stored in Firebase for consistency
      return trialDataSeed;
    }
    // Generate new seed based on game creation time and code
    const createdAt = gameState?.meta?.createdAt || Date.now();
    const codeHash = gameState?.gameCode?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
    return createdAt + codeHash;
  }, [trialDataSeed, gameState?.meta?.createdAt, gameState?.gameCode]);

  // Store the seed in Firebase if not already stored
  useEffect(() => {
    if (!trialDataSeed && gameSeed && gameState?.gameCode) {
      updateLevelState('level3', { trialDataSeed: gameSeed });
    }
  }, [trialDataSeed, gameSeed, gameState?.gameCode, updateLevelState]);

  // Generate fake data based on sampling plan with consistent seed
  const { data: generatedData, scatterData, anomalies, uncoveredCriteria } = useMemo(() => {
    return generateFakeData(samplingPlan, selectedCriteria, gameSeed);
  }, [samplingPlan, selectedCriteria, gameSeed]);

  // Generate conversational data (operator quotes) based on asked questions
  const conversationalData = useMemo(() => {
    const operatorConvPlan = samplingPlan['operator-conversation'];
    if (!operatorConvPlan) return [];

    // Use same seed-based random for consistency
    let randomState = gameSeed + 999; // Offset to get different random sequence
    const seededRandom = () => {
      randomState = (randomState * 1103515245 + 12345) & 0x7fffffff;
      return randomState / 0x7fffffff;
    };

    const results = [];
    Object.entries(operatorConvPlan).forEach(([questionId, questionData]) => {
      if (!questionData?.asked) return;

      const question = operatorQuestions.find(q => q.id === questionId);
      const quotes = operatorQuoteBank[questionId];
      if (!question || !quotes) return;

      // ~20% chance of negative quote (similar to anomaly rate)
      const isNegative = seededRandom() < 0.20;
      const quotePool = isNegative ? quotes.notMet : quotes.met;
      const selectedQuote = quotePool[Math.floor(seededRandom() * quotePool.length)];

      results.push({
        questionId,
        question: question.question,
        category: question.category,
        relatedCriteria: question.relatedCriteria,
        speaker: selectedQuote.speaker,
        quote: selectedQuote.quote,
        isPositive: !isNegative,
      });
    });

    return results;
  }, [samplingPlan, gameSeed]);

  // Sync local assessments with Firebase state
  useEffect(() => {
    if (Object.keys(syncedAssessments).length > 0) {
      setLocalAssessments(syncedAssessments);
    }
  }, [syncedAssessments]);

  // Check if level is already submitted (from Firebase)
  useEffect(() => {
    if (level3State.completedAt && !isEditingMode) {
      setIsSubmitted(true);
    }
  }, [level3State.completedAt, isEditingMode]);

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

      // Check if this is a conversational criteria (PIM role)
      if (criteria.measurementType === 'conversational') {
        // For conversational criteria, check if the relevant questions were asked
        const requiredQuestions = criteria.requiredMeasurements
          .filter(m => m.step === 'operator-conversation' && m.question)
          .map(m => m.question);

        const askedQuestions = requiredQuestions.filter(qId =>
          samplingPlan['operator-conversation']?.[qId]?.asked
        );

        if (askedQuestions.length === 0) {
          answers[criteria.id] = {
            met: 'insufficient',
            reason: 'No operator conversations conducted for this criteria',
            details: `To evaluate this criteria, you needed to ask operator questions about: ${requiredQuestions.map(qId => {
              const q = operatorQuestions.find(oq => oq.id === qId);
              return q?.category || qId;
            }).join(', ')}. No relevant questions were asked.`,
            requiredTests: criteria.requiredMeasurements.map(m => ({
              step: m.step,
              test: m.question,
              description: m.description
            })),
            collectedTests: [],
            anomaliesFound: [],
            statisticallySound: true, // N/A for conversational
            totalSamples: 0,
            sampleDetails: [],
            isConversational: true
          };
          return;
        }

        // Check if any of the quotes for asked questions are negative
        const relevantQuotes = conversationalData.filter(cd =>
          requiredQuestions.includes(cd.questionId)
        );
        const hasNegativeQuote = relevantQuotes.some(q => !q.isPositive);

        if (hasNegativeQuote) {
          const negativeQuotes = relevantQuotes.filter(q => !q.isPositive);
          answers[criteria.id] = {
            met: 'no',
            reason: `Operator feedback indicates criteria not met`,
            details: `Operators reported issues: ${negativeQuotes.map(q => `"${q.quote.substring(0, 60)}..." - ${q.speaker}`).join('; ')}`,
            requiredTests: criteria.requiredMeasurements.map(m => ({
              step: m.step,
              test: m.question,
              description: m.description
            })),
            collectedTests: askedQuestions.map(qId => ({
              step: 'operator-conversation',
              test: qId,
              description: operatorQuestions.find(q => q.id === qId)?.category || qId
            })),
            anomaliesFound: negativeQuotes.map(q => ({
              step: 'operator-conversation',
              test: q.questionId,
              value: 'Negative feedback',
              expected: 'Positive feedback',
              unit: '',
              severity: 'critical'
            })),
            statisticallySound: true,
            totalSamples: askedQuestions.length,
            sampleDetails: [],
            isConversational: true,
            conversationalQuotes: relevantQuotes
          };
        } else {
          answers[criteria.id] = {
            met: 'yes',
            reason: 'Operator feedback confirms criteria was met',
            details: `Operators confirmed positive results: ${relevantQuotes.map(q => `"${q.quote.substring(0, 60)}..." - ${q.speaker}`).join('; ')}`,
            requiredTests: criteria.requiredMeasurements.map(m => ({
              step: m.step,
              test: m.question,
              description: m.description
            })),
            collectedTests: askedQuestions.map(qId => ({
              step: 'operator-conversation',
              test: qId,
              description: operatorQuestions.find(q => q.id === qId)?.category || qId
            })),
            anomaliesFound: [],
            statisticallySound: true,
            totalSamples: askedQuestions.length,
            sampleDetails: [],
            isConversational: true,
            conversationalQuotes: relevantQuotes
          };
        }
        return;
      }

      // Get the required tests for this criteria (instrumental)
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
            meetsMinimum: testSampleCount >= MIN_SAMPLES_FOR_STATISTICAL_VALIDITY,
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

      // Check statistical validity - ALL steps require 30+ samples for statistical confidence
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
          `${processSteps.find(s => s.id === a.step)?.name || a.step} ${testOptions[a.test]?.name || a.test}: ${a.value}${a.unit} (expected ${a.expected})`
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
            `${processSteps.find(s => s.id === a.step)?.name || a.step} ${testOptions[a.test]?.name || a.test}: ${a.value}${a.unit} (expected ${a.expected})`
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
          met: statisticallySound ? 'yes' : 'insufficient',
          reason: !statisticallySound
            ? `Not statistically significant — sample size below minimum (n<${MIN_SAMPLES_FOR_STATISTICAL_VALIDITY})`
            : hasNotes
              ? 'Met with minor deviations noted'
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
  }, [selectedCriteria, generatedData, anomalies, conversationalData, samplingPlan]);

  // Handle assessment change - sync to Firebase
  const handleAssessmentChange = useCallback((criteriaId, value) => {
    const newAssessments = {
      ...localAssessments,
      [criteriaId]: value
    };
    setLocalAssessments(newAssessments);

    // Sync to Firebase - reset agreements when assessments change
    updateLevelState('level3', {
      criteriaAssessments: newAssessments,
      playerAgreements: {} // Reset agreements when any assessment changes
    });
  }, [localAssessments, updateLevelState]);

  // Handle player agreement
  const handleAgree = useCallback(() => {
    const newAgreements = {
      ...syncedAgreements,
      [playerId]: true
    };

    updateLevelState('level3', {
      playerAgreements: newAgreements
    });
  }, [syncedAgreements, playerId, updateLevelState]);

  const allCriteriaAssessed = selectedCriteria.every(c => localAssessments[c?.id]);

  const calculateScore = () => {
    let score = 0;
    let correctCount = 0;

    selectedCriteria.forEach(criteria => {
      if (!criteria?.id) return;
      const userAnswer = localAssessments[criteria.id];
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
      } else if (userAnswer === 'no' && correct.met === 'yes') {
        // Being cautious (saying "Not Met" when it was actually "Met") is not penalized
        score += 100;
        correctCount++;
      }
    });

    // Bonus for good sampling plan coverage
    const coverageBonus = selectedCriteria.length > 0
      ? Math.floor((selectedCriteria.length - uncoveredCriteria.length) / selectedCriteria.length * 200)
      : 0;
    score += coverageBonus;

    return { score: Math.min(score, 1000), correctCount };
  };

  const handleSubmit = () => {
    const { score, correctCount } = calculateScore();

    updateLevelState('level3', {
      criteriaAssessments: localAssessments,
      correctAnswers,
      score,
      correctCount,
      completedAt: Date.now(),
    });
    setIsSubmitted(true);
    // Don't auto-redirect - let user review results and decide
  };

  const handleReturnToSampling = () => {
    // Reset Level 3 (Mission Report) state to allow fresh assessment after editing sampling plan
    updateLevelState('level3', {
      criteriaAssessments: {},
      playerAgreements: {},
      correctAnswers: null,
      score: 0,
      correctCount: 0,
      completedAt: null,
      // Clear the trialDataSeed so new data is generated for the new sampling plan
      trialDataSeed: null,
    });

    // Reset Level 2 (Sampling Plan) completion so it can be re-submitted
    updateLevelState('level2', {
      completedAt: null,
    });

    // Reset local state
    setIsSubmitted(false);
    setLocalAssessments({});
    setIsEditingMode(true);

    // Navigate to Level 2 (Sampling Plan) using the local navigation prop
    if (onNavigateToLevel) {
      onNavigateToLevel(2);
    } else {
      navigateToLevel(2);
    }
  };

  const handleCompleteGame = () => {
    setShowLevelComplete(true);
  };

  const handleFinalComplete = () => {
    completeLevel(3);
  };

  // Show the LevelComplete transition screen before the certificate
  if (showLevelComplete) {
    const { score } = calculateScore();
    return (
      <LevelComplete
        level={4}
        score={score}
        onContinue={handleFinalComplete}
      />
    );
  }

  if (isSubmitted) {
    const { score, correctCount } = calculateScore();

    // Determine which functional roles are missing from the team
    const allFunctionalRoles = ['productDev', 'packageDev', 'quality', 'pim'];
    const presentRoles = new Set();
    Object.values(gameState?.players || {}).forEach(player => {
      if (player.functionalRole) {
        presentRoles.add(player.functionalRole);
      }
    });
    const missingRoles = allFunctionalRoles.filter(r => !presentRoles.has(r));

    // Collect all disasters for incorrect answers AND statistically unsound conclusions
    const disasters = [];
    selectedCriteria.forEach(criteria => {
      if (!criteria?.id) return;
      const userAnswer = localAssessments[criteria.id];
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
          {/* Header - changes based on performance AND missing crew */}
          <div className="text-center mb-8">
            {missingRoles.length > 0 ? (
              // Missing crew roles override "Perfect Assessment" - can't be perfect if crew is incomplete
              disasters.length === 0 ? (
                <>
                  <div className="flex justify-center mb-4">
                    <AlertTriangle className="w-16 h-16 text-orange-400" />
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-bold text-orange-400 mb-2">Assessment Complete - With Concerns</h2>
                  <p className="text-orange-300">Your assessments were correct, but critical crew roles were missing. Review the consequences below.</p>
                </>
              ) : criticalCount > 0 ? (
                <>
                  <div className="flex justify-center mb-4">
                    <XCircle className="w-16 h-16 text-red-400" />
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-bold text-red-400 mb-2">Production Crisis!</h2>
                  <p className="text-red-300">Assessment errors combined with missing crew would cause severe production problems</p>
                </>
              ) : (
                <>
                  <div className="flex justify-center mb-4">
                    <AlertTriangle className="w-16 h-16 text-orange-400" />
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-bold text-orange-400 mb-2">Assessment Complete - With Concerns</h2>
                  <p className="text-orange-300">Critical crew roles were missing from the team. Review the impact below.</p>
                </>
              )
            ) : disasters.length === 0 ? (
              <>
                <div className="flex justify-center mb-4">
                  <Trophy className="w-16 h-16 text-yellow-400" />
                </div>
                <h2 className="text-2xl sm:text-4xl font-bold text-green-400 mb-2">Perfect Assessment!</h2>
                <p className="text-slate-400">Joy Bites production can proceed safely</p>
              </>
            ) : onlyStatisticalWarnings ? (
              <>
                <div className="flex justify-center mb-4">
                  <BarChart3 className="w-16 h-16 text-purple-400" />
                </div>
                <h2 className="text-2xl sm:text-4xl font-bold text-purple-400 mb-2">Assessments Correct, But...</h2>
                <p className="text-purple-300">Your assessments were right, but sample sizes are too small for statistical confidence</p>
              </>
            ) : criticalCount > 0 ? (
              <>
                <div className="flex justify-center mb-4">
                  <XCircle className="w-16 h-16 text-red-400" />
                </div>
                <h2 className="text-2xl sm:text-4xl font-bold text-red-400 mb-2">Production Crisis!</h2>
                <p className="text-red-300">Your assessment errors would cause serious problems in production</p>
              </>
            ) : majorCount > 0 ? (
              <>
                <div className="flex justify-center mb-4">
                  <AlertTriangle className="w-16 h-16 text-orange-400" />
                </div>
                <h2 className="text-2xl sm:text-4xl font-bold text-orange-400 mb-2">Quality Issues Detected</h2>
                <p className="text-orange-300">Your assessment would lead to significant production problems</p>
              </>
            ) : (
              <>
                <div className="flex justify-center mb-4">
                  <FileText className="w-16 h-16 text-amber-400" />
                </div>
                <h2 className="text-2xl sm:text-4xl font-bold text-amber-400 mb-2">Assessment Complete</h2>
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
            <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
              <div>
                <div className="text-xs sm:text-sm text-slate-400">Correct Assessments</div>
                <div className={`text-2xl sm:text-3xl font-bold ${
                  correctCount === selectedCriteria.length ? 'text-green-400' : 'text-cyan-400'
                }`}>{correctCount} / {selectedCriteria.length}</div>
              </div>
              <div className="w-px h-12 bg-slate-700 hidden sm:block" />
              <div>
                <div className="text-xs sm:text-sm text-slate-400">Level Score</div>
                <div className="text-2xl sm:text-3xl font-bold text-cyan-400">{score} PTS</div>
              </div>
              {actualErrorCount > 0 && (
                <>
                  <div className="w-px h-12 bg-slate-700 hidden sm:block" />
                  <div>
                    <div className="text-sm text-slate-400">Production Issues</div>
                    <div className="text-2xl sm:text-3xl font-bold text-red-400">{actualErrorCount}</div>
                  </div>
                </>
              )}
              {statisticalWarningCount > 0 && (
                <>
                  <div className="w-px h-12 bg-slate-700 hidden sm:block" />
                  <div>
                    <div className="text-sm text-slate-400">Statistical Warnings</div>
                    <div className="text-2xl sm:text-3xl font-bold text-purple-400">{statisticalWarningCount}</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Production Disasters Section */}
          {disasters.length > 0 && (
            <div className="bg-red-950/30 rounded-xl p-3 sm:p-6 border border-red-800 mb-4 sm:mb-6">
              <h3 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-red-300">
                <AlertTriangle className="w-6 h-6" />
                What Would Happen in Production
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Based on your assessments, here's what would likely happen when Joy Bites goes into full production.
                {disasters.some(d => d.isStatisticalWarning) && (
                  <span className="text-purple-400"> Note: Some criteria were assessed correctly but lack statistical confidence at packaging/post-packaging steps (n&lt;{MIN_SAMPLES_FOR_STATISTICAL_VALIDITY} samples required for packaging and QC release steps only).</span>
                )}
              </p>
              <div className="space-y-3">
                {disasters.map(({ criteria, disaster, userAnswer, correct, isStatisticalWarning }, index) => {
                  const styles = severityStyles[disaster.severity] || severityStyles.moderate;
                  const isExpanded = expandedDisasters[criteria.id];
                  return (
                    <div
                      key={criteria.id}
                      className={`${styles.bg} border ${styles.border} rounded-lg`}
                    >
                      {/* Clickable header — always visible */}
                      <button
                        onClick={() => setExpandedDisasters(prev => ({ ...prev, [criteria.id]: !prev[criteria.id] }))}
                        className="w-full p-4 flex items-center gap-3 text-left hover:bg-white/5 transition-colors rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
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
                          <p className="text-xs text-slate-400 mt-1 truncate">
                            Criteria: {criteria.text}
                          </p>
                        </div>
                        {isExpanded
                          ? <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                          : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        }
                      </button>

                      {/* Expandable details */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-0">
                          <p className="text-sm text-slate-300 mb-3">{disaster.description}</p>

                          {/* Show sample size details for statistical warnings */}
                          {isStatisticalWarning && correct.sampleDetails?.length > 0 && (
                            <div className="bg-purple-900/30 border border-purple-700/50 rounded p-2 mb-3">
                              <p className="text-xs text-purple-300 font-medium mb-1">
                                Sample Size Details (Minimum required: {MIN_SAMPLES_FOR_STATISTICAL_VALIDITY})
                              </p>
                              <div className="text-xs space-y-0.5">
                                {correct.sampleDetails.map((s, i) => (
                                  <p key={i} className={s.meetsMinimum ? 'text-green-400' : 'text-red-400'}>
                                    - {s.description}: n={s.count} {s.meetsMinimum ? '(OK)' : `(need ${MIN_SAMPLES_FOR_STATISTICAL_VALIDITY - s.count} more)`}
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
                                <span className="text-purple-400"> - Answer correct but data not statistically valid</span>
                              ) : (
                                <>
                                  {' -> '}
                                  Correct: <span className="text-cyan-400">
                                    {correct.met === 'yes' ? 'Met' : correct.met === 'no' ? 'Not Met' : 'Insufficient Data'}
                                  </span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Missing Crew Member Consequences */}
          {missingRoles.length > 0 && (
            <div className="bg-orange-950/30 rounded-xl p-6 border border-orange-800 mb-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-orange-300">
                <Users className="w-6 h-6" />
                Missing Crew Impact: What Went Wrong
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Your team was missing {missingRoles.length} functional role{missingRoles.length > 1 ? 's' : ''}.
                Without their expertise, critical areas were not properly covered during the trial.
              </p>
              <div className="space-y-3">
                {missingRoles.map(roleKey => {
                  const roleInfo = FUNCTIONAL_ROLE_INFO[roleKey];
                  if (!roleInfo) return null;

                  // Find criteria that belong to this missing role
                  const affectedCriteria = selectedCriteria.filter(c => c?.role === roleKey);
                  const unselectedRoleCriteria = (roleKey === 'productDev'
                    ? ['Flavor familiarity', 'Texture cohesion', 'Moisture content']
                    : roleKey === 'packageDev'
                      ? ['Seal integrity', 'Package dimensions', 'Containment']
                      : roleKey === 'quality'
                        ? ['Microbial safety', 'Weight consistency', 'Documentation compliance']
                        : ['Line efficiency', 'Operator training', 'Equipment compatibility']
                  );

                  const isExpanded = expandedMissingRoles[roleKey];

                  return (
                    <div key={roleKey} className="bg-orange-900/30 border border-orange-700/50 rounded-lg">
                      {/* Clickable header — always visible */}
                      <button
                        onClick={() => setExpandedMissingRoles(prev => ({ ...prev, [roleKey]: !prev[roleKey] }))}
                        className="w-full p-4 flex items-center gap-3 text-left hover:bg-white/5 transition-colors rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-orange-300">
                            {roleInfo.name} — Not Represented on Team
                          </h4>
                          <p className="text-xs text-slate-400 mt-1">
                            Responsible for: {roleInfo.focus}
                          </p>
                        </div>
                        {isExpanded
                          ? <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                          : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        }
                      </button>

                      {/* Expandable details */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-0">
                          <p className="text-sm text-orange-200 mb-3">
                            {roleInfo.consequence}
                          </p>
                          {affectedCriteria.length > 0 && (
                            <div className="bg-slate-900/50 rounded p-2">
                              <p className="text-xs text-slate-500 mb-1">Affected criteria in your plan:</p>
                              {affectedCriteria.map(c => (
                                <p key={c.id} className="text-xs text-orange-400">• {c.text}</p>
                              ))}
                            </div>
                          )}
                          {affectedCriteria.length === 0 && (
                            <div className="bg-slate-900/50 rounded p-2">
                              <p className="text-xs text-slate-500 mb-1">
                                Because {roleInfo.name} was not on the team, these areas were never included in your success criteria:
                              </p>
                              {unselectedRoleCriteria.map((item, i) => (
                                <p key={i} className="text-xs text-orange-400">• {item}</p>
                              ))}
                              <p className="text-xs text-orange-300 mt-2 italic">
                                This means potential failures in {roleInfo.focus} were invisible to the team —
                                the measurements were never taken, so problems could not be detected until production.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Detailed Results */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" />
                Detailed Assessment Results
              </h3>
              <button
                onClick={() => {
                  const allIds = selectedCriteria.filter(c => c?.id).map(c => c.id);
                  const allExpanded = allIds.every(id => expandedAssessments[id]);
                  if (allExpanded) {
                    setExpandedAssessments({});
                  } else {
                    const expanded = {};
                    allIds.forEach(id => { expanded[id] = true; });
                    setExpandedAssessments(expanded);
                  }
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
              >
                {selectedCriteria.filter(c => c?.id).every(c => expandedAssessments[c.id])
                  ? <><ChevronUp className="w-4 h-4" /> Collapse All</>
                  : <><ChevronDown className="w-4 h-4" /> Expand All</>
                }
              </button>
            </div>
            <div className="space-y-3">
              {selectedCriteria.map((criteria, index) => {
                if (!criteria?.id) return null;
                const userAnswer = localAssessments[criteria.id];
                const correct = correctAnswers[criteria.id];
                const isCorrect = userAnswer === correct.met;
                const isExpanded = expandedAssessments[criteria.id];

                return (
                  <div
                    key={criteria.id}
                    className={`rounded-lg border ${
                      isCorrect
                        ? 'bg-green-900/20 border-green-600'
                        : 'bg-red-900/20 border-red-600'
                    }`}
                  >
                    {/* Clickable header — always visible */}
                    <button
                      onClick={() => setExpandedAssessments(prev => ({ ...prev, [criteria.id]: !prev[criteria.id] }))}
                      className="w-full p-4 flex items-center gap-3 text-left hover:bg-white/5 transition-colors rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        {isCorrect ? (
                          <CheckCircle2 className="w-6 h-6 text-green-400" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-200 font-medium truncate">
                          <span className="text-cyan-400 font-mono mr-2">{index + 1}.</span>
                          {criteria.text}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-slate-400">
                            You said: <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>
                              {userAnswer === 'yes' ? 'Met' : userAnswer === 'no' ? 'Not Met' : 'Insufficient Data'}
                            </span>
                          </span>
                          {!isCorrect && (
                            <span className="text-xs text-slate-400">
                              Correct: <span className="text-cyan-400">
                                {correct.met === 'yes' ? 'Met' : correct.met === 'no' ? 'Not Met' : 'Insufficient Data'}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded flex-shrink-0 ${
                        isCorrect ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {isCorrect ? 'CORRECT' : 'INCORRECT'}
                      </span>
                      {isExpanded
                        ? <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                      }
                    </button>

                    {/* Expandable details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 ml-9">
                        {/* Answer comparison */}
                        <div className="grid md:grid-cols-2 gap-2 mb-3 text-sm">
                          <div className={`p-2 rounded ${isCorrect ? 'bg-green-900/30' : 'bg-slate-900/50'}`}>
                            <span className="text-slate-400">Your answer: </span>
                            <span className={isCorrect ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                              {userAnswer === 'yes' ? 'Met' : userAnswer === 'no' ? 'Not Met' : 'Insufficient Data'}
                            </span>
                          </div>
                          {!isCorrect && (
                            <div className="p-2 rounded bg-cyan-900/30">
                              <span className="text-slate-400">Correct answer: </span>
                              <span className="text-cyan-400 font-medium">
                                {correct.met === 'yes' ? 'Met' : correct.met === 'no' ? 'Not Met' : 'Insufficient Data'}
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
                                  <p className={`text-xs font-medium ${correct.statisticallySound ? 'text-green-500' : 'text-red-400'}`}>
                                    {correct.statisticallySound
                                      ? `Statistically valid (total n=${correct.totalSamples})`
                                      : `Not statistically significant (total n=${correct.totalSamples}, need n>=${MIN_SAMPLES_FOR_STATISTICAL_VALIDITY} per test)`
                                    }
                                  </p>
                                  {!correct.statisticallySound && (
                                    <div className="mt-1 space-y-0.5">
                                      {correct.sampleDetails.map((s, i) => (
                                        <p key={i} className={`text-xs ${s.meetsMinimum ? 'text-slate-500' : 'text-red-400'}`}>
                                          - {s.description}: n={s.count} {!s.meetsMinimum ? `(need ${MIN_SAMPLES_FOR_STATISTICAL_VALIDITY - s.count} more)` : ''}
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
                                    Minor deviations noted ({correct.minorAnomalies.length}):
                                  </p>
                                  <div className="mt-1 space-y-0.5">
                                    {correct.minorAnomalies.map((a, i) => (
                                      <p key={i} className="text-xs text-amber-300">
                                        - {processSteps.find(s => s.id === a.step)?.name || a.step} {testOptions[a.test]?.name || a.test}: {a.value}{a.unit} (expected {a.expected})
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
                    )}
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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white p-3 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-1 sm:mb-2">Level 3: Mission Report</h1>
          <p className="text-sm sm:text-base text-slate-400">Analyze your trial data and determine if success criteria were met</p>
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-xl p-3 sm:p-4 border border-amber-700/50 mb-4 sm:mb-6">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-200">
                <strong>Your task:</strong> Review the production data generated from your sampling plan.
                For each success criteria, determine if the data supports that the criteria was met,
                not met, or if there's insufficient data to determine.
              </p>
              <p className="text-sm text-amber-200 mt-2">
                <strong>Team Collaboration:</strong> All crew members must agree on the assessments before submitting.
                Discuss your findings and reach consensus as a team!
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
          <div className="bg-slate-800/50 rounded-xl p-3 sm:p-6 border border-slate-700 mb-4 sm:mb-6">
            <h3 className="text-lg font-semibold mb-3 sm:mb-4">Your Previous Work</h3>
            <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
              {/* Level 1 - Success Criteria */}
              <div className="bg-slate-900/50 rounded-lg p-3 sm:p-4">
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

              {/* Level 2 - Sampling Plan */}
              <div className="bg-slate-900/50 rounded-lg p-4">
                <h4 className="font-medium text-cyan-400 mb-2 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4" />
                  Level 2: Sampling Plan
                </h4>
                <div className="text-sm text-slate-400 space-y-1">
                  <p>Samples Used: {gameState?.level2?.samplesUsed || 0} / 300</p>
                  <p>Criteria Coverage: {gameState?.level2?.criteriaCoverage?.covered || 0} / {selectedCriteria.length}</p>
                  {uncoveredCriteria.length > 0 && (
                    <p className="text-amber-400">
                      Warning: {uncoveredCriteria.length} criteria not covered by sampling plan
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generated Data Display - Interactive Process Flow Viewer */}
        <ProcessFlowDataViewer
          generatedData={generatedData}
          scatterData={scatterData}
          anomalies={anomalies}
          conversationalData={conversationalData}
          testSpecs={testSpecs}
          timePointLabels={timePointLabels}
        />

        {/* Success Criteria Assessment */}
        <div className="bg-slate-800/50 rounded-xl p-3 sm:p-6 border border-slate-700 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Target className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 flex-shrink-0" />
            <div>
              <h2 className="text-base sm:text-xl font-semibold">Success Criteria Assessment</h2>
              <p className="text-xs sm:text-sm text-slate-400">Based on the data, determine if each criteria was met</p>
            </div>
          </div>

          <div className="space-y-4">
            {selectedCriteria.map((criteria, index) => {
              if (!criteria?.id) return null;
              const assessment = localAssessments[criteria.id];
              const isUncovered = uncoveredCriteria.some(c => c?.id === criteria.id);
              const correctData = correctAnswers[criteria.id];
              const hasInsufficientSamples = correctData && !correctData.statisticallySound && correctData.sampleDetails?.length > 0;

              return (
                <div
                  key={criteria.id}
                  className={`p-3 sm:p-4 rounded-lg border ${
                    assessment
                      ? 'border-cyan-600 bg-cyan-900/20'
                      : 'border-slate-600 bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-start gap-2 sm:gap-3 mb-3">
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
                          <p className="text-xs text-red-400 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Not statistically significant — minimum {MIN_SAMPLES_FOR_STATISTICAL_VALIDITY} samples required
                          </p>
                          <div className="text-xs text-slate-500 ml-4">
                            {correctData.sampleDetails.filter(s => !s.meetsMinimum).map((s, i) => (
                              <span key={i} className="text-red-400">
                                {s.description}: n={s.count}
                                {i < correctData.sampleDetails.filter(s2 => !s2.meetsMinimum).length - 1 ? ' - ' : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {!isUncovered && correctData?.statisticallySound && correctData?.sampleDetails?.length > 0 && (
                        <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                          Statistically valid (total n={correctData.totalSamples})
                        </p>
                      )}
                      {!isUncovered && correctData?.minorAnomalies?.length > 0 && (
                        <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                          Minor deviations noted ({correctData.minorAnomalies.length}) - within acceptable tolerances
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 ml-4 sm:ml-6">
                    {['yes', 'no', 'insufficient'].map(option => (
                      <button
                        key={option}
                        onClick={() => handleAssessmentChange(criteria.id, option)}
                        className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                          assessment === option
                            ? option === 'yes'
                              ? 'bg-green-600 text-white'
                              : option === 'no'
                                ? 'bg-red-600 text-white'
                                : 'bg-amber-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {option === 'yes' && 'Met'}
                        {option === 'no' && 'Not Met'}
                        {option === 'insufficient' && 'Insufficient Data'}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Crew Agreement Panel - Show when assessments are made (at bottom, before submit) */}
        {allCriteriaAssessed && (
          <CrewAgreementPanel
            players={gameState?.players}
            agreements={syncedAgreements}
            playerId={playerId}
            onAgree={handleAgree}
            hasAgreed={hasAgreed}
            allAgreed={allAgreed}
            gameState={gameState}
          />
        )}

        {/* Submit Button */}
        <div className="text-center pb-16 sm:pb-8">
          <button
            onClick={handleSubmit}
            disabled={!allCriteriaAssessed || !allAgreed}
            className="flex items-center gap-2 mx-auto bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed px-6 sm:px-8 py-3 rounded-lg font-semibold text-base sm:text-lg transition-colors"
          >
            <Send className="w-5 h-5" />
            Submit Final Assessment
          </button>
          {!allCriteriaAssessed ? (
            <p className="text-slate-500 text-sm mt-2">
              Assess all {selectedCriteria.length} success criteria to continue
            </p>
          ) : !allAgreed ? (
            <p className="text-amber-400 text-sm mt-2">
              All crew members must agree before submitting ({Object.values(syncedAgreements).filter(Boolean).length}/{allPlayers.length} agreed)
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Level4);
