// Bridge game utilities

import { Direction, Result, Suit } from "./types";

/**
 * Get suit symbol for display
 */
export function getSuitSymbol(suit: Suit): string {
  switch (suit) {
    case "Clubs":
      return "♣";
    case "Diamonds":
      return "♦";
    case "Hearts":
      return "♥";
    case "Spades":
      return "♠";
    case "NoTrump":
      return "NT";
    default:
      return "";
  }
}

/**
 * Get suit color for display (used for styling)
 */
export function getSuitColor(suit: Suit): "red" | "black" | "blue" {
  switch (suit) {
    case "Diamonds":
    case "Hearts":
      return "red";
    case "Clubs":
    case "Spades":
      return "black";
    case "NoTrump":
      return "blue";
    default:
      return "black";
  }
}

/**
 * Determine vulnerability based on board number
 * Standard vulnerability pattern:
 * - None: Boards 1, 8, 11, 14
 * - NS only: Boards 2, 5, 12, 15
 * - EW only: Boards 3, 6, 9, 16
 * - Both: Boards 4, 7, 10, 13
 */
export function getVulnerability(boardNumber: number): {
  ns: boolean;
  ew: boolean;
} {
  // Board numbers repeat in cycles of 16
  const normalizedBoard = ((boardNumber - 1) % 16) + 1;

  switch (normalizedBoard) {
    case 1:
    case 8:
    case 11:
    case 14:
      return { ns: false, ew: false }; // None vulnerable
    case 2:
    case 5:
    case 12:
    case 15:
      return { ns: true, ew: false }; // NS vulnerable
    case 3:
    case 6:
    case 9:
    case 16:
      return { ns: false, ew: true }; // EW vulnerable
    case 4:
    case 7:
    case 10:
    case 13:
      return { ns: true, ew: true }; // Both vulnerable
    default:
      return { ns: false, ew: false }; // Fallback, should never happen
  }
}

/**
 * Get vulnerability display text
 */
export function getVulnerabilityText(boardNumber: number): string {
  const { ns, ew } = getVulnerability(boardNumber);

  if (ns && ew) return "Both";
  if (ns) return "N-S";
  if (ew) return "E-W";
  return "None";
}

/**
 * Format contract for display
 */
export function formatContract(
  level: number,
  suit: Suit,
  doubled: boolean,
  redoubled: boolean
): string {
  return `${level}${getSuitSymbol(suit)}${doubled ? "X" : ""}${
    redoubled ? "XX" : ""
  }`;
}

/**
 * Format score with color indication
 */
export function getScoreColor(
  score?: number,
  declarer?: string,
  yourSide?: Direction
): "green" | "red" | "gray" {
  if (score === undefined) return "gray";

  // If yourSide is set, use it to determine if the score is for your side or opponents
  if (yourSide && declarer) {
    const isDeclarerNS = declarer === "N" || declarer === "S";
    const isYourSideNS = yourSide === "N-S";

    // Determine if declarer is on your side
    const isDeclarerOnYourSide =
      (isDeclarerNS && isYourSideNS) || (!isDeclarerNS && !isYourSideNS);

    // If score > 0 and declarer is on your side, or score < 0 and declarer is not on your side, it's good for you
    if (
      (score > 0 && isDeclarerOnYourSide) ||
      (score < 0 && !isDeclarerOnYourSide)
    ) {
      return "green";
    } else {
      return "red";
    }
  }

  // Default behavior if yourSide is not set
  if (score > 0) return "green";
  if (score < 0) return "red";
  return "gray";
}

/**
 * Get a display string for the result of a contract
 */
export function formatContractResult(
  level: number,
  result: Result,
  tricks: number
): string {
  if (result === "Made") {
    const contractTricks = level + 6;
    const overtricks = tricks - contractTricks;
    if (overtricks > 0) {
      return `+${overtricks}`;
    } else {
      return "=";
    }
  } else {
    // Down
    return `-${tricks}`;
  }
}
