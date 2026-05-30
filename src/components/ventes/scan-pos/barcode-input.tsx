import React from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Colors } from "@/constants/colors";
import { FontFamily } from "@/constants/typography";

type BarcodeInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
};

export function BarcodeInput({ value, onChangeText, onSubmit }: BarcodeInputProps) {
  return (
    <View style={styles.inputRow}>
      <TextInput
        style={styles.input}
        placeholder="Entrer un code-barres"
        value={value}
        onChangeText={onChangeText}
        keyboardType="number-pad"
        placeholderTextColor={Colors.textSecondary}
      />
      <TouchableOpacity style={styles.scanButton} onPress={onSubmit}>
        <Text style={styles.scanButtonText}>Scanner</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 14,
  },
  input: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    paddingHorizontal: 14,
    color: Colors.textPrimary,
    fontFamily: FontFamily.medium,
  },
  scanButton: {
    height: 46,
    borderRadius: 12,
    paddingHorizontal: 18,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  scanButtonText: {
    color: "#FFFFFF",
    fontFamily: FontFamily.bold,
    fontSize: 14,
  },
});
