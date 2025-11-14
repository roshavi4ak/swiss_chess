import React from 'react';
import { Pairing, Result } from '../types';
import { PrintIcon } from './Icon';
import { useI18n } from '../i18n/I18nContext';

interface PairingsProps {
  pairings: Pairing[];
  onResultUpdate: (table: number, result: Result) => void;
  onColorFlip: (table: number) => void;
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

const Pairings: React.FC<PairingsProps> = ({ pairings, onResultUpdate, onColorFlip, isOrganizer, swapSelection, onPlayerSelectForSwap, onPrint }) => {
  const { t } = useI18n();

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-yellow-400">{t.currentRoundPairings}</h2>
        {pairings.length > 0 && isOrganizer && (
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
            <div key={pairing.table} className="bg-gray-700 p-4 rounded-lg print-pairing-card">
              {/* Table Number Header */}
              <div className="print-table-header font-bold text-lg mb-3 pb-2 border-b border-gray-600">
                {t.table} {pairing.table}
              </div>
              
              {pairing.black ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                    <div className={`text-left ${isOrganizer ? 'cursor-pointer hover:bg-gray-600 p-2 rounded-md transition-colors' : ''}`}
                         onClick={isOrganizer ? () => onPlayerSelectForSwap(pairing.white.id, pairing.table) : undefined}>
                      <div className={`font-semibold text-lg sm:text-xl ${isWhiteSelected ? 'text-yellow-300 bg-yellow-900 px-2 py-1 rounded' : 'text-white'}`}>
                        № {pairing.white.playerNumber} {pairing.white.name}
                      </div>
                      <div className={`text-xs ${isWhiteSelected ? 'text-yellow-200' : 'text-gray-400'}`}>
                        ({pairing.white.elo})
                      </div>
                    </div>
                    <div className="font-bold text-yellow-400 text-center text-sm">
                      {t.vs}
                    </div>
                    <div className={`text-right ${isOrganizer ? 'cursor-pointer hover:bg-gray-600 p-2 rounded-md transition-colors' : ''}`}
                         onClick={isOrganizer ? () => onPlayerSelectForSwap(pairing.black.id, pairing.table) : undefined}>
                      <div className={`font-semibold text-lg sm:text-xl ${isBlackSelected ? 'text-yellow-300 bg-yellow-900 px-2 py-1 rounded' : 'text-white'}`}>
                        № {pairing.black.playerNumber} {pairing.black.name}
                      </div>
                    </div>
                  </div>
                  {/* Results section - shown for both organizers and observers */}
                  <div className="mt-3 pt-3 border-t border-gray-600 no-print">
                    {isOrganizer ? (
                      <div className="flex justify-center items-center gap-1 sm:gap-2">
                        <ResultButton onClick={() => onResultUpdate(pairing.table, '1-0')} selected={pairing.result === '1-0'}>1-0</ResultButton>
                        <ResultButton onClick={() => onResultUpdate(pairing.table, '1/2-1/2')} selected={pairing.result === '1/2-1/2'}>½-½</ResultButton>
                        <ResultButton onClick={() => onResultUpdate(pairing.table, '0-1')} selected={pairing.result === '0-1'}>0-1</ResultButton>
                        <button
                          onClick={() => onColorFlip(pairing.table)}
                          className="py-2 px-3 rounded-md text-xs font-semibold bg-orange-600 hover:bg-orange-500 text-white transition-all duration-200"
                          title="Flip colors"
                          aria-label="Flip player colors"
                        >
                          Flip
                        </button>
                      </div>
                    ) : (
                      /* Observer view - show results in read-only format */
                      <div className="flex justify-center items-center gap-1 sm:gap-2">
                        <div className={`py-2 px-3 rounded-md text-xs font-semibold ${
                          pairing.result === '1-0'
                            ? 'bg-yellow-500 text-gray-900'
                            : 'bg-gray-600 text-gray-300'
                        }`}>
                          1-0
                        </div>
                        <div className={`py-2 px-3 rounded-md text-xs font-semibold ${
                          pairing.result === '1/2-1/2'
                            ? 'bg-yellow-500 text-gray-900'
                            : 'bg-gray-600 text-gray-300'
                        }`}>
                          ½-½
                        </div>
                        <div className={`py-2 px-3 rounded-md text-xs font-semibold ${
                          pairing.result === '0-1'
                            ? 'bg-yellow-500 text-gray-900'
                            : 'bg-gray-600 text-gray-300'
                        }`}>
                          0-1
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                  <div className="text-left">
                    <div className="font-semibold text-white text-lg sm:text-xl">№ {pairing.white.playerNumber} {pairing.white.name}</div>
                  </div>
                  <div className="bg-green-600 text-white font-bold py-1 px-3 rounded-full text-xs self-center">
                    BYE
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {/* Bulgarian alphabetical player list - only shown in print */}
        <div className="print-only mt-6 pt-6 border-t-2 border-gray-600">
          <h3 className="text-lg font-bold text-black mb-4">Players List</h3>
          <div className="space-y-2">
            {(() => {
              const allPlayers: Array<{id: number, name: string, playerNumber: number, table: number, color: 'w' | 'b'}> = [];
              
              pairings.forEach(pairing => {
                if (pairing.black) {
                  allPlayers.push(
                    {...pairing.white, table: pairing.table, color: 'w' as const},
                    {...pairing.black, table: pairing.table, color: 'b' as const}
                  );
                } else {
                  allPlayers.push({...pairing.white, table: pairing.table, color: 'w' as const});
                }
              });
              
              const sortedPlayers = allPlayers
                .map(player => ({
                  ...player,
                  firstName: player.name.trim().split(/\s+/)[0] || player.name
                }))
                .sort((a, b) => a.firstName.localeCompare(b.firstName, 'bg'));
              
              return sortedPlayers.map(player => {
                const colorText = player.color === 'w' ? 'белите' : 'черните';
                return (
                  <div key={`${player.id}-${player.table}`} className="text-lg sm:text-xl text-black">
                    {(() => {
                      const isBye = player.color === 'w' && pairings.find(p => p.table === player.table)?.black === null;
                      return isBye 
                        ? `${player.name} (номер ${player.playerNumber}) не играе в този кръг и печели служебно 1 точка.`
                        : `${player.name} (номер ${player.playerNumber}) играе на маса ${player.table} с ${colorText} фигури`;
                    })()}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pairings;