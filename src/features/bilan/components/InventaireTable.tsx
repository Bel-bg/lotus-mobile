import { Colors } from "@/constants/colors";
import { FontFamily, FontSize } from "@/constants/typography";
import { formatMontant, formatNombre } from "@/lib/utils/formatters";
import type { BilanInventoryRow } from "@/types/bilan";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import VoirPlusButton from "./VoirPlusButton";

interface InventaireTableProps {
  title: string;
  rows: BilanInventoryRow[];
  emptyMessage?: string;
  expanded: boolean;
  onToggleExpanded: () => void;
  hideWhenEmpty?: boolean;
}

const PREVIEW_LIMIT = 3;

export default function InventaireTable({
  title,
  rows,
  emptyMessage = "Aucune donnée sur cette période.",
  expanded,
  onToggleExpanded,
  hideWhenEmpty = false,
}: InventaireTableProps) {
  if (hideWhenEmpty && rows.length === 0) {
    return null;
  }

  const visibleRows = expanded ? rows : rows.slice(0, PREVIEW_LIMIT);
  const hiddenCount = Math.max(rows.length - PREVIEW_LIMIT, 0);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title} selectable>
          {title}
        </Text>
        <Text style={styles.count} selectable>
          {formatNombre(rows.length)} ligne{rows.length > 1 ? "s" : ""}
        </Text>
      </View>

      {rows.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText} selectable>
            {emptyMessage}
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.tableHeader}>
            <Text style={[styles.columnLabel, styles.productColumn]} selectable>
              Produit
            </Text>
            <Text style={styles.columnLabel} selectable>
              Qté
            </Text>
            <Text style={styles.columnLabel} selectable>
              P.U.
            </Text>
            <Text style={[styles.columnLabel, styles.totalColumn]} selectable>
              Total
            </Text>
          </View>

          {visibleRows.map((row) => (
            <View key={row.produitId} style={styles.tableRow}>
              <Text
                style={[styles.cellText, styles.productCell]}
                numberOfLines={2}
                selectable
              >
                {row.produitNom}
              </Text>
              <Text style={styles.cellText} selectable>
                {formatNombre(row.quantite)}
              </Text>
              <Text style={styles.cellText} selectable>
                {formatMontant(row.prixUnitaire)}
              </Text>
              <Text style={[styles.cellText, styles.totalCell]} selectable>
                {formatMontant(row.total)}
              </Text>
            </View>
          ))}

          {rows.length > PREVIEW_LIMIT ? (
            <VoirPlusButton
              expanded={expanded}
              hiddenCount={hiddenCount}
              onPress={onToggleExpanded}
            />
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 6,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    flex: 1,
    fontFamily: FontFamily.displaySemi,
    fontSize: FontSize["2xl"],
    color: Colors.textPrimary,
  },
  count: {
    fontFamily: FontFamily.utility,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  emptyState: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  emptyText: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  columnLabel: {
    flex: 0.9,
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  productColumn: {
    flex: 1.45,
  },
  totalColumn: {
    textAlign: "right",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceAlt,
  },
  productCell: {
    flex: 1.45,
  },
  totalCell: {
    textAlign: "right",
  },
  cellText: {
    flex: 0.9,
    fontFamily: FontFamily.content,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textPrimary,
    fontVariant: ["tabular-nums"],
  },
});
