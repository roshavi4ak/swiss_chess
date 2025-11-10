
export interface Player {
  id: number;
  name: string;
  elo: number;
  score: number;
  opponents: number[];
  colorHistory: ('white' | 'black')[];
  hadBye: boolean;
}

export type Result = '1-0' | '0-1' | '1/2-1/2' | 'BYE' | null;

export interface Pairing {
  round: number;
  table: number;
  white: Player;
  black: Player | null;
  result: Result;
}

export type TournamentStatus = 'SETUP' | 'IN_PROGRESS' | 'COMPLETED';