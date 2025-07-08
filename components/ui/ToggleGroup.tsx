import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface ToggleOption {
  label: string;
  value: string;
  color?: "red" | "black" | "blue";
}

interface ToggleGroupProps {
  options: ToggleOption[];
  selectedValue?: string;
  onValueChange: (value: string) => void;
  style?: ViewStyle;
}

export function ToggleGroup({
  options,
  selectedValue,
  onValueChange,
  style,
}: ToggleGroupProps) {
  return (
    <View style={[styles.container, style]}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.option,
            selectedValue === option.value && styles.selectedOption,
          ]}
          onPress={() => onValueChange(option.value)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.optionText,
              selectedValue === option.value && styles.selectedOptionText,
              option.color === "red" && styles.redText,
              option.color === "blue" && styles.blueText,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    minWidth: 40,
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  selectedOptionText: {
    color: "#ffffff",
  },
  redText: {
    color: "#dc2626",
  },
  blueText: {
    color: "#2563eb",
  },
});
