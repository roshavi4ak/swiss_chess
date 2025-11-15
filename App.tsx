import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Player, Pairing, TournamentStatus, Result, AgeGroup } from './types';
import PlayerSetup from './components/PlayerSetup';
import Leaderboard from './components/Leaderboard';
import Pairings from './components/Pairings';
import { generateRound1Pairings, generateNextRoundPairings } from './services/pairing';
import { ChessKingIcon } from './components/Icon';
import ShareControl from './components/ShareControl';
import History from './components/History';
import SwapConfirmationDialog from './components/SwapConfirmationDialog';
import PlayerHistoryModal from './components/PlayerHistoryModal';
import PlayerSelectionDialog from './components/PlayerSelectionDialog';
import LanguageSwitcher from './i18n/LanguageSwitcher';
import { useI18n } from './i18n/I18nContext';
import { DataSync } from './services/api';


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
  const { t } = useI18n();
  const [status, setStatus] = useState<TournamentStatus>('SETUP');
  const [players, setPlayers] = useState<Player[]>([]);
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
  const [pairingsHistory, setPairingsHistory] = useState<Pairing[][]>([]);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [totalRounds, setTotalRounds] = useState<number>(0);
  const [organizerKey, setOrganizerKey] = useState<string | null>(null);
  const [role, setRole] = useState<'ORGANIZER' | 'OBSERVER'>('OBSERVER');
  const [view, setView] = useState<'TOURNAMENT' | 'HISTORY' | 'EDIT'>('TOURNAMENT');
  const [swapSelection, setSwapSelection] = useState<{ playerId: number; table: number } | null>(null);
  const [isObserving, setIsObserving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SAVED'>('IDLE');
  const [pendingSwap, setPendingSwap] = useState<PendingSwap | null>(null);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedAgeGroupFilter, setSelectedAgeGroupFilter] = useState<number | null>(null);
  const [selectedWomenFilter, setSelectedWomenFilter] = useState<boolean>(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showPlayerHistory, setShowPlayerHistory] = useState<boolean>(false);
  const [showPlayerSelection, setShowPlayerSelection] = useState<boolean>(false);


  // Extract tournament ID from URL path
  const getTournamentId = () => {
    const path = window.location.pathname;
    const match = path.match(/\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  };
  // Logic to save state, extracted to be reusable
  const saveStateToLocalStorage = useCallback(() => {
    // Only save state if not in SETUP status AND user is ORGANIZER
    if (status !== 'SETUP' && role === 'ORGANIZER') {
      const stateToSave = {
        status,
        players,
        ageGroups,
        pairingsHistory,
        currentRound,
        totalRounds,
        organizerKey,
      };
      const tournamentId = getTournamentId();
      if (tournamentId) {
        // Save to both localStorage and server using DataSync
        DataSync.saveTournamentData(tournamentId, stateToSave);
      }
      return true;
    }
    return false;
  }, [status, players, ageGroups, pairingsHistory, currentRound, totalRounds, organizerKey, role]);

  // Load state from localStorage on initial component mount
  useEffect(() => {
    const loadTournamentData = async () => {
      try {
        const tournamentId = getTournamentId();
        const hash = window.location.hash;
        console.log('App: loadTournamentData called', { tournamentId, hash });

        if (tournamentId) {
          // Try to load from server first, fallback to localStorage
          const savedState = await DataSync.loadTournamentData(tournamentId);
          console.log('App: loaded state from DataSync', { savedState: savedState ? { status: savedState.status, organizerKey: savedState.organizerKey } : null });

          if (savedState && savedState.status !== 'SETUP') {
            const isOrganizerHash = savedState.organizerKey && hash === `#organizer-${savedState.organizerKey}`;
            console.log('App: determining role', { organizerKey: savedState.organizerKey, hash, isOrganizerHash });

            if (isOrganizerHash) {
              console.log('App: setting role to ORGANIZER');
              setRole('ORGANIZER');
            } else {
              console.log('App: setting role to OBSERVER');
              setRole('OBSERVER');
            }

            setPlayers(savedState.players);
            setAgeGroups(savedState.ageGroups || []);
            setPairingsHistory(savedState.pairingsHistory);
            setCurrentRound(savedState.currentRound);
            setTotalRounds(savedState.totalRounds);
            setOrganizerKey(savedState.organizerKey);
            setStatus(savedState.status);
          } else {
            console.log('App: no valid saved state found, keeping default role OBSERVER');
          }
        } else {
          // Fallback to old single tournament logic for backward compatibility
          const savedStateJSON = localStorage.getItem('swissTournamentState');
          console.log('App: checking legacy localStorage', { savedStateJSON: !!savedStateJSON });

          if (savedStateJSON) {
            const savedState = JSON.parse(savedStateJSON);
            if (savedState && savedState.status !== 'SETUP') {
              const isOrganizerHash = savedState.organizerKey && hash === `#organizer-${savedState.organizerKey}`;
              console.log('App: legacy determining role', { organizerKey: savedState.organizerKey, hash, isOrganizerHash });

              if (isOrganizerHash) {
                console.log('App: legacy setting role to ORGANIZER');
                setRole('ORGANIZER');
              } else {
                console.log('App: legacy setting role to OBSERVER');
                setRole('OBSERVER');
              }

              setPlayers(savedState.players);
              setAgeGroups(savedState.ageGroups || []);
              setPairingsHistory(savedState.pairingsHistory);
              setCurrentRound(savedState.currentRound);
              setTotalRounds(savedState.totalRounds);
              setOrganizerKey(savedState.organizerKey);
              setStatus(savedState.status);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load tournament state", error);
      } finally {
        // Always set loading to false when data loading is complete
        setIsLoading(false);
      }
    };

    loadTournamentData();
  }, []);

  // Auto-save state to localStorage whenever it changes
  useEffect(() => {
    saveStateToLocalStorage();
  }, [saveStateToLocalStorage]);

  // Separate effect for password protection that runs on mount
  useEffect(() => {
    const checkPasswordProtection = () => {
      const tournamentId = getTournamentId();
      const isAuthenticated = sessionStorage.getItem('authenticated') === 'true';
      const hash = window.location.hash;

      console.log('Password check:', { tournamentId, isAuthenticated, hash });

      if (!tournamentId) {
        // Root URL requires authentication
        if (!isAuthenticated) {
          setShowPasswordPrompt(true);
        }
      } else {
        // Tournament URLs with organizer hash require authentication
        if (hash === '#organizer-roshavi4ak' && !isAuthenticated) {
          setShowPasswordPrompt(true);
        }
      }
    };

    checkPasswordProtection();
  }, []);

  // Smart data polling for observer pages - only update when data changes
  useEffect(() => {
    const tournamentId = getTournamentId();
    
    // Only poll observer pages (not root URL, not organizer pages)
    if (tournamentId && role === 'OBSERVER') {
      const pollForUpdates = async () => {
        try {
          console.log('Observer: Checking for tournament updates...');
          const latestData = await DataSync.loadTournamentData(tournamentId);
          
          if (latestData && latestData.status !== 'SETUP') {
            // Compare with current state to see if anything changed
            const hasChanges =
              latestData.status !== status ||
              latestData.currentRound !== currentRound ||
              latestData.totalRounds !== totalRounds ||
              JSON.stringify(latestData.players) !== JSON.stringify(players) ||
              JSON.stringify(latestData.pairingsHistory) !== JSON.stringify(pairingsHistory);
            
            if (hasChanges) {
              console.log('Observer: Tournament data changed, updating display...');
              
              // Only update the state if there are actual changes
              setPlayers(latestData.players);
              setPairingsHistory(latestData.pairingsHistory);
              setCurrentRound(latestData.currentRound);
              setTotalRounds(latestData.totalRounds);
              setStatus(latestData.status);
              setOrganizerKey(latestData.organizerKey);
              
              console.log('Observer: Tournament display updated with latest data');
            } else {
              console.log('Observer: No changes detected');
            }
          }
        } catch (error) {
          console.error('Observer: Error checking for updates:', error);
        }
      };

      // Initial check
      pollForUpdates();
      
      // Poll every 10 seconds for updates
      const pollInterval = setInterval(pollForUpdates, 10000);

      return () => clearInterval(pollInterval);
    }
  }, [role, status, currentRound, totalRounds, players, pairingsHistory]);

  const handleManualSave = () => {
    if (saveStateToLocalStorage()) {
      setSaveStatus('SAVED');
      setTimeout(() => setSaveStatus('IDLE'), 2000);
    }
  };

  const handleStartTournament = async (initialPlayers: Player[], rounds: number, tournamentAgeGroups: AgeGroup[], customTournamentId?: string) => {
    // Use custom tournament ID if provided, otherwise create new one
    let newTournamentId: string;
    
    if (customTournamentId && customTournamentId.trim()) {
      // Check if tournament with this ID already exists
      const existingData = await DataSync.loadTournamentData(customTournamentId.trim());
      if (existingData) {
        alert(`Tournament ID "${customTournamentId}" already exists. Please choose a different ID.`);
        return;
      }
      newTournamentId = customTournamentId.trim();
    } else {
      // Generate new ID automatically
      newTournamentId = await DataSync.createNewTournament({
        status: 'IN_PROGRESS',
        players: initialPlayers,
        ageGroups: tournamentAgeGroups,
        pairingsHistory: [],
        currentRound: 1,
        totalRounds: rounds,
        organizerKey: 'roshavi4ak',
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      });
    }

    // Save tournament data with the chosen ID
    const tournamentData = {
      status: 'IN_PROGRESS',
      players: initialPlayers,
      ageGroups: tournamentAgeGroups,
      pairingsHistory: [],
      currentRound: 1,
      totalRounds: rounds,
      organizerKey: 'roshavi4ak',
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    await DataSync.saveTournamentData(newTournamentId, tournamentData);

    const newKey = 'roshavi4ak'; // Fixed organizer key
    const round1Pairings = generateRound1Pairings(initialPlayers);

    setOrganizerKey(newKey);
    setRole('ORGANIZER');

    setPlayers(initialPlayers);
    setAgeGroups(tournamentAgeGroups);
    setTotalRounds(rounds);
    setPairingsHistory([round1Pairings]);
    setCurrentRound(1);
    setStatus('IN_PROGRESS');
    setView('TOURNAMENT');

    // Navigate to the tournament URL and ensure organizer hash is present
    window.history.pushState(null, '', `/${newTournamentId}`);
    window.location.hash = `#organizer-${newKey}`;
  };
  
  const handleNewTournament = () => {
    if (window.confirm(t.areYouSureDelete)) {
      // Clear the tournament state from local storage.
      const tournamentId = getTournamentId();
      if (tournamentId) {
        localStorage.removeItem(`swissTournamentState-${tournamentId}`);
      }

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
      setShowPlayerSelection(false);
      setSelectedAgeGroupFilter(null);
      setSelectedWomenFilter(false);
      setSelectedPlayer(null);
      setShowPlayerHistory(false);

      // Clear the URL hash to remove the organizer key from the URL.
      // This prevents re-entering organizer mode on refresh.
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === '1905') {
      sessionStorage.setItem('authenticated', 'true');
      setShowPasswordPrompt(false);
      setPasswordInput('');
    } else {
      alert('Incorrect password');
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
    setSwapSelection(null);
  };
  
  const handleCancelSwap = () => {
    setPendingSwap(null);
  };

  const handlePickPlayer = (playerId: number, table: number) => {
    if (role !== 'ORGANIZER' || isObserving || status !== 'IN_PROGRESS') return;

    // Find the selected player
    const currentRoundPairings = pairingsHistory[currentRound - 1];
    const pairing = currentRoundPairings.find(p => p.table === table);
    if (!pairing) return;

    const selectedPlayer = pairing.white.id === playerId ? pairing.white : pairing.black;
    if (!selectedPlayer) return;

    setSelectedPlayer(selectedPlayer);
    setShowPlayerSelection(true);
  };

  const handlePlayerSelectionConfirm = (targetPlayer: Player) => {
    if (!selectedPlayer) return;

    // Find the table of the target player
    const currentRoundPairings = pairingsHistory[currentRound - 1];
    const targetPairing = currentRoundPairings.find(p =>
      p.white.id === targetPlayer.id || (p.black && p.black.id === targetPlayer.id)
    );

    if (!targetPairing) {
      console.error('Could not find pairing for target player');
      return;
    }

    const targetTable = targetPairing.table;

    // Set up the pending swap
    setPendingSwap({
      player1: selectedPlayer,
      table1: currentRoundPairings.find(p =>
        p.white.id === selectedPlayer.id || (p.black && p.black.id === selectedPlayer.id)
      )?.table || 0,
      player2: targetPlayer,
      table2: targetTable,
    });

    // Close the selection dialog
    setShowPlayerSelection(false);
    setSelectedPlayer(null);
  };

  const handlePlayerSelectionCancel = () => {
    setShowPlayerSelection(false);
    setSelectedPlayer(null);
  };

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
    setShowPlayerHistory(true);
  };

  const handleClosePlayerHistory = () => {
    setShowPlayerHistory(false);
    setSelectedPlayer(null);
  };

  const handleColorFlip = (table: number) => {
    if (role !== 'ORGANIZER' || isObserving || status !== 'IN_PROGRESS') return;

    const newPairingsHistory = pairingsHistory.map((roundPairings, index) => {
      // If it's not the current round, return the original array
      if (index !== currentRound - 1) {
        return roundPairings;
      }
      
      // For the current round, create a new array of pairings
      return roundPairings.map(pairing => {
        if (pairing.table === table && pairing.black) {
          // If this is the pairing to flip, swap white and black players
          return {
            ...pairing,
            white: pairing.black,
            black: pairing.white,
            result: null // Reset result when colors are flipped
          };
        }
        // Otherwise, return the original pairing object
        return pairing;
      });
    });
    
    setPairingsHistory(newPairingsHistory);
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
        fullColorHistory: p.colorHistory.map(c => c === 'white' ? t.whiteShort : t.blackShort)
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
    
    let filteredPlayers = players.map(player => {
      const liveScore = liveScores.get(player.id) ?? player.score;
      
      let currentColor: string | null = null;
      const pairingForPlayer = currentPairings.find(p => p.white.id === player.id || (p.black && p.black.id === player.id));
      if (pairingForPlayer) {
        currentColor = pairingForPlayer.white.id === player.id ? t.whiteShort : t.blackShort;
      }

      const historicalColors = player.colorHistory.map(c => c === 'white' ? t.whiteShort : t.blackShort);
      const fullColorHistory = currentColor ? [...historicalColors, currentColor] : historicalColors;

      return {
        ...player,
        score: liveScore,
        fullColorHistory,
      };
    });

    // Apply age group filter
    if (selectedAgeGroupFilter !== null) {
      const ageGroup = ageGroups.find(ag => ag.id === selectedAgeGroupFilter);
      if (ageGroup) {
        filteredPlayers = filteredPlayers.filter(player =>
          player.age >= ageGroup.minAge && player.age <= ageGroup.maxAge
        );
      }
    }

    // Apply women filter
    if (selectedWomenFilter) {
      filteredPlayers = filteredPlayers.filter(player => player.sex === 'Ж');
    }
    
    return filteredPlayers;
  }, [players, currentPairings, status, ageGroups, selectedAgeGroupFilter, selectedWomenFilter]);

  const handlePrint = (sectionId: string) => {
    const printSection = document.getElementById(sectionId);
    if (!printSection) {
      console.error(`Print section with id "${sectionId}" not found`);
      alert('Print section not found. Please try again.');
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Unable to open print window. Please allow pop-ups and try again.');
      return;
    }

    // Generate print-friendly content
    const printContent = printSection.cloneNode(true) as HTMLElement;
    
    // Remove no-print elements from the clone
    const noPrintElements = printContent.querySelectorAll('.no-print');
    noPrintElements.forEach(element => element.remove());
    
    // Remove the h2 header from the cloned content to avoid duplication
    const clonedHeader = printContent.querySelector('h2');
    if (clonedHeader) {
      clonedHeader.remove();
    }
    
    // Remove the organizer instruction text
    const organizerInstruction = printContent.querySelector('p');
    if (organizerInstruction && organizerInstruction.textContent?.includes('organizer')) {
      organizerInstruction.remove();
    }
    
    // Add print styles
    const printStyles = `
      <style>
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          padding: 15px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: white;
          color: #333;
          line-height: 1.4;
        }
        
        h1 {
          text-align: center;
          color: #2c3e50;
          font-size: 24px;
          margin-bottom: 20px;
          border-bottom: 2px solid #3498db;
          padding-bottom: 10px;
        }
        
        h2 {
          color: #2c3e50;
          border-bottom: 2px solid #3498db;
          padding-bottom: 8px;
          margin-bottom: 20px;
          font-size: 18px;
        }
        
        .printable-content {
          background: white;
          border: 1px solid #bdc3c7;
          border-radius: 4px;
          padding: 20px;
          margin-bottom: 15px;
        }
        
        /* Table styling for leaderboard */
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          font-size: 12px;
        }
        
        th {
          background: #34495e;
          color: white;
          font-weight: bold;
          padding: 8px 6px;
          text-align: left;
          border: 1px solid #2c3e50;
        }
        
        td {
          padding: 6px;
          border: 1px solid #ddd;
        }
        
        tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        
        /* Pairings styling - more compact */
        .print-pairing-card {
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 12px;
          margin-bottom: 10px;
          page-break-inside: avoid;
        }
        
        .print-table-header {
          font-size: 14px;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 6px;
          padding-bottom: 3px;
          border-bottom: 1px solid #bdc3c7;
        }
        
        /* Force horizontal layout for player vs player */
        .flex.justify-between.items-center {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          flex-wrap: nowrap !important;
          margin-bottom: 6px !important;
        }
        
        .flex-1 {
          flex: 1 !important;
          display: flex !important;
          align-items: center !important;
        }
        
        .text-left {
          text-align: left !important;
        }
        
        .text-right {
          text-align: right !important;
        }
        
        .player-name {
          font-weight: bold;
          font-size: 12px;
          color: #2c3e50;
        }
        
        .player-elo {
          color: #7f8c8d;
          font-size: 10px;
          margin-left: 3px;
        }
        
        .vs {
          text-align: center;
          font-weight: bold;
          color: #e74c3c;
          font-size: 11px;
          margin: 0 8px;
          background: #fdf2f2;
          padding: 2px 6px;
          border-radius: 8px;
          border: 1px solid #e74c3c;
          white-space: nowrap;
        }
        
        .bye {
          text-align: center;
          background: #d4edda;
          color: #155724;
          padding: 6px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 12px;
        }
        
        /* Results buttons styling */
        .results-section {
          border-top: 1px solid #ddd;
          padding-top: 6px;
          margin-top: 6px;
        }
        
        .result-button {
          display: inline-block;
          padding: 3px 6px;
          margin: 1px;
          border: 1px solid #bbb;
          background: #f8f9fa;
          color: #333;
          text-decoration: none;
          border-radius: 2px;
          font-size: 9px;
          font-weight: bold;
          white-space: nowrap;
        }
        
        .result-button.selected {
          background: #ffd700;
          color: #333;
          border-color: #ffb300;
        }
        
        .flip-button {
          display: inline-block;
          padding: 3px 6px;
          margin: 1px;
          background: #ff9800;
          color: white;
          border: 1px solid #f57c00;
          border-radius: 2px;
          font-size: 9px;
          font-weight: bold;
          white-space: nowrap;
        }
        
        /* Make everything more compact for print */
        .space-y-4 > * + * {
          margin-top: 8px;
        }
        
        .bg-gray-700 {
          background: white !important;
          border: 1px solid #ddd;
        }
        
        .bg-gray-800 {
          background: white !important;
          border: 1px solid #bdc3c7;
        }
        
        .text-yellow-400 {
          color: #2c3e50 !important;
        }
        
        .text-white {
          color: #333 !important;
        }
        
        /* Force elements to stay on same line */
        .rounded-lg {
          border-radius: 3px !important;
        }
        
        .p-2, .p-4 {
          padding: 4px !important;
        }
        
        .mx-4 {
          margin-left: 6px !important;
          margin-right: 6px !important;
        }
        
        .w-12 {
          width: 60px !important;
        }
        
        .font-semibold {
          font-weight: 600 !important;
        }
        
        .text-sm {
          font-size: 10px !important;
        }
        
        .text-xs {
          font-size: 9px !important;
        }
        
        /* Print optimizations */
        @media print {
          body {
            margin: 0;
            padding: 8px;
          }
          
          .printable-content {
            border: 1px solid #333;
            box-shadow: none;
          }
          
          .print-pairing-card {
            break-inside: avoid;
            page-break-inside: avoid;
            margin-bottom: 8px;
            padding: 8px;
          }
          
          table {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          h1, h2 {
            color: #000 !important;
            border-color: #000 !important;
          }
          
          /* Force the specific layout to work */
          .flex {
            display: flex !important;
          }
          
          .justify-between {
            justify-content: space-between !important;
          }
          
          .items-center {
            align-items: center !important;
          }
          
          .flex-1 {
            flex: 1 !important;
          }
        }
      </style>
    `;

    // Generate title and round info for pairings
    const getPrintTitle = () => {
      if (sectionId === 'pairings-section') {
        return `${t.currentRoundPairings} (${t.round} ${currentRound} ${t.outOf} ${totalRounds})`;
      }
      return t.leaderboard;
    };

    // Write content to new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Swiss Chess Tournament - ${sectionId === 'pairings-section' ? 'Pairings' : 'Leaderboard'}</title>
          ${printStyles}
        </head>
        <body>
          <h2>${getPrintTitle()}</h2>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-yellow-400 mb-2">Loading Tournament...</h2>
          <p className="text-gray-300">Please wait while we load the tournament data</p>
        </div>
      </div>
    );
  }

  if (showPasswordPrompt) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">Enter Password</h2>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            className="w-full bg-gray-700 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-4"
            placeholder="Enter password"
            autoFocus
          />
          <button
            onClick={handlePasswordSubmit}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-4 rounded-lg transition"
          >
            Submit
          </button>
        </div>
      </div>
    );
  }

  if (status === 'SETUP') {
    return <PlayerSetup onStart={handleStartTournament} />;
  }
  
  if (view === 'HISTORY') {
    return <History pairingsHistory={pairingsHistory} onClose={() => setView('TOURNAMENT')} />
  }

  if (view === 'EDIT') {
    return (
      <PlayerSetup 
        onStart={(updatedPlayers, updatedRounds, updatedAgeGroups) => {
          const round1Pairings = generateRound1Pairings(updatedPlayers);
          setPlayers(updatedPlayers);
          setAgeGroups(updatedAgeGroups);
          setTotalRounds(updatedRounds);
          setPairingsHistory([round1Pairings]);
          setCurrentRound(1);
          setStatus('IN_PROGRESS');
          setView('TOURNAMENT');
        }} 
        initialPlayers={players}
        initialAgeGroups={ageGroups}
        initialRounds={totalRounds}
        isEditing={true}
      />
    );
  }

  const isOrganizerView = role === 'ORGANIZER' && !isObserving;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8 no-print">
            <div className="flex justify-between items-start">
                <div className="flex-1 flex justify-start">
                    {isOrganizerView && (
                        <button
                            onClick={() => window.location.href = '/'}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center gap-2 mt-4"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 1a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                            </svg>
                            Past Tournaments
                        </button>
                    )}
                </div>
                <div className="inline-flex justify-center items-center gap-4 relative">
                    <ChessKingIcon className="w-10 h-10 text-yellow-400"/>
                    <h1 className="text-4xl font-bold">{t.swissTournament}</h1>
                    <p className="absolute -bottom-5 text-lg text-yellow-300 font-semibold">
                        {status === 'COMPLETED' ? t.tournamentCompleted : `${t.round} ${currentRound} / ${totalRounds}`}
                    </p>
                </div>
                <div className="flex-1 flex justify-end">
                    <LanguageSwitcher className="mt-4" />
                </div>
            </div>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div id="pairings-section" className="order-1 lg:order-1 lg:col-span-2">
            <Pairings
              pairings={currentPairings}
              onResultUpdate={handleResultUpdate}
              onColorFlip={handleColorFlip}
              isOrganizer={isOrganizerView}
              swapSelection={swapSelection}
              onPlayerSelectForSwap={handlePlayerSelectForSwap}
              onPlayerPickForSwap={handlePickPlayer}
              onPrint={() => handlePrint('pairings-section')}
            />
          </div>
          <div id="leaderboard-section" className="order-2 lg:order-2 lg:col-span-1">
            <Leaderboard
              players={livePlayers}
              onPrint={() => handlePrint('leaderboard-section')}
              isOrganizer={isOrganizerView}
              ageGroups={ageGroups}
              selectedAgeGroupFilter={selectedAgeGroupFilter}
              onAgeGroupFilterChange={setSelectedAgeGroupFilter}
              selectedWomenFilter={selectedWomenFilter}
              onWomenFilterChange={setSelectedWomenFilter}
              onPlayerClick={handlePlayerClick}
            />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center items-center gap-4 no-print">
          {status === 'IN_PROGRESS' && isOrganizerView && (
            <button
              onClick={handleNextRound}
              disabled={!allResultsSubmitted}
              className="w-full sm:w-auto bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed enabled:hover:bg-green-700 enabled:transform enabled:hover:scale-105"
            >
              {t.startNextRound} ({currentRound + 1})
            </button>
          )}
          {status === 'COMPLETED' && (
            <p className="text-2xl font-bold text-green-400">{t.tournamentFinished}</p>
          )}
          {isOrganizerView && (
            <>
              <button
                onClick={handleManualSave}
                className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
              >
                {saveStatus === 'SAVED' ? t.saved : t.saveTournament}
              </button>
              <button
                onClick={() => setView('EDIT')}
                className="w-full sm:w-auto bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
              >
                {t.editTournament}
              </button>
            </>
          )}
          <button
            onClick={() => setView('HISTORY')}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
          >
            {t.viewHistory}
          </button>
           {role === 'ORGANIZER' && (
            <button
                onClick={() => setIsObserving(!isObserving)}
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
            >
                {isObserving ? t.returnToOrganizerView : t.observerView}
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
                        {t.newTournament}
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
      <PlayerSelectionDialog
        isOpen={showPlayerSelection}
        onClose={handlePlayerSelectionCancel}
        onPlayerSelect={handlePlayerSelectionConfirm}
        players={players}
        selectedPlayer={selectedPlayer || undefined}
        currentPairings={currentPairings}
        title="Select Player to Swap With"
      />
      <PlayerHistoryModal
        player={selectedPlayer}
        pairingsHistory={pairingsHistory}
        isOpen={showPlayerHistory}
        onClose={handleClosePlayerHistory}
      />
    </div>
  );
};

export default App;