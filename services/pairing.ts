
import { Player, Pairing } from '../types';

export const generateRound1Pairings = (players: Player[]): Pairing[] => {
  const sortedPlayers = [...players].sort((a, b) => b.elo - a.elo);
  const pairings: Pairing[] = [];
  let byePlayer: Player | null = null;

  if (sortedPlayers.length % 2 !== 0) {
    // Lowest ELO player gets the bye in round 1
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

  for (const score of sortedScores) {
    let group = [...unpairedDown, ...scoreGroups[score]];
    group.sort((a, b) => b.elo - a.elo);
    unpairedDown = [];

    while (group.length >= 2) {
      const player1 = group.shift()!;
      let opponentIndex = -1;

      for (let i = 0; i < group.length; i++) {
        if (!player1.opponents.includes(group[i].id)) {
          opponentIndex = i;
          break;
        }
      }

      if (opponentIndex !== -1) {
        const player2 = group.splice(opponentIndex, 1)[0];
        
        const p1WhiteCount = player1.colorHistory.filter(c => c === 'white').length;
        const p1BlackCount = player1.colorHistory.length - p1WhiteCount;
        const p2WhiteCount = player2.colorHistory.filter(c => c === 'white').length;

        let whitePlayer = player1;
        let blackPlayer = player2;
        
        const colorDifference = p1WhiteCount - p1BlackCount - (p2WhiteCount - (player2.colorHistory.length - p2WhiteCount));

        if (colorDifference > 0) {
            whitePlayer = player2;
            blackPlayer = player1;
        } else if (colorDifference === 0) {
            if (player2.elo > player1.elo) {
                whitePlayer = player2;
                blackPlayer = player1;
            }
        }

        pairings.push({
          round: currentRound,
          table: pairings.length + 1,
          white: whitePlayer,
          black: blackPlayer,
          result: null,
        });
      } else {
        unpairedDown.push(player1);
      }
    }
    unpairedDown.push(...group);
  }
  
  if(unpairedDown.length > 0) {
      console.warn("Could not pair all players. Unpaired: ", unpairedDown);
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