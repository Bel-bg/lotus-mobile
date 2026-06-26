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
  const createdAt = item.createdAt ?? "";

  return (
    <View>
      {showDateSection && (
        <View style={styles.dateSection}>
          <Text style={styles.dateSectionText}>{dateSectionLabel}</Text>
        </View>
      )}

      <View style={styles.itemCard}>
        {/* Bande colorée gauche à la place de l'iconBox ronde */}
        <View style={styles.stripe} />

        <View style={[styles.iconBox, isEntree ? styles.iconBoxSuccess : styles.iconBoxDanger]}>
          {isEntree ? (
            <ArrowDownRight size={18} color={Colors.success} strokeWidth={2.5} />
          ) : (
            <ArrowUpRight size={18} color={Colors.danger} strokeWidth={2.5} />
          )}
        </View>

        <View style={styles.itemContent}>
          <View style={styles.itemTitleRow}>
            <Text style={styles.itemTitle} numberOfLines={1}>
              {item.produitNom || "Produit inconnu"}
            </Text>
            <Text style={[styles.itemQuantity, isEntree ? styles.qtyIn : styles.qtyOut]}>
              {isEntree ? "+" : "-"}{item.quantite}
            </Text>
          </View>

          <Text style={styles.itemMeta}>
            {isEntree ? "Entrée" : "Sortie"} •{" "}
            {createdAt ? formatTempsRelatif(createdAt) : "Date inconnue"}
            {createdAt ? ` • ${formatHeure(createdAt)}` : ""}
          </Text>

          {(item.reference || item.note) && (
            <Text style={styles.itemDetail} numberOfLines={2}>
              {item.reference || item.note}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dateSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 6,
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
    alignItems: "center",
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 14,
    paddingRight: 20,
  },

  stripe: {
    width: 3,
    alignSelf: "stretch",
    marginRight: 14,
  },

  iconBox: {
    width: 36,
    height: 36,
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
    marginBottom: 4,
  },
  itemTitle: {
    flex: 1,
    fontFamily: FontFamily.utilityBold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  itemQuantity: {
    fontFamily: FontFamily.display,
    fontSize: 16,
  },
  qtyIn: { color: Colors.successText },
  qtyOut: { color: Colors.dangerText },

  itemMeta: {
    fontFamily: FontFamily.utility,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  itemDetail: {
    fontFamily: FontFamily.content,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 17,
  },
});