// ============================================
// LOTUS BUSINESS — MoveFooter
// ============================================

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ArrowRight, History } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/colors";
import { FontFamily } from "@/constants/typography";

interface MoveFooterProps {
  hasMore: boolean;
  extraCount: number;
}

export default function MoveFooter({ hasMore, extraCount }: MoveFooterProps) {
  const router = useRouter();

  return (
    <View style={styles.footerWrap}>
      {/* Indicateur "…et X de plus" quand la recherche masque des résultats */}
      {hasMore && (
        <View style={styles.moreHint}>
          <Text style={styles.moreHintText}>
            +{extraCount} mouvement{extraCount > 1 ? "s" : ""} supplémentaire
            {extraCount > 1 ? "s" : ""}
          </Text>
        </View>
      )}

      {/* Bouton Historique complet */}
      <TouchableOpacity
        style={styles.historyButton}
        activeOpacity={0.85}
        onPress={() => router.push("/(drawer)/screens/historique")}
      >
        <View style={styles.historyButtonLeft}>
          <View style={styles.historyIconWrap}>
            <History size={20} color={Colors.textInverse} strokeWidth={2.2} />
          </View>
          <View style={styles.historyButtonTexts}>
            <Text style={styles.historyButtonTitle}>Voir tout l'historique</Text>
            <Text style={styles.historyButtonSub}>
              Ventes · Entrées stock · Pagination
            </Text>
          </View>
        </View>
        <ArrowRight size={18} color={Colors.textSecondary} strokeWidth={2.2} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footerWrap: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 12,
  },
  moreHint: {
    alignItems: "center",
    paddingVertical: 6,
  },
  moreHintText: {
    fontFamily: FontFamily.utility,
    fontSize: 12,
    color: Colors.textTertiary,
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  historyButtonLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  historyIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: Colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  historyButtonTexts: {
    gap: 3,
  },
  historyButtonTitle: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  historyButtonSub: {
    fontFamily: FontFamily.content,
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
