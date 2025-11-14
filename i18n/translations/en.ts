import { Translations } from '../../types/translations';

export const englishTranslations: Translations = {
  // Main app
  title: 'Swiss System Chess Tournament',
  currentRoundPairings: 'Current Round Pairings',
  swissTournament: 'Swiss Tournament',
  swissTournamentSetup: 'Swiss Tournament Setup',
  round: 'Round',
  roundShort: 'R',
  rounds: 'Rounds',
  outOf: 'out of',
  totalRounds: 'Total Rounds',
  tournament: 'Tournament',
  tournamentCompleted: 'Tournament Completed',
  tournamentFinished: '🏆 Tournament Finished! 🏆',
  tournamentHistory: 'Tournament History',
  backToTournament: 'Back to Tournament',
  numberOfRounds: 'Number of Rounds',
  startTournament: 'Start Tournament',
  recommended: '(Recommended)',
  roundLabel: 'Round',
  pending: 'Pending',
  
  // Player Setup
  enterPlayerDetails: 'Enter player details and configure the tournament.',
  tournamentId: 'Tournament ID',
  tournamentIdPlaceholder: 'e.g., deca, champions-2024, my-tournament',
  tournamentIdError: 'Tournament ID must be 3-50 characters, containing only letters, numbers, hyphens, and underscores.',
  tournamentIdRequired: 'Tournament ID is required.',
  playerName: 'Player Name',
  playerNameCannotBeEmpty: 'Player name cannot be empty.',
  
  elo: 'ELO',
  eloMustBeBetween: 'ELO must be between 100 and 3000.',
  addPlayer: 'Add Player',
  removePlayer: 'Remove',
  addPlayerButton: 'Add Player',
  exportTournamentData: 'Export Tournament Data (JSON)',
  tournamentLinksActions: 'Tournament Links & Actions',
  
  // Tournament status
  setup: 'Setup',
  inProgress: 'In Progress',
  completed: 'Completed',
  
  // Results
  whiteWin: '1-0',
  blackWin: '0-1',
  draw: '1/2-1/2',
  bye: 'BYE',
  startNextRound: 'Start Next Round',
  
  // Organizer
  organizerView: 'Organizer View',
  returnToOrganizerView: 'Return to Organizer View',
  observerView: 'Observer View',
  saveTournament: 'Save Tournament',
  saved: '✓ Saved!',
  newTournament: 'New Tournament',
  areYouSureDelete: 'Are you sure? This will delete the current tournament data and start a new one.',
  viewHistory: 'View History',
  
  // Pairings
  table: 'Table',
  white: 'White',
  black: 'Black',
  
  // Leaderboard
  leaderboard: 'Leaderboard',
  player: 'Player',
  score: 'Score',
  scoreShort: 'Pts',
  rank: 'Pos.',
  points: 'Points',
  
  colorHistory: 'Colors',
  
  // Common
  yes: 'Yes',
  no: 'No',
  close: 'Close',
  cancel: 'Cancel',
  confirm: 'Confirm',
  print: 'Print',
  vs: 'vs',
  whiteShort: 'W',
  blackShort: 'B',
  
  // Error messages
  nameError: 'Player name cannot be empty.',
  eloError: 'ELO must be between 100 and 3000.',
  ageError: 'Age must be between 5 and 100.',
  numberError: 'Player number is required.',
  sexError: 'Please select sex.',
  validationError: 'Please fix the errors before starting the tournament.',
  
  // Player details
  age: 'Age',
  playerNumber: 'Number',
  sex: 'Sex',
  male: 'М',
  female: 'Ж',
  addAgeGroup: 'Add Age Group',
  removeAgeGroup: 'Remove',
  ageGroupName: 'Group Name',
  ageGroupRange: 'Age Range',
  ageGroupMin: 'Min Age',
  ageGroupMax: 'Max Age',
  editTournament: 'Edit Tournament',
  deletePlayer: 'Delete Player',
  
  // Filter buttons
  all: 'All',
  filterByAgeGroup: 'Filter by Age Group',
  filterByWomen: 'Filter by Women',
  filters: 'Filters',
  
  // Player history modal
  playerHistory: 'Player History',
  matchHistory: 'Match History',
  playerRound: 'Round',
  opponent: 'Opponent',
  matchResult: 'Result',
  matchBye: 'BYE'
};