import fs from 'fs';

// Read the database
const data = JSON.parse(fs.readFileSync('database.json', 'utf8'));

// Function to recalculate scores for a tournament
function recalculateScores(tournament) {
    console.log(`Recalculating scores for tournament: ${tournament.id}`);

    // Reset all player scores to 0
    tournament.players.forEach(player => {
        player.score = 0;
        player.opponents = [];
        player.colorHistory = [];
        player.hadBye = false;
    });

    // Process each round
    tournament.pairingsHistory.forEach((roundPairings, roundIndex) => {
        const roundNumber = roundIndex + 1;
        console.log(`Processing round ${roundNumber}`);

        roundPairings.forEach(pairing => {
            if (pairing.result === 'BYE') {
                // Handle bye - player gets 1 point
                const byePlayer = tournament.players.find(p => p.id === pairing.white.id);
                if (byePlayer) {
                    byePlayer.score += 1;
                    byePlayer.hadBye = true;
                    console.log(`${byePlayer.name}: +1 (bye)`);
                }
            } else if (pairing.black && pairing.result) {
                // Handle regular game
                const whitePlayer = tournament.players.find(p => p.id === pairing.white.id);
                const blackPlayer = tournament.players.find(p => p.id === pairing.black.id);

                if (whitePlayer && blackPlayer) {
                    // Add opponents
                    whitePlayer.opponents.push(pairing.black.id);
                    blackPlayer.opponents.push(pairing.white.id);

                    // Add colors
                    whitePlayer.colorHistory.push('white');
                    blackPlayer.colorHistory.push('black');

                    // Add scores based on result
                    if (pairing.result === '1-0') {
                        whitePlayer.score += 1;
                        console.log(`${whitePlayer.name}: +1 vs ${blackPlayer.name}`);
                    } else if (pairing.result === '0-1') {
                        blackPlayer.score += 1;
                        console.log(`${blackPlayer.name}: +1 vs ${whitePlayer.name}`);
                    } else if (pairing.result === '1/2-1/2') {
                        whitePlayer.score += 0.5;
                        blackPlayer.score += 0.5;
                        console.log(`${whitePlayer.name} and ${blackPlayer.name}: +0.5 each (draw)`);
                    }
                }
            }
        });
    });

    console.log('\nFinal scores:');
    tournament.players.forEach(player => {
        console.log(`${player.name}: ${player.score} points`);
    });
}

// Recalculate scores for both tournaments
recalculateScores(data.tournaments.golemi);
recalculateScores(data.tournaments.deca);

// Write back to file
fs.writeFileSync('database.json', JSON.stringify(data, null, 4));
console.log('\nDatabase updated with recalculated scores!');