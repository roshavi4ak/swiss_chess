import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Player, Pairing, TournamentStatus, Result } from './types';
import PlayerSetup from './components/PlayerSetup';
import Leaderboard from './components/Leaderboard';
import Pairings from './components/Pairings';
import { generateRound1Pairings, generateNextRoundPairings } from './services/pairing';
import { ChessKingIcon } from './components/Icon';
import ShareControl from './components/ShareControl';
import History from './components/History';
import SwapConfirmationDialog from './components/SwapConfirmationDialog';


// This interface will be used for the data passed to the Leaderboard component.
export interface LeaderboardPlayer extends Player {
  fullColorHistory: string[];
}

type PendingSwap = {
  player1: Player;
  table1: number;
  player2: Player;
  table2: number;
};


const App: React.FC = () => {
  const [status, setStatus] = useState<TournamentStatus>('SETUP');
  const [players, setPlayers] = useState<Player[]>([]);
  const [pairingsHistory, setPairingsHistory] = useState<Pairing[][]>([]);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [totalRounds, setTotalRounds] = useState<number>(0);
  const [organizerKey, setOrganizerKey] = useState<string | null>(null);
  const [role, setRole] = useState<'ORGANIZER' | 'OBSERVER'>('OBSERVER');
  const [view, setView] = useState<'TOURNAMENT' | 'HISTORY'>('TOURNAMENT');
  const [swapSelection, setSwapSelection] = useState<{ playerId: number; table: number } | null>(null);
  const [isObserving, setIsObserving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SAVED'>('IDLE');
  const [pendingSwap, setPendingSwap] = useState<PendingSwap | null>(null);


  // Logic to save state, extracted to be reusable
  const saveStateToLocalStorage = useCallback(() => {
    if (status !== 'SETUP') {
      const stateToSave = {
        status,
        players,
        pairingsHistory,
        currentRound,
        totalRounds,
        organizerKey,
      };
      localStorage.setItem('swissTournamentState', JSON.stringify(stateToSave));
      return true;
    }
    return false;
  }, [status, players, pairingsHistory, currentRound, totalRounds, organizerKey]);

  // Load state from localStorage on initial component mount
  useEffect(() => {
    try {
      const savedStateJSON = localStorage.getItem('swissTournamentState');
      if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);
        if (savedState && savedState.status !== 'SETUP') {
          const hash = window.location.hash;
          if (savedState.organizerKey && hash === `#organizer-${savedState.organizerKey}`) {
            setRole('ORGANIZER');
          } else {
            setRole('OBSERVER');
          }

          setPlayers(savedState.players);
          setPairingsHistory(savedState.pairingsHistory);
          setCurrentRound(savedState.currentRound);
          setTotalRounds(savedState.totalRounds);
          setOrganizerKey(savedState.organizerKey);
          setStatus(savedState.status);
        }
      }
    } catch (error) {
      console.error("Failed to load tournament state from localStorage", error);
      localStorage.removeItem('swissTournamentState');
    }
  }, []);

  // Auto-save state to localStorage whenever it changes
  useEffect(() => {
    saveStateToLocalStorage();
  }, [saveStateToLocalStorage]);

  const handleManualSave = () => {
    if (saveStateToLocalStorage()) {
      setSaveStatus('SAVED');
      setTimeout(() => setSaveStatus('IDLE'), 2000);
    }
  };

  const handleStartTournament = (initialPlayers: Player[], rounds: number) => {
    const newKey = Math.random().toString(36).substring(2, 11);
    const round1Pairings = generateRound1Pairings(initialPlayers);
    
    setOrganizerKey(newKey);
    setRole('ORGANIZER');
    window.location.hash = `#organizer-${newKey}`;
    
    setPlayers(initialPlayers);
    setTotalRounds(rounds);
    setPairingsHistory([round1Pairings]);
    setCurrentRound(1);
    setStatus('IN_PROGRESS');
    setView('TOURNAMENT');
  };
  
  const handleNewTournament = () => {
    if (window.confirm("Are you sure? This will delete the current tournament data and start a new one.")) {
      // Clear the tournament state from local storage.
      localStorage.removeItem('swissTournamentState');
      
      // Reset all state variables to their initial values.
      setStatus('SETUP');
      setPlayers([]);
      setPairingsHistory([]);
      setCurrentRound(0);
      setTotalRounds(0);
      setOrganizerKey(null);
      setRole('OBSERVER');
      setView('TOURNAMENT');
      setSwapSelection(null);
      setIsObserving(false);
      setPendingSwap(null);


      // Clear the URL hash to remove the organizer key from the URL.
      // This prevents re-entering organizer mode on refresh.
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const handleResultUpdate = (table: number, result: Result) => {
    if (role !== 'ORGANIZER' || isObserving) return;

    const newPairingsHistory = pairingsHistory.map((roundPairings, index) => {
      // If it's not the current round, return the original array
      if (index !== currentRound - 1) {
        return roundPairings;
      }
      
      // For the current round, create a new array of pairings
      return roundPairings.map(pairing => {
        if (pairing.table === table) {
          // If this is the pairing to update, return a new object with the new result
          return { ...pairing, result };
        }
        // Otherwise, return the original pairing object
        return pairing;
      });
    });
    
    setPairingsHistory(newPairingsHistory);
  };

  const handlePlayerSelectForSwap = (playerId: number, table: number) => {
    if (role !== 'ORGANIZER' || isObserving || status !== 'IN_PROGRESS') return;

    if (!swapSelection) {
      // First player selected
      setSwapSelection({ playerId, table });
    } else if (swapSelection.playerId === playerId) {
      // Same player clicked again, deselect
      setSwapSelection(null);
    } else if (swapSelection.table === table) {
      // Different player on the same table clicked, select the new one
      setSwapSelection({ playerId, table });
    } else {
      // Second player on a different table selected, prepare for swap confirmation
      const currentRoundPairings = pairingsHistory[currentRound - 1];
      
      const pairing1 = currentRoundPairings.find(p => p.table === swapSelection.table);
      const pairing2 = currentRoundPairings.find(p => p.table === table);

      if (!pairing1 || !pairing2) return;

      const player1 = pairing1.white.id === swapSelection.playerId ? pairing1.white : pairing1.black;
      const player2 = pairing2.white.id === playerId ? pairing2.white : pairing2.black;

      if (!player1 || !player2) return;

      setPendingSwap({
        player1,
        table1: swapSelection.table,
        player2,
        table2: table,
      });

      setSwapSelection(null);
    }
  };

  const handleConfirmSwap = () => {
    if (!pendingSwap) return;

    const { player1, table1, player2, table2 } = pendingSwap;

    const newPairingsHistory = [...pairingsHistory.map(r => r.map(p => ({...p})))];
    const currentRoundPairings = newPairingsHistory[currentRound - 1];

    const table1Index = currentRoundPairings.findIndex(p => p.table === table1);
    const table2Index = currentRoundPairings.findIndex(p => p.table === table2);

    if (table1Index === -1 || table2Index === -1) {
        console.error("Could not find tables for swap");
        setPendingSwap(null);
        return;
    }
    
    const pairing1 = currentRoundPairings[table1Index];
    const pairing2 = currentRoundPairings[table2Index];

    const player1IsWhite = pairing1.white.id === player1.id;
    
    // Perform the swap
    if (player1IsWhite) {
        pairing1.white = player2;
    } else {
        pairing1.black = player2;
    }

    const player2IsWhite = pairing2.white.id === player2.id;
    if (player2IsWhite) {
        pairing2.white = player1;
    } else {
        pairing2.black = player1;
    }

    // Reset results for the affected tables
    pairing1.result = pairing1.black === null ? 'BYE' : null;
    pairing2.result = pairing2.black === null ? 'BYE' : null;

    currentRoundPairings[table1Index] = pairing1;
    currentRoundPairings[table2Index] = pairing2;

    setPairingsHistory(newPairingsHistory);
    setPendingSwap(null);
  };
  
  const handleCancelSwap = () => {
    setPendingSwap(null);
  };

  const handleNextRound = () => {
    const lastRoundPairings = pairingsHistory[currentRound - 1];
    const playerMap = new Map<number, Player>(players.map(p => [p.id, { ...p, opponents: [...p.opponents], colorHistory: [...p.colorHistory] }]));

    lastRoundPairings.forEach(pairing => {
      if (pairing.black === null && pairing.result === 'BYE') {
        const byePlayer = playerMap.get(pairing.white.id)!;
        byePlayer.score += 1;
        byePlayer.hadBye = true;
        playerMap.set(byePlayer.id, byePlayer);
      } else if (pairing.black) {
        const white = playerMap.get(pairing.white.id)!;
        const black = playerMap.get(pairing.black.id)!;

        white.opponents.push(black.id);
        black.opponents.push(white.id);
        white.colorHistory.push('white');
        black.colorHistory.push('black');

        if (pairing.result === '1-0') white.score += 1;
        else if (pairing.result === '0-1') black.score += 1;
        else if (pairing.result === '1/2-1/2') {
          white.score += 0.5;
          black.score += 0.5;
        }
        playerMap.set(white.id, white);
        playerMap.set(black.id, black);
      }
    });

    const updatedPlayers = Array.from(playerMap.values());
    setPlayers(updatedPlayers);

    if (currentRound >= totalRounds) {
      setStatus('COMPLETED');
      return;
    }

    const nextRoundPairings = generateNextRoundPairings(updatedPlayers, pairingsHistory.flat(), currentRound + 1);
    setPairingsHistory([...pairingsHistory, nextRoundPairings]);
    setCurrentRound(currentRound + 1);
    setSwapSelection(null); // Clear swap selection for new round
  };
  
  const currentPairings = useMemo(() => pairingsHistory[currentRound - 1] || [], [pairingsHistory, currentRound]);
  const allResultsSubmitted = useMemo(() => currentPairings.every(p => p.result !== null), [currentPairings]);

  const livePlayers: LeaderboardPlayer[] = useMemo(() => {
    if (status === 'COMPLETED') {
      return players.map(p => ({
        ...p,
        fullColorHistory: p.colorHistory.map(c => c === 'white' ? 'W' : 'B')
      }));
    }

    if (status !== 'IN_PROGRESS' || !currentPairings.length) {
      return players.map(p => ({
        ...p,
        fullColorHistory: []
      }));
    }

    const baseScores = new Map<number, number>();
    players.forEach(p => baseScores.set(p.id, p.score));

    const liveScores = new Map<number, number>(baseScores);

    for (const pairing of currentPairings) {
      if (!pairing.result) continue;

      if (pairing.result === 'BYE') {
        const baseScore = baseScores.get(pairing.white.id) ?? 0;
        liveScores.set(pairing.white.id, baseScore + 1);
      } else if (pairing.black) {
        const whiteId = pairing.white.id;
        const blackId = pairing.black.id;
        
        const whiteBaseScore = baseScores.get(whiteId) ?? 0;
        const blackBaseScore = baseScores.get(blackId) ?? 0;

        if (pairing.result === '1-0') {
          liveScores.set(whiteId, whiteBaseScore + 1);
          liveScores.set(blackId, blackBaseScore);
        } else if (pairing.result === '0-1') {
          liveScores.set(whiteId, whiteBaseScore);
          liveScores.set(blackId, blackBaseScore + 1);
        } else if (pairing.result === '1/2-1/2') {
          liveScores.set(whiteId, whiteBaseScore + 0.5);
          liveScores.set(blackId, blackBaseScore + 0.5);
        }
      }
    }
    
    return players.map(player => {
      const liveScore = liveScores.get(player.id) ?? player.score;
      
      let currentColor: 'W' | 'B' | null = null;
      const pairingForPlayer = currentPairings.find(p => p.white.id === player.id || (p.black && p.black.id === player.id));
      if (pairingForPlayer) {
        currentColor = pairingForPlayer.white.id === player.id ? 'W' : 'B';
      }

      const historicalColors = player.colorHistory.map(c => c === 'white' ? 'W' : 'B');
      const fullColorHistory = currentColor ? [...historicalColors, currentColor] : historicalColors;

      return {
        ...player,
        score: liveScore,
        fullColorHistory,
      };
    });
  }, [players, currentPairings, status]);

  const handlePrint = (sectionId: string) => {
    const printSection = document.getElementById(sectionId);
    if (!printSection) return;

    const handleAfterPrint = () => {
      document.body.classList.remove('printing');
      printSection.classList.remove('printable-section');
      window.removeEventListener('afterprint', handleAfterPrint);
    };

    window.addEventListener('afterprint', handleAfterPrint);
    
    printSection.classList.add('printable-section');
    document.body.classList.add('printing');
    window.print();
  };

  if (status === 'SETUP') {
    return <PlayerSetup onStart={handleStartTournament} />;
  }
  
  if (view === 'HISTORY') {
    return <History pairingsHistory={pairingsHistory} onClose={() => setView('TOURNAMENT')} />
  }

  const isOrganizerView = role === 'ORGANIZER' && !isObserving;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8 no-print">
            <div className="inline-flex justify-center items-center gap-4 relative">
                <ChessKingIcon className="w-10 h-10 text-yellow-400"/>
                <h1 className="text-4xl font-bold">Swiss Tournament</h1>
                <p className="absolute -bottom-5 text-lg text-yellow-300 font-semibold">
                    {status === 'COMPLETED' ? 'Tournament Completed' : `Round ${currentRound} / ${totalRounds}`}
                </p>
            </div>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div id="pairings-section" className="lg:col-span-2">
            <Pairings 
              pairings={currentPairings}
              onResultUpdate={handleResultUpdate}
              isOrganizer={isOrganizerView}
              swapSelection={swapSelection}
              onPlayerSelectForSwap={handlePlayerSelectForSwap}
              onPrint={() => handlePrint('pairings-section')}
            />
          </div>
          <div id="leaderboard-section" className="lg:col-span-1">
            <Leaderboard players={livePlayers} onPrint={() => handlePrint('leaderboard-section')} />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center items-center gap-4 no-print">
          {status === 'IN_PROGRESS' && isOrganizerView && (
            <button
              onClick={handleNextRound}
              disabled={!allResultsSubmitted}
              className="w-full sm:w-auto bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed enabled:hover:bg-green-700 enabled:transform enabled:hover:scale-105"
            >
              {`Start Next Round (${currentRound + 1})`}
            </button>
          )}
          {status === 'COMPLETED' && (
            <p className="text-2xl font-bold text-green-400">🏆 Tournament Finished! 🏆</p>
          )}
          {isOrganizerView && (
            <button
              onClick={handleManualSave}
              className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
            >
              {saveStatus === 'SAVED' ? '✓ Saved!' : 'Save Tournament'}
            </button>
          )}
          <button
            onClick={() => setView('HISTORY')}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
          >
            View History
          </button>
           {role === 'ORGANIZER' && (
            <button
                onClick={() => setIsObserving(!isObserving)}
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
            >
                {isObserving ? 'Return to Organizer View' : 'Observer View'}
            </button>
           )}
        </div>
        
        {isOrganizerView && (
            <>
                <ShareControl 
                    organizerKey={organizerKey} 
                    tournamentData={{ status, players, pairingsHistory, currentRound, totalRounds }} 
                />
                <div className="mt-4 flex justify-center no-print">
                    <button
                        onClick={handleNewTournament}
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
                    >
                        New Tournament
                    </button>
                </div>
            </>
        )}
      </div>
      <SwapConfirmationDialog 
        isOpen={!!pendingSwap}
        onConfirm={handleConfirmSwap}
        onCancel={handleCancelSwap}
        swapDetails={pendingSwap}
      />
    </div>
  );
};

export default App;