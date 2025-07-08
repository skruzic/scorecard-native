import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { getSuitSymbol, getVulnerability } from "../lib/bridge-utils";
import { useTournament } from "../lib/tournament-context";
import { Board, Contract, Direction, Result, Suit } from "../lib/types";
import { Button } from "./ui/Button";
import { Checkbox } from "./ui/Checkbox";
import { ModalDialog } from "./ui/ModalDialog";
import { RadioGroup } from "./ui/RadioGroup";
import { ToggleGroup } from "./ui/ToggleGroup";

interface ContractDialogProps {
  board: Board | null;
  visible: boolean;
  onClose: () => void;
}

export function ContractDialog({
  board,
  visible,
  onClose,
}: ContractDialogProps) {
  const {
    saveBoardData,
    calculateScore,
    lastUsedYourSide,
    updateLastUsedYourSide,
  } = useTournament();

  const [contract, setContract] = useState<Partial<Contract>>({});
  const [yourSide, setYourSide] = useState<Direction>(lastUsedYourSide);

  useEffect(() => {
    if (board) {
      setContract(board.contract || {});
      setYourSide(board.yourSide || lastUsedYourSide);
    }
  }, [board, lastUsedYourSide]);

  const handleInputChange = (key: keyof Contract, value: any) => {
    setContract((prev) => ({ ...prev, [key]: value }));
  };

  const getCurrentScore = () => {
    if (
      !contract.level ||
      !contract.suit ||
      !contract.declarer ||
      !contract.result ||
      contract.tricks === undefined
    ) {
      return null;
    }

    const vulnerability = getVulnerability(board?.id || 1);
    const fullContract: Contract = {
      level: contract.level,
      suit: contract.suit,
      doubled: contract.doubled || false,
      redoubled: contract.redoubled || false,
      declarer: contract.declarer,
      result: contract.result,
      tricks: contract.tricks,
      vulnerable:
        contract.declarer === "N" || contract.declarer === "S"
          ? vulnerability.ns
          : vulnerability.ew,
    };

    return calculateScore(fullContract);
  };

  const handleSave = () => {
    if (!board) return;

    const isContractComplete =
      contract.level &&
      contract.suit &&
      contract.declarer &&
      contract.result &&
      contract.tricks !== undefined;

    if (isContractComplete) {
      const vulnerability = getVulnerability(board.id);
      const fullContract: Contract = {
        level: contract.level!,
        suit: contract.suit!,
        doubled: contract.doubled || false,
        redoubled: contract.redoubled || false,
        declarer: contract.declarer!,
        result: contract.result!,
        tricks: contract.tricks!,
        vulnerable:
          contract.declarer === "N" || contract.declarer === "S"
            ? vulnerability.ns
            : vulnerability.ew,
      };

      saveBoardData(board.id, { contract: fullContract, yourSide });
      updateLastUsedYourSide(yourSide);
      Alert.alert("Success", "Contract saved successfully");
    } else {
      // Save just the yourSide if contract is incomplete
      saveBoardData(board.id, { yourSide });
      updateLastUsedYourSide(yourSide);
      Alert.alert("Success", "Your side saved successfully");
    }

    onClose();
  };

  const suitOptions = [
    { label: getSuitSymbol("Clubs"), value: "Clubs", color: "black" as const },
    {
      label: getSuitSymbol("Diamonds"),
      value: "Diamonds",
      color: "red" as const,
    },
    { label: getSuitSymbol("Hearts"), value: "Hearts", color: "red" as const },
    {
      label: getSuitSymbol("Spades"),
      value: "Spades",
      color: "black" as const,
    },
    {
      label: getSuitSymbol("NoTrump"),
      value: "NoTrump",
      color: "blue" as const,
    },
  ];

  const levelOptions = [1, 2, 3, 4, 5, 6, 7].map((level) => ({
    label: level.toString(),
    value: level.toString(),
  }));

  const declarerOptions = ["N", "E", "S", "W"].map((dir) => ({
    label: dir,
    value: dir,
  }));

  const resultOptions = [
    { label: "Made", value: "Made" },
    { label: "Down", value: "Down" },
  ];

  const yourSideOptions = [
    { label: "N-S", value: "N-S" },
    { label: "E-W", value: "E-W" },
  ];

  // Generate tricks options based on contract level and result
  const getTricksOptions = () => {
    if (!contract.level || !contract.result) return [];

    if (contract.result === "Made") {
      // Made contracts: contract tricks + 0-6 overtricks
      const contractTricks = contract.level + 6;
      return Array.from({ length: 7 }, (_, i) => ({
        label: `${contractTricks + i}`,
        value: (contractTricks + i).toString(),
      }));
    } else {
      // Down contracts: 1-13 undertricks
      return Array.from({ length: contract.level + 6 }, (_, i) => ({
        label: `${i + 1}`,
        value: (i + 1).toString(),
      }));
    }
  };

  const tricksOptions = getTricksOptions();

  if (!board) return null;

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      title={`Board ${board.id} - ${
        getVulnerability(board.id).ns && getVulnerability(board.id).ew
          ? "Both Vul"
          : getVulnerability(board.id).ns
          ? "N-S Vul"
          : getVulnerability(board.id).ew
          ? "E-W Vul"
          : "None Vul"
      }`}
      footer={
        <View style={styles.footer}>
          <Button
            title="Cancel"
            onPress={onClose}
            variant="outline"
            style={styles.footerButton}
          />
          <Button
            title="Save"
            onPress={handleSave}
            style={styles.footerButton}
          />
        </View>
      }
    >
      <View style={styles.content}>
        {/* Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Level</Text>
          <ToggleGroup
            options={levelOptions}
            selectedValue={contract.level?.toString()}
            onValueChange={(value) =>
              handleInputChange("level", parseInt(value))
            }
          />
        </View>

        {/* Suit */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suit</Text>
          <ToggleGroup
            options={suitOptions}
            selectedValue={contract.suit}
            onValueChange={(value) => handleInputChange("suit", value as Suit)}
          />
        </View>

        {/* Declarer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Declarer</Text>
          <ToggleGroup
            options={declarerOptions}
            selectedValue={contract.declarer}
            onValueChange={(value) => handleInputChange("declarer", value)}
          />
        </View>

        {/* Doubling */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Doubling</Text>
          <View style={styles.checkboxRow}>
            <Checkbox
              label="Doubled"
              checked={contract.doubled || false}
              onPress={() => {
                handleInputChange("doubled", !contract.doubled);
                if (!contract.doubled) handleInputChange("redoubled", false);
              }}
            />
            <Checkbox
              label="Redoubled"
              checked={contract.redoubled || false}
              onPress={() =>
                handleInputChange("redoubled", !contract.redoubled)
              }
              disabled={!contract.doubled}
            />
          </View>
        </View>

        {/* Result */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Result</Text>
          <ToggleGroup
            options={resultOptions}
            selectedValue={contract.result}
            onValueChange={(value) =>
              handleInputChange("result", value as Result)
            }
          />
        </View>

        {/* Tricks */}
        {contract.result && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {contract.result === "Made" ? "Tricks Made" : "Undertricks"}
            </Text>
            <ToggleGroup
              options={tricksOptions}
              selectedValue={contract.tricks?.toString()}
              onValueChange={(value) =>
                handleInputChange("tricks", parseInt(value))
              }
            />
          </View>
        )}

        {/* Your Side */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Side</Text>
          <RadioGroup
            options={yourSideOptions}
            selectedValue={yourSide}
            onValueChange={(value) => setYourSide(value as Direction)}
          />
        </View>

        {/* Score Display */}
        <View style={styles.scoreSection}>
          <Text style={styles.sectionTitle}>Score</Text>
          <Text
            style={[
              styles.scoreText,
              getCurrentScore() !== null
                ? getCurrentScore()! >= 0
                  ? styles.positiveScore
                  : styles.negativeScore
                : styles.noScore,
            ]}
          >
            {getCurrentScore() !== null ? getCurrentScore() : "—"}
          </Text>
        </View>
      </View>
    </ModalDialog>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
  },
  checkboxRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
  },
  scoreSection: {
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
  },
  positiveScore: {
    color: "#059669",
  },
  negativeScore: {
    color: "#dc2626",
  },
  noScore: {
    color: "#6b7280",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  footerButton: {
    flex: 1,
  },
});
