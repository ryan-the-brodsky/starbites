import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Printer, ChevronDown, ChevronUp } from 'lucide-react';

const ExportPanel = ({ allGames, leaderboard }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const teams = Object.values(allGames);

  const exportBasicCSV = () => {
    const headers = ['Team Name', 'Game Code', 'Current Level', 'Total Score', 'Players', 'Badges'];
    const rows = teams.map(team => [
      team.meta?.teamName,
      team.gameCode,
      team.meta?.currentLevel,
      team.meta?.totalScore,
      Object.keys(team.players || {}).length,
      (team.badges || []).join('; '),
    ]);

    downloadCSV(headers, rows, 'mission-north-star-results');
  };

  const exportDetailedCSV = () => {
    const headers = [
      'Team Name', 'Game Code', 'Current Level', 'Total Score', 'Players',
      'L1 Score', 'L1 Criteria Count', 'L1 Missing Roles', 'L1 Completed',
      'L2 Score', 'L2 Completed',
      'L3 Score', 'L3 Completed',
      'Badges',
    ];
    const rows = teams.map(team => {
      const l1 = team.level1 || {};
      const l2 = team.level2 || {};
      const l3 = team.level3 || {};
      return [
        team.meta?.teamName,
        team.gameCode,
        team.meta?.currentLevel,
        team.meta?.totalScore,
        Object.keys(team.players || {}).length,
        l1.score || 0,
        (l1.selectedCriteria || []).length,
        (l1.missingRoles || []).join('; '),
        l1.completedAt ? 'Yes' : 'No',
        l2.score || 0,
        l2.completedAt ? 'Yes' : 'No',
        l3.score || 0,
        l3.completedAt ? 'Yes' : 'No',
        (team.badges || []).join('; '),
      ];
    });

    downloadCSV(headers, rows, 'mission-north-star-detailed');
  };

  const exportJSON = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      totalTeams: teams.length,
      leaderboard,
      teams: teams.map(team => ({
        teamName: team.meta?.teamName,
        gameCode: team.gameCode,
        currentLevel: team.meta?.currentLevel,
        totalScore: team.meta?.totalScore,
        playerCount: Object.keys(team.players || {}).length,
        badges: team.badges || [],
        levels: {
          level1: { score: team.level1?.score || 0, criteria: (Array.isArray(team.level1?.selectedCriteria) ? team.level1.selectedCriteria : team.level1?.selectedCriteria ? Object.values(team.level1.selectedCriteria) : []).length, completed: !!team.level1?.completedAt },
          level2: { score: team.level2?.score || 0, completed: !!team.level2?.completedAt },
          level3: { score: team.level3?.score || 0, completed: !!team.level3?.completedAt },
        },
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mission-north-star-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openPrintSummary = () => {
    const printWindow = window.open('', '_blank');
    const teamRows = leaderboard.map((team, i) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #ddd;font-weight:${i < 3 ? 'bold' : 'normal'};">${i + 1}</td>
        <td style="padding:8px;border-bottom:1px solid #ddd;">${team.teamName}</td>
        <td style="padding:8px;border-bottom:1px solid #ddd;text-align:center;">${team.currentLevel}/3</td>
        <td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;font-weight:bold;">${team.score}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head><title>Mission North Star - Results Summary</title></head>
        <body style="font-family:sans-serif;max-width:800px;margin:40px auto;padding:0 20px;">
          <h1 style="text-align:center;color:#333;">Mission North Star</h1>
          <h2 style="text-align:center;color:#666;">Results Summary</h2>
          <p style="text-align:center;color:#999;">${new Date().toLocaleDateString()} | ${teams.length} Teams</p>

          <div style="display:flex;justify-content:space-around;margin:30px 0;padding:20px;background:#f5f5f5;border-radius:8px;">
            <div style="text-align:center;">
              <div style="font-size:32px;font-weight:bold;">${teams.length}</div>
              <div style="color:#666;">Total Teams</div>
            </div>
            <div style="text-align:center;">
              <div style="font-size:32px;font-weight:bold;">${teams.filter(t => (t.badges?.length || 0) === 3).length}</div>
              <div style="color:#666;">Completed</div>
            </div>
            <div style="text-align:center;">
              <div style="font-size:32px;font-weight:bold;">${teams.length > 0 ? Math.round(teams.reduce((s, t) => s + (t.meta?.totalScore || 0), 0) / teams.length) : 0}</div>
              <div style="color:#666;">Avg Score</div>
            </div>
          </div>

          <h3>Leaderboard</h3>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#f0f0f0;">
                <th style="padding:8px;text-align:left;">Rank</th>
                <th style="padding:8px;text-align:left;">Team</th>
                <th style="padding:8px;text-align:center;">Level</th>
                <th style="padding:8px;text-align:right;">Score</th>
              </tr>
            </thead>
            <tbody>${teamRows}</tbody>
          </table>

          <p style="text-align:center;color:#999;margin-top:40px;font-size:12px;">
            Generated by Mission North Star - Joy Bites Production Training
          </p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const downloadCSV = (headers, rows, filename) => {
    const escapeCsvField = (field) => {
      const str = String(field ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csv = [
      headers.map(escapeCsvField).join(','),
      ...rows.map(r => r.map(escapeCsvField).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-semibold">Export Results</h2>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>

      {isExpanded && (
        <div className="px-6 pb-4 grid grid-cols-2 gap-3">
          <button
            onClick={exportBasicCSV}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-3 rounded-lg transition-colors"
          >
            <FileSpreadsheet className="w-5 h-5 text-green-400" />
            <div className="text-left">
              <div className="font-medium text-sm">Basic CSV</div>
              <div className="text-xs text-slate-400">Team scores and badges</div>
            </div>
          </button>
          <button
            onClick={exportDetailedCSV}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-3 rounded-lg transition-colors"
          >
            <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
            <div className="text-left">
              <div className="font-medium text-sm">Detailed CSV</div>
              <div className="text-xs text-slate-400">Per-level breakdown</div>
            </div>
          </button>
          <button
            onClick={exportJSON}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-3 rounded-lg transition-colors"
          >
            <FileText className="w-5 h-5 text-purple-400" />
            <div className="text-left">
              <div className="font-medium text-sm">JSON Export</div>
              <div className="text-xs text-slate-400">Full structured data</div>
            </div>
          </button>
          <button
            onClick={openPrintSummary}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-3 rounded-lg transition-colors"
          >
            <Printer className="w-5 h-5 text-amber-400" />
            <div className="text-left">
              <div className="font-medium text-sm">Print Summary</div>
              <div className="text-xs text-slate-400">Printable results page</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportPanel;
