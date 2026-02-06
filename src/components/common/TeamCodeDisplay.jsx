import React, { useState } from 'react';
import { Copy, CheckCircle2 } from 'lucide-react';

const TeamCodeDisplay = ({ teamCode, teamName }) => {
  const [copied, setCopied] = useState(false);

  const joinUrl = `${window.location.origin}/`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(teamName || teamCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = teamName || teamCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-cyan-500/50 text-center">
      <p className="text-sm text-slate-400 mb-2">Team Name</p>
      <div className="text-3xl font-bold font-mono text-cyan-400 mb-4 tracking-wider">
        {teamName || teamCode}
      </div>
      <button
        onClick={handleCopy}
        className={`flex items-center gap-2 mx-auto px-4 py-2 rounded-lg transition-colors ${
          copied
            ? 'bg-green-900/50 border border-green-500 text-green-300'
            : 'bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300'
        }`}
      >
        {copied ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            Copy Team Name
          </>
        )}
      </button>
      <p className="text-xs text-slate-500 mt-3">
        Share this team name with your teammates so they can join at: <span className="text-cyan-400">{joinUrl}</span>
      </p>
    </div>
  );
};

export default TeamCodeDisplay;
