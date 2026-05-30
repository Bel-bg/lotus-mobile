// ============================================
// LOTUS BUSINESS — MoveEmpty
// ============================================

import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import EmptyImage from "@/assets/images/empty.png"
import { Colors } from "@/constants/colors";
import { FontFamily } from "@/constants/typography";

interface MoveEmptyProps {
  hasData: boolean;
}

export default function MoveEmpty({ hasData }: MoveEmptyProps) {
  return (
    <View style={styles.emptyState}>
      <Image
        source={EmptyImage}
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <Text style={styles.emptyTitle}>
        {hasData ? "Aucun résultat" : "Aucun mouvement enregistré"}
      </Text>
      <Text style={styles.emptyText}>
        {hasData
          ? "Ajuste la recherche ou le filtre pour retrouver un mouvement."
          : "Les ventes, entrées et sorties apparaîtront ici au fil de l'activité."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 36,
  },
  emptyImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginTop: 14,
  },
  emptyText: {
    fontFamily: FontFamily.content,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
});
