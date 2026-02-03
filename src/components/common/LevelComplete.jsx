import React from 'react';
import { CheckCircle2, ChevronRight, Target, Rocket, FlaskConical, FileText, Clock, Users } from 'lucide-react';

const levelConfig = {
  1: {
    name: 'Success Criteria',
    nextName: 'Pretrial Checklist',
    badge: { name: 'Criteria Master', emoji: '🎯' },
    icon: Target,
    color: 'cyan',
    trainingMessage: 'Before moving on, discuss with your team: What makes these success criteria most important for the trial?',
  },
  2: {
    name: 'Pretrial Checklist',
    nextName: 'Sampling Plan',
    badge: { name: 'Launch Engineer', emoji: '🚀' },
    icon: Rocket,
    color: 'orange',
    trainingMessage: 'Take a moment to reflect: How did your team coordination work? What communication strategies helped?',
  },
  3: {
    name: 'Sampling Plan',
    nextName: 'Mission Report',
    badge: { name: 'Sampling Specialist', emoji: '🧪' },
    icon: FlaskConical,
    color: 'green',
    trainingMessage: 'Discuss with your team: How did you prioritize which tests to run? What tradeoffs did you make with your sample budget?',
  },
  4: {
    name: 'Mission Report',
    nextName: null,
    badge: { name: 'Mission Commander', emoji: '🎖️' },
    icon: FileText,
    color: 'amber',
    trainingMessage: 'Final debrief: What did you learn about plant trial preparation? How will you apply this to real trials?',
  },
};

const colorClasses = {
  cyan: { bg: 'bg-cyan-900/30', border: 'border-cyan-500', text: 'text-cyan-400', button: 'bg-cyan-600 hover:bg-cyan-500' },
  orange: { bg: 'bg-orange-900/30', border: 'border-orange-500', text: 'text-orange-400', button: 'bg-orange-600 hover:bg-orange-500' },
  green: { bg: 'bg-green-900/30', border: 'border-green-500', text: 'text-green-400', button: 'bg-green-600 hover:bg-green-500' },
  amber: { bg: 'bg-amber-900/30', border: 'border-amber-500', text: 'text-amber-400', button: 'bg-amber-600 hover:bg-amber-500' },
};

const LevelComplete = ({ level, score, onContinue, customMessage }) => {
  const config = levelConfig[level] || levelConfig[1];
  const colors = colorClasses[config.color];
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border border-green-500/50 p-8 text-center shadow-2xl">
          <div className="mb-6">
            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto border-2 border-green-500/50">
              <CheckCircle2 className="w-14 h-14 text-green-400" />
            </div>
          </div>

          <h2 className="text-4xl font-bold text-green-400 mb-2">
            Level {level} Complete!
          </h2>
          <div className="flex items-center justify-center gap-2 mb-6">
            <Icon className={`w-5 h-5 ${colors.text}`} />
            <p className={`text-lg ${colors.text}`}>{config.name}</p>
          </div>

          {score !== undefined && score !== null && (
            <div className="bg-slate-900/50 rounded-xl p-4 mb-6">
              <p className="text-slate-500 text-sm">Level Score</p>
              <p className="text-5xl font-bold text-cyan-400">{score} <span className="text-2xl text-cyan-600">PTS</span></p>
            </div>
          )}

          <div className={`${colors.bg} border ${colors.border} rounded-xl p-4 mb-6`}>
            <p className={`${colors.text} text-sm mb-2`}>Badge Earned</p>
            <div className="text-5xl mb-2">{config.badge.emoji}</div>
            <p className="text-white font-semibold text-lg">{config.badge.name}</p>
          </div>

          <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Users className="w-5 h-5 text-purple-400" />
              <p className="text-purple-300 font-semibold">Team Discussion</p>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              {customMessage || config.trainingMessage}
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 text-slate-500 text-xs">
              <Clock className="w-4 h-4" />
              <span>Take time for team discussion before continuing</span>
            </div>
          </div>

          {level < 4 ? (
            <button
              onClick={onContinue}
              className={`w-full ${colors.button} py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 flex items-center justify-center gap-3 shadow-lg`}
            >
              Continue to {config.nextName}
              <ChevronRight className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={onContinue}
              className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg"
            >
              View Mission Certificate
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LevelComplete;
