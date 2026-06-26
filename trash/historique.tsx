// ============================================
// LOTUS BUSINESS — Écran Historique complet
// Ventes (entrées caisse) + Stock (entrées stock)
// Pagination : 20 éléments par page
// ============================================

import { EntreeBanniere } from "@/app/(drawer)/screens/historique/entree";
import MouvementCard from "@/app/(drawer)/(tabs)/move/_components/MouvementCard";
import { Colors } from "@/constants/colors";
import { FontFamily } from "@/constants/typography";
import { getAllVentes } from "@/lib/db/ventes";
import { getMouvementsRecents } from "@/lib/db/mouvements";
import { initDB } from "@/lib/db/schema";
import { Mouvement, Vente } from "@/types";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Package,
  ShoppingBag,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "ventes" | "stock";

const PAGE_SIZE = 20;

// ─── Composant principal ──────────────────────────────────────────────────────

export default function HistoriqueScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("ventes");

  // Ventes
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [ventePage, setVentePage] = useState(0);

  // Entrées stock (mouvements de type "entree")
  const [entrees, setEntrees] = useState<Mouvement[]>([]);
  const [entreePage, setEntreePage] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Chargement des données ───────────────────────────────────────────────

  const loadData = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      await initDB();
      const [allVentes, allMouvements] = await Promise.all([
        getAllVentes(),
        getMouvementsRecents(500),
      ]);
      setVentes(allVentes);
      setEntrees(allMouvements.filter((m) => m.type === "entree"));
      setError(null);
    } catch (err) {
      console.error("Erreur chargement historique:", err);
      setError("Impossible de charger l'historique pour le moment.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset pagination quand on change d'onglet
  useEffect(() => {
    setVentePage(0);
    setEntreePage(0);
  }, [activeTab]);

  // ─── Pagination ───────────────────────────────────────────────────────────

  const ventesTotales = ventes.length;
  const ventesPagesTotal = Math.max(1, Math.ceil(ventesTotales / PAGE_SIZE));
  const ventesPage = ventes.slice(
    ventePage * PAGE_SIZE,
    (ventePage + 1) * PAGE_SIZE
  );

  const entreesTotales = entrees.length;
  const entreesPagesTotal = Math.max(1, Math.ceil(entreesTotales / PAGE_SIZE));
  const entreesPage = entrees.slice(
    entreePage * PAGE_SIZE,
    (entreePage + 1) * PAGE_SIZE
  );

  // ─── Renders ──────────────────────────────────────────────────────────────

  const renderVenteItem = ({ item }: { item: Vente }) => (
    <EntreeBanniere vente={item} />
  );

  const renderEntreeItem = ({ item }: { item: Mouvement }) => (
    <MouvementCard item={item} showDateSection={false} dateSectionLabel="" />
  );

  const renderEmpty = (tab: Tab) => (
    <View style={styles.emptyState}>
      {tab === "ventes" ? (
        <ShoppingBag size={42} color={Colors.borderStrong} strokeWidth={1.6} />
      ) : (
        <Package size={42} color={Colors.borderStrong} strokeWidth={1.6} />
      )}
      <Text style={styles.emptyTitle}>
        {tab === "ventes" ? "Aucune vente enregistrée" : "Aucune entrée de stock"}
      </Text>
      <Text style={styles.emptyText}>
        {tab === "ventes"
          ? "Les ventes effectuées apparaîtront ici."
          : "Les réapprovisionnements et ajouts de stock apparaîtront ici."}
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.listHeader}>
      {/* Métriques rapides */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{ventesTotales}</Text>
          <Text style={styles.metricLabel}>Ventes totales</Text>
        </View>
        <View style={[styles.metricCard, styles.metricCardAlt]}>
          <Text style={styles.metricValue}>{entreesTotales}</Text>
          <Text style={styles.metricLabel}>Entrées stock</Text>
        </View>
      </View>

      {/* Titre section */}
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>
          {activeTab === "ventes" ? "Toutes les ventes" : "Toutes les entrées"}
        </Text>
        <Text style={styles.sectionCount}>
          {activeTab === "ventes" ? ventesTotales : entreesTotales} élément
          {(activeTab === "ventes" ? ventesTotales : entreesTotales) > 1 ? "s" : ""}
        </Text>
      </View>

      {error ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => loadData()}
          style={styles.errorCard}
        >
          <Text style={styles.errorTitle}>Chargement indisponible</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorAction}>Toucher pour réessayer</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  const renderPagination = (
    page: number,
    pagesTotal: number,
    setPage: (p: number) => void
  ) => (
    <View style={styles.pagination}>
      <TouchableOpacity
        style={[styles.pageBtn, page === 0 && styles.pageBtnDisabled]}
        onPress={() => setPage(Math.max(0, page - 1))}
        disabled={page === 0}
        activeOpacity={0.8}
      >
        <ChevronLeft
          size={18}
          color={page === 0 ? Colors.textTertiary : Colors.textPrimary}
          strokeWidth={2.4}
        />
      </TouchableOpacity>

      <View style={styles.pageInfo}>
        <Text style={styles.pageInfoText}>
          Page <Text style={styles.pageInfoBold}>{page + 1}</Text> sur{" "}
          <Text style={styles.pageInfoBold}>{pagesTotal}</Text>
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.pageBtn, page >= pagesTotal - 1 && styles.pageBtnDisabled]}
        onPress={() => setPage(Math.min(pagesTotal - 1, page + 1))}
        disabled={page >= pagesTotal - 1}
        activeOpacity={0.8}
      >
        <ChevronRight
          size={18}
          color={page >= pagesTotal - 1 ? Colors.textTertiary : Colors.textPrimary}
          strokeWidth={2.4}
        />
      </TouchableOpacity>
    </View>
  );

  // ─── Rendu ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <ArrowLeft size={20} color={Colors.textPrimary} strokeWidth={2.4} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Historique</Text>
        </View>

      </View>

      {/* Onglets */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabChip, activeTab === "ventes" && styles.tabChipActive]}
          onPress={() => setActiveTab("ventes")}
          activeOpacity={0.8}
        >
          <ShoppingBag
            size={15}
            color={activeTab === "ventes" ? Colors.textInverse : Colors.textSecondary}
            strokeWidth={2.2}
          />
          <Text
            style={[
              styles.tabChipText,
              activeTab === "ventes" && styles.tabChipTextActive,
            ]}
          >
            Ventes
          </Text>
          {ventesTotales > 0 ? (
            <View
              style={[
                styles.tabBadge,
                activeTab === "ventes" && styles.tabBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.tabBadgeText,
                  activeTab === "ventes" && styles.tabBadgeTextActive,
                ]}
              >
                {ventesTotales}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabChip, activeTab === "stock" && styles.tabChipActive]}
          onPress={() => setActiveTab("stock")}
          activeOpacity={0.8}
        >
          <Package
            size={15}
            color={activeTab === "stock" ? Colors.textInverse : Colors.textSecondary}
            strokeWidth={2.2}
          />
          <Text
            style={[
              styles.tabChipText,
              activeTab === "stock" && styles.tabChipTextActive,
            ]}
          >
            Entrées stock
          </Text>
          {entreesTotales > 0 ? (
            <View
              style={[
                styles.tabBadge,
                activeTab === "stock" && styles.tabBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.tabBadgeText,
                  activeTab === "stock" && styles.tabBadgeTextActive,
                ]}
              >
                {entreesTotales}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      {/* Contenu */}
      {isLoading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={Colors.textPrimary} />
          <Text style={styles.loaderText}>Chargement de l&apos;historique...</Text>
        </View>
      ) : activeTab === "ventes" ? (
        <>
          <FlatList
            data={ventesPage}
            keyExtractor={(item) => item.id}
            renderItem={renderVenteItem}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmpty("ventes")}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => loadData(true)}
                tintColor={Colors.textPrimary}
              />
            }
          />
          {ventesTotales > PAGE_SIZE
            ? renderPagination(ventePage, ventesPagesTotal, setVentePage)
            : null}
        </>
      ) : (
        <>
          <FlatList
            data={entreesPage}
            keyExtractor={(item) => item.id}
            renderItem={renderEntreeItem}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmpty("stock")}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => loadData(true)}
                tintColor={Colors.textPrimary}
              />
            }
          />
          {entreesTotales > PAGE_SIZE
            ? renderPagination(entreePage, entreesPagesTotal, setEntreePage)
            : null}
        </>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontFamily: FontFamily.display,
    fontSize: 17,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },

  // Onglets
  tabRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  tabChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#F2F2F2",
  },
  tabChipActive: {
    backgroundColor: Colors.textPrimary,
  },
  tabChipText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  tabChipTextActive: {
    color: Colors.textInverse,
  },
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 999,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  tabBadgeActive: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  tabBadgeText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  tabBadgeTextActive: {
    color: Colors.textInverse,
  },

  // Loader
  loaderWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loaderText: {
    fontFamily: FontFamily.content,
    fontSize: 14,
    color: Colors.textSecondary,
  },

  // Liste
  listContent: {
    paddingBottom: 24,
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 14,
  },

  // Métriques
  metricsRow: {
    flexDirection: "row",
    gap: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ECECEC",
    gap: 4,
  },
  metricCardAlt: {
    backgroundColor: Colors.infoLight,
    borderColor: Colors.infoBorder,
  },
  metricValue: {
    fontFamily: FontFamily.display,
    fontSize: 24,
    color: Colors.textPrimary,
  },
  metricLabel: {
    fontFamily: FontFamily.utility,
    fontSize: 12,
    color: Colors.textSecondary,
  },

  // Section
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 17,
    color: Colors.textPrimary,
  },
  sectionCount: {
    fontFamily: FontFamily.utility,
    fontSize: 12,
    color: Colors.textSecondary,
  },

  // Erreur
  errorCard: {
    backgroundColor: Colors.warningLight,
    borderColor: Colors.warningBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
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

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 48,
    gap: 10,
  },
  emptyTitle: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  emptyText: {
    fontFamily: FontFamily.content,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },

  // Pagination
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    backgroundColor: Colors.background,
  },
  pageBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#ECECEC",
    alignItems: "center",
    justifyContent: "center",
  },
  pageBtnDisabled: {
    opacity: 0.4,
  },
  pageInfo: {
    flex: 1,
    alignItems: "center",
  },
  pageInfoText: {
    fontFamily: FontFamily.utility,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  pageInfoBold: {
    fontFamily: FontFamily.utilityBold,
    color: Colors.textPrimary,
  },
});
