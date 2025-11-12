import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'database.json');

class DatabaseService {
  constructor() {
    this.db = this.loadDatabase();
  }

  loadDatabase() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading database:', error);
    }
    return this.getDefaultDatabase();
  }

  getDefaultDatabase() {
    return {
      tournaments: {},
      settings: {
        defaultPassword: "1905",
        maxTournaments: 1000,
        autoCleanup: true
      },
      stats: {
        totalTournaments: 0,
        totalPlayers: 0,
        lastBackup: null
      }
    };
  }

  saveDatabase() {
    try {
      // Create a custom serialization to preserve tournaments object structure
      let data = '{\n';
      
      // Serialize settings
      data += '  "settings": ';
      data += JSON.stringify(this.db.settings, null, 2);
      data += ',\n';
      
      // Serialize stats
      data += '  "stats": ';
      data += JSON.stringify(this.db.stats, null, 2);
      data += ',\n';
      
      // Manually serialize tournaments as an object, not an array
      data += '  "tournaments": {';
      const tournamentIds = Object.keys(this.db.tournaments);
      tournamentIds.forEach((id, index) => {
        if (index > 0) data += ',';
        data += `\n    "${id}": `;
        data += JSON.stringify(this.db.tournaments[id], null, 6).split('\n').join('\n    ');
      });
      if (tournamentIds.length > 0) {
        data += '\n  ';
      }
      data += '}\n';
      
      data += '}';
      
      fs.writeFileSync(DB_PATH, data, 'utf8');
      return true;
    } catch (error) {
      console.error('Error saving database:', error);
      return false;
    }
  }

  // Tournament operations
  createTournament(tournamentData) {
    const id = tournamentData.id;
    if (!id) {
      throw new Error('Tournament ID is required');
    }

    if (this.db.tournaments[id]) {
      throw new Error(`Tournament ${id} already exists`);
    }

    this.db.tournaments[id] = {
      ...tournamentData,
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    this.db.stats.totalTournaments = Object.keys(this.db.tournaments).length;
    this.saveDatabase();
    return this.db.tournaments[id];
  }

  getTournament(id) {
    return this.db.tournaments[id] || null;
  }

  updateTournament(id, updates) {
    if (!this.db.tournaments[id]) {
      throw new Error(`Tournament ${id} not found`);
    }

    this.db.tournaments[id] = {
      ...this.db.tournaments[id],
      ...updates,
      lastUpdated: new Date().toISOString()
    };

    this.saveDatabase();
    return this.db.tournaments[id];
  }

  deleteTournament(id) {
    if (!this.db.tournaments[id]) {
      throw new Error(`Tournament ${id} not found`);
    }

    delete this.db.tournaments[id];
    this.db.stats.totalTournaments = Object.keys(this.db.tournaments).length;
    this.saveDatabase();
    return true;
  }

  // List operations
  getAllTournaments() {
    return Object.values(this.db.tournaments)
      .sort((a, b) => new Date(b.created) - new Date(a.created));
  }

  getTournamentsByStatus(status) {
    return Object.values(this.db.tournaments)
      .filter(t => t.status === status)
      .sort((a, b) => new Date(b.created) - new Date(a.created));
  }

  // Statistics
  getStats() {
    const tournaments = Object.values(this.db.tournaments);
    return {
      ...this.db.stats,
      tournaments: {
        total: tournaments.length,
        setup: tournaments.filter(t => t.status === 'SETUP').length,
        inProgress: tournaments.filter(t => t.status === 'IN_PROGRESS').length,
        completed: tournaments.filter(t => t.status === 'COMPLETED').length
      },
      players: {
        total: tournaments.reduce((sum, t) => sum + (t.players?.length || 0), 0)
      }
    };
  }

  // Auto-cleanup old tournaments
  cleanupOldTournaments(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const tournaments = Object.entries(this.db.tournaments);
    const toDelete = [];

    for (const [id, tournament] of tournaments) {
      if (tournament.status === 'COMPLETED' && 
          new Date(tournament.lastUpdated) < cutoffDate) {
        toDelete.push(id);
      }
    }

    toDelete.forEach(id => {
      delete this.db.tournaments[id];
    });

    if (toDelete.length > 0) {
      this.db.stats.totalTournaments = Object.keys(this.db.tournaments).length;
      this.saveDatabase();
    }

    return toDelete.length;
  }

  // Backup
  createBackup() {
    const backupData = {
      ...this.db,
      stats: {
        ...this.db.stats,
        lastBackup: new Date().toISOString()
      }
    };

    const backupPath = path.join(__dirname, `backup-${Date.now()}.json`);
    try {
      fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf8');
      this.db.stats.lastBackup = backupData.stats.lastBackup;
      this.saveDatabase();
      return backupPath;
    } catch (error) {
      console.error('Error creating backup:', error);
      return null;
    }
  }

  // Search and filtering
  searchTournaments(query) {
    const lowerQuery = query.toLowerCase();
    return Object.values(this.db.tournaments).filter(tournament => {
      return (
        tournament.id.includes(query) ||
        tournament.players?.some(p => p.name.toLowerCase().includes(lowerQuery))
      );
    });
  }
}

export default new DatabaseService();