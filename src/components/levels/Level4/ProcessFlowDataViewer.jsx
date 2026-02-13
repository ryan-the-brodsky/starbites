import React, { useState, useMemo } from 'react';
import { ArrowRight, ArrowDown, BarChart3, AlertTriangle, XCircle, CheckCircle2, ChevronDown, ChevronUp, FlaskConical, MessageCircle, X } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Legend } from 'recharts';
import { processSteps, testOptions, alternateValidationPaths } from '../../../data/processDefinitions';

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

// Scatter plot component for a single test (memoized to prevent re-render when props unchanged)
const TestScatterPlot = React.memo(({ testId, scatterPoints, spec }) => {
  if (!scatterPoints || scatterPoints.length === 0) return null;

  const specMin = spec.nominal - spec.variance;
  const specMax = spec.nominal + spec.variance;

  const allValues = scatterPoints.map(p => p.y);
  const minVal = Math.min(...allValues, specMin);
  const maxVal = Math.max(...allValues, specMax);
  const padding = (maxVal - minVal) * 0.2;
  const yMin = minVal - padding;
  const yMax = maxVal + padding;

  const inSpecPoints = useMemo(() => scatterPoints.filter(p => p.inSpec), [scatterPoints]);
  const outOfSpecPoints = useMemo(() => scatterPoints.filter(p => !p.inSpec), [scatterPoints]);

  return (
    <div className="h-72">
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

          <ReferenceLine y={specMax} stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={2} />
          <ReferenceLine y={specMin} stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={2} />
          <ReferenceLine y={spec.nominal} stroke="#06b6d4" strokeDasharray="2 2" strokeOpacity={0.5} />

          <ReferenceLine x={30} stroke="#475569" strokeDasharray="2 2" />
          <ReferenceLine x={60} stroke="#475569" strokeDasharray="2 2" />
          <ReferenceLine x={90} stroke="#475569" strokeDasharray="2 2" />
          <ReferenceLine x={120} stroke="#475569" strokeDasharray="2 2" />
          <ReferenceLine x={150} stroke="#475569" strokeDasharray="2 2" />

          {inSpecPoints.length > 0 && (
            <Scatter name="In Spec" data={inSpecPoints} fill="#22c55e" shape="circle" />
          )}
          {outOfSpecPoints.length > 0 && (
            <Scatter name="Out of Spec" data={outOfSpecPoints} fill="#ef4444" shape="diamond" />
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
});

// Get step status based on data
const getStepStatus = (stepId, generatedData, anomalies) => {
  const stepData = generatedData[stepId];
  if (!stepData || Object.keys(stepData).length === 0) return 'no-data';
  const stepAnomalies = anomalies.filter(a => a.step === stepId);
  if (stepAnomalies.some(a => a.severity === 'critical')) return 'critical';
  if (stepAnomalies.length > 0) return 'warning';
  return 'ok';
};

const statusColors = {
  'no-data': { dot: 'bg-slate-500', border: 'border-slate-600', bg: 'bg-slate-800/50', text: 'text-slate-400' },
  'ok': { dot: 'bg-green-500', border: 'border-green-500', bg: 'bg-green-900/30', text: 'text-green-400' },
  'warning': { dot: 'bg-amber-500', border: 'border-amber-500', bg: 'bg-amber-900/30', text: 'text-amber-400' },
  'critical': { dot: 'bg-red-500', border: 'border-red-500', bg: 'bg-red-900/30', text: 'text-red-400' },
};

const ProcessFlowDataViewer = ({
  generatedData,
  scatterData,
  anomalies,
  conversationalData,
  testSpecs,
  timePointLabels,
}) => {
  const [selectedStep, setSelectedStep] = useState(null);

  const handleStepClick = (stepId) => {
    setSelectedStep(prev => prev === stepId ? null : stepId);
  };

  // Render a step button in the flow diagram
  const renderStepButton = (step, isAlternate = false) => {
    const Icon = step.icon;
    const status = step.isConversational
      ? (conversationalData.length > 0 ? 'ok' : 'no-data')
      : getStepStatus(step.id, generatedData, anomalies);
    const colors = statusColors[status];
    const isSelected = selectedStep === step.id;

    return (
      <button
        key={step.id}
        onClick={() => handleStepClick(step.id)}
        className={`relative flex flex-col items-center p-2 sm:p-3 rounded-xl border-2 transition-all hover:scale-105 ${
          isAlternate ? 'border-dashed' : ''
        } ${
          isSelected
            ? 'border-cyan-400 bg-cyan-900/40 shadow-lg shadow-cyan-500/20'
            : `${colors.border} ${colors.bg}`
        } ${isAlternate ? 'min-w-[80px] sm:min-w-[90px]' : 'sm:min-w-[100px]'}`}
      >
        {/* Status dot */}
        <div className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full ${colors.dot} flex items-center justify-center`}>
          {status === 'critical' && <XCircle className="w-3 h-3 text-white" />}
          {status === 'warning' && <AlertTriangle className="w-2.5 h-2.5 text-white" />}
          {status === 'ok' && <CheckCircle2 className="w-3 h-3 text-white" />}
        </div>

        <div className={`p-1.5 sm:p-2 rounded-lg mb-1 sm:mb-2 ${
          isAlternate ? 'bg-purple-500/20' : status === 'no-data' ? 'bg-slate-700' : `${colors.bg}`
        }`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isAlternate ? 'text-purple-400' : colors.text}`} />
        </div>
        <span className={`text-[10px] sm:text-xs font-medium text-center ${isAlternate ? 'text-purple-300' : ''}`}>
          {step.name}
        </span>
        <span className="text-[9px] sm:text-[10px] text-slate-500 text-center">{step.description}</span>
      </button>
    );
  };

  // Find the step data object for the selected step
  const selectedStepDef = selectedStep
    ? processSteps.find(s => s.id === selectedStep) || alternateValidationPaths.find(s => s.id === selectedStep)
    : null;

  return (
    <div className="bg-slate-800/50 rounded-xl p-3 sm:p-6 border border-slate-700 mb-4 sm:mb-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 flex-shrink-0" />
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-semibold">Trial Production Data</h2>
            <p className="text-xs sm:text-sm text-slate-400">Click a process step to view its data</p>
          </div>
        </div>
      </div>

      {/* Process Flow Diagram */}
      <div className="space-y-2 sm:space-y-3 mb-4">
        {/* Top row: steps 1-4 */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-center sm:gap-2">
          {processSteps.slice(0, 4).map((step, index) => (
            <React.Fragment key={step.id}>
              {renderStepButton(step)}
              {/* Arrow between steps - visible on both mobile and desktop */}
              {index < 3 && (
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 flex-shrink-0 hidden sm:block" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Mobile arrows for top row: show flow direction */}
        <div className="flex justify-center sm:hidden">
          <div className="flex items-center gap-1 text-slate-500">
            <span className="text-[9px]">1</span>
            <ArrowRight className="w-3 h-3" />
            <span className="text-[9px]">2</span>
            <ArrowRight className="w-3 h-3" />
            <span className="text-[9px]">3</span>
            <ArrowRight className="w-3 h-3" />
            <span className="text-[9px]">4</span>
          </div>
        </div>

        {/* Alternate Path: Operator Conversation (branches off Heating/Gelling) */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2 sm:ml-auto sm:mr-16">
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-3 border-l-2 border-dashed border-purple-400/60" />
            </div>
            {renderStepButton(alternateValidationPaths[0], true)}
          </div>
        </div>

        {/* Connector arrow down */}
        <div className="flex justify-center sm:justify-end sm:pr-12">
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-3 bg-slate-500" />
            <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
          </div>
        </div>

        {/* Bottom row: steps 5-8 (reversed on desktop for flow, normal grid on mobile) */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-center sm:gap-2 sm:flex-row-reverse">
          {processSteps.slice(4, 8).map((step, index) => (
            <React.Fragment key={step.id}>
              {renderStepButton(step)}
              {index < 3 && (
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 flex-shrink-0 rotate-180 hidden sm:block" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Mobile arrows for bottom row: show flow direction */}
        <div className="flex justify-center sm:hidden">
          <div className="flex items-center gap-1 text-slate-500">
            <span className="text-[9px]">5</span>
            <ArrowRight className="w-3 h-3" />
            <span className="text-[9px]">6</span>
            <ArrowRight className="w-3 h-3" />
            <span className="text-[9px]">7</span>
            <ArrowRight className="w-3 h-3" />
            <span className="text-[9px]">8</span>
          </div>
        </div>

        {/* Alternate Path: Shelf Life Validation (branches off QC Release) */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2 sm:ml-16">
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-3 border-l-2 border-dashed border-purple-400/60" />
            </div>
            {renderStepButton(alternateValidationPaths[1], true)}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 text-[10px] sm:text-xs text-slate-500 mb-4">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> All in-spec</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Minor issues</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Critical anomaly</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" /> No data</span>
      </div>

      {/* No step selected prompt */}
      {!selectedStep && Object.keys(generatedData).length > 0 && (
        <div className="bg-slate-900/30 rounded-lg p-4 text-center border border-dashed border-slate-600">
          <FlaskConical className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-sm text-slate-400">Click on a process step above to view its data</p>
        </div>
      )}

      {/* No data at all */}
      {Object.keys(generatedData).length === 0 && conversationalData.length === 0 && (
        <div className="text-center py-6 text-slate-500">
          <FlaskConical className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>No sampling data available</p>
          <p className="text-xs">Your sampling plan didn't collect any data</p>
        </div>
      )}

      {/* Selected Step Detail Panel */}
      {selectedStep && selectedStepDef && (
        <div className={`bg-slate-900/50 rounded-lg p-3 sm:p-4 border ${
          selectedStepDef.isConversational ? 'border-purple-500' : 'border-cyan-500'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {(() => {
                const Icon = selectedStepDef.icon;
                return <Icon className={`w-5 h-5 ${selectedStepDef.isConversational ? 'text-purple-400' : 'text-cyan-400'}`} />;
              })()}
              <div>
                <h3 className={`text-sm sm:text-base font-semibold ${selectedStepDef.isConversational ? 'text-purple-300' : 'text-cyan-300'}`}>
                  {selectedStepDef.name}
                </h3>
                <p className="text-xs text-slate-500">{selectedStepDef.description}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedStep(null)}
              className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Conversational data display */}
          {selectedStepDef.isConversational ? (
            conversationalData.length > 0 ? (
              <div className="space-y-3">
                {conversationalData.map((cd, i) => (
                  <div
                    key={i}
                    className={`rounded-lg p-3 border ${
                      cd.isPositive
                        ? 'bg-green-900/20 border-green-700/50'
                        : 'bg-red-900/20 border-red-700/50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        cd.isPositive ? 'bg-green-600/30' : 'bg-red-600/30'
                      }`}>
                        <MessageCircle className={`w-3.5 h-3.5 ${cd.isPositive ? 'text-green-400' : 'text-red-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                          {cd.category}
                        </span>
                        <p className="text-xs text-slate-500 mt-1 italic">
                          Q: "{cd.question}"
                        </p>
                        <p className={`text-sm font-medium mt-1 ${cd.isPositive ? 'text-green-300' : 'text-red-300'}`}>
                          {cd.speaker}:
                        </p>
                        <p className="text-sm text-slate-200 mt-0.5">
                          "{cd.quote}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">No operator questions were asked during the trial.</p>
            )
          ) : (
            // Instrumental data display for selected step
            generatedData[selectedStep] ? (
              <>
                {/* Summary Table */}
                <div className="overflow-x-auto mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-400">
                        <th className="text-left pb-2">Test</th>
                        {Object.keys(Object.values(generatedData[selectedStep])[0] || {}).map(tp => (
                          <th key={tp} className="text-center pb-2 text-xs sm:text-sm">{timePointLabels[tp] || tp}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(generatedData[selectedStep]).map(([testId, testData]) => (
                        <tr key={testId} className="border-t border-slate-700">
                          <td className="py-2 font-medium text-slate-300 text-xs sm:text-sm">
                            {testOptions[testId]?.name || testId}
                          </td>
                          {Object.entries(testData).map(([tp, result]) => (
                            <td key={tp} className="py-2 text-center">
                              <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm ${
                                result.inSpec
                                  ? 'bg-green-900/30 text-green-300'
                                  : 'bg-red-900/30 text-red-300'
                              }`}>
                                {result.value} {result.unit}
                              </span>
                              <div className="text-[10px] sm:text-xs text-slate-500 mt-1">
                                n={result.sampleCount}
                                {!result.inSpec && ` - Expected: ${result.expected}`}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Anomalies for this step */}
                {(() => {
                  const stepAnomalies = anomalies.filter(a => a.step === selectedStep);
                  if (stepAnomalies.length === 0) return null;
                  return (
                    <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-3 mb-4">
                      <h4 className="text-xs font-medium text-red-300 mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Anomalies at {selectedStepDef.name} ({stepAnomalies.length})
                      </h4>
                      <ul className="text-xs space-y-1">
                        {stepAnomalies.map((a, i) => (
                          <li key={i} className={`flex items-center gap-1.5 ${a.severity === 'critical' ? 'text-red-300' : 'text-amber-300'}`}>
                            {a.severity === 'critical' ? <XCircle className="w-3 h-3 flex-shrink-0" /> : <AlertTriangle className="w-3 h-3 flex-shrink-0" />}
                            {testOptions[a.test]?.name || a.test}: {a.value} {a.unit}
                            <span className="text-slate-500">(expected {a.expected}, n={a.sampleCount})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })()}

                {/* Scatter Plots */}
                <div className="space-y-4 pt-3 border-t border-slate-700">
                  <h4 className="text-xs font-medium text-slate-400">Sample Data Plots</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(generatedData[selectedStep]).map(([testId, testData]) => {
                      const scatterPoints = scatterData[selectedStep]?.[testId] || [];
                      const spec = testSpecs[testId];
                      if (!spec || scatterPoints.length === 0) return null;

                      return (
                        <div key={testId} className="bg-slate-800/50 rounded-lg p-3">
                          <h5 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                            {testOptions[testId]?.name || testId}
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
              </>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">No data was collected at this step.</p>
            )
          )}
        </div>
      )}

    </div>
  );
};

export default React.memo(ProcessFlowDataViewer);
