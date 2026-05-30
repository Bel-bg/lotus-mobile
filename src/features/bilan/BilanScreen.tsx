import CustomTopBar from "@/components/customs/customTopBar";
import PrimaryButton from "@/components/PrimaryButton";
import Loader from "@/components/ui/loader";
import { Colors } from "@/constants/colors";
import { Layout } from "@/constants/layout";
import { FontFamily, FontSize } from "@/constants/typography";
import { formatMontant, formatNombre } from "@/lib/utils/formatters";
import type { BilanDateRange } from "@/types/bilan";
import Animated, { FadeInDown } from "react-native-reanimated";
import React, { useMemo, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  buildBilanPdfHtml,
  getCompactDateRangeLabel,
  getDateRangeLabel,
  getShortcutRange,
  persistBilanPdfUri,
} from "./bilan.service";
import DateRangePicker from "./components/DateRangePicker";
import InventaireTable from "./components/InventaireTable";
import SummaryCard from "./components/SummaryCard";
import { useBilan } from "./useBilan";

export default function BilanScreen() {
  const insets = useSafeAreaInsets();
  const tabBarOffset = Layout.tabBarHeight + Layout.tabBarPaddingBottom + 16;
  const footerPaddingBottom = 18;
  const footerReservedSpace = tabBarOffset + Layout.buttonHeight + 56;
  const [dateRange, setDateRange] = useState<BilanDateRange>(() =>
    getShortcutRange("today"),
  );
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [showAllSorties, setShowAllSorties] = useState(false);
  const [showAllEntrees, setShowAllEntrees] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const {
    data,
    error,
    hasEntrees,
    hasMovements,
    isLoading,
    isRefreshing,
    reload,
  } = useBilan(dateRange);

  const headerDateLabel = useMemo(
    () => getDateRangeLabel(data.range),
    [data.range],
  );
  const topBarDateLabel = useMemo(
    () => getCompactDateRangeLabel(data.range),
    [data.range],
  );
  const hasExportableData =
    data.sorties.length > 0 || data.entrees.length > 0 || hasMovements;

  const handleRangeChange = (nextRange: BilanDateRange) => {
    setDateRange(nextRange);
    setShowAllSorties(false);
    setShowAllEntrees(false);
  };

  const handleExportPdf = async () => {
    if (!hasMovements) {
      return;
    }

    try {
      setIsExporting(true);
      const Print = await import("expo-print");
      const html = buildBilanPdfHtml(data);
      const result = await Print.printToFileAsync({ html });

      await persistBilanPdfUri(data.range, result.uri);

      Alert.alert(
        "PDF généré",
        "Le bilan a bien été exporté en PDF pour cette période.",
      );
    } catch (exportError) {
      console.error("Erreur export bilan PDF:", exportError);
      Alert.alert(
        "Export impossible",
        "Le PDF n'a pas pu être généré pour le moment.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintBilan = async () => {
    if (!hasMovements) {
      return;
    }

    try {
      setIsPrinting(true);
      const Print = await import("expo-print");
      const html = buildBilanPdfHtml(data);
      await Print.printAsync({ html });
    } catch (printError) {
      console.error("Erreur impression bilan:", printError);
      Alert.alert(
        "Impression impossible",
        "L'ouverture de la boîte d'impression a échoué.",
      );
    } finally {
      setIsPrinting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <CustomTopBar
          type="bilan"
          date={topBarDateLabel}
          onPressCalendar={() => setIsDatePickerVisible(true)}
        />
        <Loader message="Chargement du bilan..." />
        <DateRangePicker
          visible={isDatePickerVisible}
          value={dateRange}
          onClose={() => setIsDatePickerVisible(false)}
          onChange={handleRangeChange}
        />
      </View>
    );
  }

  const summaryCards = [
    {
      label: "Valeur stock entré",
      value: formatMontant(data.summary.valeurStockEntre),
      helper: `${formatNombre(data.summary.totalEntrees)} unités entrées`,
      tone: "default" as const,
    },
    {
      label: "Chiffre d'affaires",
      value: formatMontant(data.summary.chiffreAffaires),
      helper: `${formatNombre(data.summary.totalSorties)} unités vendues`,
      tone: "default" as const,
    },
    {
      label: "Marge brute",
      value: formatMontant(data.summary.margeBrute),
      helper: "CA - valeur des entrées",
      tone:
        data.summary.margeBrute >= 0
          ? ("positive" as const)
          : ("negative" as const),
    },
  ];

  return (
    <View style={styles.screen}>
      <CustomTopBar
        type="bilan"
        date={topBarDateLabel}
        onPressCalendar={() => setIsDatePickerVisible(true)}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: footerReservedSpace + insets.bottom },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => reload(true)}
            tintColor={Colors.textPrimary}
          />
        }
      >
        <Animated.View
          entering={FadeInDown.duration(250)}
          style={styles.introBlock}
        >
          <Text style={styles.introTitle} selectable>
            Bilan du {headerDateLabel}
          </Text>
          <Text style={styles.introBody} selectable>
            Suivez vos ventes, vos entrées et la marge brute sur la période
            choisie.
          </Text>
        </Animated.View>

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle} selectable>
              Chargement incomplet
            </Text>
            <Text style={styles.errorBody} selectable>
              {error}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => reload()}
              activeOpacity={0.82}
            >
              <Text style={styles.retryLabel} selectable>
                Réessayer
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {hasMovements ? (
          <Animated.View
            entering={FadeInDown.duration(250).delay(40)}
            style={styles.summaryGrid}
          >
            {summaryCards.map((card, index) => (
              <SummaryCard
                key={card.label}
                label={card.label}
                value={card.value}
                helper={card.helper}
                tone={card.tone}
                fullWidth={index === 2}
              />
            ))}
          </Animated.View>
        ) : null}

        <Animated.View
          entering={FadeInDown.duration(250).delay(80)}
          style={styles.sectionWrap}
        >
          <InventaireTable
            title="Inventaire sorties"
            rows={data.sorties}
            emptyMessage="Aucune vente enregistrée sur cette période."
            expanded={showAllSorties}
            onToggleExpanded={() => setShowAllSorties((current) => !current)}
          />
        </Animated.View>

        {hasEntrees ? (
          <Animated.View
            entering={FadeInDown.duration(250).delay(120)}
            style={styles.sectionWrap}
          >
            <InventaireTable
              title="Inventaire entrées"
              rows={data.entrees}
              expanded={showAllEntrees}
              onToggleExpanded={() => setShowAllEntrees((current) => !current)}
              hideWhenEmpty
            />
            <Text style={styles.entryNote} selectable>
              Les entrées sont valorisées avec le prix unitaire actuellement
              porté par le produit, faute de prix d&apos;achat historisé dans
              SQLite.
            </Text>
          </Animated.View>
        ) : null}

        {!hasMovements ? (
          <Animated.View
            entering={FadeInDown.duration(250).delay(100)}
            style={styles.emptyCard}
          >
            <Text style={styles.emptyTitle} selectable>
              Aucun mouvement sur cette période
            </Text>
            <Text style={styles.emptyBody} selectable>
              Les cartes de synthèse et l&apos;export PDF restent désactivés tant
              qu&apos;aucune vente ou entrée n&apos;existe sur la période choisie.
            </Text>
          </Animated.View>
        ) : null}
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            bottom: tabBarOffset + insets.bottom,
            paddingBottom: footerPaddingBottom,
          },
        ]}
      >
        <PrimaryButton
          label={
            hasExportableData
              ? isExporting
                ? "GÉNÉRATION EN COURS..."
                : "GÉNÉRER LE BILAN PDF"
              : "GÉNÉRER LE BILAN PDF"
          }
          onPress={() => void handleExportPdf()}
          disabled={!hasExportableData || isExporting || isPrinting}
        />

        {hasExportableData ? (
          <TouchableOpacity
            style={styles.printButton}
            onPress={() => void handlePrintBilan()}
            activeOpacity={0.82}
            disabled={isExporting || isPrinting}
          >
            <Text style={styles.printButtonLabel} selectable>
              {isPrinting ? "Ouverture..." : "Imprimer le bilan"}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.footerHint} selectable>
            Sélectionnez une période avec au moins une vente ou une entrée pour
            activer l&apos;export.
          </Text>
        )}
      </View>

      <DateRangePicker
        visible={isDatePickerVisible}
        value={dateRange}
        onClose={() => setIsDatePickerVisible(false)}
        onChange={handleRangeChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 30,
  },
  content: {
    paddingHorizontal: 10,
    paddingTop: 8,
    gap: 18,
  },
  introBlock: {
    gap: 6,
    paddingTop: 4,
    paddingHorizontal: 2,
  },
  introTitle: {
    fontFamily: FontFamily.displaySemi,
    fontSize: FontSize["3xl"],
    color: Colors.textPrimary,
    lineHeight: 26,
  },
  introBody: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.base,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  errorCard: {
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.dangerBorder,
    backgroundColor: Colors.dangerLight,
    gap: 10,
  },
  errorTitle: {
    fontFamily: FontFamily.displaySemi,
    fontSize: FontSize.xl,
    color: Colors.dangerText,
  },
  errorBody: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.base,
    color: Colors.dangerText,
    lineHeight: 21,
  },
  retryButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.dangerBorder,
  },
  retryLabel: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.sm,
    color: Colors.dangerText,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  sectionWrap: {
    gap: 10,
  },
  entryNote: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    paddingHorizontal: 6,
  },
  emptyCard: {
    padding: 22,
    borderRadius: 28,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  emptyTitle: {
    fontFamily: FontFamily.displaySemi,
    fontSize: FontSize["2xl"],
    color: Colors.textPrimary,
  },
  emptyBody: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.base,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    marginHorizontal: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 10,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.98)",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  printButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingBottom: 12,
  },
  printButtonLabel: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    textDecorationLine: "underline",
  },
  footerHint: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
