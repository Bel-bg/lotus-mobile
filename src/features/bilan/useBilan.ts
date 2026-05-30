import { useIsFocused } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";

import {
  getBilanData,
  getShortcutRange,
  normalizeDateRange,
} from "./bilan.service";
import type { BilanData, BilanDateRange } from "@/types/bilan";

const EMPTY_DATA: BilanData = {
  boutique: null,
  range: getShortcutRange("today"),
  entrees: [],
  sorties: [],
  summary: {
    totalEntrees: 0,
    totalSorties: 0,
    valeurStockEntre: 0,
    chiffreAffaires: 0,
    margeBrute: 0,
    mouvementCount: 0,
  },
};

export function useBilan(dateRange: BilanDateRange) {
  const isFocused = useIsFocused();
  const [data, setData] = useState<BilanData>({
    ...EMPTY_DATA,
    range: normalizeDateRange(dateRange),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBilan = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const nextData = await getBilanData(dateRange);
        setData(nextData);
      } catch (loadError) {
        console.error("Erreur chargement bilan:", loadError);
        setError("Impossible de charger le bilan pour cette période.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [dateRange]
  );

  useEffect(() => {
    if (isFocused) {
      void loadBilan();
    }
  }, [isFocused, loadBilan]);

  return {
    data,
    error,
    isLoading,
    isRefreshing,
    hasMovements: data.summary.mouvementCount > 0,
    hasEntrees: data.entrees.length > 0,
    hasSorties: data.sorties.length > 0,
    reload: loadBilan,
  };
}
