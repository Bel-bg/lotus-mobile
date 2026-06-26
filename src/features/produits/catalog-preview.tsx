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
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  FadeInUp,
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

const PREVIEW_LIMIT = 20;

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = React.useState(0);

  useEffect(() => {
    if (target === 0) return;
    const steps = 24;
    const stepTime = 700 / steps;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + Math.ceil(target / steps), target);
      setCount(current);
      if (current >= target) clearInterval(timer);
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
    fillWidth.value = withSpring(pct, {
      damping: 18,
      stiffness: 120,
      mass: 0.8,
    });
  }, [pct]);

  const barColor =
    statut === "rupture" || statut === "critique"
      ? Colors.danger
      : statut === "faible"
        ? Colors.warning
        : Colors.success;

  const barStyle = useAnimatedStyle(() => ({
    width: `${fillWidth.value * 100}%` as `${number}%`,
  }));

  return (
    <View style={styles.miniBarBg}>
      <Animated.View
        style={[styles.miniBarFill, { backgroundColor: barColor }, barStyle]}
      />
    </View>
  );
}

function StatutIcon({ statut }: { statut: StockStatut }) {
  if (statut === "ok") return <Text style={styles.statutEmoji}>🟢</Text>;
  if (statut === "faible") return <Text style={styles.statutEmoji}>🟠</Text>;
  return <Text style={styles.statutEmoji}>🔴</Text>;
}

function AlertBadge({ count, onPress }: { count: number; onPress: () => void }) {
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (count > 0) {
      translateX.value = withSequence(
        withTiming(-4, { duration: 55 }),
        withRepeat(
          withSequence(
            withTiming(4, { duration: 55 }),
            withTiming(-4, { duration: 55 }),
          ),
          3,
          true,
        ),
        withTiming(0, { duration: 55 }),
      );
    }
  }, [count]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  if (count === 0) return null;

  return (
    <Animated.View style={shakeStyle}>
      <TouchableOpacity
        style={styles.alertBadge}
        onPress={onPress}
        activeOpacity={0.75}
      >
        <Text style={styles.alertBadgeText}>
          {count} produit{count > 1 ? "s" : ""}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

//  Card individuelle (1 des 2 colonnes) 
function ProduitCard({
  item,
  index,
  isLastRow,
  isRightCol,
}: {
  item: MiniProduit;
  index: number;
  isLastRow: boolean;
  isRightCol: boolean;
}) {
  const router = useRouter();

  return (
    <Animated.View
      style={styles.cardWrapper}
      entering={FadeInUp.delay(Math.min(index, 6) * 30)
        .springify()
        .damping(16)
        .stiffness(140)}
    >
      {/* Séparateur vertical central */}
      {isRightCol && <View style={styles.colDivider} />}

      <Pressable
        onPress={() => router.push(`/(drawer)/(tabs)/produits/${item.id}`)}
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
      >
        {/* Statut + stock */}
        <View style={styles.cardTopRow}>
          <StatutIcon statut={item.statut} />
          <Text style={styles.cardStock}>{item.stockActuel} en stock</Text>
        </View>

        {/* Nom */}
        <Text style={styles.cardName} numberOfLines={2}>
          {item.nom}
        </Text>

        {/* Barre */}
        <MiniStockBar
          current={item.stockActuel}
          min={item.stockMin}
          statut={item.statut}
        />
      </Pressable>

      {/* Séparateur horizontal bas (sauf dernière ligne) */}
      {!isLastRow && <View style={styles.rowDivider} />}
    </Animated.View>
  );
}

//  Composant principal 
export default function CatalogPreview() {
  const router = useRouter();
  const produits = useStockStore((s) => s.produits);
  const loadProduits = useStockStore((s) => s.loadProduits);

  useEffect(() => {
    loadProduits();
  }, [loadProduits]);

  const miniProduits: MiniProduit[] = produits
    .map((p) => ({
      id: p.id,
      nom: p.nom,
      stockActuel: p.stockActuel,
      stockMin: p.stockMin,
      statut: deriverStatut(p.stockActuel, p.stockMin),
    }))
    .sort((a, b) => PRIORITY[a.statut] - PRIORITY[b.statut])
    .slice(0, PREVIEW_LIMIT);

  const alertesCount = produits.filter((p) => p.stockActuel <= p.stockMin).length;
  const totalRows = Math.ceil(miniProduits.length / 2);

  const handleGoToCatalogue = () => {
    router.push("/(drawer)/(tabs)/produits/catalogue");
  };

  if (produits.length === 0) return null;

  return (
    <View style={styles.container}>
      {/*  Header  */}
      <TouchableOpacity
        style={styles.header}
        onPress={handleGoToCatalogue}
        activeOpacity={0.65}
      >
        <View style={styles.headerLeft}>
          <Package size={15} color={Colors.textSecondary} strokeWidth={2} />
          <Text style={styles.headerLabel}>CATALOGUE</Text>
         
        </View>
        <View style={styles.headerRight}>
           <View style={styles.headerCountPill}>
            <AnimatedCounter target={produits.length} />
            <Text style={styles.headerCountSuffix}> produits</Text>
          </View>
          <ChevronRight size={16} color={Colors.textTertiary} />
        </View>
      </TouchableOpacity>

      {/*  Séparateur header / grid  */}
      <View style={styles.divider} />

      {/*  Grid 2 colonnes  */}
      <FlatList
        data={miniProduits}
        keyExtractor={(item) => item.id}
        numColumns={2}
        scrollEnabled={false}
        renderItem={({ item, index }) => {
          const rowIndex = Math.floor(index / 2);
          const isLastRow = rowIndex === totalRows - 1;
          const isRightCol = index % 2 === 1;

          return (
            <ProduitCard
              item={item}
              index={index}
              isLastRow={isLastRow}
              isRightCol={isRightCol}
            />
          );
        }}
      />

      {/*  "N autres produits"  */}
      {produits.length > PREVIEW_LIMIT && (
        <>
          <View style={styles.divider} />
          <TouchableOpacity
            onPress={handleGoToCatalogue}
            activeOpacity={0.6}
            style={styles.moreHintWrapper}
          >
            <Text style={styles.moreHint}>
              + {produits.length - PREVIEW_LIMIT} autre
              {produits.length - PREVIEW_LIMIT > 1 ? "s" : ""} produit
              {produits.length - PREVIEW_LIMIT > 1 ? "s" : ""}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    backgroundColor: Colors.background,
    overflow: "hidden",
  },

  //  Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
    paddingHorizontal: 9,
    paddingVertical: 3,
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

  //  Séparateurs
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  // Trait vertical entre les 2 colonnes
  colDivider: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
  },
  // Trait horizontal en bas de chaque rangée (sauf dernière)
  rowDivider: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
  },

  //  Card wrapper (occupe 50% de la largeur)
  cardWrapper: {
    flex: 1,
    position: "relative",
  },

  //  Card pressable
  card: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  cardPressed: {
    opacity: 0.7,
    backgroundColor: Colors.surfaceAlt,
  },

  //  Contenu card
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statutEmoji: {
    fontSize: 11,
    lineHeight: 16,
  },
  cardStock: {
    fontFamily: FontFamily.content,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  cardName: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 18,
  },

  //  Bar
  miniBarBg: {
    height: 4,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 99,
    overflow: "hidden",
    marginTop: 2,
  },
  miniBarFill: {
    height: "100%",
    borderRadius: 99,
  },

  //  Alert badge
alertBadge: {
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
  backgroundColor: Colors.danger,
  borderRadius: 99,
  paddingHorizontal: 10,
  paddingVertical: 4,
},
alertBadgeText: {
  fontFamily: FontFamily.utilityBold,
  fontSize: 11,
  color: "#FFFFFF",
},

  //  More hint
  moreHintWrapper: {
    paddingVertical: 11,
    alignItems: "center",
  },
  moreHint: {
    fontFamily: FontFamily.content,
    fontSize: 12,
    color: Colors.textSecondary,
  },
});