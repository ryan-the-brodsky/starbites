import React from 'react';
import { Rocket, Star, Award, BarChart2 } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';

const badges = [
  { id: 'criteria-master', name: 'Criteria Master', icon: Star, level: 1, color: 'text-cyan-400' },
  { id: 'sampling-specialist', name: 'Sampling Specialist', icon: BarChart2, level: 2, color: 'text-green-400' },
  { id: 'mission-commander', name: 'Mission Commander', icon: Award, level: 3, color: 'text-amber-400' },
];

const Certificate = () => {
  const { gameState } = useGame();
  const earnedBadges = gameState?.badges || [];
  const totalScore = gameState?.meta?.totalScore || 0;
  const teamName = gameState?.meta?.teamName || 'Unknown Team';

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-8">
      {/* Stars background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.8 + 0.2
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-2xl w-full">
        {/* Certificate */}
        <div className="bg-gradient-to-b from-slate-800/90 to-slate-900/90 backdrop-blur rounded-2xl border-4 border-amber-500/50 p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Rocket className="w-16 h-16 text-cyan-400 transform -rotate-45" />
                <Star className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
              MISSION ACCOMPLISHED
            </h1>
            <p className="text-slate-400 mt-2">Certificate of Completion</p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
            <Star className="w-4 h-4 text-amber-400" />
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          </div>

          {/* Team Name */}
          <div className="text-center mb-8">
            <p className="text-slate-400 text-sm mb-1">This certifies that</p>
            <h2 className="text-3xl font-bold text-white">{teamName}</h2>
            <p className="text-slate-400 text-sm mt-2">
              has successfully completed all mission objectives
            </p>
          </div>

          {/* Score */}
          <div className="text-center mb-8">
            <p className="text-slate-400 text-sm">Final Score</p>
            <div className="text-5xl font-bold text-cyan-400">{totalScore.toLocaleString()}</div>
            <p className="text-slate-500 text-sm">points</p>
          </div>

          {/* Badges */}
          <div className="mb-8">
            <p className="text-slate-400 text-sm text-center mb-4">Badges Earned</p>
            <div className="flex justify-center gap-4">
              {badges.map(badge => {
                const earned = earnedBadges.includes(badge.id);
                const Icon = badge.icon;
                return (
                  <div
                    key={badge.id}
                    className={`flex flex-col items-center ${earned ? '' : 'opacity-30'}`}
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      earned
                        ? 'bg-slate-700/50 border-2 border-amber-500/50'
                        : 'bg-slate-800/50 border border-slate-700'
                    }`}>
                      <Icon className={`w-8 h-8 ${earned ? badge.color : 'text-slate-600'}`} />
                    </div>
                    <span className={`text-xs mt-2 text-center ${earned ? 'text-slate-300' : 'text-slate-600'}`}>
                      {badge.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Mission North Star</span>
            <span>Joy Bites Training 2026</span>
            <span>Danone North America</span>
          </div>
        </div>

        {/* Screenshot hint */}
        <p className="text-center text-slate-500 text-sm mt-6">
          Take a screenshot to save your certificate
        </p>
      </div>
    </div>
  );
};

export default Certificate;
