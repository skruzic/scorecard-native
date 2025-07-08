// Types for Contract Bridge Scorecard

export type Suit = "Clubs" | "Diamonds" | "Hearts" | "Spades" | "NoTrump";
export type Direction = "N-S" | "E-W";
export type Result = "Made" | "Down";

export interface Contract {
  level: number; // 1-7
  suit: Suit;
  doubled: boolean;
  redoubled: boolean;
  declarer: string; // N, S, E, W
  result: Result;
  tricks: number; // If made: contract + overtricks, if down: number of undertricks
  vulnerable: boolean;
}

export interface Board {
  id: number;
  contract?: Contract;
  score?: number;
  yourSide?: Direction; // Track which side you're on for this board
}

export interface Tournament {
  id: string;
  name: string;
  date: string;
  boards: Board[];
  numberOfBoards: number;
}
