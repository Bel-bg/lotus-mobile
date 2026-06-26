import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import React, { useEffect } from "react";
import {
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUiStore } from "@/contexts/useUiStore";

const { width } = Dimensions.get("window");

const VISIBLE_TABS = [
  "index",
  "analytics/index",
  "bilan/index",
  "move/index",
] as const;

const imageIcons = {
  home: require("@/assets/icons/home.png"),
  analytics: require("@/assets/icons/analyses.png"),
  bilan: require("@/assets/icons/bilan.png"),
  move: require("@/assets/icons/move.png"),
  add: require("@/assets/icons/addd.png"),
};

const TAB_LABELS: Record<string, string> = {
  index: "ACCUEIL",
  "analytics/index": "ANALYSES",
  "bilan/index": "BILAN",
  "move/index": "ACTIVITÉS",
};

const TAB_ICONS: Record<string, any> = {
  index: imageIcons.home,
  "analytics/index": imageIcons.analytics,
  "bilan/index": imageIcons.bilan,
  "move/index": imageIcons.move,
};

const H_PADDING = 16; // paddingHorizontal du wrapper
const CENTER_SPACE = 70; // largeur du trou central
const CONTENT_PADDING = 10; // paddingHorizontal du content interne
const USABLE = width - H_PADDING * 2; // largeur du floatingContainer
const GROUPS_WIDTH = USABLE - CENTER_SPACE - CONTENT_PADDING * 2;
const TAB_WIDTH = GROUPS_WIDTH / 4; // 4 tabs au total

const SPRING_CONFIG = {
  damping: 18,
  stiffness: 220,
  mass: 0.7,
};

export default function TabsBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const currentRoute = state.routes[state.index].name;

  const visibleRoutes = state.routes.filter((route: { name: string }) =>
    VISIBLE_TABS.includes(route.name as (typeof VISIBLE_TABS)[number]),
  );

  const hideTabBar =
    currentRoute.startsWith("ventes/") ||
    currentRoute === "profil/index" ||
    currentRoute === "produits" ||
    currentRoute.includes("produits/");
const isAdCarouselActive = useUiStore((s) => s.isAdCarouselActive);

if (hideTabBar || isAdCarouselActive) return null;y
  // Index actif parmi les 4 tabs visibles
  const activeVisibleIndex = visibleRoutes.findIndex(
    (r: { key: any }) => r.key === state.routes[state.index]?.key,
  );

  const pillX = useSharedValue(0);

  // Calcule le X de la pill selon l'index actif
  function getPillX(idx: number): number {
    // Largeur d'un groupe = moitié de GROUPS_WIDTH
    const GROUP_W = GROUPS_WIDTH / 2;
    // Position locale dans le groupe (0 ou 1)
    const localIdx = idx % 2;
    // Offset du groupe : droit démarre après groupe gauche + centerSpace
    const groupStart = idx >= 2 ? GROUP_W + CENTER_SPACE : 0;
    return CONTENT_PADDING + groupStart + localIdx * TAB_WIDTH;
  }

  useEffect(() => {
    if (activeVisibleIndex >= 0) {
      pillX.value = withSpring(getPillX(activeVisibleIndex), SPRING_CONFIG);
    }
  }, [activeVisibleIndex]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
  }));

  if (hideTabBar) return null;

  return (
    // Wrapper positionné en absolute tout en bas
    <View
      style={[
        styles.wrapper,
        { paddingBottom: insets.bottom ? insets.bottom + 8 : 20 },
      ]}
      pointerEvents="box-none"
    >
      {/* ── TabBar flottant ── */}
      <View style={styles.floatingContainer}>
        {/* Glassmorphisme expo-blur */}
        <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />

        {/* Surcouche blanche semi-transparente pour renforcer le glass */}
        <View style={styles.glassOverlay} />

        {/* Border glass top */}
        <View style={styles.glassBorder} pointerEvents="none" />

        {/* Pill animée */}
        <Animated.View style={[styles.pill, pillStyle]} />

        {/* Tabs */}
        <View style={styles.content}>
          {/* Groupe gauche */}
          <View style={styles.tabGroup}>
            {visibleRoutes
              .slice(0, 2)
              .map(
                (route: {
                  key: React.Key | null | undefined;
                  name: string | number;
                }) => {
                  const routeIndex = state.routes.findIndex(
                    (s: { key: React.Key | null | undefined }) =>
                      s.key === route.key,
                  );
                  const isFocused = state.index === routeIndex;

                  const onPress = () => {
                    const event = navigation.emit({
                      type: "tabPress",
                      target: route.key,
                      canPreventDefault: true,
                    });
                    if (!isFocused && !event.defaultPrevented) {
                      navigation.navigate(route.name as string, {
                        screen: route.name,
                      });
                    }
                  };

                  return (
                    <TouchableOpacity
                      key={route.key}
                      onPress={onPress}
                      style={[styles.tabItem, { width: TAB_WIDTH }]}
                      activeOpacity={0.7}
                    >
                      <Image
                        source={TAB_ICONS[route.name]}
                        style={[
                          styles.tabIcon,
                          { tintColor: isFocused ? "#0A0A0A" : "#AAAAAA" },
                        ]}
                      />
                      <Text
                        style={[
                          styles.tabLabel,
                          { color: isFocused ? "#0A0A0A" : "#AAAAAA" },
                        ]}
                      >
                        {TAB_LABELS[route.name]}
                      </Text>
                    </TouchableOpacity>
                  );
                },
              )}
          </View>

          {/* Trou central pour le bouton flottant */}
          <View style={styles.centerSpace} />

          {/* Groupe droit */}
          <View style={styles.tabGroup}>
            {visibleRoutes
              .slice(2, 4)
              .map(
                (route: {
                  key: React.Key | null | undefined;
                  name: string | number;
                }) => {
                  const routeIndex = state.routes.findIndex(
                    (s: { key: React.Key | null | undefined }) =>
                      s.key === route.key,
                  );
                  const isFocused = state.index === routeIndex;

                  const onPress = () => {
                    const event = navigation.emit({
                      type: "tabPress",
                      target: route.key,
                      canPreventDefault: true,
                    });
                    if (!isFocused && !event.defaultPrevented) {
                      navigation.navigate(route.name as string, {
                        screen: route.name,
                      });
                    }
                  };

                  return (
                    <TouchableOpacity
                      key={route.key}
                      onPress={onPress}
                      style={[styles.tabItem, { width: TAB_WIDTH }]}
                      activeOpacity={0.7}
                    >
                      <Image
                        source={TAB_ICONS[route.name]}
                        style={[
                          styles.tabIcon,
                          { tintColor: isFocused ? "#0A0A0A" : "#AAAAAA" },
                        ]}
                      />
                      <Text
                        style={[
                          styles.tabLabel,
                          { color: isFocused ? "#0A0A0A" : "#AAAAAA" },
                        ]}
                      >
                        {TAB_LABELS[route.name]}
                      </Text>
                    </TouchableOpacity>
                  );
                },
              )}
          </View>
        </View>
      </View>

      {/* ── Bouton central flottant ── */}
      <TouchableOpacity
        style={styles.centerButton}
        activeOpacity={0.85}
        onPress={() => router.push("/(drawer)/(tabs)/ventes/nouvelle")}
      >
        <Image source={imageIcons.add} style={styles.addIcon} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
wrapper: {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  paddingHorizontal: H_PADDING,
  paddingTop: 8,
  alignItems: "center",
  zIndex: 1,
},
  floatingContainer: {
    width: "100%",
    borderRadius: 26,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  glassOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  glassBorder: {
    ...StyleSheet.absoluteFill,
    borderRadius: 26,
    borderWidth: 0.8,
    borderColor: "rgba(255,255,255,0.8)",
    zIndex: 10,
  },
  pill: {
    position: "absolute",
    top: 6,
    left: 0,
    width: TAB_WIDTH - 4,
    height: 50,
    backgroundColor: "rgba(0,0,0,0.07)",
    borderRadius: 16,
    zIndex: 5,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: CONTENT_PADDING,
    paddingVertical: 8,
    zIndex: 6,
  },
  tabGroup: {
    flexDirection: "row",
    flex: 2,
    justifyContent: "space-around",
  },
  centerSpace: {
    width: CENTER_SPACE,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: "700",
    marginTop: 4,
    letterSpacing: 0.8,
  },
  tabIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  centerButton: {
    position: "absolute",
    top: 22,
    width: 50,
    height: 35,
    backgroundColor: "#0A0A0A",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 14,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  addIcon: {
    width: 20,
    height: 20,
    tintColor: "#FFF",
    resizeMode: "contain",
  },
});
