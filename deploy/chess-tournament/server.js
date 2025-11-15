import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS headers for API routes
app.use('/api', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();

});

// API Routes

// Get all tournaments
app.get('/api/tournaments', (req, res) => {
  try {
    const tournaments = db.getAllTournaments();
    res.json({ success: true, data: tournaments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get specific tournament
app.get('/api/tournaments/:id', (req, res) => {
  try {
    const tournament = db.getTournament(req.params.id);
    if (!tournament) {
      return res.status(404).json({ success: false, error: 'Tournament not found' });
    }
    res.json({ success: true, data: tournament });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new tournament
app.post('/api/tournaments', (req, res) => {
  try {
    const tournamentData = req.body;
    if (!tournamentData.id) {
      return res.status(400).json({ success: false, error: 'Tournament ID is required' });
    }
    
    const tournament = db.createTournament(tournamentData);
    res.status(201).json({ success: true, data: tournament });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update tournament
app.put('/api/tournaments/:id', (req, res) => {
  try {
    let tournament = db.getTournament(req.params.id);
    
    // If tournament doesn't exist, create it
    if (!tournament) {
      const tournamentData = {
        ...req.body,
        id: req.params.id
      };
      tournament = db.createTournament(tournamentData);
      return res.status(201).json({ success: true, data: tournament });
    } else {
      // If tournament exists, update it
      tournament = db.updateTournament(req.params.id, req.body);
      return res.json({ success: true, data: tournament });
    }
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete tournament
app.delete('/api/tournaments/:id', (req, res) => {
  try {
    db.deleteTournament(req.params.id);
    res.json({ success: true, message: 'Tournament deleted successfully' });
  } catch (error) {
    if (error.message.includes('not found')) {
      res.status(404).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message });
    }
  }
});

// Get statistics
app.get('/api/stats', (req, res) => {
  try {
    const stats = db.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search tournaments
app.get('/api/search', (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, error: 'Search query is required' });
    }
    const results = db.searchTournaments(q);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Backup endpoint
app.post('/api/backup', (req, res) => {
  try {
    const backupPath = db.createBackup();
    if (backupPath) {
      res.json({ success: true, message: 'Backup created successfully', path: backupPath });
    } else {
      res.status(500).json({ success: false, error: 'Failed to create backup' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Swiss Chess Tournament API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle all routes by serving index.html (for React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Set security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Swiss Chess Tournament server running on port ${port}`);
  console.log(`🌐 Web App: http://localhost:${port}/`);
  console.log(`📊 API Health: http://localhost:${port}/api/health`);
  console.log(`🏆 Tournament 1: http://localhost:${port}/1`);
  console.log(`👤 Organizer: http://localhost:${port}/1#organizer-roshavi4ak`);
  console.log(`📈 API Stats: http://localhost:${port}/api/stats`);
});