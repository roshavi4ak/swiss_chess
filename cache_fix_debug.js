// Force reload JavaScript and check if new code is loaded
console.log('🔄 Checking JavaScript version...');

// Check if the new tournament navigation code is present
const scriptContent = document.querySelector('script[src*="index-BGwJjERS"]');
console.log('📱 Loaded script:', scriptContent ? '✅ NEW VERSION (index-BGwJjERS.js)' : '❌ OLD VERSION');

// Force reload with cache bypass
if (scriptContent) {
    console.log('✅ New code loaded. Now testing tournament navigation...');
    console.log('📝 Try clicking on an IN_PROGRESS tournament from Past Tournaments page');
    console.log('🎯 Should open with organizer hash: #organizer-roshavi4ak');
} else {
    console.log('❌ Still loading old code. Try: Ctrl+Shift+R for hard refresh');
}

// Manual navigation test - replace '3' with any IN_PROGRESS tournament ID
function testTournamentNavigation(tournamentId) {
    const tournaments = [
        {id: '1', status: 'IN_PROGRESS'},
        {id: '3', status: 'IN_PROGRESS'}, 
        {id: '4', status: 'IN_PROGRESS'},
        {id: '5', status: 'IN_PROGRESS'}
    ];
    
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (tournament && tournament.status !== 'COMPLETED') {
        console.log(`🎯 Should navigate to: /${tournamentId}#organizer-roshavi4ak`);
        window.location.href = `/${tournamentId}#organizer-roshavi4ak`;
    } else {
        console.log(`📄 Should navigate to: /${tournamentId} (observer mode)`);
        window.location.href = `/${tournamentId}`;
    }
}

console.log('🧪 Manual test: Copy and paste this to test navigation:');
console.log('testTournamentNavigation("5") // Test with Tournament #5');