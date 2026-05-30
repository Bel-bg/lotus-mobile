import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ArrowLeft, Trash2 } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { FontFamily } from "@/constants/typography";

type ScanPosHeaderProps = {
  onBack: () => void;
  onReset: () => void;
};

export function ScanPosHeader({ onBack, onReset }: ScanPosHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.iconButton}>
        <ArrowLeft size={22} color={Colors.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.title}>Scan POS</Text>
      <TouchableOpacity onPress={onReset} style={styles.iconButton}>
        <Trash2 size={20} color={Colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
});
