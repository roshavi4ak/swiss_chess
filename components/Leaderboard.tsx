import React from 'react';
import { Player, AgeGroup } from '../types';
import { LeaderboardPlayer } from '../App';
import { PrintIcon } from './Icon';
import { useI18n } from '../i18n/I18nContext';

interface LeaderboardProps {
  players: LeaderboardPlayer[];
  onPrint: () => void;
  isOrganizer: boolean;
  ageGroups: AgeGroup[];
  selectedAgeGroupFilter: number | null;
  onAgeGroupFilterChange: (ageGroupId: number | null) => void;
  onPlayerClick: (player: Player) => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ players, onPrint, isOrganizer, ageGroups, selectedAgeGroupFilter, onAgeGroupFilterChange, onPlayerClick }) => {
  const { t } = useI18n();
  
  const sortedPlayers = [...players].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return b.elo - a.elo;
  });

  return (
    <div className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-yellow-400">{t.leaderboard}</h2>
        {players.length > 0 && isOrganizer && (
          <button
            onClick={onPrint}
            className="no-print bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-3 rounded-lg transition duration-300 flex items-center gap-2 text-sm"
            title="Save as PDF / Print"
            aria-label="Save leaderboard as PDF or print"
          >
            <PrintIcon className="h-4 w-4" />
            <span className="hidden sm:inline">PDF / Print</span>
          </button>
        )}
      </div>

      {/* Filter Buttons */}
      {ageGroups.length > 0 && (
        <div className="mb-4">
          <div className="text-sm text-gray-300 mb-2">{t.filterByAgeGroup}:</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onAgeGroupFilterChange(null)}
              className={`px-3 py-1 text-sm rounded-lg transition duration-300 ${
                selectedAgeGroupFilter === null
                  ? 'bg-yellow-500 text-gray-900 font-bold'
                  : 'bg-gray-600 hover:bg-gray-500 text-white'
              }`}
            >
              {t.all}
            </button>
            {ageGroups.map((ageGroup) => (
              <button
                key={ageGroup.id}
                onClick={() => onAgeGroupFilterChange(ageGroup.id)}
                className={`px-3 py-1 text-sm rounded-lg transition duration-300 ${
                  selectedAgeGroupFilter === ageGroup.id
                    ? 'bg-yellow-500 text-gray-900 font-bold'
                    : 'bg-gray-600 hover:bg-gray-500 text-white'
                }`}
              >
                {ageGroup.name}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Mobile Card Layout */}
      <div className="block sm:hidden">
        <div className="space-y-2">
          {sortedPlayers.map((player, index) => (
            <div key={player.id} className="bg-gray-700 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-yellow-400">#{index + 1}</span>
                  <div>
                    <button
                      onClick={() => onPlayerClick(player)}
                      className="font-medium text-white hover:text-yellow-400 transition duration-300 cursor-pointer text-left"
                    >
                      {player.name}
                    </button>
                    <div className="text-xs text-gray-400">ELO: {player.elo}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-white">{player.score.toFixed(1)}</div>
                  <div className="text-xs text-gray-400">{t.points}</div>
                </div>
              </div>
              {player.fullColorHistory.length > 0 && (
                <div className="text-center font-mono text-xs text-gray-400">
                  {player.fullColorHistory.join(' ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-600">
            <tr>
              <th className="p-3 font-bold text-yellow-400">#{t.rank}</th>
              <th className="p-3 font-bold text-yellow-400">{t.player}</th>
              <th className="p-3 text-center font-bold text-yellow-400 hidden md:table-cell">{t.colorHistory}</th>
              <th className="p-3 text-right font-bold text-yellow-400">{t.score}</th>
              <th className="p-3 text-right font-bold text-yellow-400">{t.elo}</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, index) => (
              <tr key={player.id} className="border-b border-gray-700 last:border-b-0 hover:bg-gray-700/50">
                <td className="p-3 font-semibold">{index + 1}</td>
                <td className="p-3">
                  <button
                    onClick={() => onPlayerClick(player)}
                    className="text-white hover:text-yellow-400 transition duration-300 cursor-pointer text-left"
                  >
                    {player.name}
                  </button>
                </td>
                <td className="p-3 text-center font-mono text-xs text-gray-400 hidden md:table-cell">
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