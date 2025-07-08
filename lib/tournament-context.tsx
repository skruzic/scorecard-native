import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Contract, Direction, Tournament } from "./types";

interface TournamentContextType {
  tournaments: Tournament[];
  currentTournament: Tournament | null;
  lastUsedYourSide: Direction;
  createTournament: (name: string, numberOfBoards: number) => void;
  saveBoardData: (
    boardId: number,
    data: { contract?: Contract; yourSide?: Direction }
  ) => void;
  calculateScore: (contract: Contract) => number;
  selectTournament: (tournamentId: string) => void;
  deleteTournament: (tournamentId: string) => void;
  updateLastUsedYourSide: (yourSide: Direction) => void;
}

const TournamentContext = createContext<TournamentContextType | undefined>(
  undefined
);

export function TournamentProvider({ children }: { children: ReactNode }) {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [currentTournament, setCurrentTournament] = useState<Tournament | null>(
    null
  );
  const [lastUsedYourSide, setLastUsedYourSide] = useState<Direction>("N-S");

  // Load data from AsyncStorage on mount
  useEffect(() => {
    loadData();
  }, []);

  // Save tournaments to AsyncStorage whenever they change
  useEffect(() => {
    if (tournaments.length > 0) {
      AsyncStorage.setItem("bridgeTournaments", JSON.stringify(tournaments));
    }
  }, [tournaments]);

  // Save current tournament ID to AsyncStorage
  useEffect(() => {
    if (currentTournament) {
      AsyncStorage.setItem("currentTournamentId", currentTournament.id);
    }
  }, [currentTournament]);

  const loadData = async () => {
    try {
      const storedTournaments = await AsyncStorage.getItem("bridgeTournaments");
      if (storedTournaments) {
        const parsedTournaments = JSON.parse(storedTournaments);
        setTournaments(parsedTournaments);

        // If there's a stored current tournament ID, select it
        const currentId = await AsyncStorage.getItem("currentTournamentId");
        if (currentId) {
          const current = parsedTournaments.find(
            (t: Tournament) => t.id === currentId
          );
          if (current) {
            setCurrentTournament(current);
          }
        }
      }

      // Load last used "Your Side" value
      const storedYourSide = await AsyncStorage.getItem("lastUsedYourSide");
      if (
        storedYourSide &&
        (storedYourSide === "N-S" || storedYourSide === "E-W")
      ) {
        setLastUsedYourSide(storedYourSide as Direction);
      }
    } catch (error) {
      console.error("Failed to load data from AsyncStorage:", error);
    }
  };

  // Create a new tournament
  const createTournament = (name: string, numberOfBoards: number) => {
    const newTournament: Tournament = {
      id: Date.now().toString(),
      name,
      date: new Date().toISOString().split("T")[0],
      numberOfBoards,
      boards: Array.from({ length: numberOfBoards }, (_, index) => ({
        id: index + 1,
      })),
    };

    setTournaments([...tournaments, newTournament]);
    setCurrentTournament(newTournament);
  };

  // Save board data (contract and/or yourSide)
  const saveBoardData = (
    boardId: number,
    data: { contract?: Contract; yourSide?: Direction }
  ) => {
    if (!currentTournament) return;

    let score: number | undefined;
    if (data.contract) {
      score = calculateScore(data.contract);
    }

    const updatedBoards = currentTournament.boards.map((board) => {
      if (board.id === boardId) {
        const updatedBoard = { ...board };
        if (data.contract) {
          updatedBoard.contract = data.contract;
          updatedBoard.score = score;
        }
        if (data.yourSide !== undefined) {
          updatedBoard.yourSide = data.yourSide;
        }
        return updatedBoard;
      }
      return board;
    });

    const updatedTournament = {
      ...currentTournament,
      boards: updatedBoards,
    };

    setCurrentTournament(updatedTournament);

    // Update in the tournaments list too
    const updatedTournaments = tournaments.map((tournament) =>
      tournament.id === currentTournament.id ? updatedTournament : tournament
    );

    setTournaments(updatedTournaments);
  };

  // Calculate score based on contract details
  const calculateScore = (contract: Contract): number => {
    let score = 0;
    const { level, suit, doubled, redoubled, result, tricks, vulnerable } =
      contract;

    // Basic points per trick
    const trickValues: Record<string, number> = {
      Clubs: 20,
      Diamonds: 20,
      Hearts: 30,
      Spades: 30,
      NoTrump: 30, // NT: first trick 40, subsequent tricks 30
    };

    if (result === "Made") {
      // Contract was made
      const contractTricks = level;

      // Calculate basic contract points
      if (suit === "NoTrump") {
        // First trick in NT is 40, others are 30
        score += 40 + (contractTricks - 1) * 30;
      } else {
        score += contractTricks * trickValues[suit];
      }

      // Apply doubling multipliers to basic score only
      if (redoubled) {
        score *= 4; // Redoubled is 4x original
      } else if (doubled) {
        score *= 2; // Doubled is 2x original
      }

      // Game and slam bonuses (applied after doubling)
      if (score >= 100) {
        // Game bonus
        score += vulnerable ? 500 : 300;
      } else {
        // Part score bonus
        score += 50;
      }

      // Small slam bonus (level 6)
      if (level === 6) {
        score += vulnerable ? 750 : 500;
      }

      // Grand slam bonus (level 7)
      if (level === 7) {
        score += vulnerable ? 1500 : 1000;
      }

      // Overtrick points
      const overtricks = tricks - (contractTricks + 6); // Total tricks - (level + 6)
      if (overtricks > 0) {
        if (redoubled) {
          score += (vulnerable ? 400 : 200) * overtricks;
        } else if (doubled) {
          score += (vulnerable ? 200 : 100) * overtricks;
        } else {
          score +=
            overtricks *
            (suit === "NoTrump" || suit === "Hearts" || suit === "Spades"
              ? 30
              : 20);
        }
      }

      // Doubling/redoubling bonus (applied once at the end)
      if (redoubled) {
        score += 100; // 50 for doubled + 50 additional for redoubled
      } else if (doubled) {
        score += 50;
      }
    } else {
      // Contract went down - 'tricks' represents number of undertricks
      const undertricks = tricks;

      if (redoubled) {
        if (vulnerable) {
          // Vulnerable and redoubled: -400, -800, -1200, -1600...
          score -= 400 + (undertricks - 1) * 600;
        } else {
          // Non-vulnerable and redoubled: -200, -600, -1000, -1400...
          score -= 200 + Math.max(0, undertricks - 1) * 400;
        }
      } else if (doubled) {
        if (vulnerable) {
          // Vulnerable and doubled: -200, -500, -800, -1100...
          score -= 200 + (undertricks - 1) * 300;
        } else {
          // Non-vulnerable and doubled: -100, -300, -500, -800...
          if (undertricks === 1) {
            score -= 100;
          } else if (undertricks <= 3) {
            score -= 100 + (undertricks - 1) * 200;
          } else {
            score -= 500 + (undertricks - 3) * 300;
          }
        }
      } else {
        // Not doubled
        score -= undertricks * (vulnerable ? 100 : 50);
      }
    }

    return score;
  };

  // Select a tournament
  const selectTournament = (tournamentId: string) => {
    const tournament = tournaments.find((t) => t.id === tournamentId);
    if (tournament) {
      setCurrentTournament(tournament);
    }
  };

  // Delete a tournament
  const deleteTournament = (tournamentId: string) => {
    const updatedTournaments = tournaments.filter((t) => t.id !== tournamentId);
    setTournaments(updatedTournaments);

    if (currentTournament?.id === tournamentId) {
      setCurrentTournament(
        updatedTournaments.length > 0 ? updatedTournaments[0] : null
      );
    }
  };

  // Update the last used "Your Side" value and save to AsyncStorage
  const updateLastUsedYourSide = (yourSide: Direction) => {
    setLastUsedYourSide(yourSide);
    AsyncStorage.setItem("lastUsedYourSide", yourSide);
  };

  return (
    <TournamentContext.Provider
      value={{
        tournaments,
        currentTournament,
        lastUsedYourSide,
        createTournament,
        saveBoardData,
        calculateScore,
        selectTournament,
        deleteTournament,
        updateLastUsedYourSide,
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournament() {
  const context = useContext(TournamentContext);
  if (context === undefined) {
    throw new Error("useTournament must be used within a TournamentProvider");
  }
  return context;
}
