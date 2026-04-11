import { Colors } from "@/constants/colors";
import { FontFamily } from "@/constants/typography";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "expo-router";
import {
  Archive,
  ArrowLeft,
  BarChart3,
  Check,
  ChevronRight,
  Clock3,
  Cloud,
  FileText,
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

interface SummaryItem {
  label: string;
  value: string;
  helper: string;
  tone: "info" | "success" | "default";
}

const SUMMARY_DATA: SummaryItem[] = [
  {
    label: "Bilans",
    value: "28",
    helper: "ce mois-ci",
    tone: "info",
  },
  {
    label: "CA moyen",
    value: "118 000",
    helper: "FCFA / jour",
    tone: "success",
  },
  {
    label: "Bénéfice",
    value: "41 000",
    helper: "moyenne journalière",
    tone: "success",
  },
  {
    label: "Synchro",
    value: "100%",
    helper: "Drive disponible",
    tone: "default",
  },
];

type BilanStatus = "ready" | "synced" | "archived";

interface BilanItem {
  id: string;
  date: string;
  salesCount: number;
  profit: string;
  status: BilanStatus;
  timestamp?: string;
}

const RECENT_BILANS: BilanItem[] = [
  {
    id: "1",
    date: "05 avril 2026",
    salesCount: 14,
    profit: "77 000 FCFA",
    status: "ready",
  },
  {
    id: "2",
    date: "04 avril 2026",
    salesCount: 11,
    profit: "63 500 FCFA",
    status: "synced",
  },
  {
    id: "3",
    date: "03 avril 2026",
    salesCount: 9,
    profit: "20:43",
    status: "archived",
  },
];

const STATUS_META: Record<
  BilanStatus,
  {
    label: string;
    tint: string;
    background: string;
    dotBackground: string;
    Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  }
> = {
  ready: {
    label: "PDF PRÊT",
    tint: Colors.successText,
    background: "#F1FBF4",
    dotBackground: "#DDF4E5",
    Icon: Check,
  },
  synced: {
    label: "DRIVE",
    tint: Colors.infoText,
    background: "#F0F7FE",
    dotBackground: "#D9EBFE",
    Icon: Cloud,
  },
  archived: {
    label: "ARCHIVÉ",
    tint: Colors.textSecondary,
    background: "#F2F2F0",
    dotBackground: "#E0E0DE",
    Icon: Archive,
  },
};

export default function HistoriqueBilansScreen() {
  const router = useRouter();
  const boutiqueNom = useAuthStore(
    (state) => state.boutique?.nom ?? "Boutique Lotus",
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
          activeOpacity={0.75}
        >
          <ArrowLeft size={20} color={Colors.textPrimary} strokeWidth={2.4} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} selectable>
            Historique des bilans
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.replace("/documents")}
          style={styles.iconButton}
          activeOpacity={0.75}
        >
          <BarChart3 size={18} color={Colors.textPrimary} strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
      >
        <View style={styles.metricsGrid}>
          {SUMMARY_DATA.map((item, index) => (
            <View key={index} style={styles.metricCard}>
              <Text style={styles.metricLabel}>{item.label}</Text>
              <Text
                style={[
                  styles.metricValue,
                  item.tone === "success" && { color: Colors.successText },
                  item.tone === "info" && { color: Colors.infoText },
                ]}
                selectable
              >
                {item.value}
              </Text>
              <Text style={styles.metricHelper}>{item.helper}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionDot} />
          <Text style={styles.sectionTitle} selectable>
            Clôtures récentes
          </Text>
        </View>

        <View style={styles.list}>
          {RECENT_BILANS.map((bilan) => {
            const meta = STATUS_META[bilan.status];
            const StatusIcon = meta.Icon;

            return (
              <TouchableOpacity
                key={bilan.id}
                style={styles.bilanCard}
                onPress={() => router.replace("/documents")}
                activeOpacity={0.82}
              >
                <View style={[styles.iconBox, { backgroundColor: meta.background }]}>
                  <FileText size={22} color={meta.tint} strokeWidth={2.2} />
                </View>

                <View style={styles.bilanBody}>
                  <Text style={styles.bilanTitle} selectable>
                    Bilan du {bilan.date}
                  </Text>
                  <Text style={styles.bilanSubtitle} selectable>
                    {bilan.salesCount} ventes • bénéfice: {bilan.profit}
                  </Text>
                </View>

                <View style={[styles.statusPill, { backgroundColor: meta.background }]}>
                  <View
                    style={[
                      styles.statusIconWrap,
                      { backgroundColor: meta.dotBackground },
                    ]}
                  >
                    <StatusIcon size={10} color={meta.tint} strokeWidth={2.5} />
                  </View>
                  <Text style={[styles.statusText, { color: meta.tint }]}>
                    {meta.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.footerNote} selectable>
          Les bilans archivés servent de point d'entrée vers les exports PDF et les
          synchronisations Drive.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.footerButton, styles.footerPrimary]}
          onPress={() => router.replace("/bilan")}
          activeOpacity={0.85}
        >
          <Text style={styles.footerButtonText}>OUVRIR LE BILAN DU JOUR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.footerButton, styles.footerSecondary]}
          onPress={() => router.replace("/documents")}
          activeOpacity={0.82}
        >
          <Text style={styles.footerSecondaryText}>VOIR LES PDF</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBFBFA",
  },
  header: {
    paddingTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    paddingHorizontal: 16,
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
    fontFamily: FontFamily.displaySemi,
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
    letterSpacing: -0.3,
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
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 160,
    gap: 20,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#F3F2F0",
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  metricLabel: {
    fontFamily: FontFamily.utility,
    fontSize: 10,
    color: Colors.textSecondary,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  metricValue: {
    fontFamily: FontFamily.display,
    fontSize: 18,
    color: Colors.textPrimary,
    marginTop: 4,
  },
  metricHelper: {
    fontFamily: FontFamily.content,
    fontSize: 11,
    color: Colors.textTertiary,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#CFCFCF",
  },
  sectionTitle: {
    fontFamily: FontFamily.display,
    fontSize: 16,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  list: {
    gap: 12,
  },
  bilanCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.background,
    borderRadius: 18,
    padding: 12,
    boxShadow: "0 12px 28px rgba(15, 23, 42, 0.05)",
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  bilanBody: {
    flex: 1,
    gap: 3,
  },
  bilanTitle: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 14,
    color: Colors.textPrimary,
    letterSpacing: -0.1,
  },
  bilanSubtitle: {
    fontFamily: FontFamily.content,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    paddingLeft: 5,
    paddingRight: 8,
    paddingVertical: 5,
  },
  statusIconWrap: {
    width: 16,
    height: 16,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 9,
    letterSpacing: 0.4,
  },
  footerNote: {
    fontFamily: FontFamily.content,
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: "#FBFBFA",
    borderTopWidth: 1,
    borderTopColor: "#F0F0EE",
    gap: 10,
  },
  footerButton: {
    minHeight: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  footerPrimary: {
    backgroundColor: Colors.textPrimary,
  },
  footerSecondary: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  footerButtonText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 12,
    color: Colors.textInverse,
    letterSpacing: 0.8,
  },
  footerSecondaryText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 12,
    color: Colors.textPrimary,
    letterSpacing: 0.8,
  },
});
