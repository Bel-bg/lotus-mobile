// ============================================
// LOTUS BUSINESS — Écran Paiement Premium
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
  Easing,
} from "react-native-reanimated";
import { ArrowLeft, CheckCircle2, Zap } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { FontFamily, FontSize } from "@/constants/typography";
import { Radius, Spacing, Shadow } from "@/constants/layout";
import { useAuthStore } from "@/store/useAuthStore";
import PromoTrialOverlay from "@/components/premium/PromoTrialOverlay";
import GiftImage from "@/assets/images/gift.png";

// ─── Constantes ───────────────────────────────────────────────────────────────

const ACCENT = Colors.info;
const PROMO_DELAY_MS = 4000; // L'overlay promo s'affiche après 4 secondes

type Plan = "mensuel" | "annuel";
type Operator = "moov" | "mtn" | null;

interface PlanConfig {
  id: Plan;
  label: string;
  prix: string;
  prixNum: number;
  periode: string;
  badge?: string;
  badgeColor?: string;
}

const PLANS: PlanConfig[] = [
  {
    id: "mensuel",
    label: "Mensuel",
    prix: "999",
    prixNum: 999,
    periode: "/ mois",
  },
  {
    id: "annuel",
    label: "Annuel",
    prix: "10 000",
    prixNum: 10000,
    periode: "/ an",
    badge: "-17%",
    badgeColor: Colors.success,
  },
];

// ─── Composant OperatorCard ───────────────────────────────────────────────────

interface OperatorCardProps {
  name: string;
  subtitle: string;
  color: string;
  emoji: string;
  selected: boolean;
  onPress: () => void;
}

function OperatorCard({
  name,
  subtitle,
  color,
  emoji,
  selected,
  onPress,
}: OperatorCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.operatorCard,
        selected && { borderColor: color, borderWidth: 2 },
      ]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      {/* Cercle coloré avec emoji */}
      <View style={[styles.operatorIconCircle, { backgroundColor: color + "22" }]}>
        <Text style={styles.operatorEmoji}>{emoji}</Text>
      </View>

      <View style={styles.operatorInfo}>
        <Text style={styles.operatorName}>{name}</Text>
        <Text style={styles.operatorSub}>{subtitle}</Text>
      </View>

      {/* Radio */}
      <View style={[styles.radio, selected && { borderColor: color }]}>
        {selected && (
          <View style={[styles.radioDot, { backgroundColor: color }]} />
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Composant Principal ──────────────────────────────────────────────────────

export default function PaiementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const email = useAuthStore((state) => state.email);
  const setLicence = useAuthStore((state) => state.setLicence);

  const [selectedPlan, setSelectedPlan] = useState<Plan>("mensuel");
  const [selectedOperator, setSelectedOperator] = useState<Operator>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPromo, setShowPromo] = useState(false);
  const [promoShownOnce, setPromoShownOnce] = useState(false);

  const promoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Animation lueur du bouton persistant ─────────────────────────────────
  const glowScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.55);

  useEffect(() => {
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.18, { duration: 900, easing: Easing.out(Easing.ease) }),
        withTiming(1,    { duration: 900, easing: Easing.in(Easing.ease) })
      ),
      -1,
      false
    );
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 900 }),
        withTiming(0.4, { duration: 900 })
      ),
      -1,
      false
    );
  }, []);

  const glowRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }));

  const handleReopenPromo = () => {
    setShowPromo(true);
  };

  // Lancer l'overlay promo après PROMO_DELAY_MS (une seule fois)
  useEffect(() => {
    promoTimerRef.current = setTimeout(() => {
      setShowPromo(true);
      setPromoShownOnce(true);
    }, PROMO_DELAY_MS);

    return () => {
      if (promoTimerRef.current) {
        clearTimeout(promoTimerRef.current);
      }
    };
  }, []);

  const currentPlan = PLANS.find((p) => p.id === selectedPlan)!;

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const computeExpiration = (months: number): string => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toISOString();
  };

  const activateLicence = (trialMonths?: number) => {
    const months = trialMonths ?? (selectedPlan === "mensuel" ? 1 : 12);
    setLicence("actif", {
      email: email || "client@lotusbusiness.app",
      statut: "actif",
      type: "premium",
      dateCreation: new Date().toISOString(),
      dateExpiration: computeExpiration(months),
      nom:
        trialMonths != null
          ? "Essai gratuit (2 mois)"
          : `Plan ${selectedPlan} — ${currentPlan.prix} FCFA`,
    });
  };

  // ── Paiement normal ───────────────────────────────────────────────────────

  const handlePay = () => {
    if (!selectedOperator) {
      Alert.alert(
        "Opérateur requis",
        "Veuillez sélectionner Moov Money ou MTN MoMo pour continuer.",
        [{ text: "OK" }]
      );
      return;
    }

    const operatorLabel =
      selectedOperator === "moov" ? "Moov Money" : "MTN Mobile Money";

    Alert.alert(
      `Confirmer le paiement`,
      `Vous allez payer ${currentPlan.prix} FCFA ${currentPlan.periode} via ${operatorLabel}.\n\nUn SMS de confirmation vous sera envoyé.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Confirmer",
          onPress: () => {
            setIsProcessing(true);
            // Simulation d'un délai de traitement paiement
            setTimeout(() => {
              activateLicence();
              setIsProcessing(false);
              Alert.alert(
                "Paiement réussi ! 🎉",
                `Votre abonnement Pro ${selectedPlan} est maintenant actif.`,
                [
                  {
                    text: "Accéder à Pro",
                    onPress: () => router.replace("/(drawer)/(tabs)"),
                  },
                ]
              );
            }, 1500);
          },
        },
      ]
    );
  };

  // ── Essai gratuit (depuis l'overlay) ─────────────────────────────────────

  const handleAcceptTrial = () => {
    setShowPromo(false);
    activateLicence(2); // 2 mois gratuits
    Alert.alert(
      "Essai gratuit activé ! 🎁",
      "Vous bénéficiez de 2 mois offerts. À leur expiration, votre abonnement démarrera automatiquement.",
      [
        {
          text: "Découvrir Pro",
          onPress: () => router.replace("/(drawer)/(tabs)"),
        },
      ]
    );
  };

  const handleDeclineTrial = () => {
    setShowPromo(false);
  };

  // ── Rendu ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: Math.max(insets.top, Spacing[4]) },
        ]}
      >
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
          { paddingBottom: insets.bottom + 120 },
        ]}
      >
        {/* ── Sélecteur de plan ── */}
        <Animated.View entering={FadeInDown.delay(50).duration(400)}>
          <Text style={styles.sectionLabel}>Votre plan</Text>
          <View style={styles.planRow}>
            {PLANS.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              return (
                <TouchableOpacity
                  key={plan.id}
                  style={[
                    styles.planCard,
                    isSelected && styles.planCardSelected,
                  ]}
                  onPress={() => setSelectedPlan(plan.id)}
                  activeOpacity={0.82}
                >
                  {/* Badge réduction */}
                  {plan.badge && (
                    <View
                      style={[
                        styles.discountBadge,
                        { backgroundColor: plan.badgeColor + "22" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.discountBadgeText,
                          { color: plan.badgeColor },
                        ]}
                      >
                        {plan.badge}
                      </Text>
                    </View>
                  )}

                  {/* Contenu */}
                  <Text
                    style={[
                      styles.planLabel,
                      isSelected && styles.planLabelSelected,
                    ]}
                  >
                    {plan.label}
                  </Text>
                  <View style={styles.planPriceRow}>
                    <Text
                      style={[
                        styles.planPrice,
                        isSelected && styles.planPriceSelected,
                      ]}
                    >
                      {plan.prix}
                    </Text>
                    <Text style={styles.planCurrency}> FCFA</Text>
                  </View>
                  <Text style={styles.planPeriode}>{plan.periode}</Text>

                  {isSelected && (
                    <CheckCircle2
                      size={18}
                      color={ACCENT}
                      style={styles.planCheck}
                      strokeWidth={2.5}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* ── Sélecteur d'opérateur ── */}
        <Animated.View
          entering={FadeInDown.delay(150).duration(400)}
          style={styles.section}
        >
          <Text style={styles.sectionLabel}>Mode de paiement</Text>
          <View style={styles.operatorsList}>
            <OperatorCard
              name="Moov Money"
              subtitle="Paiement mobile sécurisé"
              color="#FF6B00"
              emoji="🟠"
              selected={selectedOperator === "moov"}
              onPress={() => setSelectedOperator("moov")}
            />
            <OperatorCard
              name="MTN Mobile Money"
              subtitle="Paiement mobile sécurisé"
              color="#FFCC00"
              emoji="🟡"
              selected={selectedOperator === "mtn"}
              onPress={() => setSelectedOperator("mtn")}
            />
          </View>
        </Animated.View>

        {/* ── Récapitulatif ── */}
        <Animated.View
          entering={FadeInDown.delay(250).duration(400)}
          style={styles.section}
        >
          <Text style={styles.sectionLabel}>Récapitulatif</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Plan sélectionné</Text>
              <Text style={styles.summaryVal}>
                Pro {currentPlan.label}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryDivider]}>
              <Text style={styles.summaryKey}>Montant</Text>
              <Text style={[styles.summaryVal, styles.summaryAmount]}>
                {currentPlan.prix} FCFA{currentPlan.periode}
              </Text>
            </View>
            {selectedPlan === "annuel" && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Économies</Text>
                <Text style={[styles.summaryVal, { color: Colors.success }]}>
                  -1 988 FCFA / an
                </Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.summaryDivider]}>
              <Text style={styles.summaryKey}>Opérateur</Text>
              <Text style={styles.summaryVal}>
                {selectedOperator === "moov"
                  ? "Moov Money 🟠"
                  : selectedOperator === "mtn"
                  ? "MTN MoMo 🟡"
                  : "Non sélectionné"}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Note légale ── */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Text style={styles.legalNote}>
            En procédant au paiement, vous acceptez les conditions d&apos;utilisation de Lotus Business. L&apos;abonnement se renouvelle automatiquement. Vous pouvez annuler à tout moment depuis votre profil.
          </Text>
        </Animated.View>
      </ScrollView>

      {/* ── Footer ── */}
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, Spacing[4]) },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.payButton,
            isProcessing && styles.payButtonDisabled,
          ]}
          onPress={handlePay}
          disabled={isProcessing}
          activeOpacity={0.88}
        >
          {isProcessing ? (
            <Text style={styles.payButtonText}>Traitement en cours…</Text>
          ) : (
            <>
              <Zap size={18} color={Colors.textInverse} strokeWidth={2.5} />
              <Text style={styles.payButtonText}>
                Payer {currentPlan.prix} FCFA{currentPlan.periode}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Bouton persistant Promo (flottant, coin bas-droit) ── */}
      <View
        style={styles.promoFabWrap}
      >

        <TouchableOpacity
          style={styles.promoFab}
          onPress={handleReopenPromo}
          activeOpacity={0.82}
        >
          <Image source={GiftImage} style={styles.promoFabIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      {/* ── Overlay promo ── */}
      <PromoTrialOverlay
        visible={showPromo}
        onAccept={handleAcceptTrial}
        onDecline={handleDeclineTrial}
      />
    </View>
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
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[3],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.overlayLight,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: FontFamily.displaySemi,
    fontSize: FontSize["2xl"],
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
    gap: Spacing[5],
  },

  // Section
  section: {},
  sectionLabel: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: Spacing[3],
  },

  // Plans
  planRow: {
    flexDirection: "row",
    gap: Spacing[3],
  },
  planCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    padding: Spacing[4],
    backgroundColor: Colors.background,
    position: "relative",
    gap: 2,
    ...Shadow.sm,
  },
  planCardSelected: {
    borderColor: ACCENT,
    borderWidth: 2,
    backgroundColor: Colors.infoLight,
  },
  discountBadge: {
    position: "absolute",
    top: Spacing[2],
    right: Spacing[2],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  discountBadgeText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  planLabel: {
    fontFamily: FontFamily.utility,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  planLabelSelected: {
    color: ACCENT,
    fontFamily: FontFamily.utilityBold,
  },
  planPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  planPrice: {
    fontFamily: FontFamily.display,
    fontSize: FontSize["5xl"],
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  planPriceSelected: {
    color: ACCENT,
  },
  planCurrency: {
    fontFamily: FontFamily.utility,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  planPeriode: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  planCheck: {
    position: "absolute",
    bottom: Spacing[3],
    right: Spacing[3],
  },

  // Operators
  operatorsList: {
    gap: Spacing[3],
  },
  operatorCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing[4],
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    gap: Spacing[3],
    ...Shadow.sm,
  },
  operatorIconCircle: {
    width: 46,
    height: 46,
    borderRadius: Radius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  operatorEmoji: {
    fontSize: 24,
  },
  operatorInfo: {
    flex: 1,
  },
  operatorName: {
    fontFamily: FontFamily.displaySemi,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  operatorSub: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: Colors.borderStrong,
    justifyContent: "center",
    alignItems: "center",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
  },

  // Summary
  summaryCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    backgroundColor: Colors.background,
    overflow: "hidden",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  summaryDivider: {
    borderTopWidth: 1,
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
  summaryAmount: {
    fontSize: FontSize.lg,
    color: ACCENT,
  },

  // Legal
  legalNote: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textAlign: "center",
    lineHeight: 18,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Platform.select({
      ios: {
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: { elevation: 8 },
    }),
  },
  payButton: {
    width: "100%",
    backgroundColor: ACCENT,
    borderRadius: Radius.full,
    height: 58,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing[2],
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
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

  // ── Bouton persistant Promo FAB ──────────────────────────────────────────
  promoFabWrap: {
    position: "absolute",
    bottom: 110,
    right: Spacing[4],
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },
  promoFabGlow: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    backgroundColor: "transparent",
    opacity: 0.55,
  },
  promoFab: {
    width: 62,
    height: 62,
    borderRadius: Radius.full,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  promoFabIcon: {
    width: 80,
    height: 80,
  },
  promoFabText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 8,
    color: Colors.textInverse,
    textAlign: "center",
    letterSpacing: 0.2,
    lineHeight: 10,
  },
});

