import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  formatContract,
  formatContractResult,
  getScoreColor,
  getSuitColor,
  getVulnerabilityText,
} from "../lib/bridge-utils";
import { useTournament } from "../lib/tournament-context";
import { Board } from "../lib/types";
import { ContractDialog } from "./ContractDialog";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";

export function BoardList() {
  const { currentTournament, tournaments } = useTournament();
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  if (!currentTournament) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Tournament Selected</Text>
        <Text style={styles.emptyDescription}>
          Create or select a tournament from the Tournaments tab to view boards.
        </Text>
        {tournaments.length > 0 && (
          <Text style={styles.emptySubtext}>
            You have {tournaments.length} tournament(s) available. Go to
            Tournaments tab to select one.
          </Text>
        )}
      </View>
    );
  }

  const handleBoardPress = (board: Board) => {
    setSelectedBoard(board);
    setDialogVisible(true);
  };

  const handleDialogClose = () => {
    setDialogVisible(false);
    setSelectedBoard(null);
  };

  const renderBoardItem = ({ item: board }: { item: Board }) => {
    const vulnerability = getVulnerabilityText(board.id);
    const contract = board.contract;
    const score = board.score;

    return (
      <TouchableOpacity
        style={styles.boardRow}
        onPress={() => handleBoardPress(board)}
        activeOpacity={0.7}
      >
        <View style={styles.boardCell}>
          <Text style={styles.boardNumber}>{board.id}</Text>
        </View>

        <View style={styles.boardCell}>
          <Text
            style={[
              styles.vulnerabilityText,
              vulnerability === "Both" && styles.bothVulText,
              vulnerability === "None" && styles.noneVulText,
              vulnerability === "N-S" && styles.nsVulText,
              vulnerability === "E-W" && styles.ewVulText,
            ]}
          >
            {vulnerability}
          </Text>
        </View>

        <View style={[styles.boardCell, styles.contractCell]}>
          {contract ? (
            <Text
              style={[
                styles.contractText,
                getSuitColor(contract.suit) === "red" && styles.redSuitText,
                getSuitColor(contract.suit) === "blue" && styles.blueSuitText,
              ]}
            >
              {formatContract(
                contract.level,
                contract.suit,
                contract.doubled,
                contract.redoubled
              )}
            </Text>
          ) : (
            <Text style={styles.emptyText}>-</Text>
          )}
        </View>

        <View style={styles.boardCell}>
          {contract?.declarer ? (
            <Text style={styles.declarerText}>{contract.declarer}</Text>
          ) : (
            <Text style={styles.emptyText}>-</Text>
          )}
        </View>

        <View style={styles.boardCell}>
          {contract ? (
            <Text style={styles.resultText}>
              {formatContractResult(
                contract.level,
                contract.result,
                contract.tricks
              )}
            </Text>
          ) : (
            <Text style={styles.emptyText}>-</Text>
          )}
        </View>

        <View style={[styles.boardCell, styles.scoreCell]}>
          {score !== undefined ? (
            <Text
              style={[
                styles.scoreText,
                getScoreColor(score, contract?.declarer, board.yourSide) ===
                  "green" && styles.positiveScore,
                getScoreColor(score, contract?.declarer, board.yourSide) ===
                  "red" && styles.negativeScore,
                getScoreColor(score, contract?.declarer, board.yourSide) ===
                  "gray" && styles.neutralScore,
              ]}
            >
              {score}
            </Text>
          ) : (
            <Text style={styles.emptyText}>-</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <View style={styles.headerCell}>
        <Text style={styles.headerText}>Board</Text>
      </View>
      <View style={styles.headerCell}>
        <Text style={styles.headerText}>Vuln</Text>
      </View>
      <View style={[styles.headerCell, styles.contractCell]}>
        <Text style={styles.headerText}>Contract</Text>
      </View>
      <View style={styles.headerCell}>
        <Text style={styles.headerText}>Decl</Text>
      </View>
      <View style={styles.headerCell}>
        <Text style={styles.headerText}>Result</Text>
      </View>
      <View style={[styles.headerCell, styles.scoreCell]}>
        <Text style={styles.headerText}>Score</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <CardHeader>
          <CardTitle>{currentTournament.name}</CardTitle>
          <Text style={styles.subtitle}>
            Tap any board to enter contract details
          </Text>
        </CardHeader>
        <CardContent style={styles.cardContent}>
          {renderHeader()}
          <FlatList
            data={currentTournament.boards}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderBoardItem}
            showsVerticalScrollIndicator={false}
            style={styles.list}
            nestedScrollEnabled={true}
          />
        </CardContent>
      </Card>

      <ContractDialog
        board={selectedBoard}
        visible={dialogVisible}
        onClose={handleDialogClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    flex: 1,
    margin: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  cardContent: {
    flex: 1,
    padding: 0,
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  boardRow: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  headerCell: {
    flex: 1,
    alignItems: "center",
  },
  boardCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  contractCell: {
    flex: 1.5,
  },
  scoreCell: {
    flex: 1,
  },
  headerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  boardNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  vulnerabilityText: {
    fontSize: 12,
    fontWeight: "500",
  },
  bothVulText: {
    color: "#dc2626",
  },
  noneVulText: {
    color: "#059669",
  },
  nsVulText: {
    color: "#ea580c",
  },
  ewVulText: {
    color: "#2563eb",
  },
  contractText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
  },
  redSuitText: {
    color: "#dc2626",
  },
  blueSuitText: {
    color: "#2563eb",
  },
  declarerText: {
    fontSize: 14,
    color: "#1f2937",
  },
  resultText: {
    fontSize: 14,
    color: "#1f2937",
  },
  scoreText: {
    fontSize: 16,
    fontWeight: "600",
  },
  positiveScore: {
    color: "#059669",
  },
  negativeScore: {
    color: "#dc2626",
  },
  neutralScore: {
    color: "#6b7280",
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
  },
  list: {
    flex: 1,
  },
});
