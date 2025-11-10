import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { ChessKingIcon } from './Icon';

interface PlayerSetupProps {
  onStart: (players: Player[], rounds: number) => void;
}

const defaultPlayers: Omit<Player, 'id' | 'score' | 'opponents' | 'colorHistory' | 'hadBye'>[] = [
    { name: 'Magnus Carlsen', elo: 2830 },
    { name: 'Fabiano Caruana', elo: 2805 },
    { name: 'Hikaru Nakamura', elo: 2794 },
    { name: 'Ding Liren', elo: 2775 },
    { name: 'Ian Nepomniachtchi', elo: 2770 },
    { name: 'Alireza Firouzja', elo: 2763 },
    { name: 'Wesley So', elo: 2757 },
    { name: 'Anish Giri', elo: 2754 },
];

const calculateRecommendedRounds = (playerCount: number): number => {
    if (playerCount < 5) return 3; // A practical minimum for a very small tournament.
    // The standard formula: R = ceil(log2(P))
    const recommended = Math.ceil(Math.log2(playerCount));
    return Math.max(3, recommended); // Ensure at least 3 rounds
};


const PlayerSetup: React.FC<PlayerSetupProps> = ({ onStart }) => {
  const [players, setPlayers] = useState(defaultPlayers);
  const [rounds, setRounds] = useState(() => calculateRecommendedRounds(defaultPlayers.length));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const recommendedRounds = calculateRecommendedRounds(players.length);
    setRounds(recommendedRounds);
  }, [players.length]);


  const handlePlayerChange = (index: number, field: 'name' | 'elo', value: string | number) => {
    const newPlayers = [...players];
    if (field === 'elo' && typeof value === 'string') {
        newPlayers[index][field] = parseInt(value, 10) || 0;
    } else {
        newPlayers[index][field] = value as any;
    }
    setPlayers(newPlayers);

    // Clear error on change
    const newErrors = { ...errors };
    const errorKey = `${field}-${index}`;
    if (newErrors[errorKey]) {
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };

  const handleAddPlayer = () => {
    setPlayers([...players, { name: '', elo: 1200 }]);
  };

  const handleRemovePlayer = (indexToRemove: number) => {
    setPlayers(players.filter((_, index) => index !== indexToRemove));
  };

  const validateInputs = (): boolean => {
    const newErrors: Record<string, string> = {};
    players.forEach((player, index) => {
        if (!player.name.trim()) {
            newErrors[`name-${index}`] = 'Player name cannot be empty.';
        }
        if (isNaN(player.elo) || player.elo < 100 || player.elo > 3000) {
            newErrors[`elo-${index}`] = 'ELO must be between 100 and 3000.';
        }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateInputs()) {
        return;
    }

    const initialPlayers: Player[] = players.map((p, i) => ({
      ...p,
      id: i + 1,
      score: 0,
      opponents: [],
      colorHistory: [],
      hadBye: false,
    }));
    onStart(initialPlayers, rounds);
  };
  
  const getInputClass = (hasError: boolean) => {
    const baseClasses = "bg-gray-800 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:outline-none";
    const errorClasses = "border border-red-500 focus:ring-red-500";
    return hasError ? `${baseClasses} ${errorClasses}` : baseClasses;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8">
        <div className="text-center mb-8">
          <ChessKingIcon className="w-16 h-16 mx-auto text-yellow-400" />
          <h1 className="text-4xl font-bold mt-2">Swiss Tournament Setup</h1>
          <p className="text-gray-400 mt-2">Enter player details and configure the tournament.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
          {players.map((player, index) => (
            <div key={index} className="flex items-center gap-3 bg-gray-700 p-3 rounded-lg">
              <span className="text-gray-400 font-semibold w-6 text-center">{index + 1}.</span>
              <div className="flex-grow">
                <input
                  type="text"
                  value={player.name}
                  onChange={(e) => handlePlayerChange(index, 'name', e.target.value)}
                  className={`w-full ${getInputClass(!!errors[`name-${index}`])}`}
                  placeholder="Player Name"
                  aria-invalid={!!errors[`name-${index}`]}
                  aria-describedby={errors[`name-${index}`] ? `name-error-${index}` : undefined}
                />
                {errors[`name-${index}`] && <p id={`name-error-${index}`} className="text-red-500 text-xs mt-1">{errors[`name-${index}`]}</p>}
              </div>
              <div className="w-24 flex-shrink-0">
                <input
                  type="number"
                  value={player.elo}
                  onChange={(e) => handlePlayerChange(index, 'elo', e.target.value)}
                  className={`w-full text-center ${getInputClass(!!errors[`elo-${index}`])}`}
                  placeholder="ELO"
                  aria-invalid={!!errors[`elo-${index}`]}
                  aria-describedby={errors[`elo-${index}`] ? `elo-error-${index}` : undefined}
                />
                {errors[`elo-${index}`] && <p id={`elo-error-${index}`} className="text-red-500 text-xs mt-1">{errors[`elo-${index}`]}</p>}
              </div>
              <button
                onClick={() => handleRemovePlayer(index)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 transition-transform transform hover:scale-110"
                aria-label={`Remove player ${player.name}`}
                title={`Remove ${player.name}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-center mb-6">
            <button
              onClick={handleAddPlayer}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Player
            </button>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
          <label htmlFor="rounds" className="font-semibold text-lg">Number of Rounds:</label>
          <select
            id="rounds"
            value={rounds}
            onChange={(e) => setRounds(parseInt(e.target.value, 10))}
            className="bg-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
          >
            {[...Array(9)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1} {i + 1 === calculateRecommendedRounds(players.length) ? '(Recommended)' : ''}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-4 px-4 rounded-lg text-xl transition duration-300 transform hover:scale-105"
        >
          Start Tournament
        </button>
      </div>
    </div>
  );
};

export default PlayerSetup;