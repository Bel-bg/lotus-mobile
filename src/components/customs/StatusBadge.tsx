import { FontFamily, FontSize } from "@/constants/typography";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAuthStore } from "@/store/useAuthStore";

interface StatusBadgeProps {
  /** Si fourni, force l'affichage sans lire le store (utile pour les previews). */
  status?: "free" | "premium";
}

export default function StatusBadge({ status: statusProp }: StatusBadgeProps) {
  const licenceStatut = useAuthStore((state) => state.licenceStatut)
  const licence = useAuthStore((state) => state.licence)

  // Détermine le mode : "premium" si la licence est active ET de type premium
  const resolvedStatus: "free" | "premium" =
    statusProp ??
    (licenceStatut === 'actif' && licence?.type === 'premium' ? 'premium' : 'free')

  const isPremium = resolvedStatus === "premium";

  return (
    <View style={[styles.badge, isPremium ? styles.premiumBadge : styles.freeBadge]}>
      <View style={[styles.dot, isPremium ? styles.premiumDot : styles.freeDot]} />
      <Text style={[styles.label, isPremium ? styles.premiumLabel : styles.freeLabel]}>
        {isPremium ? "Premium" : "Mode Gratuit"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },

  // FREE (Style adouci avec un fond violet très clair)
  freeBadge: {
    backgroundColor: "#F5F3FF", // Violet ultra clair (presque blanc)
    borderColor: "#DDD6FE",     // Bordure violette douce
  },
  freeDot: {
    backgroundColor: "#7C3AED", // Point violet vif pour le contraste
  },
  freeLabel: {
    color: "#6D28D9",           // Texte violet foncé lisible
  },

  // PREMIUM (Style lumineux avec une touche d'or/ambre élégante)
  premiumBadge: {
    backgroundColor: "#FEF3C7", // Fond ambre/or très clair
    borderColor: "#FDE68A",     // Bordure dorée douce
  },
  premiumDot: {
    backgroundColor: "#D97706", // Point or/ambre soutenu
  },
  premiumLabel: {
    color: "#B45309",           // Texte ambre foncé pour le contraste
  },

  // SHARED
  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
  },
  label: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
});