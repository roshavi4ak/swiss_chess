import React from 'react';
import { Player, Pairing } from '../types';

interface PlayerSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayerSelect: (player: Player) => void;
  players: Player[];
  selectedPlayer?: Player;
  currentPairings: Pairing[];
  title?: string;
}

const PlayerSelectionDialog: React.FC<PlayerSelectionDialogProps> = ({
  isOpen,
  onClose,
  onPlayerSelect,
  players,
  selectedPlayer,
  currentPairings,
  title = 'Select Player for Swap'
}) => {
  if (!isOpen) return null;

  // Find the table of the selected player
  let selectedPlayerTable: number | null = null;
  if (selectedPlayer) {
    const pairing = currentPairings.find(p =>
      p.white.id === selectedPlayer.id || (p.black && p.black.id === selectedPlayer.id)
    );
    selectedPlayerTable = pairing?.table || null;
  }

  // Filter players to exclude:
  // 1. The selected player themselves
  // 2. Players from the same table (since they can be flipped with the flip button)
  const availablePlayers = players.filter(player => {
    // Always exclude the selected player
    if (selectedPlayer && player.id === selectedPlayer.id) {
      return false;
    }
    
    // If we found the player's table, exclude players from the same table
    if (selectedPlayerTable !== null) {
      const playerPairing = currentPairings.find(p =>
        p.white.id === player.id || (p.black && p.black.id === player.id)
      );
      
      if (playerPairing && playerPairing.table === selectedPlayerTable) {
        return false;
      }
    }
    
    return true;
  }).sort((a, b) => a.playerNumber - b.playerNumber);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-gray-800 rounded-xl shadow-2xl p-6 m-4 max-w-2xl w-full border border-yellow-500/30 max-h-[80vh] overflow-hidden flex flex-col">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">{title}</h2>
        <p className="text-gray-300 mb-6">
          {selectedPlayer 
            ? `Select a player to swap with ${selectedPlayer.name}:`
            : 'Select a player for the swap:'
          }
        </p>
        
        <div className="flex-1 overflow-y-auto">
          <div className="grid gap-3">
            {availablePlayers.map((player) => (
              <button
                key={player.id}
                onClick={() => onPlayerSelect(player)}
                className="bg-gray-700 hover:bg-gray-600 text-left p-4 rounded-lg transition duration-200 flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold text-white text-lg">
                    № {player.playerNumber} {player.name}
                  </div>
                  <div className="text-gray-400 text-sm">
                    ELO: {player.elo} | Age: {player.age} | Sex: {player.sex}
                  </div>
                  {player.ageGroup && (
                    <div className="text-gray-500 text-xs">
                      Group: {player.ageGroup}
                    </div>
                  )}
                </div>
                <div className="text-yellow-400 font-semibold">
                  Score: {player.score}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerSelectionDialog;