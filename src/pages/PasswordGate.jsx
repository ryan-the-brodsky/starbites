import React, { useState } from 'react';
import { Rocket, Star, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const PasswordGate = ({ onSuccess, isAdminGate = false }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, loginAdmin } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const success = isAdminGate ? loginAdmin(password) : login(password);

    if (success) {
      onSuccess?.();
    } else {
      setError('Access denied. Please check your password.');
      setPassword('');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-center p-6">
      {/* Stars background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(80)].map((_, i) => (
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

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Rocket className="w-16 h-16 text-cyan-400 transform -rotate-45" />
              <Star className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            MISSION NORTH STAR
          </h1>
          <p className="text-slate-400">
            {isAdminGate ? 'Mission Control Access' : 'Enter Access Code to Begin'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock className={`w-5 h-5 ${isAdminGate ? 'text-amber-400' : 'text-cyan-400'}`} />
            <span className="text-slate-300 font-medium">
              {isAdminGate ? 'Admin Password' : 'Mission Access Code'}
            </span>
          </div>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isAdminGate ? 'Enter admin password' : 'Enter access code'}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono text-lg tracking-widest mb-4"
            autoFocus
          />

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm mb-4">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !password}
            className={`w-full py-3 rounded-lg font-semibold transition-all ${
              isAdminGate
                ? 'bg-amber-600 hover:bg-amber-500 disabled:bg-slate-600'
                : 'bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600'
            } disabled:cursor-not-allowed`}
          >
            {isSubmitting ? 'Verifying...' : 'Enter Mission'}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          Joy Bites Training Game - Danone North America 2026
        </p>
      </div>
    </div>
  );
};

export default PasswordGate;
