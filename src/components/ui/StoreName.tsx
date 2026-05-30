// ============================================
// LOTUS BUSINESS — Composant : StoreName
// ============================================
// Affiche le nom de la boutique avec un indicateur de plan (basique/pro)

import { Crown, Star } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/colors";
import { FontFamily } from "../../constants/typography";
import { useAuthStore } from "../../store/useAuthStore";

interface StoreNameProps {
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export default function StoreName({
  size = "md",
  showIcon = true,
}: StoreNameProps) {
  const boutique = useAuthStore((state) => state.boutique);
  const licenceStatut = useAuthStore((state) => state.licenceStatut);

  const isPro = licenceStatut === "actif";
  const boutiqueNom = boutique?.nom || "Ma boutique";

  const fontSize = size === "sm" ? 14 : size === "lg" ? 24 : 18;
  const iconSize = size === "sm" ? 12 : size === "lg" ? 20 : 16;

  return (
    <View style={styles.container}>
      {showIcon && (
        <View
          style={[
            styles.iconContainer,
            isPro ? styles.iconPro : styles.iconBasic,
          ]}
        >
          {isPro ? (
            <Crown size={iconSize} color={Colors.warning} />
          ) : (
            <Star size={iconSize} color={Colors.textTertiary} />
          )}
        </View>
      )}
      <Text
        style={[styles.name, { fontSize }, isPro && styles.namePro]}
        numberOfLines={1}
      >
        {boutiqueNom}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 6,
    padding: 2,
  },
  iconBasic: {
    opacity: 0.6,
  },
  iconPro: {
    // Style spécifique pour le mode pro
  },
  name: {
    fontFamily: FontFamily.display,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  namePro: {
    fontWeight: "700",
  },
});
