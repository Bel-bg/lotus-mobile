import CustomTopBar from "@/components/customs/customTopBar";
import { Colors } from "@/constants/colors";
import Loader from "@/components/ui/loader";
import { getMouvementsRecents } from "@/lib/db/mouvements";
import { initDB } from "@/lib/db/schema";
import { Mouvement } from "@/types";
import { useIsFocused } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import MoveHeader, { type MovementFilter } from "./_components/MoveHeader";
import MouvementCard from "./_components/MouvementCard";
import MoveFooter from "./_components/MoveFooter";
import MoveEmpty from "./_components/MoveEmpty";
import getSectionDateLabel, { getDateKey } from "./_utils/dateHelpers";

// Nombre de mouvements affichés en aperçu
const PREVIEW_LIMIT = 5;

export default function MoveScreen() {
  const isFocused = useIsFocused();

  const [mouvements, setMouvements] = useState<Mouvement[]>([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<MovementFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Chargement ──────────────────────────────────────────────────────────────

  const loadMouvements = useCallback(async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      await initDB();
      const data = await getMouvementsRecents(50);
      setMouvements(data);
    } catch (err) {
      console.error("Erreur chargement mouvements:", err);
      setError("Impossible de charger les mouvements pour le moment.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      loadMouvements();
    }
  }, [isFocused, loadMouvements]);

  // ─── Dérivations ─────────────────────────────────────────────────────────────

  const filteredMouvements = mouvements.filter((m) => {
    const normalizedSearch = search.trim().toLowerCase();
    const matchesFilter = activeFilter === "all" || m.type === activeFilter;
    const matchesSearch =
      normalizedSearch.length === 0 ||
      m.produitNom?.toLowerCase().includes(normalizedSearch) ||
      m.reference?.toLowerCase().includes(normalizedSearch) ||
      m.note?.toLowerCase().includes(normalizedSearch);
    return matchesFilter && matchesSearch;
  });

  const previewMouvements = filteredMouvements.slice(0, PREVIEW_LIMIT);
  const hasMore = filteredMouvements.length > PREVIEW_LIMIT;
  const extraCount = filteredMouvements.length - PREVIEW_LIMIT;

  // Stats du jour
  const todayKey = new Date().toISOString().split("T")[0];
  const mouvementsAujourdhui = mouvements.filter((m) =>
    m.createdAt?.startsWith(todayKey)
  );
  const totalEntreesJour = mouvementsAujourdhui
    .filter((m) => m.type === "entree")
    .reduce((sum, m) => sum + m.quantite, 0);
  const totalSortiesJour = mouvementsAujourdhui
    .filter((m) => m.type === "sortie")
    .reduce((sum, m) => sum + m.quantite, 0);

  // ─── Renders ─────────────────────────────────────────────────────────────────

  const renderHeader = () => (
    <MoveHeader
      search={search}
      onSearchChange={setSearch}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      totalEntreesJour={totalEntreesJour}
      totalSortiesJour={totalSortiesJour}
      filteredCount={filteredMouvements.length}
      error={error}
      onRetry={() => loadMouvements()}
    />
  );

  const renderItem = ({ item, index }: { item: Mouvement; index: number }) => {
    const previousItem = previewMouvements[index - 1];
    const currentDateKey = getDateKey(item.createdAt);
    const previousDateKey = getDateKey(previousItem?.createdAt);
    const isNewSection = currentDateKey !== previousDateKey;

    return (
      <MouvementCard
        item={item}
        showDateSection={isNewSection}
        dateSectionLabel={getSectionDateLabel(item.createdAt)}
      />
    );
  };

  const renderFooter = () => (
    <MoveFooter hasMore={hasMore} extraCount={extraCount} />
  );

  const renderEmpty = () => (
    <MoveEmpty hasData={mouvements.length > 0} />
  );

  // ─── Rendu principal ──────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <CustomTopBar type="mouvement" />

      {isLoading ? (
        <Loader message="Chargement des mouvements..." />
      ) : (
        <FlatList
          data={previewMouvements}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing} 
              onRefresh={() => loadMouvements(true)}
              tintColor={Colors.textPrimary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingBottom: 36,
  },
});
