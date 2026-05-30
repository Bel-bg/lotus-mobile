import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "@/constants/colors";
import { FontFamily } from "@/constants/typography";
import { PosProduct } from "./types";

type QuickAddChipsProps = {
  products: PosProduct[];
  onPress: (barcode: string) => void;
};

export function QuickAddChips({ products, onPress }: QuickAddChipsProps) {
  return (
    <View style={styles.quickTestRow}>
      {products.slice(0, 3).map((product) => (
        <TouchableOpacity
          key={product.barcode}
          style={styles.quickChip}
          onPress={() => onPress(product.barcode)}
        >
          <Text style={styles.quickChipText}>{product.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  quickTestRow: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    flexDirection: "row",
    gap: 8,
  },
  quickChip: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  quickChipText: {
    color: Colors.textPrimary,
    fontFamily: FontFamily.medium,
    fontSize: 11,
  },
});
