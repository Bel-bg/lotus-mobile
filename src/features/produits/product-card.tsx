import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  runOnJS,
  FadeInDown,
} from "react-native-reanimated";
import { Plus, Pencil, Trash2 } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { FontFamily } from "@/constants/typography";
import type { Produit } from "@/types";
import {
  getStockStatut,
  getStockLabel,
  getStockColor,
  getStockBgColor,
} from "@/lib/utils/stock";
import AnimatedStockBar from "./animated-stock-bar";
import { useAuthStore } from "@/store/useAuthStore";

const SWIPE_DELETE_WIDTH = 96;
const SWIPE_OPEN_THRESHOLD = 40;
const SWIPE_DELETE_TRIGGER = 120;
const SPRING = { damping: 20, stiffness: 220 };

interface ProductCardProps {
  produit: Produit;
  index: number;
  onPress: () => void;
  onAddStock: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function formatPrice(produit: Produit, devise: string) {
  const prix = produit.prixUnitaire ?? produit.prixCarton;
  if (prix != null) {
    return `${prix.toLocaleString("fr-FR")} ${devise}`;
  }
  return "—";
}

function RuptureBadge() {
  const opacity = useSharedValue(1);
  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.45, { duration: 1500 }),
        withTiming(1, { duration: 1500 }),
      ),
      -1,
      false,
    );
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View style={[styles.statusBadge, styles.ruptureBadge, style]}>
      <Text style={[styles.statusText, { color: Colors.danger }]}>RUPTURE</Text>
    </Animated.View>
  );
}

export default function ProductCard({
  produit,
  index,
  onPress,
  onAddStock,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const devise = useAuthStore((s) => s.boutique?.devise ?? "FCFA");
  const statut = getStockStatut(produit);
  const translateX = useSharedValue(0);
  const dragStartX = useSharedValue(0);

  const closeSwipe = () => {
    translateX.value = withSpring(0, SPRING);
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-12, 12])
    .onBegin(() => {
      dragStartX.value = translateX.value;
    })
    .onUpdate((e) => {
      const next = dragStartX.value + e.translationX;
      translateX.value = Math.min(0, Math.max(next, -SWIPE_DELETE_WIDTH));
    })
    .onEnd(() => {
      const x = translateX.value;
      if (x <= -SWIPE_DELETE_TRIGGER) {
        translateX.value = withSpring(0, SPRING);
        runOnJS(onDelete)();
        return;
      }
      if (x <= -SWIPE_OPEN_THRESHOLD) {
        translateX.value = withSpring(-SWIPE_DELETE_WIDTH, SPRING);
        return;
      }
      translateX.value = withSpring(0, SPRING);
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).springify()}>
      <View style={styles.swipeContainer}>
        <Pressable
          style={styles.deleteAction}
          onPress={() => {
            closeSwipe();
            onDelete();
          }}
          accessibilityRole="button"
          accessibilityLabel="Supprimer le produit"
        >
          <Trash2 size={22} color={Colors.textInverse} strokeWidth={2.5} />
          <Text style={styles.deleteLabel}>Supprimer</Text>
        </Pressable>
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.card, cardStyle]}>
            <View style={styles.cardInner}>
              <Pressable
                onPress={onPress}
                style={({ pressed }) => pressed && { opacity: 0.92 }}
              >
                <View style={styles.topRow}>
                  <View style={styles.titleBlock}>
                    <Text style={styles.name} numberOfLines={1}>
                      {produit.nom}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <View style={styles.catPill}>
                        <Text style={styles.catText}>{produit.categorie}</Text>
                      </View>
                      <Text style={styles.price}>
                        {formatPrice(produit, devise)}
                      </Text>
                    </View>
                  </View>
                  {statut === "rupture" ? (
                    <RuptureBadge />
                  ) : (
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStockBgColor(statut) },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStockColor(statut) },
                        ]}
                      >
                        {getStockLabel(statut).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>

                <AnimatedStockBar produit={produit} showLabels />
              </Pressable>

              <View style={styles.quickRow}>
                <Pressable
                  style={styles.quickBtn}
                  onPress={onAddStock}
                  hitSlop={8}
                >
                  <Plus size={14} color={Colors.success} strokeWidth={2.5} />
                  <Text style={styles.quickBtnText}>Stock</Text>
                </Pressable>
                <Pressable style={styles.quickBtn} onPress={onEdit} hitSlop={8}>
                  <Pencil size={14} color={Colors.textPrimary} />
                  <Text style={styles.quickBtnText}>Modifier</Text>
                </Pressable>
                <Text style={styles.swipeHint}>← glisser pour supprimer</Text>
              </View>
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  swipeContainer: {
    marginBottom: 0,
    marginHorizontal: 0,
    overflow: "hidden",
  },
  deleteAction: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: SWIPE_DELETE_WIDTH,
    backgroundColor: Colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteLabel: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 11,
    color: Colors.textInverse,
    textAlign: "center",
  },
  card: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cardInner: { padding: 16 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  titleBlock: { flex: 1, marginRight: 8 },
  name: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  catPill: {
    borderRadius: 0, // pill → tag rectangulaire
    alignSelf: "flex-start",
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  catText: {
    fontFamily: FontFamily.content,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ruptureBadge: {
    backgroundColor: Colors.dangerLight,
  },
  statusText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 10,
  },
  price: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  priceSecondary: {
    fontFamily: FontFamily.content,
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  quickRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  quickBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  quickBtnText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 11,
    color: Colors.textPrimary,
  },
  swipeHint: {
    flex: 1,
    fontFamily: FontFamily.content,
    fontSize: 10,
    color: Colors.textTertiary,
    textAlign: "right",
  },
});
