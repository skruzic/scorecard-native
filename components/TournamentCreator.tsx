import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useTournament } from "../lib/tournament-context";
import { Button } from "./ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Input } from "./ui/Input";

interface TournamentCreatorProps {
  onClose?: () => void;
}

export function TournamentCreator({ onClose }: TournamentCreatorProps) {
  const [name, setName] = useState("");
  const [numberOfBoards, setNumberOfBoards] = useState("16");
  const { createTournament } = useTournament();

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a tournament name");
      return;
    }

    const boardsCount = parseInt(numberOfBoards, 10);
    if (isNaN(boardsCount) || boardsCount < 1) {
      Alert.alert("Error", "Please enter a valid number of boards");
      return;
    }

    createTournament(name, boardsCount);
    Alert.alert("Success", "Tournament created successfully");

    // Reset form
    setName("");
    setNumberOfBoards("16");

    onClose?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Tournament</CardTitle>
        <Text style={styles.description}>
          Enter tournament details to get started
        </Text>
      </CardHeader>
      <CardContent>
        <View style={styles.form}>
          <Input
            label="Tournament Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter tournament name"
          />

          <Input
            label="Number of Boards"
            value={numberOfBoards}
            onChangeText={setNumberOfBoards}
            placeholder="Enter number of boards"
            keyboardType="numeric"
          />

          <Button
            title="Create Tournament"
            onPress={handleSubmit}
            style={styles.submitButton}
          />
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
  form: {
    gap: 16,
  },
  submitButton: {
    marginTop: 8,
  },
});
