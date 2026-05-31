// ============================================
// LOTUS BUSINESS — F5 : Aperçu Catalogue (HomeScreen Widget)
// ============================================

import React, { useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withSpring,
  FadeInUp,
  Easing,
} from "react-native-reanimated";
import { AlertTriangle, ChevronRight, Package } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { FontFamily } from "@/constants/typography";
import { useStockStore } from "@/store/useStockStore";

type StockStatut = "ok" | "faible" | "critique" | "rupture";

interface MiniProduit {
  id: string;
  nom: string;
  stockActuel: number;
  stockMin: number;
  statut: StockStatut;
}

function deriverStatut(stockActuel: number, stockMin: number): StockStatut {
  if (stockActuel <= 0) return "rupture";
  if (stockActuel <= stockMin * 0.5) return "critique";
  if (stockActuel <= stockMin) return "faible";
  return "ok";
}

const PRIORITY: Record<StockStatut, number> = {
  rupture: 0,
  critique: 1,
  faible: 2,
  ok: 3,
};

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = React.useState(0);

  useEffect(() => {
    const duration = 800;
    const steps = 30;
    const stepTime = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += Math.ceil(target / steps);
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [target]);

  return <Text style={styles.counterValue}>{count}</Text>;
}

function MiniStockBar({
  current,
  min,
  statut,
}: {
  current: number;
  min: number;
  statut: StockStatut;
}) {
  const maxRef = Math.max(min * 2, current, 1);
  const pct = Math.min(current / maxRef, 1);
  const fillWidth = useSharedValue(0);

  useEffect(() => {
    fillWidth.value = withTiming(pct, { duration: 600, easing: Easing.out(Easing.cubic) });
  }, [pct]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${fillWidth.value * 100}%` as `${number}%`,
    backgroundColor:
      statut === "rupture" || statut === "critique"
        ? Colors.danger
        : statut === "faible"
          ? Colors.warning
          : Colors.success,
  }));

  return (
    <View style={styles.miniBarBg}>
      <Animated.View style={[styles.miniBarFill, barStyle]} />
    </View>
  );
}

function StatutIcon({ statut }: { statut: StockStatut }) {
  if (statut === "ok") return <Text style={styles.statutEmoji}>✅</Text>;
  if (statut === "faible") return <Text style={styles.statutEmoji}>⚠️</Text>;
  return <Text style={styles.statutEmoji}>🔴</Text>;
}

function AlertBadge({ count, onPress }: { count: number; onPress: () => void }) {
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (count > 0) {
      translateX.value = withSequence(
        withTiming(-4, { duration: 60 }),
        withRepeat(
          withSequence(withTiming(4, { duration: 60 }), withTiming(-4, { duration: 60 })),
          3,
          true
        ),
        withTiming(0, { duration: 60 })
      );
    }
  }, [count]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  if (count === 0) return null;

  return (
    <Animated.View style={shakeStyle}>
      <TouchableOpacity style={styles.alertBadge} onPress={onPress} activeOpacity={0.8}>
        <AlertTriangle size={13} color={Colors.warningText} strokeWidth={2.5} />
        <Text style={styles.alertBadgeText}>
          {count} produit{count > 1 ? "s" : ""} ⚠️
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function CatalogPreview() {
  const router = useRouter();
  const produits = useStockStore((s) => s.produits);
  const loadProduits = useStockStore((s) => s.loadProduits);

  useFocusEffect(
    useCallback(() => {
      loadProduits();
    }, [loadProduits])
  );

  const miniProduits: MiniProduit[] = produits
    .map((p) => ({
      id: p.id,
      nom: p.nom,
      stockActuel: p.stockActuel,
      stockMin: p.stockMin,
      statut: deriverStatut(p.stockActuel, p.stockMin),
    }))
    .sort((a, b) => PRIORITY[a.statut] - PRIORITY[b.statut])
    .slice(0, 3);

  const alertesCount = produits.filter((p) => p.stockActuel <= p.stockMin).length;

  const handleGoToCatalogue = () => {
    router.push("/(drawer)/(tabs)/produits/catalogue");
  };

  if (produits.length === 0) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={handleGoToCatalogue}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Package size={15} color={Colors.textSecondary} strokeWidth={2} />
          <Text style={styles.headerLabel}>CATALOGUE</Text>
          <View style={styles.headerCountPill}>
            <AnimatedCounter target={produits.length} />
            <Text style={styles.headerCountSuffix}> produits</Text>
          </View>
        </View>
        <ChevronRight size={16} color={Colors.textTertiary} />
      </TouchableOpacity>

      <View style={styles.miniCardsRow}>
        {miniProduits.map((p, idx) => (
          <Animated.View
            key={p.id}
            entering={FadeInUp.delay(idx * 60).springify()}
            style={styles.miniCard}
          >
            <Pressable
              onPress={() => router.push(`/(drawer)/(tabs)/produits/${p.id}`)}
              style={({ pressed }) => [
                styles.miniCardInner,
                pressed && styles.miniCardPressed,
              ]}
            >
              <View style={styles.miniCardHeader}>
                <StatutIcon statut={p.statut} />
                <Text style={styles.miniCardName} numberOfLines={1}>
                  {p.nom}
                </Text>
              </View>
              <Text style={styles.miniCardStock}>{p.stockActuel} en stock</Text>
              <MiniStockBar current={p.stockActuel} min={p.stockMin} statut={p.statut} />
            </Pressable>
          </Animated.View>
        ))}
      </View>

      <View style={styles.footer}>
        <AlertBadge count={alertesCount} onPress={handleGoToCatalogue} />
        <TouchableOpacity
          onPress={handleGoToCatalogue}
          style={styles.voirToutBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.voirToutText}>Voir le catalogue →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerLabel: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 11,
    color: Colors.textSecondary,
    letterSpacing: 1.2,
  },
  headerCountPill: {
    flexDirection: "row",
    alignItems: "baseline",
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  counterValue: {
    fontFamily: FontFamily.display,
    fontSize: 13,
    color: Colors.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  headerCountSuffix: {
    fontFamily: FontFamily.content,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  miniCardsRow: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
  },
  miniCard: {
    flex: 1,
  },
  miniCardInner: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 10,
    gap: 4,
  },
  miniCardPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
  miniCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  statutEmoji: {
    fontSize: 11,
  },
  miniCardName: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 11,
    color: Colors.textPrimary,
    flex: 1,
  },
  miniCardStock: {
    fontFamily: FontFamily.content,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  miniBarBg: {
    height: 4,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 4,
  },
  miniBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  alertBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.warningLight,
    borderWidth: 1,
    borderColor: Colors.warningBorder,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  alertBadgeText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 11,
    color: Colors.warningText,
  },
  voirToutBtn: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  voirToutText: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
