import React, { useState, useEffect } from 'react';
import { Player, AgeGroup } from '../types';
import { ChessKingIcon } from './Icon';
import { useI18n } from '../i18n/I18nContext';
import TournamentList from './TournamentList';

interface PlayerSetupProps {
  onStart: (players: Player[], rounds: number, ageGroups: AgeGroup[]) => void;
  initialPlayers?: Omit<Player, 'id' | 'score' | 'opponents' | 'colorHistory' | 'hadBye'>[];
  initialAgeGroups?: Omit<AgeGroup, 'id'>[];
  initialRounds?: number;
  isEditing?: boolean;
}

const defaultPlayers: Omit<Player, 'id' | 'score' | 'opponents' | 'colorHistory' | 'hadBye'>[] = [
    { name: 'Magnus Carlsen', elo: 2830, age: 33, playerNumber: 1, sex: 'М' },
    { name: 'Fabiano Caruana', elo: 2805, age: 32, playerNumber: 2, sex: 'М' },
    { name: 'Hikaru Nakamura', elo: 2794, age: 36, playerNumber: 3, sex: 'М' },
    { name: 'Ding Liren', elo: 2775, age: 32, playerNumber: 4, sex: 'М' },
    { name: 'Ian Nepomniachtchi', elo: 2770, age: 34, playerNumber: 5, sex: 'М' },
    { name: 'Alireza Firouzja', elo: 2763, age: 22, playerNumber: 6, sex: 'М' },
    { name: 'Wesley So', elo: 2757, age: 31, playerNumber: 7, sex: 'М' },
    { name: 'Anish Giri', elo: 2754, age: 30, playerNumber: 8, sex: 'М' },
];

const defaultAgeGroups: Omit<AgeGroup, 'id'>[] = [
    { name: 'U10', minAge: 6, maxAge: 9 },
    { name: 'U12', minAge: 10, maxAge: 11 },
    { name: 'U14', minAge: 12, maxAge: 13 },
    { name: 'U16', minAge: 14, maxAge: 15 },
    { name: 'U18', minAge: 16, maxAge: 17 },
];

const calculateRecommendedRounds = (playerCount: number): number => {
    if (playerCount < 5) return 3; // A practical minimum for a very small tournament.
    // The standard formula: R = ceil(log2(P))
    const recommended = Math.ceil(Math.log2(playerCount));
    return Math.max(3, recommended); // Ensure at least 3 rounds
};

const PlayerSetup: React.FC<PlayerSetupProps> = ({ 
  onStart, 
  initialPlayers, 
  initialAgeGroups, 
  initialRounds, 
  isEditing = false 
}) => {
  const { t } = useI18n();
  const [showTournamentList, setShowTournamentList] = useState(false);
  
  // Initialize with props if provided, otherwise use defaults
  const [players, setPlayers] = useState<Omit<Player, 'id' | 'score' | 'opponents' | 'colorHistory' | 'hadBye'>[]>(
    initialPlayers || defaultPlayers
  );
  const [ageGroups, setAgeGroups] = useState(
    (initialAgeGroups || defaultAgeGroups).map((group, index) => ({...group, id: index + 1}))
  );
  const [rounds, setRounds] = useState(() => 
    initialRounds || calculateRecommendedRounds((initialPlayers || defaultPlayers).length)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const recommendedRounds = calculateRecommendedRounds(players.length);
    setRounds(prev => prev || recommendedRounds);
  }, [players.length]);


  const handlePlayerChange = (index: number, field: 'name' | 'elo' | 'age' | 'playerNumber' | 'sex', value: string | number) => {
    const newPlayers = [...players];
    if (field === 'elo' && typeof value === 'string') {
        newPlayers[index][field] = parseInt(value, 10) || 0;
    } else if (field === 'age' && typeof value === 'string') {
        newPlayers[index][field] = parseInt(value, 10) || 0;
    } else if (field === 'playerNumber' && typeof value === 'string') {
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
    setPlayers([...players, { name: '', elo: 1200, age: 12, playerNumber: players.length + 1, sex: 'М' }]);
  };

  const handleRemovePlayer = (indexToRemove: number) => {
    setPlayers(players.filter((_, index) => index !== indexToRemove));
  };

  const handleAddAgeGroup = () => {
    setAgeGroups([...ageGroups, { id: ageGroups.length + 1, name: '', minAge: 6, maxAge: 8 }]);
  };

  const handleRemoveAgeGroup = (indexToRemove: number) => {
    setAgeGroups(ageGroups.filter((_, index) => index !== indexToRemove));
  };

  const handleAgeGroupChange = (index: number, field: 'name' | 'minAge' | 'maxAge', value: string | number) => {
    const newAgeGroups = [...ageGroups];
    if ((field === 'minAge' || field === 'maxAge') && typeof value === 'string') {
        newAgeGroups[index][field] = parseInt(value, 10) || 0;
    } else {
        newAgeGroups[index][field] = value as any;
    }
    setAgeGroups(newAgeGroups);
  };

  const validateInputs = (): boolean => {
    const newErrors: Record<string, string> = {};
    players.forEach((player, index) => {
        if (!player.name.trim()) {
            newErrors[`name-${index}`] = t.nameError;
        }
        if (isNaN(player.elo) || player.elo < 100 || player.elo > 3000) {
            newErrors[`elo-${index}`] = t.eloError;
        }
        if (isNaN(player.age) || player.age < 5 || player.age > 100) {
            newErrors[`age-${index}`] = t.ageError;
        }
        if (isNaN(player.playerNumber) || player.playerNumber <= 0) {
            newErrors[`playerNumber-${index}`] = t.numberError;
        }
        if (!player.sex || (player.sex !== 'Ж' && player.sex !== 'М')) {
            newErrors[`sex-${index}`] = t.sexError;
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
    onStart(initialPlayers, rounds, ageGroups);
  };

  const handleTournamentSelect = (tournamentId: string) => {
    // Navigate to the selected tournament in ORGANIZER mode
    window.location.href = `/${tournamentId}#organizer-roshavi4ak`;
  };

  const handleShowTournamentList = () => {
    setShowTournamentList(true);
  };

  const handleCloseTournamentList = () => {
    setShowTournamentList(false);
  };
  
  const getInputClass = (hasError: boolean) => {
    const baseClasses = "bg-gray-800 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:outline-none";
    const errorClasses = "border border-red-500 focus:ring-red-500";
    return hasError ? `${baseClasses} ${errorClasses}` : baseClasses;
  };

  // Show tournament list if requested
  if (showTournamentList) {
    return (
      <TournamentList
        onTournamentSelect={handleTournamentSelect}
        onClose={handleCloseTournamentList}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8">
        <div className="text-center mb-8">
          <ChessKingIcon className="w-16 h-16 mx-auto text-yellow-400" />
          <h1 className="text-4xl font-bold mt-2">
            {isEditing ? 'Edit Tournament' : t.swissTournamentSetup}
          </h1>
          <p className="text-gray-400 mt-2">
            {isEditing ? 'Edit player details and age groups' : t.enterPlayerDetails}
          </p>
          
          {/* Past Tournaments Button - only show if not editing */}
          {!isEditing && (
            <div className="mt-4">
              <button
                onClick={handleShowTournamentList}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center gap-2 mx-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 1a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                Past Tournaments
              </button>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">Players</h2>
          <div className="grid grid-cols-1 gap-4 mb-6">
            {players.map((player, index) => (
              <div key={index} className="bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
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
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">ELO</label>
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
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Age</label>
                    <input
                      type="number"
                      value={player.age}
                      onChange={(e) => handlePlayerChange(index, 'age', e.target.value)}
                      className={`w-full text-center ${getInputClass(!!errors[`age-${index}`])}`}
                      placeholder="Age"
                      min="5"
                      max="100"
                      aria-invalid={!!errors[`age-${index}`]}
                      aria-describedby={errors[`age-${index}`] ? `age-error-${index}` : undefined}
                    />
                    {errors[`age-${index}`] && <p id={`age-error-${index}`} className="text-red-500 text-xs mt-1">{errors[`age-${index}`]}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Number</label>
                    <input
                      type="number"
                      value={player.playerNumber}
                      onChange={(e) => handlePlayerChange(index, 'playerNumber', e.target.value)}
                      className={`w-full text-center ${getInputClass(!!errors[`playerNumber-${index}`])}`}
                      placeholder="Number"
                      min="1"
                      aria-invalid={!!errors[`playerNumber-${index}`]}
                      aria-describedby={errors[`playerNumber-${index}`] ? `playerNumber-error-${index}` : undefined}
                    />
                    {errors[`playerNumber-${index}`] && <p id={`playerNumber-error-${index}`} className="text-red-500 text-xs mt-1">{errors[`playerNumber-${index}`]}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Sex</label>
                    <select
                      value={player.sex}
                      onChange={(e) => handlePlayerChange(index, 'sex', e.target.value as 'Ж' | 'М')}
                      className={`w-full text-center ${getInputClass(!!errors[`sex-${index}`])}`}
                      aria-invalid={!!errors[`sex-${index}`]}
                      aria-describedby={errors[`sex-${index}`] ? `sex-error-${index}` : undefined}
                    >
                      <option value="М">М</option>
                      <option value="Ж">Ж</option>
                    </select>
                    {errors[`sex-${index}`] && <p id={`sex-error-${index}`} className="text-red-500 text-xs mt-1">{errors[`sex-${index}`]}</p>}
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      onClick={() => handleRemovePlayer(index)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold p-2 rounded-lg transition-transform transform hover:scale-105"
                      aria-label={`Remove player ${player.name}`}
                      title={`Remove ${player.name}`}
                    >
                      {t.deletePlayer || 'Delete'}
                    </button>
                  </div>
                </div>
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
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">Age Groups</h2>
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-300 mb-4">Define age groups for medal awards. Best 3 players in each group will receive medals.</p>
            <div className="grid grid-cols-1 gap-4 mb-4">
              {ageGroups.map((group, index) => (
                <div key={group.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Group Name</label>
                    <input
                      type="text"
                      value={group.name}
                      onChange={(e) => handleAgeGroupChange(index, 'name', e.target.value)}
                      className="w-full bg-gray-800 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                      placeholder="U10, U12, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Min Age</label>
                    <input
                      type="number"
                      value={group.minAge}
                      onChange={(e) => handleAgeGroupChange(index, 'minAge', e.target.value)}
                      className="w-full bg-gray-800 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                      placeholder="6"
                      min="5"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Max Age</label>
                    <input
                      type="number"
                      value={group.maxAge}
                      onChange={(e) => handleAgeGroupChange(index, 'maxAge', e.target.value)}
                      className="w-full bg-gray-800 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                      placeholder="8"
                      min="5"
                      max="100"
                    />
                  </div>
                  <div>
                    <button
                      onClick={() => handleRemoveAgeGroup(index)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <button
                onClick={handleAddAgeGroup}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Age Group
              </button>
            </div>
          </div>
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
          {isEditing ? 'Save Changes' : 'Start Tournament'}
        </button>
      </div>
    </div>
  );
};

export default PlayerSetup;