// ============================================
// LOTUS BUSINESS — Écran Premium (comparatif)
// ============================================

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { X, Check } from "lucide-react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Colors } from "@/constants/colors";
import { FontFamily, FontSize } from "@/constants/typography";
import { Radius, Spacing } from "@/constants/layout";

// ─── Données du tableau comparatif ────────────────────────────────────────────

interface FeatureRow {
  label: string;
  basic: boolean;
  pro: boolean;
  isNew?: boolean;
}

const COMPARISON_FEATURES: FeatureRow[] = [
  { label: "Entrées de journal illimitées", basic: true, pro: true },
  { label: "Chiffrement sécurisé",          basic: true, pro: true },
  { label: "Sans publicité",                basic: true, pro: true },
  { label: "Éditeur de flux de caisse",     basic: true, pro: true },
  { label: "Images de produits",            basic: false, pro: true },
  { label: "Multi-appareils",               basic: false, pro: true },
  { label: "Tous les bilans guidés",         basic: false, pro: true },
  { label: "Analyses avancées par IA",      basic: false, pro: true, isNew: true },
  { label: "Verrouillage de sécurité",      basic: false, pro: true },
];

const PRO_COL_WIDTH = 72;
const ACCENT = Colors.info; // #2563EB

// ─── Composant ────────────────────────────────────────────────────────────────

export default function PremiumScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(drawer)/(tabs)");
    }
  };

  const handleCTA = () => {
    router.push("/screens/premium/paiement" as never);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* ── Header ── */}
      <View
        style={[
          styles.header,
          { paddingTop: Math.max(insets.top, Spacing[4]) },
        ]}
      >
        <TouchableOpacity
          onPress={handleClose}
          style={styles.closeCircle}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <X size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* ── Contenu scrollable ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 120 },
        ]}
      >
        {/* Titre */}
        <Animated.View
          entering={FadeIn.duration(400)}
          style={styles.titleSection}
        >
          <Text style={styles.titleText}>Le Pro vous{"\n"}offre plus</Text>
        </Animated.View>

        {/* Tableau de comparaison */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.tableContainer}
        >
          {/* Fond colonne Pro */}
          <View style={styles.proBackgroundCol} />

          {/* En-têtes */}
          <View style={styles.tableRow}>
            <View style={styles.featureCell} />
            <View style={styles.checkCell}>
              <Text style={styles.basicHeaderText}>Basic</Text>
            </View>
            <View style={[styles.checkCell, styles.proCheckCell]}>
              <Text style={styles.proHeaderText}>Pro</Text>
            </View>
          </View>

          {/* Lignes */}
          {COMPARISON_FEATURES.map((feature, idx) => (
            <View key={idx} style={styles.tableRow}>
              <View style={styles.featureCell}>
                <Text style={styles.featureLabelText}>{feature.label}</Text>
                {feature.isNew && (
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>NEW</Text>
                  </View>
                )}
              </View>

              <View style={styles.checkCell}>
                {feature.basic ? (
                  <Check size={18} color={ACCENT} strokeWidth={3} />
                ) : null}
              </View>

              <View style={[styles.checkCell, styles.proCheckCell]}>
                {feature.pro ? (
                  <Check size={18} color={ACCENT} strokeWidth={3} />
                ) : null}
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Prix indicatif */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={styles.priceHintRow}
        >
          <Text style={styles.priceHintText}>
            À partir de{" "}
            <Text style={styles.priceHintBold}>999 FCFA / mois</Text>
            {"  "}ou{" "}
            <Text style={styles.priceHintBold}>
              10 000 FCFA / an{" "}
            </Text>
            <Text style={[styles.priceHintBold, { color: Colors.success }]}>
              (-17%)
            </Text>
          </Text>
        </Animated.View>
      </ScrollView>

      {/* ── Footer fixe ── */}
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, Spacing[4]) },
        ]}
      >
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleCTA}
          activeOpacity={0.88}
        >
          <Text style={styles.primaryButtonText}>
            Commencer mon essai gratuit
          </Text>
          <Text style={styles.primaryButtonSubtext}>
            2 clics pour commencer, facile à annuler
          </Text>
        </TouchableOpacity>
      </View>
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    zIndex: 10,
  },
  closeCircle: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.overlayLight,
    justifyContent: "center",
    alignItems: "center",
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[3],
    gap: Spacing[4],
  },

  // Titre
  titleSection: {},
  titleText: {
    fontFamily: FontFamily.display,
    fontSize: 34,
    color: Colors.textPrimary,
    lineHeight: 40,
    letterSpacing: -0.5,
  },

  // Tableau
  tableContainer: {
    position: "relative",
    width: "100%",
    borderRadius: Radius.xl,
    overflow: "hidden",
  },
  proBackgroundCol: {
    position: "absolute",
    right: 0,
    width: PRO_COL_WIDTH,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.infoLight,
    borderRadius: Radius.xl,
    zIndex: -1,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.overlayLight,
  },
  featureCell: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    paddingRight: Spacing[2],
    gap: Spacing[1],
  },
  featureLabelText: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  newBadge: {
    backgroundColor: Colors.black,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  newBadgeText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 9,
    color: Colors.textInverse,
    letterSpacing: 0.5,
  },
  checkCell: {
    width: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  proCheckCell: {
    width: PRO_COL_WIDTH,
  },
  basicHeaderText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
  },
  proHeaderText: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.lg,
    color: ACCENT,
  },

  // Indication de prix
  priceHintRow: {
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[1],
  },
  priceHintText: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    lineHeight: 20,
    textAlign: "center",
  },
  priceHintBold: {
    fontFamily: FontFamily.utilityBold,
    color: Colors.textPrimary,
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
    borderTopColor: Colors.overlayLight,
    ...Platform.select({
      ios: {
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  primaryButton: {
    width: "100%",
    backgroundColor: ACCENT,
    borderRadius: Radius.full,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryButtonText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.xl,
    color: Colors.textInverse,
    marginBottom: 2,
  },
  primaryButtonSubtext: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.xs,
    color: "rgba(255,255,255,0.7)",
  },
});