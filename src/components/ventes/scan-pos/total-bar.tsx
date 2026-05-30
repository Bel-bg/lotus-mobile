import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { FontFamily } from "@/constants/typography";

type TotalBarProps = {
  total: number;
};

export function TotalBar({ total }: TotalBarProps) {
  return (
    <View style={styles.totalBar}>
      <Text style={styles.totalLabel}>Total</Text>
      <Text style={styles.totalValue}>{total.toLocaleString()} FCFA</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  totalBar: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "#0A0A0A",
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    color: "#FFFFFF",
    fontFamily: FontFamily.medium,
    fontSize: 14,
  },
  totalValue: {
    color: "#FFFFFF",
    fontFamily: FontFamily.bold,
    fontSize: 16,
  },
});
