import React from 'react';
import { Pairing, Result } from '../types';
import { PrintIcon } from './Icon';

interface PairingsProps {
  pairings: Pairing[];
  onResultUpdate: (table: number, result: Result) => void;
  isOrganizer: boolean;
  swapSelection: { playerId: number; table: number } | null;
  onPlayerSelectForSwap: (playerId: number, table: number) => void;
  onPrint: () => void;
}

const ResultButton: React.FC<{
  onClick: () => void;
  selected: boolean;
  children: React.ReactNode;
}> = ({ onClick, selected, children }) => {
  const baseClasses = "py-2 px-3 rounded-md text-xs font-semibold transition-all duration-200";
  const selectedClasses = "bg-yellow-500 text-gray-900 scale-110";
  const unselectedClasses = "bg-gray-600 hover:bg-gray-500";
  return (
    <button onClick={onClick} className={`${baseClasses} ${selected ? selectedClasses : unselectedClasses}`}>
      {children}
    </button>
  );
};

const Pairings: React.FC<PairingsProps> = ({ pairings, onResultUpdate, isOrganizer, swapSelection, onPlayerSelectForSwap, onPrint }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-yellow-400">Current Round Pairings</h2>
        {pairings.length > 0 && (
          <button
            onClick={onPrint}
            className="no-print bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-3 rounded-lg transition duration-300 flex items-center gap-2 text-sm"
            title="Save as PDF / Print"
            aria-label="Save pairings as PDF or print"
          >
            <PrintIcon className="h-4 w-4" />
            <span>PDF / Print</span>
          </button>
        )}
      </div>
      {isOrganizer && <p className="text-sm text-gray-400 mb-4 -mt-2">As an organizer, you can click on two players from different tables to swap them.</p>}
      <div className="space-y-4">
        {pairings.map((pairing) => {
           const isWhiteSelected = isOrganizer && swapSelection?.playerId === pairing.white.id;
           const isBlackSelected = isOrganizer && pairing.black && swapSelection?.playerId === pairing.black.id;

          return (
            <div key={pairing.table} className="bg-gray-700 p-4 rounded-lg">
              {pairing.black ? (
                <>
                  <div className="flex justify-between items-center">
                    <div
                      className={`flex-1 text-left p-2 rounded-lg transition-all ${isOrganizer ? 'cursor-pointer hover:bg-gray-600/50' : ''} ${isWhiteSelected ? 'ring-2 ring-yellow-400 bg-gray-600' : ''}`}
                      onClick={() => isOrganizer && onPlayerSelectForSwap(pairing.white.id, pairing.table)}
                      aria-label={isOrganizer ? `Select ${pairing.white.name} to swap` : undefined}
                      role={isOrganizer ? "button" : undefined}
                      tabIndex={isOrganizer ? 0 : -1}
                    >
                      <span className="font-semibold text-white">{pairing.white.name}</span>
                      <span className="text-gray-400 ml-2 text-sm">({pairing.white.elo})</span>
                    </div>
                    <div className="font-bold text-yellow-400 mx-4 text-center w-12 text-sm">
                      vs
                    </div>
                    <div
                      className={`flex-1 text-right p-2 rounded-lg transition-all ${isOrganizer ? 'cursor-pointer hover:bg-gray-600/50' : ''} ${isBlackSelected ? 'ring-2 ring-yellow-400 bg-gray-600' : ''}`}
                      onClick={() => isOrganizer && pairing.black && onPlayerSelectForSwap(pairing.black.id, pairing.table)}
                      aria-label={isOrganizer ? `Select ${pairing.black.name} to swap` : undefined}
                      role={isOrganizer ? "button" : undefined}
                      tabIndex={isOrganizer ? 0 : -1}
                    >
                      <span className="text-gray-400 mr-2 text-sm">({pairing.black.elo})</span>
                      <span className="font-semibold text-white">{pairing.black.name}</span>
                    </div>
                  </div>
                  {isOrganizer && (
                    <div className="flex justify-center items-center gap-2 mt-3 pt-3 border-t border-gray-600 no-print">
                        <ResultButton onClick={() => onResultUpdate(pairing.table, '1-0')} selected={pairing.result === '1-0'}>1-0</ResultButton>
                        <ResultButton onClick={() => onResultUpdate(pairing.table, '1/2-1/2')} selected={pairing.result === '1/2-1/2'}>½-½</ResultButton>
                        <ResultButton onClick={() => onResultUpdate(pairing.table, '0-1')} selected={pairing.result === '0-1'}>0-1</ResultButton>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex justify-between items-center">
                    <div
                      className={`flex items-center gap-3 p-2 rounded-lg transition-all ${isOrganizer ? 'cursor-pointer hover:bg-gray-600/50' : ''} ${isWhiteSelected ? 'ring-2 ring-yellow-400 bg-gray-600' : ''}`}
                      onClick={() => isOrganizer && onPlayerSelectForSwap(pairing.white.id, pairing.table)}
                      aria-label={isOrganizer ? `Select ${pairing.white.name} to swap` : undefined}
                      role={isOrganizer ? "button" : undefined}
                      tabIndex={isOrganizer ? 0 : -1}
                    >
                        <span className="font-semibold text-white">{pairing.white.name}</span>
                        <span className="text-gray-400 ml-2 text-sm">({pairing.white.elo})</span>
                    </div>
                    <div className="bg-green-600 text-white font-bold py-1 px-3 rounded-full text-xs">
                        BYE
                    </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pairings;