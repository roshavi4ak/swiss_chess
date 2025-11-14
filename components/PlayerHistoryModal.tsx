import React from 'react';
import { Player, Pairing } from '../types';
import { useI18n } from '../i18n/I18nContext';

interface PlayerHistoryModalProps {
  player: Player | null;
  pairingsHistory: Pairing[][];
  isOpen: boolean;
  onClose: () => void;
}

interface MatchInfo {
  round: number;
  opponent?: string;
  opponentElo?: number;
  result?: string;
  isBye: boolean;
  playerColor?: 'white' | 'black';
}

const PlayerHistoryModal: React.FC<PlayerHistoryModalProps> = ({ 
  player, 
  pairingsHistory, 
  isOpen, 
  onClose 
}) => {
  const { t } = useI18n();

  if (!isOpen || !player) return null;

  const matchHistory: MatchInfo[] = [];

  // Extract match history from pairings
  pairingsHistory.forEach((roundPairings, roundIndex) => {
    const round = roundIndex + 1;
    const pairing = roundPairings.find(p => 
      p.white.id === player.id || (p.black && p.black.id === player.id)
    );

    if (pairing) {
      if (pairing.black === null) {
        // BYE match
        matchHistory.push({
          round,
          isBye: true,
          result: 'BYE'
        });
      } else {
        // Regular match
        const isWhite = pairing.white.id === player.id;
        const opponent = isWhite ? pairing.black : pairing.white;
        const result = pairing.result;
        
        matchHistory.push({
          round,
          opponent: opponent.name,
          opponentElo: opponent.elo,
          result: result || undefined,
          isBye: false,
          playerColor: isWhite ? 'white' : 'black'
        });
      }
    } else {
      // Player had no pairing this round (shouldn't happen in swiss system, but just in case)
      matchHistory.push({
        round,
        isBye: true,
        result: 'No pairing'
      });
    }
  });

  // Sort by round number
  matchHistory.sort((a, b) => a.round - b.round);

  const formatResult = (result?: string, isBye: boolean = false) => {
    if (isBye) return t.matchBye;
    if (!result) return '-';
    return result;
  };

  const getResultColor = (result?: string, isBye: boolean = false) => {
    if (isBye || result === 'BYE') return 'text-blue-400';
    switch (result) {
      case '1-0':
        return 'text-green-400';
      case '0-1':
        return 'text-red-400';
      case '1/2-1/2':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-700 px-6 py-4 border-b border-gray-600">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-yellow-400">{t.playerHistory}</h2>
              <p className="text-white font-medium">{player.name}</p>
              <p className="text-gray-300 text-sm">ELO: {player.elo} | Age: {player.age}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-600 transition duration-300"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <h3 className="text-lg font-semibold text-yellow-400 mb-4">{t.matchHistory}</h3>
          
          {matchHistory.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No matches found</p>
          ) : (
            <div className="space-y-3">
              {matchHistory.map((match, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <span className="text-yellow-400 font-bold text-lg">
                        {t.playerRound} {match.round}
                      </span>
                      {!match.isBye && (
                        <div>
                          <div className="text-white font-medium">
                            {match.playerColor === 'white' ? '⚪' : '⚫'} vs {match.opponent}
                          </div>
                          {match.opponentElo && (
                            <div className="text-gray-400 text-sm">ELO: {match.opponentElo}</div>
                          )}
                        </div>
                      )}
                      {match.isBye && (
                        <div className="text-blue-400 font-medium">{t.matchBye}</div>
                      )}
                    </div>
                    <div className={`font-bold text-lg ${getResultColor(match.result, match.isBye)}`}>
                      {formatResult(match.result, match.isBye)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-700 px-6 py-3 border-t border-gray-600">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerHistoryModal;