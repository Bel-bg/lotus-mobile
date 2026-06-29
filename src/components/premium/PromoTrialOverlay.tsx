// ============================================
// LOTUS BUSINESS — PromoTrialOverlay
// Overlay promotionnel : 2 mois gratuits
// ============================================

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
  Image,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";
import { X, CheckCircle2 } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { FontFamily, FontSize } from "@/constants/typography";
import { Radius, Spacing, Shadow } from "@/constants/layout";
import Gift from "@/assets/images/gift.png"
interface PromoTrialOverlayProps {
  visible: boolean;
  onAccept: () => void;   
  onDecline: () => void; 
}

const PROMO_ITEMS = [
  "2 mois offerts sans engagement",
  "Accès complet à toutes les fonctions Pro",
  "Annulation avant expiration = 0 FCFA débité",
];

export default function PromoTrialOverlay({
  visible,
  onAccept,
  onDecline,
}: PromoTrialOverlayProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onDecline}
    >

      <Animated.View
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(250)}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onDecline} />

        {/* Carte modale */}
        <Animated.View
          entering={SlideInDown.duration(500)}
          exiting={SlideOutDown.duration(250)}
          style={styles.card}
        >
          {/* Bouton fermer */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onDecline}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={18} color={Colors.textSecondary} />
          </TouchableOpacity>


            <Image source={Gift} style={styles.iconWrap} />
          {/* Badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>OFFRE SPÉCIALE 🎁</Text>
          </View>

          {/* Titre */}
          <Text style={styles.title}>2 mois{"\n"}entièrement gratuits</Text>

          {/* Sous-titre */}
          <Text style={styles.subtitle}>
            Profitez de Lotus Business Pro sans payer pendant{" "}
            <Text style={styles.subtitleBold}>60 jours</Text>. À l&apos;issue de
            l&apos;essai, votre abonnement démarrera automatiquement.
          </Text>

          {/* Points clés */}
          <View style={styles.itemsList}>
            {PROMO_ITEMS.map((item, i) => (
              <View key={i} style={styles.itemRow}>
                <CheckCircle2
                  size={16}
                  color={Colors.success}
                  strokeWidth={2.5}
                />
                <Text style={styles.itemText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Bouton principal */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onAccept}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryButtonText}>
              Activer mon essai gratuit
            </Text>
            <Text style={styles.primaryButtonSub}>
              2 mois offerts, puis abonnement choisi
            </Text>
          </TouchableOpacity>

          {/* Lien secondaire */}
          <TouchableOpacity
            onPress={onDecline}
            activeOpacity={0.7}
            style={styles.declineBtn}
          >
            <Text style={styles.declineText}>
              Non merci, payer maintenant
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const ACCENT = "#2F54EB";

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: "center",
    paddingHorizontal: Spacing[4],
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[6],
    paddingBottom: Platform.OS === "ios" ? 36 : Spacing[6],
    alignItems: "center",
    gap: Spacing[3],
    ...Shadow.lg,
  },
  closeBtn: {
    position: "absolute",
    top: Spacing[4],
    right: Spacing[4],
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: Radius.full,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing[2],
  },
  badge: {
    backgroundColor: "#FFF3CD",
    paddingHorizontal: Spacing[3],
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: "#FFE082",
  },
  badgeText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.xs,
    color: "#7C5C00",
    letterSpacing: 0.6,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: FontSize["5xl"],
    color: Colors.textPrimary,
    textAlign: "center",
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  subtitleBold: {
    fontFamily: FontFamily.utilityBold,
    color: Colors.textPrimary,
  },
  itemsList: {
    width: "100%",
    gap: Spacing[2],
    marginVertical: Spacing[1],
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[2],
  },
  itemText: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  primaryButton: {
    width: "100%",
    backgroundColor: ACCENT,
    borderRadius: Radius.full,
    height: 58,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
    marginTop: Spacing[1],
  },
  primaryButtonText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.xl,
    color: Colors.textInverse,
    marginBottom: 2,
  },
  primaryButtonSub: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.xs,
    color: "rgba(255,255,255,0.7)",
  },
  declineBtn: {
    paddingVertical: Spacing[2],
  },
  declineText: {
    fontFamily: FontFamily.utility,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textDecorationLine: "underline",
  },
});
