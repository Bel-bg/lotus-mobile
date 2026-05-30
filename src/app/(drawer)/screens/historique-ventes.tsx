import { Colors } from "@/constants/colors";
import { FontFamily } from "@/constants/typography";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  ChevronRight,
  Clock3,
  SlidersHorizontal,
} from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FilterKey = "today" | "week" | "month";

interface SaleItem {
  id: string;
  reference: string;
  productCount: number;
  time: string;
  amount: number;
  muted?: boolean;
}

interface SaleSection {
  title: string;
  subtle?: boolean;
  items: SaleItem[];
}

interface SaleSnapshot {
  performanceLabel: string;
  performanceValue: string;
  averageValue: string;
  sections: SaleSection[];
}

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: "today", label: "Aujourd'hui" },
  { key: "week", label: "Cette semaine" },
  { key: "month", label: "Ce mois" },
];

const SALES_BY_FILTER: Record<FilterKey, SaleSnapshot> = {
  today: {
    performanceLabel: "Performance",
    performanceValue: "14 ventes · Total 125 000 FCFA",
    averageValue: "8 928 FCFA",
    sections: [
      {
        title: "Aujourd'hui - 17 mars",
        items: [
          {
            id: "1",
            reference: "#1042",
            productCount: 3,
            time: "14:25",
            amount: 45000,
          },
          {
            id: "2",
            reference: "#1041",
            productCount: 1,
            time: "11:10",
            amount: 12500,
          },
          {
            id: "3",
            reference: "#1040",
            productCount: 5,
            time: "09:45",
            amount: 67500,
          },
        ],
      },
      {
        title: "Hier - 16 mars",
        subtle: true,
        items: [
          {
            id: "4",
            reference: "#1039",
            productCount: 2,
            time: "16:50",
            amount: 8000,
            muted: true,
          },
        ],
      },
    ],
  },
  week: {
    performanceLabel: "Semaine",
    performanceValue: "46 ventes · Total 398 500 FCFA",
    averageValue: "8 663 FCFA",
    sections: [
      {
        title: "Aujourd'hui - 17 mars",
        items: [
          {
            id: "1",
            reference: "#1042",
            productCount: 3,
            time: "14:25",
            amount: 45000,
          },
          {
            id: "2",
            reference: "#1041",
            productCount: 1,
            time: "11:10",
            amount: 12500,
          },
        ],
      },
      {
        title: "Samedi - 16 mars",
        subtle: true,
        items: [
          {
            id: "3",
            reference: "#1039",
            productCount: 2,
            time: "16:50",
            amount: 8000,
          },
          {
            id: "4",
            reference: "#1038",
            productCount: 4,
            time: "12:15",
            amount: 23000,
          },
        ],
      },
      {
        title: "Vendredi - 15 mars",
        subtle: true,
        items: [
          {
            id: "5",
            reference: "#1037",
            productCount: 6,
            time: "18:05",
            amount: 51200,
          },
        ],
      },
    ],
  },
  month: {
    performanceLabel: "Mois",
    performanceValue: "124 ventes · Total 2 405 000 FCFA",
    averageValue: "19 395 FCFA",
    sections: [
      {
        title: "17 mars",
        items: [
          {
            id: "1",
            reference: "#1042",
            productCount: 3,
            time: "14:25",
            amount: 45000,
          },
          {
            id: "2",
            reference: "#1041",
            productCount: 1,
            time: "11:10",
            amount: 12500,
          },
        ],
      },
      {
        title: "16 mars",
        subtle: true,
        items: [
          {
            id: "3",
            reference: "#1039",
            productCount: 2,
            time: "16:50",
            amount: 8000,
          },
        ],
      },
      {
        title: "12 mars",
        subtle: true,
        items: [
          {
            id: "4",
            reference: "#1031",
            productCount: 8,
            time: "17:35",
            amount: 97300,
          },
        ],
      },
    ],
  },
};

function formatAmount(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value);
}

export default function HistoriqueVentesScreen() {
  const router = useRouter();
  const boutiqueNom = useAuthStore(
    (state) => state.boutique?.nom ?? "Boutique Lotus",
  );
  const [activeFilter, setActiveFilter] = React.useState<FilterKey>("today");

  const snapshot = SALES_BY_FILTER[activeFilter];

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
      >

        <View style={styles.filterRow}>
          {FILTERS.map((filter) => {
            const isActive = filter.key === activeFilter;

            return (
              <TouchableOpacity
                key={filter.key}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveFilter(filter.key)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.metricsCard}>
          <View style={styles.metricBlock}>
            <Text style={styles.metricLabel}>{snapshot.performanceLabel}</Text>
            <Text style={styles.metricValue} selectable>
              {snapshot.performanceValue}
            </Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricBlock}>
            <Text style={styles.metricLabel}>Moyenne</Text>
            <Text style={styles.metricValue} selectable>
              {snapshot.averageValue}
            </Text>
          </View>
        </View>

        {snapshot.sections.map((section, sectionIndex) => (
          <View key={section.title} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text
                style={[
                  styles.sectionTitle,
                  section.subtle && styles.sectionTitleSubtle,
                ]}
                selectable
              >
                {section.title}
              </Text>
              {sectionIndex === 0 ? <View style={styles.sectionDot} /> : null}
            </View>

            <View style={styles.list}>
              {section.items.map((sale) => (
                <TouchableOpacity
                  key={sale.id}
                  style={[styles.saleCard, sale.muted && styles.saleCardMuted]}
                  onPress={() => router.push("/ventes/nouvelle")}
                  activeOpacity={0.82}
                >
                  <View
                    style={[
                      styles.referenceBadge,
                      sale.muted && styles.referenceBadgeMuted,
                    ]}
                  >
                    <Text
                      style={[
                        styles.referenceText,
                        sale.muted && styles.referenceTextMuted,
                      ]}
                      selectable
                    >
                      {sale.reference}
                    </Text>
                  </View>

                  <View style={styles.saleBody}>
                    <Text
                      style={[
                        styles.saleTitle,
                        sale.muted && styles.saleTitleMuted,
                      ]}
                      selectable
                    >
                      {sale.productCount}{" "}
                      {sale.productCount > 1 ? "produits" : "produit"}
                    </Text>

                    <View style={styles.timeRow}>
                      <Clock3
                        size={14}
                        color={
                          sale.muted
                            ? Colors.textTertiary
                            : Colors.textSecondary
                        }
                        strokeWidth={2.2}
                      />
                      <Text style={styles.timeText} selectable>
                        {sale.time}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.amountWrap}>
                    <View style={styles.amountRow}>
                      <Text
                        style={[
                          styles.amountValue,
                          sale.muted && styles.amountValueMuted,
                        ]}
                        selectable
                      >
                        {formatAmount(sale.amount)}
                      </Text>
                      <Text style={styles.amountCurrency} selectable>
                        FCFA
                      </Text>
                    </View>
                    <ChevronRight
                      size={18}
                      color={
                        sale.muted ? Colors.borderStrong : Colors.textSecondary
                      }
                      strokeWidth={2.4}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    paddingHorizontal: 22,
    paddingBottom: 40,
    gap: 18,
  },
  header: {
    paddingTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
    paddingBottom: 10,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  headerTitle: {
    fontFamily: FontFamily.display,
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontFamily: FontFamily.content,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F7F7F7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  filterRow: {
    flexDirection: "row",
    gap: 10,
  },
  filterChip: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: "#F2F1EF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  filterChipActive: {
    backgroundColor: Colors.textPrimary,
  },
  filterChipText: {
    fontFamily: FontFamily.utility,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.textInverse,
  },
  metricsCard: {
    flexDirection: "row",
    alignItems: "stretch",
    borderRadius: 18,
    backgroundColor: "#F3F2F0",
    paddingHorizontal: 16,
    paddingVertical: 14,
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
  },
  metricBlock: {
    flex: 1,
    gap: 6,
  },
  metricDivider: {
    width: 1,
    marginHorizontal: 14,
    backgroundColor: "#E3E1DE",
  },
  metricLabel: {
    fontFamily: FontFamily.utility,
    fontSize: 10,
    color: Colors.textSecondary,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  metricValue: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
    fontVariant: ["tabular-nums"],
  },
  section: {
    gap: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontFamily: FontFamily.display,
    fontSize: 16,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  sectionTitleSubtle: {
    color: Colors.textSecondary,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#CFCFCF",
  },
  list: {
    gap: 14,
  },
  saleCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.background,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.05)",
  },
  saleCardMuted: {
    opacity: 0.78,
  },
  referenceBadge: {
    width: 52,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  referenceBadgeMuted: {
    backgroundColor: "#ECECEA",
  },
  referenceText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 15,
    color: Colors.textInverse,
  },
  referenceTextMuted: {
    color: Colors.textSecondary,
  },
  saleBody: {
    flex: 1,
    gap: 5,
  },
  saleTitle: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  saleTitleMuted: {
    color: Colors.textSecondary,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  timeText: {
    fontFamily: FontFamily.content,
    fontSize: 13,
    color: Colors.textSecondary,
    fontVariant: ["tabular-nums"],
  },
  amountWrap: {
    alignItems: "flex-end",
    gap: 6,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  amountValue: {
    fontFamily: FontFamily.display,
    fontSize: 15,
    color: Colors.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  amountValueMuted: {
    color: Colors.textSecondary,
  },
  amountCurrency: {
    fontFamily: FontFamily.utility,
    fontSize: 10,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
});
