import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useTournament } from "../lib/tournament-context";
import { Button } from "./ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";

interface TournamentListProps {
  onClose?: () => void;
}

export function TournamentList({ onClose }: TournamentListProps) {
  const { tournaments, selectTournament, deleteTournament, currentTournament } =
    useTournament();

  const handleSelect = (id: string) => {
    selectTournament(id);
    Alert.alert("Success", "Tournament selected");
    onClose?.();
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Tournament",
      "Are you sure you want to delete this tournament?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteTournament(id);
            Alert.alert("Success", "Tournament deleted");
          },
        },
      ]
    );
  };

  if (tournaments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Tournaments</CardTitle>
          <Text style={styles.description}>
            No tournaments yet. Create one to get started.
          </Text>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Tournaments</CardTitle>
        <Text style={styles.description}>
          Select a tournament to view or edit
        </Text>
      </CardHeader>
      <CardContent>
        <View style={styles.tournamentList}>
          {tournaments.map((tournament) => (
            <View
              key={tournament.id}
              style={[
                styles.tournamentItem,
                currentTournament?.id === tournament.id &&
                  styles.selectedTournament,
              ]}
            >
              <View style={styles.tournamentInfo}>
                <Text style={styles.tournamentName}>{tournament.name}</Text>
                <Text style={styles.tournamentDetails}>
                  {tournament.date} · {tournament.numberOfBoards} boards
                </Text>
              </View>
              <View style={styles.tournamentActions}>
                <Button
                  title="Select"
                  onPress={() => handleSelect(tournament.id)}
                  disabled={currentTournament?.id === tournament.id}
                  variant="outline"
                  size="sm"
                  style={styles.actionButton}
                />
                <Button
                  title="Delete"
                  onPress={() => handleDelete(tournament.id)}
                  variant="destructive"
                  size="sm"
                  style={styles.actionButton}
                />
              </View>
            </View>
          ))}
        </View>
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  description: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  tournamentList: {
    gap: 8,
  },
  tournamentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
  },
  selectedTournament: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  tournamentInfo: {
    flex: 1,
  },
  tournamentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  tournamentDetails: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  tournamentActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    minWidth: 60,
  },
});
