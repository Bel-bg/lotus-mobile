// ============================================
// LOTUS BUSINESS — Écran : Bilan
// ============================================

import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LineChart } from "react-native-gifted-charts";
import { Colors } from "../../../../constants/colors";
import { FontFamily, TextStyles } from "../../../../constants/typography";
import { BILAN_DATA, Period } from "../../../../features/bilan/mock.data";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CHART_WIDTH = SCREEN_WIDTH - 64;

// ─── Helpers ────────────────────────────────

function formatFCFA(value: number): string {
  return value.toLocaleString("fr-FR");
}

// ─── Sous-composants ─────────────────────────

function PeriodButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.periodBtn, active && styles.periodBtnActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[styles.periodBtnText, active && styles.periodBtnTextActive]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function KPICard({
  label,
  value,
  sub,
  badge,
  badgeType,
}: {
  label: string;
  value: string;
  sub: string;
  badge?: string;
  badgeType?: "up" | "down" | "neutral";
}) {
  const badgeStyle =
    badgeType === "up"
      ? styles.badgeUp
      : badgeType === "down"
        ? styles.badgeDown
        : styles.badgeNeutral;

  const badgeTextStyle =
    badgeType === "up"
      ? styles.badgeTextUp
      : badgeType === "down"
        ? styles.badgeTextDown
        : styles.badgeTextNeutral;

  return (
    <View style={styles.kpiCard}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiSub}>{sub}</Text>
      {badge && (
        <View style={[styles.badge, badgeStyle]}>
          <Text style={[styles.badgeText, badgeTextStyle]}>{badge}</Text>
        </View>
      )}
    </View>
  );
}

function SalesChart({ data }: { data: { label: string; value: number }[] }) {
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        value: d.value,
        label: d.label,
        labelTextStyle: {
          color: Colors.textSecondary,
          fontSize: 10,
          fontFamily: FontFamily.content,
        },
        dataPointText: "",
      })),
    [data],
  );

  const maxValue = Math.max(...data.map((d) => d.value));
  const peak = data.find((d) => d.value === maxValue);

  return (
    <LineChart
      data={chartData}
      width={CHART_WIDTH - 16}
      height={120}
      // Ligne
      color="#0A0A0A"
      thickness={2}
      // Zone remplie
      areaChart
      startFillColor="rgba(10,10,10,0.08)"
      endFillColor="rgba(10,10,10,0)"
      startOpacity={1}
      endOpacity={0}
      // Points
      hideDataPoints={false}
      dataPointsColor="#0A0A0A"
      dataPointsRadius={3}
      // Axes
      xAxisColor="#F0F0F0"
      yAxisColor="transparent"
      yAxisTextStyle={{
        color: Colors.textSecondary,
        fontSize: 10,
        fontFamily: FontFamily.content,
      }}
      noOfSections={3}
      maxValue={Math.ceil(maxValue / 5000) * 5000}
      // Grille
      rulesColor="#F5F5F5"
      rulesType="solid"
      // Spacing
      spacing={CHART_WIDTH / data.length - 4}
      initialSpacing={8}
      endSpacing={8}
      // Courbe lisse
      curved
      // Pas de légende
      hideYAxisText={false}
      formatYLabel={(val) => `${Math.round(Number(val) / 1000)}FCFA`}
    />
  );
}

function TopProducts({
  products,
}: {
  products: { rank: number; nom: string; ventes: number }[];
}) {
  const maxVentes = Math.max(...products.map((p) => p.ventes));

  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Top produits</Text>
      {products.map((p, i) => (
        <View
          key={p.rank}
          style={[
            styles.productRow,
            i < products.length - 1 && styles.productRowBorder,
          ]}
        >
          <View style={styles.productRank}>
            <Text style={styles.productRankText}>{p.rank}</Text>
          </View>
          <Text style={styles.productName}>{p.nom}</Text>
          <Text style={styles.productQty}>{p.ventes} ventes</Text>
          <View style={styles.productBarWrap}>
            <View
              style={[
                styles.productBar,
                { width: `${(p.ventes / maxVentes) * 100}%` },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Écran principal ─────────────────────────

const PERIODS: { key: Period; label: string }[] = [
  { key: "7j", label: "7 jours" },
  { key: "30j", label: "30 jours" },
  { key: "mois", label: "Ce mois" },
];

export default function BilanScreen() {
  const [period, setPeriod] = useState<Period>("7j");
  const data = BILAN_DATA[period];
  const { kpi, salesChart, topProducts } = data;

  const totalChart = salesChart.reduce((sum, d) => sum + d.value, 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.periodRow}>
          <Text style={styles.periodText}>Periode :</Text>
          {PERIODS.map((p) => (
            <PeriodButton
              key={p.key}
              label={p.label}
              active={period === p.key}
              onPress={() => setPeriod(p.key)}
            />
          ))}
        </View>
        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          <KPICard
            label="Valeur du stock"
            value={formatFCFA(kpi.valeurStock)}
            sub="FCFA"
            badge="↑ 3.2%"
            badgeType="up"
          />
          <KPICard
            label="Total revenus"
            value={formatFCFA(kpi.totalRevenus)}
            sub="FCFA"
            badge="↑ 8.1%"
            badgeType="up"
          />
          <KPICard
            label="Nb. ventes"
            value={String(kpi.nombreVentes)}
            sub="transactions"
            badge="↓ 2 vs précédent"
            badgeType="down"
          />
          <KPICard
            label="Total créances"
            value={formatFCFA(kpi.totalCreances)}
            sub="FCFA"
            badge={`${kpi.nbClients} clients`}
            badgeType="neutral"
          />
        </View>

        {/* Graphe */}
        <View style={styles.sectionCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>
              Ventes — {PERIODS.find((p) => p.key === period)?.label}
            </Text>
            <Text style={styles.chartTotal}>{formatFCFA(totalChart)} FCFA</Text>
          </View>
          <SalesChart data={salesChart} />
        </View>

        {/* Top produits */}
        <TopProducts products={topProducts} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles 

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingBottom: 50,
    paddingTop: -50,
  },
  periodRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 16,
    gap: 8,
  },
  periodText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: FontFamily.bold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  periodBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 1)",
  },
  periodBtnActive: {
    backgroundColor: "#000000ff",
  },
  periodBtnText: {
    color: "rgba(0, 0, 0, 1)",
    fontSize: 13,
    fontFamily: FontFamily.content,
  },
  periodBtnTextActive: {
    color: "#ffffffff",
    fontFamily: FontFamily.medium,
  },
  scroll: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 40,
    backgroundColor: "#FFF",
  },
  kpiGrid: {
    flexDirection: "row",
    padding: 8,
    flexWrap: "wrap",
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 14,
    borderWidth: 0.5,
    borderColor: "#F0F0F0",
  },
  kpiLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: FontFamily.content,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  kpiValue: {
    fontSize: 20,
    fontFamily: FontFamily.semiBold,
    color: Colors.textPrimary,
  },
  kpiSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: FontFamily.content,
    marginTop: 2,
  },
  badge: {
    alignSelf: "flex-start",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginTop: 6,
  },
  badgeUp: {
    backgroundColor: "#EAF3DE",
  },
  badgeDown: {
    backgroundColor: "#FCEBEB",
  },
  badgeNeutral: {
    backgroundColor: "#F0F0F0",
  },
  badgeText: {
    fontSize: 10,
    fontFamily: FontFamily.medium,
  },
  badgeTextUp: { color: "#3B6D11" },
  badgeTextDown: { color: "#A32D2D" },
  badgeTextNeutral: { color: Colors.textSecondary },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    borderWidth: 0.5,
    borderColor: "#F0F0F0",
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  chartTotal: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: FontFamily.content,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  productRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#F0F0F0",
  },
  productRank: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  productRankText: {
    fontSize: 11,
    fontFamily: FontFamily.medium,
    color: Colors.textSecondary,
  },
  productName: {
    flex: 1,
    fontSize: 13,
    fontFamily: FontFamily.content,
    color: Colors.textPrimary,
  },
  productQty: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: FontFamily.content,
  },
  productBarWrap: {
    width: 50,
    height: 4,
    backgroundColor: "#F0F0F0",
    borderRadius: 2,
  },
  productBar: {
    height: 4,
    backgroundColor: "#0A0A0A",
    borderRadius: 2,
  },
});
