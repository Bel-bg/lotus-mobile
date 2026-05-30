import { Colors } from "@/constants/colors";
import { FontFamily } from "@/constants/typography";
import { useRouter } from "expo-router";
import {
  Check,
  CheckCircle2,
  CircleX,
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

type FilterKey = "all" | "notSaved" | "inProgress";
type DocumentStatus = "saved" | "progress" | "failed";

interface FilterItem {
  key: FilterKey;
  label: string;
}

interface DocumentItem {
  id: string;
  title: string;
  subtitle: string;
  size: string;
  status: DocumentStatus;
}

const FILTERS: FilterItem[] = [
  { key: "all", label: "TOUT" },
  { key: "notSaved", label: "NON SAUVEGARDÉ" },
  { key: "inProgress", label: "EN COURS" },
];

const DOCUMENTS: DocumentItem[] = [
  {
    id: "1",
    title: "Bilan-17-03-2026.pdf",
    subtitle: "17 Mars 2026 • 14:32",
    size: "1.4 MB",
    status: "saved",
  },
  {
    id: "2",
    title: "Inventaire-Stock-Q1.xlsx",
    subtitle: "Il y a 2 min",
    size: "4.2 MB",
    status: "progress",
  },
  {
    id: "3",
    title: "Note-Honoraires-Marque.pdf",
    subtitle: "Hier, 18:05",
    size: "892 KB",
    status: "failed",
  },
  {
    id: "4",
    title: "Contrat-Boutique-Paris.pdf",
    subtitle: "15 Mars 2026",
    size: "09:12",
    status: "saved",
  },
  {
    id: "5",
    title: "Photos-Collection-Ete.zip",
    subtitle: "12 Mars 2026",
    size: "125.4 MB",
    status: "saved",
  },
];

const STATUS_META: Record<
  DocumentStatus,
  {
    label: string;
    tint: string;
    background: string;
    dotBackground: string;
    Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  }
> = {
  saved: {
    label: "SAUVEGARDÉ",
    tint: Colors.successText,
    background: "#F1FBF4",
    dotBackground: "#DDF4E5",
    Icon: Check,
  },
  progress: {
    label: "EN COURS",
    tint: Colors.warningText,
    background: "#FFF8EA",
    dotBackground: "#FBE3AF",
    Icon: Clock3,
  },
  failed: {
    label: "ÉCHEC",
    tint: Colors.dangerText,
    background: "#FDEEEE",
    dotBackground: "#F8D4D3",
    Icon: CircleX,
  },
};

export default function DocumentsScreen({
  showHeader = true,
}: {
  showHeader?: boolean;
}) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = React.useState<FilterKey>("all");

  const filteredDocuments = React.useMemo(() => {
    if (activeFilter === "all") {
      return DOCUMENTS;
    }

    if (activeFilter === "notSaved") {
      return DOCUMENTS.filter((item) => item.status === "failed");
    }

    return DOCUMENTS.filter((item) => item.status === "progress");
  }, [activeFilter]);

  return (
    <SafeAreaView
      style={styles.container}
      edges={showHeader ? ["top", "bottom"] : ["bottom"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
      >
        <View style={styles.filtersRow}>
          {FILTERS.map((filter) => {
            const isActive = filter.key === activeFilter;

            return (
              <TouchableOpacity
                key={filter.key}
                activeOpacity={0.85}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveFilter(filter.key)}
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

        <View style={styles.syncCard}>
          <Text style={styles.syncLabel}>DERNIÈRE SYNCHRONISATION</Text>
          <Text style={styles.syncTitle} selectable>
            Aujourd&apos;hui, 14:35
          </Text>

          <View style={styles.syncFooter}>
            <View style={styles.syncStatusRow}>
              <View style={styles.syncDot} />
              <Text style={styles.syncStatusText}>Tout est à jour</Text>
            </View>

            <View style={styles.syncArtwork}>
              <Cloud size={46} color="rgba(10, 10, 10, 0.08)" strokeWidth={2} />
              <View style={styles.syncArtworkCheck}>
                <CheckCircle2
                  size={34}
                  color="rgba(10, 10, 10, 0.08)"
                  strokeWidth={1.9}
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.documentsList}>
          {filteredDocuments.map((item) => {
            const meta = STATUS_META[item.status];
            const StatusIcon = meta.Icon;

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.88}
                style={styles.documentCard}
              >
                <View style={styles.documentIconBox}>
                  <FileText size={18} color={Colors.textPrimary} strokeWidth={2} />
                </View>

                <View style={styles.documentBody}>
                  <Text style={styles.documentTitle} numberOfLines={2} selectable>
                    {item.title}
                  </Text>
                  <Text style={styles.documentMeta} selectable>
                    {item.subtitle} • {item.size}
                  </Text>
                </View>

                <View style={[styles.statusPill, { backgroundColor: meta.background }]}>
                  <View
                    style={[
                      styles.statusIconWrap,
                      { backgroundColor: meta.dotBackground },
                    ]}
                  >
                    <StatusIcon size={11} color={meta.tint} strokeWidth={2.3} />
                  </View>
                  <Text style={[styles.statusText, { color: meta.tint }]}>
                    {meta.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.archiveButton}
          onPress={() => router.push("/historique-bilans")}
        >
          <Text style={styles.archiveButtonText}>Afficher les archives de 2025</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 28,
    gap: 14,
  },
  filtersRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    minHeight: 31,
    paddingHorizontal: 12,
    borderRadius: 9,
    backgroundColor: "#EBE8E1",
    alignItems: "center",
    justifyContent: "center",
  },
  filterChipActive: {
    backgroundColor: Colors.textPrimary,
  },
  filterChipText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 9,
    letterSpacing: 0.55,
    color: "#7C7870",
  },
  filterChipTextActive: {
    color: Colors.textInverse,
  },
  syncCard: {
    backgroundColor: "#FDFCF9",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    boxShadow: "0 10px 24px rgba(30, 24, 15, 0.04)",
    gap: 6,
  },
  syncLabel: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 8,
    letterSpacing: 0.9,
    color: "#7D776E",
  },
  syncTitle: {
    fontFamily: FontFamily.display,
    fontSize: 18,
    lineHeight: 22,
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  syncFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  syncStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: Colors.success,
  },
  syncStatusText: {
    fontFamily: FontFamily.content,
    fontSize: 10,
    color: "#6F6B64",
  },
  syncArtwork: {
    width: 54,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  syncArtworkCheck: {
    position: "absolute",
    right: 3,
    bottom: -1,
  },
  documentsList: {
    gap: 10,
  },
  documentCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FBFAF7",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 11,
  },
  documentIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#F2F0EA",
    alignItems: "center",
    justifyContent: "center",
  },
  documentBody: {
    flex: 1,
    gap: 2,
  },
  documentTitle: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 11.5,
    lineHeight: 14,
    color: Colors.textPrimary,
    letterSpacing: -0.15,
  },
  documentMeta: {
    fontFamily: FontFamily.content,
    fontSize: 9.5,
    lineHeight: 12,
    color: "#7B766E",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    paddingLeft: 5,
    paddingRight: 7,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  statusIconWrap: {
    width: 14,
    height: 14,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 8,
    letterSpacing: 0.4,
  },
  archiveButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    paddingBottom: 4,
  },
  archiveButtonText: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 11.5,
    color: Colors.textPrimary,
    textDecorationLine: "underline",
    textDecorationColor: Colors.textPrimary,
  },
});
