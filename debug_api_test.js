// Simple script to test API connectivity from frontend
// Add this to your browser console to debug the API issues

async function testApiConnectivity() {
  console.log('🧪 Testing API connectivity...');
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:8080/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check passed:', healthData);
    
    // Test tournament update endpoint
    console.log('2. Testing tournament update...');
    const testData = {
      status: 'IN_PROGRESS',
      currentRound: 1,
      players: [{id: 1, name: 'Test Player Debug'}]
    };
    
    const updateResponse = await fetch('http://localhost:8080/api/tournaments/1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const updateData = await updateResponse.json();
    console.log('✅ Tournament update result:', updateData);
    
    // Test DataSync methods
    console.log('3. Testing DataSync...');
    if (window.DataSync) {
      const shouldUseApi = await window.DataSync.shouldUseApi();
      console.log('✅ Should use API:', shouldUseApi);
      
      const saveResult = await window.DataSync.saveTournamentData('1', testData);
      console.log('✅ DataSync save result:', saveResult);
    } else {
      console.log('❌ DataSync not available on window object');
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

// Run the test
testApiConnectivity();