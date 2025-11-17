
import { Player, Pairing } from '../types';

// Helper function to get color difference (white games - black games)
const getColorDifference = (player: Player): number => {
  const whiteCount = player.colorHistory.filter(c => c === 'white').length;
  const blackCount = player.colorHistory.length - whiteCount;
  return whiteCount - blackCount;
};

// Helper function to check if player had same color last two rounds
const hadSameColorTwice = (player: Player): boolean => {
  if (player.colorHistory.length < 2) return false;
  const lastTwo = player.colorHistory.slice(-2);
  return lastTwo[0] === lastTwo[1];
};

// Helper function to determine color preference strength
const getColorPreference = (player: Player): { color: 'white' | 'black' | null; strength: 'absolute' | 'strong' | 'mild' | 'none' } => {
  if (player.colorHistory.length === 0) {
    return { color: null, strength: 'none' };
  }

  const colorDiff = getColorDifference(player);
  
  // Absolute preference (FIDE Rule C.04.1.6 and C.04.1.7)
  if (colorDiff > 1 || hadSameColorTwice(player)) {
    return { color: 'black', strength: 'absolute' };
  }
  if (colorDiff < -1 || (player.colorHistory.length >= 2 && player.colorHistory.slice(-2).every(c => c === 'black'))) {
    return { color: 'white', strength: 'absolute' };
  }
  
  // Strong preference
  if (colorDiff === 1) {
    return { color: 'black', strength: 'strong' };
  }
  if (colorDiff === -1) {
    return { color: 'white', strength: 'strong' };
  }
  
  // Mild preference (alternate from last game)
  if (colorDiff === 0 && player.colorHistory.length > 0) {
    const lastColor = player.colorHistory[player.colorHistory.length - 1];
    return { color: lastColor === 'white' ? 'black' : 'white', strength: 'mild' };
  }
  
  return { color: null, strength: 'none' };
};

// Assign colors to a pair according to FIDE rules
const assignColors = (player1: Player, player2: Player): { white: Player; black: Player } => {
  const p1Pref = getColorPreference(player1);
  const p2Pref = getColorPreference(player2);
  
  // Rule 5.2.1: Grant both preferences if compatible
  if (p1Pref.color && p2Pref.color && p1Pref.color !== p2Pref.color) {
    return p1Pref.color === 'white'
      ? { white: player1, black: player2 }
      : { white: player2, black: player1 };
  }
  
  // Rule 5.2.2: Grant stronger preference
  const strengthOrder = { 'absolute': 3, 'strong': 2, 'mild': 1, 'none': 0 };
  if (strengthOrder[p1Pref.strength] > strengthOrder[p2Pref.strength]) {
    return p1Pref.color === 'white'
      ? { white: player1, black: player2 }
      : { white: player2, black: player1 };
  }
  if (strengthOrder[p2Pref.strength] > strengthOrder[p1Pref.strength]) {
    return p2Pref.color === 'white'
      ? { white: player2, black: player1 }
      : { white: player1, black: player2 };
  }
  
  // If both have absolute preference for same color, grant to player with wider color difference
  if (p1Pref.strength === 'absolute' && p2Pref.strength === 'absolute') {
    const p1Diff = Math.abs(getColorDifference(player1));
    const p2Diff = Math.abs(getColorDifference(player2));
    if (p1Diff > p2Diff) {
      return p1Pref.color === 'white'
        ? { white: player1, black: player2 }
        : { white: player2, black: player1 };
    }
    if (p2Diff > p1Diff) {
      return p2Pref.color === 'white'
        ? { white: player2, black: player1 }
        : { white: player1, black: player2 };
    }
  }
  
  // Rule 5.2.4: Grant preference of higher ranked player (higher ELO)
  if (player1.elo > player2.elo) {
    return p1Pref.color === 'white'
      ? { white: player1, black: player2 }
      : { white: player2, black: player1 };
  }
  
  // Default: higher ELO gets white
  return { white: player1, black: player2 };
};

export const generateRound1Pairings = (players: Player[]): Pairing[] => {
  const sortedPlayers = [...players].sort((a, b) => b.elo - a.elo);
  const pairings: Pairing[] = [];
  let byePlayer: Player | null = null;

  if (sortedPlayers.length % 2 !== 0) {
    // Lowest ELO player gets the bye in round 1 (FIDE Rule C.04.1.3)
    byePlayer = sortedPlayers.pop()!;
  }
  
  const topHalf = sortedPlayers.slice(0, sortedPlayers.length / 2);
  const bottomHalf = sortedPlayers.slice(sortedPlayers.length / 2);

  for (let i = 0; i < topHalf.length; i++) {
    pairings.push({
      round: 1,
      table: i + 1,
      white: topHalf[i],
      black: bottomHalf[i],
      result: null,
    });
  }

  if (byePlayer) {
    pairings.push({
      round: 1,
      table: pairings.length + 1,
      white: byePlayer,
      black: null,
      result: 'BYE',
    });
  }

  return pairings;
};

export const generateNextRoundPairings = (players: Player[], allPreviousPairings: Pairing[], currentRound: number): Pairing[] => {
  let playersToPair = [...players];
  const pairings: Pairing[] = [];
  let byePlayer: Player | null = null;

  if (playersToPair.length % 2 !== 0) {
    // Find player for bye: lowest score group, then lowest ELO, who hasn't had a bye
    const sortedForBye = [...playersToPair].sort((a, b) => {
      if (a.score !== b.score) return a.score - b.score; // lowest score first
      return a.elo - b.elo; // lowest ELO first
    });

    const byeCandidate = sortedForBye.find(p => !p.hadBye);
    if (byeCandidate) {
      byePlayer = byeCandidate;
    } else {
      // Fallback: everyone has had a bye, give it to the lowest ranked player overall
      console.warn("All eligible players have already received a bye. Assigning to lowest ranked player.");
      byePlayer = sortedForBye[0];
    }
    playersToPair = playersToPair.filter(p => p.id !== byePlayer!.id);
  }


  const scoreGroups: Record<number, Player[]> = {};
  playersToPair.forEach(p => {
    const score = p.score;
    if (!scoreGroups[score]) {
      scoreGroups[score] = [];
    }
    scoreGroups[score].push(p);
  });

  const sortedScores = Object.keys(scoreGroups).map(Number).sort((a, b) => b - a);

  let unpairedDown: Player[] = [];

  // Process each score group from highest to lowest
  for (const score of sortedScores) {
    let group = [...unpairedDown, ...scoreGroups[score]];
    group.sort((a, b) => b.elo - a.elo);
    unpairedDown = [];

    while (group.length >= 2) {
      const player1 = group.shift()!;
      let opponentIndex = -1;
      let canPairWithoutViolation = false;

      // FIDE Rule C.04.1.2: Try to find opponent who hasn't played against player1
      for (let i = 0; i < group.length; i++) {
        const player2 = group[i];
        
        // Check if they haven't played before
        if (!player1.opponents.includes(player2.id)) {
          // FIDE Rule C.04.1.6 & C.04.1.7: Check color constraints for non-topscorers
          const p1Pref = getColorPreference(player1);
          const p2Pref = getColorPreference(player2);
          
          // Don't pair if both have absolute preference for same color (unless topscorers)
          const maxScore = Math.max(...players.map(p => p.score));
          const isTopscorer = (p: Player) => p.score > maxScore / 2;
          
          if (p1Pref.strength === 'absolute' && p2Pref.strength === 'absolute' &&
              p1Pref.color === p2Pref.color &&
              !isTopscorer(player1) && !isTopscorer(player2)) {
            continue; // Skip this pairing
          }
          
          opponentIndex = i;
          canPairWithoutViolation = true;
          break;
        }
      }

      if (opponentIndex !== -1 && canPairWithoutViolation) {
        const player2 = group.splice(opponentIndex, 1)[0];
        
        // Use FIDE color assignment rules
        const { white, black } = assignColors(player1, player2);

        pairings.push({
          round: currentRound,
          table: pairings.length + 1,
          white,
          black,
          result: null,
        });
      } else {
        // Player cannot be paired in this bracket, move down
        unpairedDown.push(player1);
      }
    }
    unpairedDown.push(...group);
  }
  
  // CRITICAL FALLBACK: Handle any remaining unpaired players
  // This ensures FIDE Rule C.04.1.2 can be relaxed when necessary to complete pairing
  if (unpairedDown.length > 0) {
    console.warn(`Pairing ${unpairedDown.length} remaining players with fallback (may repeat opponents to ensure all play)`);
    
    while (unpairedDown.length >= 2) {
      const player1 = unpairedDown.shift()!;
      const player2 = unpairedDown.shift()!;
      
      // Use FIDE color assignment rules even in fallback
      const { white, black } = assignColors(player1, player2);
      
      pairings.push({
        round: currentRound,
        table: pairings.length + 1,
        white,
        black,
        result: null,
      });
    }
    
    // If there's still one unpaired player (odd number after fallback), they get a bye
    if (unpairedDown.length === 1) {
      const lastPlayer = unpairedDown[0];
      console.warn(`Last unpaired player ${lastPlayer.name} receives a bye`);
      pairings.push({
        round: currentRound,
        table: pairings.length + 1,
        white: lastPlayer,
        black: null,
        result: 'BYE',
      });
    }
  }

  if (byePlayer) {
    pairings.push({
      round: currentRound,
      table: pairings.length + 1,
      white: byePlayer,
      black: null,
      result: 'BYE',
    });
  }

  return pairings;
};