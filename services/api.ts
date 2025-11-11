export interface Tournament {
  id: string;
  status: 'SETUP' | 'IN_PROGRESS' | 'COMPLETED';
  players: any[];
  pairingsHistory: any[][];
  currentRound: number;
  totalRounds: number;
  organizerKey: string | null;
  created: string | null;
  lastUpdated: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TournamentStats {
  totalTournaments: number;
  totalPlayers: number;
  lastBackup: string | null;
  tournaments: {
    total: number;
    setup: number;
    inProgress: number;
    completed: number;
  };
  players: {
    total: number;
  };
}

class ApiService {
  private baseUrl: string;

  constructor() {
    // In production, this will be the same domain
    // In development, use the same port as the current app
    this.baseUrl = process.env.NODE_ENV === 'production'
      ? window.location.origin
      : `${window.location.protocol}//${window.location.hostname}:8080`;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}/api${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  // Tournament operations
  async getTournaments(): Promise<ApiResponse<Tournament[]>> {
    return this.request<Tournament[]>('/tournaments');
  }

  async getTournament(id: string): Promise<ApiResponse<Tournament>> {
    return this.request<Tournament>(`/tournaments/${id}`);
  }

  async createTournament(tournament: Partial<Tournament>): Promise<ApiResponse<Tournament>> {
    return this.request<Tournament>('/tournaments', {
      method: 'POST',
      body: JSON.stringify(tournament),
    });
  }

  async updateTournament(id: string, updates: Partial<Tournament>): Promise<ApiResponse<Tournament>> {
    return this.request<Tournament>(`/tournaments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTournament(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/tournaments/${id}`, {
      method: 'DELETE',
    });
  }

  // Search and statistics
  async searchTournaments(query: string): Promise<ApiResponse<Tournament[]>> {
    return this.request<Tournament[]>(`/search?q=${encodeURIComponent(query)}`);
  }

  async getStats(): Promise<ApiResponse<TournamentStats>> {
    return this.request<TournamentStats>('/stats');
  }

  // Backup
  async createBackup(): Promise<ApiResponse<{ path: string }>> {
    return this.request<{ path: string }>('/backup', {
      method: 'POST',
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ message: string; timestamp: string; version: string }>> {
    return this.request<{ message: string; timestamp: string; version: string }>('/health');
  }

  // Utility methods
  async isApiAvailable(): Promise<boolean> {
    try {
      const response = await this.healthCheck();
      return response.success;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Utility functions for data synchronization
export class DataSync {
  // Check if we should use localStorage (offline mode) or API (online mode)
  static async shouldUseApi(): Promise<boolean> {
    // In development, always try API first
    if (process.env.NODE_ENV === 'development') {
      return await apiService.isApiAvailable();
    }
    
    // In production, check if we have an API endpoint
    try {
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        mode: 'no-cors' // Don't require CORS for health check
      });
      return true;
    } catch {
      return false;
    }
  }

  // Save tournament data (localStorage + API if available)
  static async saveTournamentData(tournamentId: string, data: any): Promise<boolean> {
    const useApi = await this.shouldUseApi();
    
    if (useApi) {
      try {
        const response = await apiService.updateTournament(tournamentId, data);
        if (response.success) {
          console.log('Tournament data saved to server');
          return true;
        } else {
          console.warn('Server save failed, falling back to localStorage:', response.error);
        }
      } catch (error) {
        console.warn('Server save error, falling back to localStorage:', error);
      }
    }

    // Fallback to localStorage
    try {
      localStorage.setItem(`swissTournamentState-${tournamentId}`, JSON.stringify(data));
      console.log('Tournament data saved to localStorage');
      return true;
    } catch (error) {
      console.error('Failed to save tournament data:', error);
      return false;
    }
  }

  // Load tournament data (API + localStorage fallback)
  static async loadTournamentData(tournamentId: string): Promise<any | null> {
    const useApi = await this.shouldUseApi();
    console.log('DataSync: loadTournamentData called', { tournamentId, useApi });

    if (useApi) {
      try {
        const response = await apiService.getTournament(tournamentId);
        console.log('DataSync: API response', { success: response.success, hasData: !!response.data, error: response.error });
        if (response.success && response.data) {
          console.log('DataSync: Tournament data loaded from server', { status: response.data.status, organizerKey: response.data.organizerKey });
          return response.data;
        }
      } catch (error) {
        console.warn('DataSync: Server load failed, falling back to localStorage:', error);
      }
    }

    // Fallback to localStorage
    try {
      const savedData = localStorage.getItem(`swissTournamentState-${tournamentId}`);
      console.log('DataSync: checking localStorage', { key: `swissTournamentState-${tournamentId}`, hasData: !!savedData });
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        console.log('DataSync: Tournament data loaded from localStorage', { status: parsedData.status, organizerKey: parsedData.organizerKey });
        return parsedData;
      } else {
        console.log('DataSync: No data found in localStorage');
      }
    } catch (error) {
      console.error('DataSync: Failed to load tournament data:', error);
    }

    return null;
  }

  // Create new tournament (with auto-incrementing ID)
  static async createNewTournament(tournamentData: any): Promise<string> {
    const useApi = await this.shouldUseApi();
    
    if (useApi) {
      try {
        // Get all tournaments to find the next ID
        const response = await apiService.getTournaments();
        if (response.success) {
          const tournaments = response.data || [];
          const existingIds = tournaments.map((t: Tournament) => parseInt(t.id)).filter(n => !isNaN(n));
          const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
          
          const newTournament = {
            ...tournamentData,
            id: nextId.toString(),
            created: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          };

          const createResponse = await apiService.createTournament(newTournament);
          if (createResponse.success) {
            console.log('Tournament created on server');
            return nextId.toString();
          }
        }
      } catch (error) {
        console.warn('Server create failed, using localStorage:', error);
      }
    }

    // Fallback: find next ID in localStorage
    try {
      const existingKeys = Object.keys(localStorage).filter(key => key.startsWith('swissTournamentState-'));
      const tournamentNumbers = existingKeys.map(key => {
        const match = key.match(/swissTournamentState-(\d+)/);
        const num = match ? parseInt(match[1]) : 0;
        return num < 10000 ? num : 0; // Only consider reasonable IDs
      }).filter(num => num > 0);
      
      const nextId = tournamentNumbers.length > 0 ? Math.max(...tournamentNumbers) + 1 : 1;
      console.log('New tournament ID assigned (localStorage):', nextId);
      return nextId.toString();
    } catch (error) {
      console.error('Failed to determine tournament ID:', error);
      return '1'; // Fallback
    }
  }
}