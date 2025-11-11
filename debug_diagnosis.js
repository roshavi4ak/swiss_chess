function debugDatabaseSaving() {
    console.log('🔍 Starting database saving diagnosis...');
    
    // Test 1: Check if API is reachable
    fetch('http://localhost:8080/api/health')
        .then(response => response.json())
        .then(data => {
            console.log('✅ API Health Check:', data);
            
            // Test 2: Try to update tournament directly
            const testUpdate = {
                status: 'IN_PROGRESS',
                players: [{id: 1, name: 'Debug Test Player'}],
                currentRound: 1
            };
            
            return fetch('http://localhost:8080/api/tournaments/1', {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(testUpdate)
            });
        })
        .then(response => response.json())
        .then(data => {
            console.log('✅ Direct Update Test:', data);
            
            // Test 3: Check if DataSync is available and working
            if (window.DataSync) {
                console.log('✅ DataSync is available');
                
                window.DataSync.shouldUseApi().then(shouldUseApi => {
                    console.log('🔧 Should use API:', shouldUseApi);
                    
                    window.DataSync.saveTournamentData('1', {
                        status: 'IN_PROGRESS',
                        players: [{id: 1, name: 'DataSync Test Player'}],
                        currentRound: 1
                    }).then(result => {
                        console.log('🔧 DataSync save result:', result);
                    });
                });
            } else {
                console.log('❌ DataSync not available - check if the frontend is loading correctly');
            }
        })
        .catch(error => {
            console.error('❌ API Test Failed:', error);
        });
    
    // Test 4: Check localStorage for tournament data
    console.log('🔍 Checking localStorage...');
    const tournamentKeys = Object.keys(localStorage).filter(key => key.includes('tournament'));
    console.log('📱 localStorage tournament keys:', tournamentKeys);
    
    // Test 5: Check browser network tab
    console.log('💡 Next Steps:');
    console.log('1. Open Developer Tools (F12)');
    console.log('2. Go to Network tab');  
    console.log('3. Make a tournament change in the UI');
    console.log('4. Look for failed API requests');
}

// Run the diagnostic
debugDatabaseSaving();