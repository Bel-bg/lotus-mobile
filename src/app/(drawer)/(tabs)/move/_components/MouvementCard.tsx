// ============================================
// LOTUS BUSINESS — MouvementCard
// ============================================

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ArrowDownRight, ArrowUpRight } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { FontFamily } from "@/constants/typography";
import { formatTempsRelatif, formatHeure } from "@/lib/utils/formatters";
import { Mouvement } from "@/types";

interface MouvementCardProps {
  item: Mouvement;
  showDateSection: boolean;
  dateSectionLabel: string;
}

export default function MouvementCard({
  item,
  showDateSection,
  dateSectionLabel,
}: MouvementCardProps) {
  const isEntree = item.type === "entree";

  // Valeurs sûres pour les formatters (on utilise une string vide si la date est absente)
  const createdAt = item.createdAt ?? "";

  return (
    <View>
      {showDateSection ? (
        <View style={styles.dateSection}>
          <Text style={styles.dateSectionText}>{dateSectionLabel}</Text>
        </View>
      ) : null}

      <View style={styles.itemCard}>
        <View
          style={[
            styles.iconBox,
            isEntree ? styles.iconBoxSuccess : styles.iconBoxDanger,
          ]}
        >
          {isEntree ? (
            <ArrowDownRight size={20} color={Colors.success} strokeWidth={2.5} />
          ) : (
            <ArrowUpRight size={20} color={Colors.danger} strokeWidth={2.5} />
          )}
        </View>

        <View style={styles.itemContent}>
          <View style={styles.itemTitleRow}>
            <Text style={styles.itemTitle} numberOfLines={1}>
              {item.produitNom || "Produit inconnu"}
            </Text>
            <Text
              style={[styles.itemQuantity, isEntree ? styles.qtyIn : styles.qtyOut]}
            >
              {isEntree ? "+" : "-"}
              {item.quantite}
            </Text>
          </View>

          <Text style={styles.itemMeta}>
            {isEntree ? "Entrée" : "Sortie"} •{" "}
            {createdAt ? formatTempsRelatif(createdAt) : "Date inconnue"}
          </Text>

          <Text style={styles.itemDetail} numberOfLines={2}>
            {item.reference ||
              item.note ||
              "Mouvement enregistré dans l'application"}
          </Text>

          {createdAt ? (
            <Text style={styles.itemTime}>{formatHeure(createdAt)}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dateSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  dateSectionText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 11,
    letterSpacing: 0.8,
    color: Colors.textSecondary,
    textTransform: "uppercase",
  },
  itemCard: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconBoxSuccess: { backgroundColor: Colors.successLight },
  iconBoxDanger: { backgroundColor: Colors.dangerLight },
  itemContent: { flex: 1 },
  itemTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  itemTitle: {
    flex: 1,
    fontFamily: FontFamily.utilityBold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  itemQuantity: {
    fontFamily: FontFamily.display,
    fontSize: 17,
  },
  qtyIn: { color: Colors.successText },
  qtyOut: { color: Colors.dangerText },
  itemMeta: {
    fontFamily: FontFamily.utility,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  itemDetail: {
    fontFamily: FontFamily.content,
    fontSize: 13,
    color: Colors.textPrimary,
    marginTop: 8,
    lineHeight: 18,
  },
  itemTime: {
    fontFamily: FontFamily.utility,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 10,
  },
});
