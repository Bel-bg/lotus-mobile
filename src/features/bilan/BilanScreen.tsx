import ChargeFormSheet, {
  type ChargeFormSheetRef,
} from "@/components/charges/ChargeFormSheet";
import ChargesSummaryBlock from "@/components/charges/ChargesSummaryBlock";
import CustomTopBar from "@/components/customs/customTopBar";
import PrimaryButton from "@/components/PrimaryButton";
import Loader from "@/components/ui/loader";
import { Colors } from "@/constants/colors";
import { Layout } from "@/constants/layout";
import { FontFamily, FontSize } from "@/constants/typography";
import { formatMontant, formatNombre } from "@/lib/utils/formatters";
import type { BilanDateRange } from "@/types/bilan";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
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
import DateRangePicker, {
  DateRangePickerRef,
} from "./components/DateRangePicker";
import InventaireTable from "./components/InventaireTable";
import SummaryCard from "./components/SummaryCard";
import { useBilan } from "./useBilan";
import FullAdCarousel from "@/components/ads/fullAds";
import { useUiStore } from "@/contexts/useUiStore";

export default function BilanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarOffset = Layout.tabBarHeight + Layout.tabBarPaddingBottom + 16;
  const footerReservedSpace = tabBarOffset + Layout.buttonHeight + 56;
  const [dateRange, setDateRange] = useState<BilanDateRange>(() =>
    getShortcutRange("today"),
  );
  // const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [showAllSorties, setShowAllSorties] = useState(false);
  const [showAllEntrees, setShowAllEntrees] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const datePickerRef = useRef<DateRangePickerRef>(null);
  const chargeFormRef = useRef<ChargeFormSheetRef>(null);
  const [showCarousel, setShowCarousel] = useState(true);
  const [isAdCompleted, setIsAdCompleted] = useState(false);
  const setAdOverlayActive = useUiStore((state) => state.setAdOverlayActive);
  const {
    data,
    error,
    hasEntrees,
    hasMovements,
    isLoading,
    isRefreshing,
    reload,
  } = useBilan(dateRange);
  const handleAdFinish = () => {
    setIsAdCompleted(true);
    setShowCarousel(false);
    console.log("Carousel ad terminé !");
  };

  useEffect(() => {
    setAdOverlayActive(showCarousel);
    return () => setAdOverlayActive(false);
  }, [showCarousel, setAdOverlayActive]);

  const handleRedirect = () => {
    console.log(" Redirection vers la page premium !");
    router.push("/premium");
  };
const adImages = [
  { uri: 'https://i.pinimg.com/1200x/ba/c4/96/bac4969c7ff1026d609b4556c7784c06.jpg' },
  { uri: 'https://i.pinimg.com/1200x/68/f2/da/68f2da1b15939683c9b8d4781829d3a6.jpg' },
  { uri: 'https://i.pinimg.com/736x/ba/0b/13/ba0b133fcc329015d1e7b271eb4dd443.jpg' },
  { uri: 'https://i.pinimg.com/1200x/06/dc/75/06dc75f010cc6fcd730fb689ee1a69a4.jpg' },
];

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
          onPressCalendar={() => datePickerRef.current?.open()}
        />
        <Loader message="Chargement du bilan..." />
        <DateRangePicker
          ref={datePickerRef}
          value={dateRange}
          onChange={handleRangeChange}
        />
        <ChargeFormSheet ref={chargeFormRef} onSuccess={() => reload(true)} />
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
    {
      label: "Bénéfice net",
      value: formatMontant(data.summary.beneficeNet),
      helper: "Après charges annexes",
      tone:
        data.summary.beneficeNet >= 0
          ? ("positive" as const)
          : ("negative" as const),
    },
  ];

  return (
    <View style={styles.screen}>
      <>
        <CustomTopBar
          type="bilan"
          date={topBarDateLabel}
          onPressCalendar={() => datePickerRef.current?.open()}
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
              Ventes du {headerDateLabel}
            </Text>
            <Text style={styles.introBody} selectable>
              Récapitulatif de vos ventes, vos entrées et la marge brute sur la
              période choisie.
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
              {summaryCards.map((card) => (
                <SummaryCard
                  key={card.label}
                  label={card.label}
                  value={card.value}
                  helper={card.helper}
                  tone={card.tone}
                />
              ))}
            </Animated.View>
          ) : null}

          <Animated.View
            entering={FadeInDown.duration(250).delay(30)}
            style={styles.chargeActions}
          >
            <TouchableOpacity
              style={styles.addChargeButton}
              onPress={() => chargeFormRef.current?.open()}
              activeOpacity={0.82}
            >
              <Text style={styles.addChargeLabel} selectable>
                Ajouter
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.historyChargeButton}
              onPress={() =>
                router.replace("/(drawer)/screens/Charges/history")
              }
              activeOpacity={0.82}
            >
              <Text style={styles.addChargeLabel} selectable>
                Historique
              </Text>
            </TouchableOpacity>
          </Animated.View>
          {data.summary.totalCharges > 0 ? (
            <Animated.View entering={FadeInDown.duration(250).delay(60)}>
              <ChargesSummaryBlock
                total={data.summary.totalCharges}
                parCategorie={data.summary.chargesParCategorie}
              />
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
                onToggleExpanded={() =>
                  setShowAllEntrees((current) => !current)
                }
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
                Les cartes de synthèse et l&apos;export PDF restent désactivés
                tant qu&apos;aucune vente ou entrée n&apos;existe sur la période
                choisie.
              </Text>
            </Animated.View>
          ) : null}

          <View>
            {hasExportableData ? (
              <PrimaryButton
                label={isPrinting ? "Ouverture..." : "Imprimer le bilan"}
                onPress={() => void handlePrintBilan()}
                disabled={isExporting || isPrinting}
              />
            ) : (
              <Text style={styles.footerHint} selectable>
                Sélectionnez une période avec au moins une vente ou une entrée
                pour activer l&apos;export.
              </Text>
            )}
          </View>
        </ScrollView>

        <DateRangePicker
          ref={datePickerRef}
          value={dateRange}
          onChange={handleRangeChange}
        />
        <ChargeFormSheet ref={chargeFormRef} onSuccess={() => reload(true)} />
        {showCarousel && (
          <FullAdCarousel
            onFinish={handleAdFinish}
            images={adImages}
            redirectPath="/premium"
            onRedirect={handleRedirect}
          />
        )}
      </>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 50,
  },
  content: {
    paddingHorizontal: 10,
    paddingTop: 8,
    gap: 18,
  },
  introBlock: {
    gap: 6,
    paddingTop: 4,
    paddingHorizontal: 5,
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
  chargeActions: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 5,
  },
  addChargeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
  },
  historyChargeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
  },
  addChargeLabel: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "flex-start",
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
    padding: 30,
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
