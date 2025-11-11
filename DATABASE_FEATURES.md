# 🗄️ Swiss Chess Tournament - JSON Database System

## Overview
Your web application now includes a comprehensive JSON file-based database system for persistent tournament storage. This ensures your tournament data is never lost, even if users clear their browser or use different devices.

## 🗂️ Database Structure

### `database.json` - Main Database File
```json
{
  "tournaments": {
    "1": {
      "id": "1",
      "status": "IN_PROGRESS",
      "players": [...],
      "pairingsHistory": [...],
      "currentRound": 1,
      "totalRounds": 5,
      "organizerKey": "roshavi4ak",
      "created": "2025-11-10T22:00:00.000Z",
      "lastUpdated": "2025-11-10T22:30:00.000Z"
    }
  },
  "settings": {
    "defaultPassword": "1905",
    "maxTournaments": 1000,
    "autoCleanup": true
  },
  "stats": {
    "totalTournaments": 15,
    "totalPlayers": 127,
    "lastBackup": "2025-11-10T20:00:00.000Z"
  }
}
```

## 🌐 API Endpoints

### Tournament Management
- `GET /api/tournaments` - Get all tournaments
- `GET /api/tournaments/:id` - Get specific tournament
- `POST /api/tournaments` - Create new tournament
- `PUT /api/tournaments/:id` - Update tournament
- `DELETE /api/tournaments/:id` - Delete tournament

### Search & Statistics
- `GET /api/search?q=query` - Search tournaments
- `GET /api/stats` - Get system statistics
- `POST /api/backup` - Create database backup
- `GET /api/health` - System health check

## 🔄 Data Synchronization

### Hybrid Storage System
The application uses both localStorage (browser) and server database:

1. **Online Mode** (Server Available)
   - Primary: Server database (`database.json`)
   - Backup: localStorage
   - Real-time synchronization

2. **Offline Mode** (Server Unavailable)
   - Only: localStorage
   - Automatic fallback
   - Sync when server returns

### API Service Features
- Automatic server detection
- Fallback to localStorage
- Tournament ID auto-increment
- Error handling and logging
- Data integrity checks

## 📊 Tournament History & Analytics

### Persistent Data
- ✅ Complete tournament history
- ✅ Player performance tracking
- ✅ All pairing records
- ✅ Tournament statistics
- ✅ Creation and modification timestamps

### Search Capabilities
- Search by tournament ID
- Search by player names
- Filter by tournament status
- Sort by date/performance

### Statistics Dashboard
- Total tournaments created
- Total players registered
- Active vs completed tournaments
- Auto-cleanup status
- Last backup information

## 🛡️ Data Protection

### Backup System
- Automatic backup creation
- Manual backup via API
- Timestamped backup files
- Restore capability
- Data integrity validation

### Auto-Cleanup
- Removes old completed tournaments (30+ days)
- Configurable retention period
- Statistics maintenance
- Storage optimization

### Security Features
- Input validation
- Error handling
- File system protection
- Access control
- Data sanitization

## 💾 Server Configuration

### Database Service (`database.js`)
- JSON file operations
- Concurrent access handling
- Atomic writes
- Error recovery
- Performance optimization

### API Server (`server.js`)
- Express.js REST API
- CORS support
- Security headers
- Error middleware
- Request logging

## 🔧 Development Features

### Local Development
- Automatic server detection
- Development vs production modes
- Hot reloading support
- Debug logging
- API testing endpoints

### Production Deployment
- cPanel optimized
- File permissions handled
- Environment variables
- Process management
- Logging configuration

## 📱 Client Features

### React Integration
- TypeScript types
- Service layer abstraction
- State management
- Error boundaries
- Loading states

### Data Flow
1. User actions trigger saves
2. API service attempts server save
3. Fallback to localStorage if needed
4. Real-time UI updates
5. Background synchronization

## 🚀 Usage Examples

### Creating a Tournament
```typescript
const newTournament = await DataSync.createNewTournament({
  status: 'IN_PROGRESS',
  players: [...],
  // ... other data
});
```

### Loading Tournament Data
```typescript
const data = await DataSync.loadTournamentData('1');
if (data) {
  // Use tournament data
}
```

### Saving Tournament Updates
```typescript
await DataSync.saveTournamentData('1', {
  status: 'COMPLETED',
  // ... updated data
});
```

## 📈 Benefits

### For Users
- **Never lose data** - Tournaments saved server-side
- **Cross-device access** - Same tournaments on any device
- **Complete history** - All past tournaments preserved
- **Better performance** - Server-side processing
- **Reliable storage** - No browser limitations

### For Organizers
- **Professional management** - Real tournament data system
- **Historical analysis** - Track tournament performance
- **Backup security** - Multiple data protection layers
- **Scalable system** - Handle multiple concurrent tournaments
- **Admin controls** - Full tournament lifecycle management

## 🔮 Future Enhancements

- Export tournaments to PDF/Excel
- Tournament templates
- Player rating system
- Tournament federation support
- Advanced analytics dashboard
- Email notifications
- Real-time collaboration
- Tournament import/export

Your Swiss Chess Tournament system now has enterprise-grade data persistence while maintaining simplicity and ease of use!