import React, { useState } from 'react';
import { Player, Pairing, TournamentStatus } from '../types';

interface ShareControlProps {
  organizerKey: string | null;
  tournamentData: {
    status: TournamentStatus;
    players: Player[];
    pairingsHistory: Pairing[][];
    currentRound: number;
    totalRounds: number;
  };
}

const ShareControl: React.FC<ShareControlProps> = ({ organizerKey, tournamentData }) => {
  const [copied, setCopied] = useState<'organizer' | 'observer' | null>(null);

  if (!organizerKey) return null;

  const organizerUrl = `${window.location.origin}${window.location.pathname}#organizer-${organizerKey}`;
  const observerUrl = `${window.location.origin}${window.location.pathname}`;

  const handleCopy = (type: 'organizer' | 'observer') => {
    const url = type === 'organizer' ? organizerUrl : observerUrl;
    navigator.clipboard.writeText(url);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleExport = () => {
    try {
      // Omit organizerKey from the export for security
      const exportData = {
        ...tournamentData,
        organizerKey: undefined,
      };
      const dataStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `swiss-tournament-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Failed to export tournament data", error);
        alert("An error occurred while trying to export the data.");
    }
  };


  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-lg mt-8 border border-yellow-500/30">
      <h3 className="text-lg font-bold text-yellow-400 mb-3">Tournament Links & Actions</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-300">Organizer Link (Secret)</label>
          <p className="text-xs text-gray-400 mb-1">Use this link to manage the tournament. Keep it secret!</p>
          <div className="flex gap-2">
            <input type="text" readOnly value={organizerUrl} className="flex-grow bg-gray-900 rounded-md p-2 text-sm text-gray-300 focus:outline-none" />
            <button onClick={() => handleCopy('organizer')} className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-3 rounded-md text-sm transition">
              {copied === 'organizer' ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-300">Observer Link (Public)</label>
          <p className="text-xs text-gray-400 mb-1">Share this link for a read-only view.</p>
          <div className="flex gap-2">
            <input type="text" readOnly value={observerUrl} className="flex-grow bg-gray-900 rounded-md p-2 text-sm text-gray-300 focus:outline-none" />
            <button onClick={() => handleCopy('observer')} className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-3 rounded-md text-sm transition">
              {copied === 'observer' ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-4">
          <button
            onClick={handleExport}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            Export Tournament Data (JSON)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareControl;