// ============================================
// LOTUS BUSINESS — Écran Paiement Premium (v3)
// ============================================

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  Platform,
  Image,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { ArrowLeft, Zap } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { FontFamily, FontSize } from "@/constants/typography";
import { Radius, Spacing } from "@/constants/layout";
import { useAuthStore } from "@/store/useAuthStore";
import PromoTrialOverlay from "@/components/premium/PromoTrialOverlay";
import GiftImage from "@/assets/images/gift.png";
import MoovLogo   from "@/assets/images/moov.png";
import MtnLogo    from "@/assets/images/momo.png";
import CeltisLogo from "@/assets/images/celtis.png";

// ─── Constantes ───────────────────────────────────────────────────────────────

const ACCENT = Colors.info;
const PROMO_DELAY_MS = 4000;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Plan     = "mensuel" | "annuel";
type Operator = "moov" | "mtn" | "celtis" | null;

interface OperatorConfig {
  id: Operator;
  name: string;
  logo: ReturnType<typeof require>;
}

const OPERATORS: OperatorConfig[] = [
  { id: "moov",   name: "Moov Money",       logo: MoovLogo   },
  { id: "mtn",    name: "MTN Mobile Money",  logo: MtnLogo    },
  { id: "celtis", name: "Celtis Cash",       logo: CeltisLogo },
];

// ─── OperatorRow ──────────────────────────────────────────────────────────────

function OperatorRow({
  config,
  selected,
  onPress,
  isLast,
}: {
  config: OperatorConfig;
  selected: boolean;
  onPress: () => void;
  isLast: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.operatorRow, !isLast && styles.operatorRowDivider]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image source={config.logo} style={styles.operatorLogo} resizeMode="contain" />
      <Text style={styles.operatorName}>{config.name}</Text>
      <View style={[styles.radio, selected && { borderColor: ACCENT }]}>
        {selected && <View style={styles.radioDot} />}
      </View>
    </TouchableOpacity>
  );
}

// ─── Composant Principal ──────────────────────────────────────────────────────

export default function PaiementScreen() {
  const router     = useRouter();
  const insets     = useSafeAreaInsets();
  const email      = useAuthStore((s) => s.email);
  const setLicence = useAuthStore((s) => s.setLicence);

  const [selectedPlan,     setSelectedPlan]     = useState<Plan>("annuel");
  const [selectedOperator, setSelectedOperator] = useState<Operator>(null);
  const [isProcessing,     setIsProcessing]     = useState(false);
  const [showPromo,        setShowPromo]        = useState(false);

  const planScrollRef = useRef<ScrollView>(null);
  const promoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Animation débattement FAB ─────────────────────────────────────────────
  // Mouvement gauche-droite à intervalle constant, comme une notification
  const fabX = useSharedValue(0);

  useEffect(() => {
    const shake = () => {
      fabX.value = withSequence(
        withTiming(-7,  { duration: 80,  easing: Easing.out(Easing.ease) }),
        withTiming( 7,  { duration: 80,  easing: Easing.inOut(Easing.ease) }),
        withTiming(-5,  { duration: 70,  easing: Easing.inOut(Easing.ease) }),
        withTiming( 5,  { duration: 70,  easing: Easing.inOut(Easing.ease) }),
        withTiming(-3,  { duration: 60,  easing: Easing.inOut(Easing.ease) }),
        withTiming( 0,  { duration: 60,  easing: Easing.in(Easing.ease)   }),
      );
    };

    // Premier shake après 1.2s, puis toutes les 3.5s
    const initial = setTimeout(() => {
      shake();
      const interval = setInterval(shake, 3500);
      return () => clearInterval(interval);
    }, 1200);

    return () => clearTimeout(initial);
  }, []);

  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: fabX.value }],
  }));

  // ── Timer promo ──────────────────────────────────────────────────────────
  useEffect(() => {
    promoTimerRef.current = setTimeout(() => setShowPromo(true), PROMO_DELAY_MS);
    return () => { if (promoTimerRef.current) clearTimeout(promoTimerRef.current); };
  }, []);

  // ── Switch plan + scroll ──────────────────────────────────────────────────
  const switchPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    planScrollRef.current?.scrollTo({
      x: plan === "annuel" ? SCREEN_WIDTH - Spacing[5] * 2 : 0,
      animated: true,
    });
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const computeExpiration = (months: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toISOString();
  };

  const currentPrix    = selectedPlan === "mensuel" ? "999"    : "10 000";
  const currentPeriode = selectedPlan === "mensuel" ? "/ mois" : "/ an";

  const activateLicence = (trialMonths?: number) => {
    const months = trialMonths ?? (selectedPlan === "mensuel" ? 1 : 12);
    setLicence("actif", {
      email:          email || "client@lotusbusiness.app",
      statut:         "actif",
      type:           "premium",
      dateCreation:   new Date().toISOString(),
      dateExpiration: computeExpiration(months),
      nom:
        trialMonths != null
          ? "Essai gratuit (2 mois)"
          : `Plan ${selectedPlan} — ${currentPrix} FCFA`,
    });
  };

  // ── Paiement ─────────────────────────────────────────────────────────────
  const handlePay = () => {
    if (!selectedOperator) {
      Alert.alert("Opérateur requis", "Sélectionnez un mode de paiement pour continuer.", [{ text: "OK" }]);
      return;
    }
    const opName = OPERATORS.find((o) => o.id === selectedOperator)!.name;
    Alert.alert(
      "Confirmer le paiement",
      `Vous allez payer ${currentPrix} FCFA ${currentPeriode} via ${opName}.\n\nUn SMS de confirmation vous sera envoyé.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Confirmer",
          onPress: () => {
            setIsProcessing(true);
            setTimeout(() => {
              activateLicence();
              setIsProcessing(false);
              Alert.alert(
                "Paiement réussi 🎉",
                `Votre abonnement Pro ${selectedPlan} est actif.`,
                [{ text: "Accéder à Pro", onPress: () => router.replace("/(drawer)/(tabs)") }]
              );
            }, 1500);
          },
        },
      ]
    );
  };

  const handleAcceptTrial = () => {
    setShowPromo(false);
    activateLicence(2);
    Alert.alert(
      "Essai gratuit activé 🎁",
      "2 mois offerts. À expiration, votre abonnement démarrera automatiquement.",
      [{ text: "Découvrir Pro", onPress: () => router.replace("/(drawer)/(tabs)") }]
    );
  };

  // ─── Rendu ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, Spacing[4]) }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Passer à Pro</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 140 },
        ]}
      >

        {/* ── Tabs plan ── */}
        <Animated.View entering={FadeInDown.delay(50).duration(380)}>
          <Text style={styles.label}>Plan</Text>

          {/* Switcher tabs */}
          <View style={styles.tabSwitcher}>
            <TouchableOpacity
              style={[styles.tab, selectedPlan === "mensuel" && styles.tabActive]}
              onPress={() => switchPlan("mensuel")}
              activeOpacity={0.75}
            >
              <Text style={[styles.tabText, selectedPlan === "mensuel" && styles.tabTextActive]}>
                Mensuel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, selectedPlan === "annuel" && styles.tabActive]}
              onPress={() => switchPlan("annuel")}
              activeOpacity={0.75}
            >
              <Text style={[styles.tabText, selectedPlan === "annuel" && styles.tabTextActive]}>
                Annuel
              </Text>
              {/* Badge -17% */}
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>-17%</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Zone de contenu scrollable horizontalement */}
          <ScrollView
            ref={planScrollRef}
            horizontal
            pagingEnabled
            scrollEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              setSelectedPlan(x > 50 ? "annuel" : "mensuel");
            }}
            // Annuel affiché par défaut
            contentOffset={{ x: SCREEN_WIDTH - Spacing[5] * 2, y: 0 }}
          >
            {/* ── Page Mensuel ── */}
            <View style={styles.planPage}>
              <View style={styles.planContent}>
                {/* Prix */}
                <View style={styles.priceBlock}>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceMain}>999</Text>
                    <Text style={styles.priceCurrency}> FCFA / mois</Text>
                  </View>
                  <View style={styles.oldPriceRow}>
                    <Text style={styles.oldPrice}>2 999 FCFA / mois</Text>
                    <View style={styles.strikeThrough} />
                  </View>
                  <Text style={styles.priceSubnote}>
                    Ancien tarif : 2 999 FCFA / mois
                  </Text>
                </View>
              </View>
            </View>

            {/* ── Page Annuel ── */}
            <View style={styles.planPage}>
              <View style={styles.planContent}>
                {/* Bandeau promo */}
                <View style={styles.promoBanner}>
                  <Text style={styles.promoBannerText}>17% de réduction appliquée</Text>
                </View>

                {/* Prix */}
                <View style={styles.priceBlock}>
                  <View style={styles.priceRow}>
                    <View style={styles.oldPriceInline}>
                      <Text style={styles.oldPriceStrike}>12 000</Text>
                    </View>
                    <Text style={styles.priceMain}>10 000</Text>
                    <Text style={styles.priceCurrency}> FCFA / an</Text>
                  </View>
                  <Text style={styles.priceSubnote}>
                    Ancien tarif : 36 000 FCFA / an
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Indicateur de page */}
          <View style={styles.pageIndicator}>
            <View style={[styles.dot, selectedPlan === "mensuel" && styles.dotActive]} />
            <View style={[styles.dot, selectedPlan === "annuel"  && styles.dotActive]} />
          </View>
        </Animated.View>

        {/* ── Opérateurs ── */}
        <Animated.View entering={FadeInDown.delay(140).duration(380)} style={styles.section}>
          <Text style={styles.label}>Mode de paiement</Text>
          <View style={styles.operatorsCard}>
            {OPERATORS.map((op, idx) => (
              <OperatorRow
                key={op.id}
                config={op}
                selected={selectedOperator === op.id}
                onPress={() => setSelectedOperator(op.id)}
                isLast={idx === OPERATORS.length - 1}
              />
            ))}
          </View>
        </Animated.View>

        {/* ── Récapitulatif ── */}
        <Animated.View entering={FadeInDown.delay(220).duration(380)} style={styles.section}>
          <Text style={styles.label}>Récapitulatif</Text>
          <View style={styles.summaryBlock}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Plan</Text>
              <Text style={styles.summaryVal}>
                Pro {selectedPlan === "mensuel" ? "Mensuel" : "Annuel"}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.divider]}>
              <Text style={styles.summaryKey}>Montant</Text>
              <Text style={[styles.summaryVal, styles.summaryAccent]}>
                {currentPrix} FCFA {currentPeriode}
              </Text>
            </View>
            {selectedPlan === "annuel" && (
              <View style={[styles.summaryRow, styles.divider]}>
                <Text style={styles.summaryKey}>Économies</Text>
                <Text style={[styles.summaryVal, { color: Colors.success }]}>
                  −26 000 FCFA / an
                </Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.divider]}>
              <Text style={styles.summaryKey}>Via</Text>
              <Text style={styles.summaryVal}>
                {selectedOperator
                  ? OPERATORS.find((o) => o.id === selectedOperator)!.name
                  : "—"}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Note légale ── */}
        <Animated.View entering={FadeInDown.delay(290).duration(380)}>
          <Text style={styles.legalNote}>
            En procédant au paiement, vous acceptez les conditions d&apos;utilisation de
            Lotus Business. L&apos;abonnement se renouvelle automatiquement et peut être
            annulé à tout moment depuis votre profil.
          </Text>
        </Animated.View>

      </ScrollView>

      {/* ── Footer ── */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing[4]) }]}>
        <TouchableOpacity
          style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
          onPress={handlePay}
          disabled={isProcessing}
          activeOpacity={0.88}
        >
          {isProcessing ? (
            <Text style={styles.payButtonText}>Traitement en cours…</Text>
          ) : (
            <>
              <Text style={styles.payButtonText}>
                Payer {currentPrix} FCFA {currentPeriode}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* ── FAB Promo — débattement ── */}
      <Animated.View style={[styles.promoFabWrap, fabStyle]}>
        <TouchableOpacity
          style={styles.promoFab}
          onPress={() => setShowPromo(true)}
          activeOpacity={0.82}
        >
          <Image source={GiftImage} style={styles.promoFabIcon} resizeMode="contain" />
        </TouchableOpacity>
      </Animated.View>

      {/* ── Overlay promo ── */}
      <PromoTrialOverlay
        visible={showPromo}
        onAccept={handleAcceptTrial}
        onDecline={() => setShowPromo(false)}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const PLAN_PAGE_WIDTH = SCREEN_WIDTH - Spacing[5] * 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Header ───────────────────────────────────────────────────────────────
  header: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[3],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: FontFamily.displaySemi,
    fontSize: FontSize["2xl"],
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },

  // ── Scroll principal ──────────────────────────────────────────────────────
  scrollContent: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[6],
    gap: Spacing[6],
  },
  section: {},

  label: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: Spacing[3],
  },

  // ── Tab switcher ──────────────────────────────────────────────────────────
  tabSwitcher: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    marginBottom: 0,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: Spacing[3],
    marginRight: Spacing[6],
    gap: Spacing[2],
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: ACCENT,
  },
  tabText: {
    fontFamily: FontFamily.utility,
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
  tabTextActive: {
    fontFamily: FontFamily.utilityBold,
    color: ACCENT,
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    backgroundColor: Colors.success + "1A",
  },
  tabBadgeText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 10,
    color: Colors.success,
  },

  // ── Pages horizontales ────────────────────────────────────────────────────
  planPage: {
    width: PLAN_PAGE_WIDTH,
  },
  planContent: {
    paddingTop: Spacing[5],
    paddingBottom: Spacing[2],
    gap: Spacing[4],
  },

  // ── Bandeau promo ─────────────────────────────────────────────────────────
  promoBanner: {
    backgroundColor: Colors.success + "14",
    borderRadius: Radius.md,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    alignSelf: "flex-start",
  },
  promoBannerText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.sm,
    color: Colors.success,
  },

  // ── Prix ──────────────────────────────────────────────────────────────────
  priceBlock: {
    gap: Spacing[2],
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  oldPriceInline: {
    position: "relative",
    justifyContent: "center",
    marginRight: Spacing[1],
  },
  oldPriceStrike: {
    fontFamily: FontFamily.display,
    fontSize: FontSize["2xl"],
    color: Colors.textTertiary,
    textDecorationLine: "line-through",
    textDecorationColor: Colors.textTertiary,
  },
  priceMain: {
    fontFamily: FontFamily.display,
    fontSize: FontSize["5xl"],
    color: Colors.textPrimary,
    letterSpacing: -1.5,
  },
  priceCurrency: {
    fontFamily: FontFamily.utility,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    paddingBottom: 4,
  },
  oldPriceRow: {
    position: "relative",
    alignSelf: "flex-start",
  },
  oldPrice: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    textDecorationLine: "line-through",
    textDecorationColor: Colors.textTertiary,
  },
  strikeThrough: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.textTertiary,
  },
  priceSubnote: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: Spacing[1],
  },

  // ── Indicateur de page ────────────────────────────────────────────────────
  pageIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: Spacing[4],
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: ACCENT,
    width: 18,
  },

  // ── Opérateurs ────────────────────────────────────────────────────────────
  operatorsCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    overflow: "hidden",
    backgroundColor: Colors.background,
  },
  operatorRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    gap: Spacing[3],
  },
  operatorRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  operatorLogo: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
  },
  operatorName: {
    flex: 1,
    fontFamily: FontFamily.displaySemi,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    justifyContent: "center",
    alignItems: "center",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ACCENT,
  },

  // ── Récapitulatif ─────────────────────────────────────────────────────────
  summaryBlock: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    overflow: "hidden",
    backgroundColor: Colors.background,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  summaryKey: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  summaryVal: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  summaryAccent: {
    fontSize: FontSize.base,
    color: ACCENT,
  },

  // ── Note légale ───────────────────────────────────────────────────────────
  legalNote: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textAlign: "center",
    lineHeight: 18,
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    ...Platform.select({
      ios: {
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  payButton: {
    width: "100%",
    backgroundColor: ACCENT,
    borderRadius: Radius.lg,
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing[2],
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  payButtonDisabled: {
    backgroundColor: Colors.borderStrong,
    shadowOpacity: 0,
    elevation: 0,
  },
  payButtonText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.xl,
    color: Colors.textInverse,
  },

  // ── FAB Promo ─────────────────────────────────────────────────────────────
  promoFabWrap: {
    position: "absolute",
    bottom: 110,
    right: Spacing[4],
    zIndex: 20,
  },
  promoFab: {
    width: 62,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
  },
  promoFabIcon: {
    width: 80,
    height: 80,
  },
});