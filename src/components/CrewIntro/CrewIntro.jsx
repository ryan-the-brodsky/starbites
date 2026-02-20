import React, { useState, useEffect } from 'react';
import { Rocket, Users, ChevronRight, FlaskConical, Package, ShieldCheck } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { getPlayerCharacter, ASTRONAUT_STYLES } from '../../data/characters';

// Role info for display
const ROLE_INFO = {
  productDev: { name: 'Product Developer', icon: FlaskConical, color: 'cyan' },
  packageDev: { name: 'Package Developer', icon: Package, color: 'orange' },
  quality: { name: 'Quality', icon: ShieldCheck, color: 'green' },
};

// Cute astronaut avatar component
const AstronautAvatar = ({ character, size = 'large', isYou = false }) => {
  const sizeClasses = {
    large: 'w-32 h-40',
    medium: 'w-20 h-24',
    small: 'w-14 h-18',
  };

  const helmetSizes = {
    large: 'w-28 h-28',
    medium: 'w-16 h-16',
    small: 'w-12 h-12',
  };

  const visorSizes = {
    large: 'w-20 h-14 text-2xl',
    medium: 'w-12 h-8 text-sm',
    small: 'w-8 h-6 text-xs',
  };

  const bodySizes = {
    large: 'w-24 h-16',
    medium: 'w-14 h-10',
    small: 'w-10 h-7',
  };

  const badgeSizes = {
    large: 'text-lg top-2 right-2',
    medium: 'text-xs top-1 right-1',
    small: 'text-[8px] top-0.5 right-0.5',
  };

  const style = character.style || ASTRONAUT_STYLES.productDev;
  const face = character.face || { eyes: '◠ ◠', mouth: '‿' };

  return (
    <div className={`${sizeClasses[size]} flex flex-col items-center relative`}>
      {/* Glow effect for "You" */}
      {isYou && (
        <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl animate-pulse" />
      )}

      {/* Helmet */}
      <div className={`${helmetSizes[size]} ${style.helmet} rounded-full relative flex items-center justify-center shadow-lg`}>
        {/* Helmet shine */}
        <div className="absolute top-2 left-2 w-4 h-4 bg-white/30 rounded-full" />

        {/* Badge on helmet */}
        <span className={`absolute ${badgeSizes[size]} ${style.accent} rounded-full w-5 h-5 flex items-center justify-center`}>
          {character.badge}
        </span>

        {/* Visor */}
        <div className={`${visorSizes[size]} ${style.visor} rounded-lg flex flex-col items-center justify-center`}>
          {/* Face */}
          <div className="text-white leading-none">
            <div className="tracking-widest">{face.eyes}</div>
            <div className="text-center">{face.mouth}</div>
          </div>
        </div>
      </div>

      {/* Body/Suit */}
      <div className={`${bodySizes[size]} ${style.suit} rounded-b-2xl rounded-t-lg -mt-2 relative`}>
        {/* Suit details */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 flex gap-0.5">
          <div className={`w-1.5 h-1.5 ${style.accent} rounded-full`} />
          <div className={`w-1.5 h-1.5 ${style.accent} rounded-full`} />
        </div>
        {/* Role icon on suit */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-white/70">
          {size === 'large' && <span className="text-2xl">{character.emoji}</span>}
        </div>
      </div>
    </div>
  );
};

const CrewIntro = ({ onContinue }) => {
  const { gameState, playerId, functionalRole, isCommander } = useGame();
  const [showCrew, setShowCrew] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);

  const myCharacter = getPlayerCharacter(playerId, functionalRole, gameState?.players);
  const allPlayers = Object.entries(gameState?.players || {});
  const otherPlayers = allPlayers.filter(([pid]) => pid !== playerId);

  // Animate in sequence
  useEffect(() => {
    const timer1 = setTimeout(() => setAnimationStep(1), 500);
    const timer2 = setTimeout(() => setAnimationStep(2), 1500);
    const timer3 = setTimeout(() => setShowCrew(true), 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const roleInfo = ROLE_INFO[functionalRole] || ROLE_INFO.productDev;
  const RoleIcon = roleInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-white flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Stars background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Title */}
        <div className={`transition-all duration-1000 ${animationStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-2">
            Welcome to the Mission!
          </h1>
          <p className="text-slate-400 text-lg">Team: {gameState?.meta?.teamName}</p>
        </div>

        {/* Your character - big reveal */}
        <div className={`mt-8 mb-10 transition-all duration-1000 ${animationStep >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
          <p className="text-slate-400 text-sm mb-4">You are...</p>

          <div className="flex flex-col items-center">
            <AstronautAvatar character={myCharacter} size="large" isYou={true} />

            <div className="mt-4">
              <h2 className="text-3xl font-bold text-white mb-1">{myCharacter.name}</h2>
              <p className="text-lg text-slate-400">{myCharacter.title}</p>

              <div className={`inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full bg-${roleInfo.color}-900/50 border border-${roleInfo.color}-500/50`}>
                <RoleIcon className={`w-5 h-5 text-${roleInfo.color}-400`} />
                <span className={`text-${roleInfo.color}-300 font-medium`}>{roleInfo.name}</span>
                {isCommander && (
                  <span className="ml-2 text-xs text-amber-400 bg-amber-900/50 px-2 py-0.5 rounded-full">Commander</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Crew members */}
        {showCrew && otherPlayers.length > 0 && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Users className="w-5 h-5 text-slate-400" />
              <h3 className="text-xl font-medium text-slate-300">Your Crew</h3>
            </div>

            <div className="flex flex-wrap justify-center gap-6">
              {otherPlayers.map(([pid, playerData], idx) => {
                const playerCharacter = getPlayerCharacter(pid, playerData.functionalRole, gameState?.players);
                const playerRoleInfo = ROLE_INFO[playerData.functionalRole] || ROLE_INFO.productDev;
                const PlayerRoleIcon = playerRoleInfo.icon;

                return (
                  <div
                    key={pid}
                    className="flex flex-col items-center p-4 bg-slate-800/50 rounded-xl border border-slate-700 animate-fade-in"
                    style={{ animationDelay: `${idx * 200}ms` }}
                  >
                    <AstronautAvatar character={playerCharacter} size="medium" />
                    <h4 className="mt-2 font-medium text-white text-sm">{playerCharacter.name}</h4>
                    <p className="text-xs text-slate-500">{playerCharacter.title}</p>
                    <div className={`flex items-center gap-1 mt-1 text-xs text-${playerRoleInfo.color}-400`}>
                      <PlayerRoleIcon className="w-3 h-3" />
                      <span>{playerRoleInfo.name}</span>
                    </div>
                    {playerData.role === 'commander' && (
                      <span className="text-[10px] text-amber-400 mt-1">Commander</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Continue button */}
        {showCrew && (
          <div className="mt-10 animate-fade-in" style={{ animationDelay: '500ms' }}>
            <button
              onClick={onContinue}
              className="group px-8 py-4 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 rounded-xl font-bold text-lg transition-all hover:scale-105 flex items-center gap-3 mx-auto"
            >
              <Rocket className="w-6 h-6 group-hover:animate-bounce" />
              Begin Mission
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CrewIntro;
