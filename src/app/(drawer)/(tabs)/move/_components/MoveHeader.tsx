// ============================================
// LOTUS BUSINESS — MoveHeader
// ============================================

import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Search } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { FontFamily } from "@/constants/typography";
import FilterChip from "./FilterChip";

export type MovementFilter = "all" | "entree" | "sortie";

interface MoveHeaderProps {
  search: string;
  onSearchChange: (text: string) => void;
  activeFilter: MovementFilter;
  onFilterChange: (filter: MovementFilter) => void;
  totalEntreesJour: number;
  totalSortiesJour: number;
  filteredCount: number;
  error: string | null;
  onRetry: () => void;
}

export default function MoveHeader({
  search,
  onSearchChange,
  activeFilter,
  onFilterChange,
  totalEntreesJour,
  totalSortiesJour,
  filteredCount,
  error,
  onRetry,
}: MoveHeaderProps) {
  return (
    <View style={styles.headerContent}>
      {/* Bannières de synthèse */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, styles.summarySuccessCard]}>
          <Text style={[styles.summaryLabel, styles.summarySuccessLabel]}>
            ENTREES
            <Text style={[styles.summaryValue, styles.summarySuccessValue]}>
              {" "}+{totalEntreesJour}
            </Text>
          </Text>
          <Text style={styles.summaryHint}>unités ce jour</Text>
        </View>

        <View style={[styles.summaryCard, styles.summaryDangerCard]}>
          <Text style={[styles.summaryLabel, styles.summaryDangerLabel]}>
            SORTIES
            <Text style={[styles.summaryValue, styles.summaryDangerValue]}>
              {" "}-{totalSortiesJour}
            </Text>
          </Text>
          <Text style={styles.summaryHint}>unités ce jour</Text>
        </View>
      </View>

      {/* Recherche */}
      <View style={styles.searchBox}>
        <Search size={18} color={Colors.textSecondary} />
        <TextInput
          placeholder="Produit, référence ou note..."
          placeholderTextColor={Colors.textSecondary}
          style={styles.searchInput}
          value={search}
          onChangeText={onSearchChange}
        />
      </View>

      {/* Filtres */}
      <View style={styles.filterRow}>
        <FilterChip
          label="Tous"
          active={activeFilter === "all"}
          onPress={() => onFilterChange("all")}
        />
        <FilterChip
          label="Entrées"
          active={activeFilter === "entree"}
          onPress={() => onFilterChange("entree")}
        />
        <FilterChip
          label="Sorties"
          active={activeFilter === "sortie"}
          onPress={() => onFilterChange("sortie")}
        />
      </View>

      {/* En-tête section */}
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Activité récente</Text>
        <Text style={styles.sectionCount}>
          {filteredCount} mouvement{filteredCount > 1 ? "s" : ""}
        </Text>
      </View>

      {/* Erreur */}
      {error ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onRetry}
          style={styles.errorCard}
        >
          <Text style={styles.errorTitle}>Chargement indisponible</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorAction}>Toucher pour réessayer</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#F6F6F6",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  summarySuccessCard: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.successBorder,
  },
  summaryDangerCard: {
    backgroundColor: Colors.dangerLight,
    borderColor: Colors.dangerBorder,
  },
  summaryLabel: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  summarySuccessLabel: { color: Colors.successText },
  summaryDangerLabel: { color: Colors.dangerText },
  summaryValue: {
    fontFamily: FontFamily.display,
    fontSize: 24,
    color: Colors.textPrimary,
  },
  summarySuccessValue: { color: Colors.successText },
  summaryDangerValue: { color: Colors.dangerText },
  summaryHint: {
    fontFamily: FontFamily.content,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontFamily: FontFamily.content,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  filterRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    marginBottom: 18,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  sectionCount: {
    fontFamily: FontFamily.utility,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  errorCard: {
    backgroundColor: Colors.warningLight,
    borderColor: Colors.warningBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
  },
  errorTitle: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 14,
    color: Colors.warningText,
    marginBottom: 4,
  },
  errorText: {
    fontFamily: FontFamily.content,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  errorAction: {
    fontFamily: FontFamily.utility,
    fontSize: 12,
    color: Colors.warningText,
    marginTop: 8,
  },
});
