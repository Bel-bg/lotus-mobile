// ============================================
// LOTUS BUSINESS — Bannière Entrée Stock (réception / ajout produit)
// ============================================

import { Colors } from "@/constants/colors";
import { FontFamily } from "@/constants/typography";
import { formatHeure, formatTempsRelatif } from "@/lib/utils/formatters";
import { Mouvement } from "@/types";
import {
  ArrowDownToLine,
  PackagePlus,
  RefreshCw,
} from "lucide-react-native";
import React from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";

// ─── Bannière Entrée Stock ────────────────────────────────────────────────────

interface SortieBanniereProps {
  mouvement: Mouvement;
}

/**
 * Bannière pour les mouvements de type "entrée" (réception de stock).
 * Affiche : icône d'action, nom du produit, quantité entrée, heure.
 *
 * Note : dans la nomenclature métier de l'app, une "sortie" (dans move.tsx)
 * correspond à une vente (sortie du stock), tandis qu'une "entrée" correspond
 * à un réapprovisionnement du stock. Ce composant représente les réappros.
 */
export function SortieBanniere({ mouvement }: SortieBanniereProps) {
  // Détermine si c'est un ajout pur (sans note = nouveau produit) ou une mise à jour
  const isAjout = !mouvement.note && !mouvement.reference;
  const Icon = isAjout ? PackagePlus : RefreshCw;
  const actionLabel = isAjout ? "Ajout produit" : "Mise à jour stock";

  return (
    <View style={styles.card}>
      {/* Icône d'action */}
      <View style={[styles.iconBox, isAjout ? styles.iconBoxAjout : styles.iconBoxMaj]}>
        <Icon
          size={20}
          color={isAjout ? Colors.info : Colors.warning}
          strokeWidth={2.2}
        />
      </View>

      {/* Corps */}
      <View style={styles.cardBody}>
        <View style={styles.titleRow}>
          <Text style={styles.produitNom} numberOfLines={1}>
            {mouvement.produitNom ?? "Produit inconnu"}
          </Text>
          <View style={styles.qtyBadge}>
            <ArrowDownToLine size={12} color={Colors.successText} strokeWidth={2.4} />
            <Text style={styles.qtyText}>+{mouvement.quantite}</Text>
          </View>
        </View>

        <Text style={styles.actionLabel}>{actionLabel}</Text>

        {(mouvement.note || mouvement.reference) ? (
          <Text style={styles.noteText} numberOfLines={1}>
            {mouvement.note ?? mouvement.reference}
          </Text>
        ) : null}

        <Text style={styles.heure}>
          {formatTempsRelatif(mouvement.createdAt)} · {formatHeure(mouvement.createdAt)}
        </Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    marginBottom: 10,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxAjout: {
    backgroundColor: Colors.infoLight,
  },
  iconBoxMaj: {
    backgroundColor: Colors.warningLight,
  },
  cardBody: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  produitNom: {
    flex: 1,
    fontFamily: FontFamily.utilityBold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  qtyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.successLight,
    borderColor: Colors.successBorder,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  qtyText: {
    fontFamily: FontFamily.display,
    fontSize: 13,
    color: Colors.successText,
  },
  actionLabel: {
    fontFamily: FontFamily.utility,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  noteText: {
    fontFamily: FontFamily.content,
    fontSize: 12,
    color: Colors.textTertiary,
  },
  heure: {
    fontFamily: FontFamily.utility,
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 4,
  },
});
export default function IgnoredRoute() { return null; }
