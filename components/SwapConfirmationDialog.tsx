import React from 'react';
import { Player } from '../types';

interface SwapConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  swapDetails: {
    player1: Player;
    table1: number;
    player2: Player;
    table2: number;
  } | null;
}

const SwapConfirmationDialog: React.FC<SwapConfirmationDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  swapDetails,
}) => {
  if (!isOpen || !swapDetails) return null;

  const { player1, table1, player2, table2 } = swapDetails;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-gray-800 rounded-xl shadow-2xl p-6 m-4 max-w-lg w-full border border-yellow-500/30">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">Confirm Player Swap</h2>
        <p className="text-gray-300 mb-6">
          Are you sure you want to swap these players?
        </p>
        <div className="space-y-3 text-lg">
            <div className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                <span className="font-semibold">{player1.name}</span>
                <span className="text-gray-400 text-sm">from Table {table1}</span>
            </div>
             <div className="text-center text-gray-400 font-bold">↑↓</div>
            <div className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                <span className="font-semibold">{player2.name}</span>
                <span className="text-gray-400 text-sm">from Table {table2}</span>
            </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-6 rounded-lg transition duration-300"
          >
            Confirm Swap
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwapConfirmationDialog;
