import React, { useState, useEffect } from 'react';
import { apiService, Tournament } from '../services/api';
import { useI18n } from '../i18n/I18nContext';
import { ChessKingIcon } from './Icon';

interface TournamentListProps {
  onTournamentSelect?: (tournamentId: string) => void;
  onClose?: () => void;
}

const TournamentList: React.FC<TournamentListProps> = ({ onTournamentSelect, onClose }) => {
  const { t } = useI18n();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'SETUP' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    setLoading(true);
    try {
      const response = await apiService.getTournaments();
      if (response.success && response.data) {
        setTournaments(response.data);
      } else {
        setError(response.error || 'Failed to load tournaments');
      }
    } catch (err) {
      setError('Failed to load tournaments');
      console.error('Error loading tournaments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTournamentClick = (tournamentId: string) => {
    console.log('TournamentList: handleTournamentClick called', { tournamentId, onTournamentSelect: !!onTournamentSelect });

    if (onTournamentSelect) {
      console.log('TournamentList: calling onTournamentSelect callback');
      onTournamentSelect(tournamentId);
    } else {
      // Find the tournament to check its status
      const tournament = tournaments.find(t => t.id === tournamentId);
      console.log('TournamentList: found tournament', { tournamentId, tournament: tournament ? { id: tournament.id, status: tournament.status, organizerKey: tournament.organizerKey } : null });

      // Always open tournaments in organizer mode from the past tournaments page
      // This allows the organizer to view and manage all their tournaments
      console.log('TournamentList: navigating to organizer mode for tournament');
      window.location.href = `/${tournamentId}#organizer-roshavi4ak`;
    }
  };

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = searchTerm === '' || 
      tournament.id.includes(searchTerm) ||
      tournament.players?.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterStatus === 'ALL' || tournament.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SETUP': return 'text-yellow-400';
      case 'IN_PROGRESS': return 'text-blue-400';
      case 'COMPLETED': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SETUP': return '⚙️';
      case 'IN_PROGRESS': return '🏁';
      case 'COMPLETED': return '🏆';
      default: return '❓';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <ChessKingIcon className="w-12 h-12 text-yellow-400 mx-auto mb-4 animate-pulse" />
          <p className="text-xl">{t.loading || 'Loading tournaments...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading Tournaments</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={loadTournaments}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1"></div>
            <div className="inline-flex justify-center items-center gap-4">
              <ChessKingIcon className="w-10 h-10 text-yellow-400" />
              <h1 className="text-4xl font-bold">{t.pastTournaments || 'Past Tournaments'}</h1>
            </div>
            <div className="flex-1 flex justify-end">
              {onClose && (
                <button
                  onClick={onClose}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                  {t.close || 'Close'}
                </button>
              )}
            </div>
          </div>
          <p className="text-lg text-gray-300">
            {t.tournamentHistory || 'Browse and manage your tournament history'}
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t.search || 'Search'}
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.searchTournaments || 'Search by ID or player name...'}
                className="w-full bg-gray-700 text-white rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t.filter || 'Filter'}
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full bg-gray-700 text-white rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="ALL">{t.allTournaments || 'All Tournaments'}</option>
                <option value="SETUP">{t.setup || 'Setup'}</option>
                <option value="IN_PROGRESS">{t.inProgress || 'In Progress'}</option>
                <option value="COMPLETED">{t.completed || 'Completed'}</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-400">
            {t.showing || 'Showing'} {filteredTournaments.length} {t.of || 'of'} {tournaments.length} {t.tournaments || 'tournaments'}
          </div>
        </div>

        {/* Tournaments Grid */}
        {filteredTournaments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold text-gray-300 mb-2">
              {searchTerm || filterStatus !== 'ALL' ? t.noMatchingTournaments || 'No matching tournaments found' : t.noTournaments || 'No tournaments yet'}
            </h3>
            <p className="text-gray-400">
              {searchTerm || filterStatus !== 'ALL' ? t.tryDifferentSearch || 'Try a different search or filter' : t.createFirstTournament || 'Create your first tournament to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map((tournament) => (
              <div
                key={tournament.id}
                onClick={() => handleTournamentClick(tournament.id)}
                className="bg-gray-800 rounded-lg p-6 cursor-pointer transform transition-all duration-200 hover:scale-105 hover:bg-gray-700 border-2 border-transparent hover:border-yellow-400"
              >
                {/* Tournament Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-yellow-400">
                      {t.tournament || 'Tournament'} #{tournament.id}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-sm font-semibold ${getStatusColor(tournament.status)}`}>
                        {getStatusIcon(tournament.status)} {t[tournament.status.toLowerCase()] || tournament.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-400">
                    <div>{formatDate(tournament.lastUpdated)}</div>
                    <div>{formatTime(tournament.lastUpdated)}</div>
                  </div>
                </div>

                {/* Tournament Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-300">{t.players || 'Players'}:</span>
                    <span className="text-white font-semibold">{tournament.players?.length || 0}</span>
                  </div>
                  
                  {tournament.totalRounds > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">{t.rounds || 'Rounds'}:</span>
                      <span className="text-white font-semibold">
                        {tournament.currentRound} / {tournament.totalRounds}
                      </span>
                    </div>
                  )}

                  {tournament.status === 'IN_PROGRESS' && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">{t.currentRound || 'Current Round'}:</span>
                      <span className="text-blue-400 font-semibold">{tournament.currentRound}</span>
                    </div>
                  )}

                  {tournament.status === 'COMPLETED' && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">{t.winner || 'Winner'}:</span>
                      <span className="text-green-400 font-semibold">
                        {tournament.players?.find(p => p.score === Math.max(...(tournament.players?.map(pl => pl.score) || [0])))?.name || 'TBD'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Player Preview */}
                {tournament.players && tournament.players.length > 0 && (
                  <div className="mb-4">
                    <p className="text-gray-400 text-sm mb-2">{t.topPlayers || 'Top Players'}:</p>
                    <div className="space-y-1">
                      {tournament.players
                        .sort((a, b) => b.score - a.score)
                        .slice(0, 3)
                        .map((player, index) => (
                          <div key={player.id} className="flex justify-between text-sm">
                            <span className="text-gray-300">
                              {index + 1}. {player.name}
                            </span>
                            <span className="text-white font-semibold">{player.score}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="mt-4 pt-4 border-t border-gray-600">
                  <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-gray-900 font-bold py-2 px-4 rounded-lg transition text-sm">
                    {t.viewDetails || 'View Details'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Statistics Footer */}
        {tournaments.length > 0 && (
          <div className="mt-8 bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-yellow-400 mb-4">{t.statistics || 'Statistics'}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{tournaments.length}</div>
                <div className="text-gray-400 text-sm">{t.totalTournaments || 'Total Tournaments'}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {tournaments.filter(t => t.status === 'COMPLETED').length}
                </div>
                <div className="text-gray-400 text-sm">{t.completed || 'Completed'}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {tournaments.filter(t => t.status === 'IN_PROGRESS').length}
                </div>
                <div className="text-gray-400 text-sm">{t.inProgress || 'In Progress'}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {tournaments.reduce((sum, t) => sum + (t.players?.length || 0), 0)}
                </div>
                <div className="text-gray-400 text-sm">{t.totalPlayers || 'Total Players'}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentList;