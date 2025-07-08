import { TournamentCreator } from "@/components/TournamentCreator";
import { TournamentList } from "@/components/TournamentList";
import React from "react";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";

export default function TournamentScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TournamentCreator />
        <TournamentList />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 16,
  },
});
