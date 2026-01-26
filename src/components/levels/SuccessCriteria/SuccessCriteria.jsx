import React, { useState } from 'react';
import { Target, FileText, CheckCircle2, AlertTriangle, Triangle, ChevronDown, ChevronUp, FlaskConical, Info } from 'lucide-react';
import { useGame } from '../../../contexts/GameContext';
import {
  dfmeaSummary,
  uxPyramidSummary,
  successCriteriaOptions
} from '../../../data/missionData';

const SuccessCriteria = () => {
  const { updateLevelState, completeLevel } = useGame();
  const [selectedCriteria, setSelectedCriteria] = useState([]);
  const [expandedDfmea, setExpandedDfmea] = useState(false);
  const [expandedUx, setExpandedUx] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const MAX_CRITERIA = 4;

  const toggleCriteria = (criteriaId) => {
    setSelectedCriteria(prev => {
      if (prev.includes(criteriaId)) {
        return prev.filter(id => id !== criteriaId);
      }
      if (prev.length >= MAX_CRITERIA) {
        return prev; // Don't add more than max
      }
      return [...prev, criteriaId];
    });
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'dfmea':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'uxpyramid':
        return <Triangle className="w-4 h-4 text-purple-400" />;
      case 'both':
        return (
          <div className="flex gap-1">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <Triangle className="w-4 h-4 text-purple-400" />
          </div>
        );
      default:
        return <Target className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getSourceLabel = (source) => {
    switch (source) {
      case 'dfmea':
        return 'DFMEA';
      case 'uxpyramid':
        return 'UX Pyramid';
      case 'both':
        return 'DFMEA + UX';
      default:
        return 'Operational';
    }
  };

  const handleSubmit = () => {
    const selectedCriteriaData = selectedCriteria.map(id =>
      successCriteriaOptions.find(c => c.id === id)
    );

    updateLevelState('level1', {
      selectedCriteria: selectedCriteriaData,
      completedAt: Date.now(),
    });
    setIsSubmitted(true);
    setTimeout(() => completeLevel(1), 2500);
  };

  if (isSubmitted) {
    const selectedData = selectedCriteria.map(id => successCriteriaOptions.find(c => c.id === id));
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-950 to-slate-950 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-4">
          <div className="text-8xl mb-6">🎯</div>
          <h2 className="text-4xl font-bold text-cyan-400 mb-4">SUCCESS CRITERIA SET!</h2>
          <p className="text-slate-300 mb-6">Your selected criteria will guide your sampling plan and final analysis.</p>
          <div className="bg-slate-800/50 rounded-xl p-4 mb-6 text-left">
            <h3 className="text-sm text-slate-400 mb-3 text-center">Your 4 Success Criteria:</h3>
            <ul className="space-y-2">
              {selectedData.map((c, i) => (
                <li key={c.id} className="flex items-start gap-2 text-sm text-cyan-300">
                  <span className="text-cyan-500 font-mono flex-shrink-0">{i + 1}.</span>
                  <span>{c.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-slate-400">Proceeding to Pretrial Checklist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-cyan-950 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">Level 1: Define Success Criteria</h1>
          <p className="text-slate-400">Select exactly 4 criteria that will define mission success for the Star Bites trial</p>
        </div>

        {/* Key Instruction */}
        <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-xl p-4 border border-cyan-700/50 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-cyan-200">
                <strong>Important:</strong> You can only focus on 4 criteria during this trial. Choose wisely based on the DFMEA risks
                and UX Pyramid priorities below. Your success criteria will determine what you need to measure in Level 3 (Sampling Plan)
                and how you'll be evaluated in Level 4 (Mission Report).
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* DFMEA Summary Panel */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            <button
              onClick={() => setExpandedDfmea(!expandedDfmea)}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
                <div className="text-left">
                  <h3 className="font-semibold text-amber-300">{dfmeaSummary.title}</h3>
                  <p className="text-sm text-slate-400">{dfmeaSummary.failureModes.length} failure modes identified</p>
                </div>
              </div>
              {expandedDfmea ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {expandedDfmea && (
              <div className="p-4 pt-0 space-y-3">
                <p className="text-sm text-slate-400 mb-3">{dfmeaSummary.description}</p>
                {dfmeaSummary.failureModes.map((fm) => (
                  <div key={fm.id} className="bg-slate-900/50 rounded-lg p-3 border border-amber-900/30">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-amber-200">{fm.mode}</span>
                      <span className="text-xs bg-amber-900/50 text-amber-300 px-2 py-0.5 rounded">RPN: {fm.rpn}</span>
                    </div>
                    <p className="text-sm text-slate-400">Cause: {fm.cause}</p>
                    <p className="text-sm text-slate-400">Effect: {fm.effect}</p>
                    <p className="text-xs text-cyan-400 mt-1">Control: {fm.control}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* UX Pyramid Summary Panel */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            <button
              onClick={() => setExpandedUx(!expandedUx)}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Triangle className="w-6 h-6 text-purple-400" />
                <div className="text-left">
                  <h3 className="font-semibold text-purple-300">{uxPyramidSummary.title}</h3>
                  <p className="text-sm text-slate-400">{uxPyramidSummary.levels.length} levels of consumer needs</p>
                </div>
              </div>
              {expandedUx ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {expandedUx && (
              <div className="p-4 pt-0 space-y-3">
                <p className="text-sm text-slate-400 mb-3">{uxPyramidSummary.description}</p>
                {uxPyramidSummary.levels.map((level, index) => (
                  <div key={level.level} className="bg-slate-900/50 rounded-lg p-3 border border-purple-900/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        index === 0 ? 'bg-green-900/50 text-green-300' :
                        index === 1 ? 'bg-blue-900/50 text-blue-300' :
                        index === 2 ? 'bg-yellow-900/50 text-yellow-300' :
                        'bg-pink-900/50 text-pink-300'
                      }`}>
                        {level.level}
                      </span>
                      <span className="font-medium text-purple-200">{level.name}</span>
                    </div>
                    <ul className="text-sm text-slate-400 space-y-1">
                      {level.needs.map((need, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-purple-400 mt-1">•</span>
                          {need}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Success Criteria Selection */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-cyan-400" />
              <div>
                <h3 className="text-xl font-semibold">Select Your Success Criteria</h3>
                <p className="text-sm text-slate-400">Choose exactly {MAX_CRITERIA} criteria to focus on during the trial</p>
              </div>
            </div>
            <div className={`text-lg font-bold px-4 py-2 rounded-lg ${
              selectedCriteria.length === MAX_CRITERIA
                ? 'bg-green-900/50 text-green-300'
                : 'bg-slate-700 text-slate-300'
            }`}>
              {selectedCriteria.length} / {MAX_CRITERIA} selected
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {successCriteriaOptions.map((criteria) => {
              const isSelected = selectedCriteria.includes(criteria.id);
              const isDisabled = !isSelected && selectedCriteria.length >= MAX_CRITERIA;

              return (
                <div
                  key={criteria.id}
                  onClick={() => !isDisabled && toggleCriteria(criteria.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-900/30'
                      : isDisabled
                        ? 'border-slate-700 bg-slate-900/30 opacity-50 cursor-not-allowed'
                        : 'border-slate-700 bg-slate-900/50 hover:border-slate-500 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'border-cyan-400 bg-cyan-500' : 'border-slate-500'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm mb-2">{criteria.text}</p>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          {getSourceIcon(criteria.source)}
                          <span className="text-xs text-slate-500">{getSourceLabel(criteria.source)}</span>
                        </div>
                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">{criteria.category}</span>
                      </div>
                      {/* Show what measurements are needed */}
                      {isSelected && criteria.requiredMeasurements && (
                        <div className="mt-2 pt-2 border-t border-slate-700">
                          <div className="flex items-center gap-1 text-xs text-green-400 mb-1">
                            <FlaskConical className="w-3 h-3" />
                            <span>Required measurements:</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {criteria.requiredMeasurements.map((m, i) => (
                              <span key={i} className="text-xs bg-green-900/30 text-green-300 px-1.5 py-0.5 rounded">
                                {m.description}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleSubmit}
            disabled={selectedCriteria.length !== MAX_CRITERIA}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
          >
            Confirm Success Criteria
          </button>
          {selectedCriteria.length !== MAX_CRITERIA && (
            <p className="text-slate-500 text-sm mt-2">
              Select {MAX_CRITERIA - selectedCriteria.length} more criteria to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuccessCriteria;
