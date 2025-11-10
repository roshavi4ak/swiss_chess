import React from 'react';
import { Player } from '../types';
import { LeaderboardPlayer } from '../App';
import { PrintIcon } from './Icon';


interface LeaderboardProps {
  players: LeaderboardPlayer[];
  onPrint: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ players, onPrint }) => {
  const sortedPlayers = [...players].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return b.elo - a.elo;
  });

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-yellow-400">Leaderboard</h2>
        {players.length > 0 && (
          <button
            onClick={onPrint}
            className="no-print bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-3 rounded-lg transition duration-300 flex items-center gap-2 text-sm"
            title="Save as PDF / Print"
            aria-label="Save leaderboard as PDF or print"
          >
            <PrintIcon className="h-4 w-4" />
            <span>PDF / Print</span>
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-600">
            <tr>
              <th className="p-3">Rank</th>
              <th className="p-3">Player</th>
              <th className="p-3 text-center">Colors</th>
              <th className="p-3 text-right">Score</th>
              <th className="p-3 text-right">ELO</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, index) => (
              <tr key={player.id} className="border-b border-gray-700 last:border-b-0 hover:bg-gray-700/50">
                <td className="p-3 font-semibold">{index + 1}</td>
                <td className="p-3">{player.name}</td>
                <td className="p-3 text-center font-mono text-xs text-gray-400">
                  {player.fullColorHistory.join(' ')}
                </td>
                <td className="p-3 text-right font-mono">{player.score.toFixed(1)}</td>
                <td className="p-3 text-right text-gray-400 font-mono">{player.elo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;