import React, { useState } from 'react';
import { Plus, Users, CheckCircle2, AlertTriangle } from 'lucide-react';
import { createGameInDB, getGameFromDB } from '../../firebase';
import { createInitialGameState } from '../../contexts/GameContext';

const BatchTeamCreation = ({ useFirebase, onTeamsCreated }) => {
  const [prefix, setPrefix] = useState('Team');
  const [count, setCount] = useState(5);
  const [startNumber, setStartNumber] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [createdTeams, setCreatedTeams] = useState([]);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    setIsCreating(true);
    setError('');
    const teams = [];

    for (let i = 0; i < count; i++) {
      const num = startNumber + i;
      const teamName = `${prefix} ${num}`;
      const teamId = teamName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');

      try {
        // Check if team exists
        if (useFirebase) {
          const existing = await getGameFromDB(teamId);
          if (existing) {
            teams.push({ teamName, teamId, status: 'exists' });
            continue;
          }
        }

        const newGame = createInitialGameState(teamId, teamName);

        if (useFirebase) {
          await createGameInDB(teamId, newGame);
        } else {
          localStorage.setItem(`joybites_game_${teamId}`, JSON.stringify(newGame));
        }

        teams.push({ teamName, teamId, status: 'created' });
      } catch (err) {
        teams.push({ teamName, teamId, status: 'error', error: err.message });
      }
    }

    setCreatedTeams(teams);
    setIsCreating(false);
    if (onTeamsCreated) onTeamsCreated();
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const content = createdTeams
      .filter(t => t.status === 'created')
      .map(t => `
        <div style="display:inline-block;width:45%;margin:10px;padding:20px;border:2px solid #333;border-radius:12px;text-align:center;page-break-inside:avoid;">
          <p style="color:#888;margin:0 0 8px 0;font-size:14px;">Team Name</p>
          <p style="font-size:28px;font-weight:bold;margin:0 0 8px 0;font-family:monospace;">${t.teamName}</p>
          <p style="color:#888;margin:0;font-size:12px;">Join at: ${window.location.origin}</p>
        </div>
      `).join('');

    printWindow.document.write(`
      <html>
        <head><title>Team Codes - Mission North Star</title></head>
        <body style="font-family:sans-serif;padding:20px;">
          <h1 style="text-align:center;">Mission North Star - Team Names</h1>
          <p style="text-align:center;color:#666;">Join at: ${window.location.origin}</p>
          <div style="display:flex;flex-wrap:wrap;justify-content:center;">
            ${content}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
        <Plus className="w-5 h-5 text-cyan-400" />
        Batch Create Teams
      </h3>

      {createdTeams.length === 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Name Prefix</label>
              <input
                type="text"
                value={prefix}
                onChange={e => setPrefix(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
                placeholder="Team"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Start Number</label>
              <input
                type="number"
                value={startNumber}
                onChange={e => setStartNumber(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Count</label>
              <input
                type="number"
                value={count}
                onChange={e => setCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                min={1}
                max={50}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="text-sm text-slate-500">
            Will create: {Array.from({ length: Math.min(3, count) }, (_, i) => `"${prefix} ${startNumber + i}"`).join(', ')}
            {count > 3 && `, ... "${prefix} ${startNumber + count - 1}"`}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={isCreating || !prefix.trim()}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Users className="w-4 h-4" />
                Create {count} Teams
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {createdTeams.map(team => (
              <div
                key={team.teamId}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                  team.status === 'created'
                    ? 'bg-green-900/30 border border-green-600 text-green-300'
                    : team.status === 'exists'
                      ? 'bg-amber-900/30 border border-amber-600 text-amber-300'
                      : 'bg-red-900/30 border border-red-600 text-red-300'
                }`}
              >
                {team.status === 'created' ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                )}
                <span className="font-mono truncate">{team.teamName}</span>
                <span className="text-xs ml-auto flex-shrink-0">
                  {team.status === 'exists' ? 'Already exists' : team.status === 'error' ? 'Error' : 'Created'}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Print Team Cards
            </button>
            <button
              onClick={() => setCreatedTeams([])}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Create More
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchTeamCreation;
