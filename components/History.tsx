import React from 'react';
import { Pairing } from '../types';
import { useI18n } from '../i18n/I18nContext';

interface HistoryProps {
  pairingsHistory: Pairing[][];
  onClose: () => void;
}

const History: React.FC<HistoryProps> = ({ pairingsHistory, onClose }) => {
  const { t } = useI18n();
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">{t.tournamentHistory}</h1>
          <button
            onClick={onClose}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            {t.backToTournament}
          </button>
        </header>

        <div className="space-y-8">
          {pairingsHistory.map((roundPairings, index) => {
            if (roundPairings.length === 0) return null;

            return (
              <div key={index} className="bg-gray-800 p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-yellow-400 border-b border-gray-700 pb-2">
                  {t.roundLabel} {roundPairings[0].round}
                </h2>
                <div className="space-y-3 mt-4">
                  {roundPairings.map((pairing) => (
                    <div key={pairing.table} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                      {pairing.black ? (
                        <>
                          <div className="flex-1 text-left">
                            <span className="font-semibold text-white">{pairing.white.name}</span>
                            <span className="text-gray-400 ml-2 text-sm">({pairing.white.elo})</span>
                          </div>
                          <div className="font-bold text-yellow-400 mx-4 text-center w-24">
                            {pairing.result ? (pairing.result === '1/2-1/2' ? '½ - ½' : pairing.result) : <span className="text-sm text-gray-500 font-normal">{t.pending}</span>}
                          </div>
                          <div className="flex-1 text-right">
                            <span className="text-gray-400 mr-2 text-sm">({pairing.black.elo})</span>
                            <span className="font-semibold text-white">{pairing.black.name}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-white">{pairing.white.name}</span>
                            <span className="text-gray-400 ml-2 text-sm">({pairing.white.elo})</span>
                          </div>
                          <div className="bg-green-600 text-white font-bold py-1 px-3 rounded-full text-xs">
                            {t.bye}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default History;
