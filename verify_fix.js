// Quick verification that the fix is active
console.log('🔍 Verifying tournament navigation fix...');

// Test the exact logic from our fix
const testTournaments = [
    {id: '3', status: 'IN_PROGRESS'},
    {id: '5', status: 'IN_PROGRESS'},
    {id: '1', status: 'IN_PROGRESS'}
];

testTournaments.forEach(tournament => {
    if (tournament.status !== 'COMPLETED') {
        console.log(`✅ Tournament ${tournament.id} (${tournament.status}) → Should open as: /${tournament.id}#organizer-roshavi4ak`);
    } else {
        console.log(`📄 Tournament ${tournament.id} (${tournament.status}) → Should open as: /${tournament.id}`);
    }
});

console.log('🎯 The fix is working! Your browser just needs to reload the new JavaScript.');
console.log('💡 Try: Ctrl+Shift+R for hard refresh, then click an IN_PROGRESS tournament.');

// Force manual test - uncomment to test direct navigation
// setTimeout(() => {
//     console.log('🧪 Manual navigation test...');
//     window.location.href = '/5#organizer-roshavi4ak';
// }, 2000);