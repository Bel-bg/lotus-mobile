import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const VISIBLE_TABS = ["index", "stock/index", "bilan/index", "move/index"] as const;

const imageIcons = {
  home: require("@/assets/icons/home.png"),
  stock: require("@/assets/icons/stock.png"),
  bilan: require("@/assets/icons/bilan.png"),
  move: require("@/assets/icons/move.png"),
  add: require("@/assets/icons/add.png"),
};

export default function TabsBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const currentRoute = state.routes[state.index].name;
  const visibleRoutes = state.routes.filter((route) =>
    VISIBLE_TABS.includes(route.name as (typeof VISIBLE_TABS)[number])
  );
  
  // Masquer la barre d’onglets sur les écrans de vente et de profil
  if (currentRoute.startsWith("ventes/") || currentRoute === "profil/index") {
    return null;
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 20 }]}>
      <View style={styles.content}>
        
        <View style={styles.tabGroup}>
          {visibleRoutes.slice(0, 2).map((route) => {
            const routeIndex = state.routes.findIndex(
              (stateRoute) => stateRoute.key === route.key
            );
            const isFocused = state.index === routeIndex;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={[styles.tabItem, isFocused && styles.tabItemActive]}
                activeOpacity={0.7}
              >
                <Image
                  source={route.name === "index" ? imageIcons.home : imageIcons.stock}
                  style={[styles.tabIcon, { tintColor: isFocused ? "#000" : "#999" }]}
                />
                <Text style={[styles.tabLabel, { color: isFocused ? "#000" : "#999" }]}>
                  {route.name === "index" ? "HOME" : "STOCK"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.centerSpace} />

        <View style={styles.tabGroup}>
          {visibleRoutes.slice(2, 4).map((route) => {
            const routeIndex = state.routes.findIndex(
              (stateRoute) => stateRoute.key === route.key
            );
            const isFocused = state.index === routeIndex;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={[styles.tabItem, isFocused && styles.tabItemActive]}
                activeOpacity={0.7}
              >
                <Image
                  source={route.name === "bilan/index" ? imageIcons.bilan : imageIcons.move}
                  style={[styles.tabIcon, { tintColor: isFocused ? "#000" : "#999" }]}
                />
                <Text style={[styles.tabLabel, { color: isFocused ? "#000" : "#999" }]}>
                  {route.name === "bilan/index" ? "BILAN" : "MOUV."}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Floating Center Button */}
      <TouchableOpacity 
        style={[styles.centerButton, { bottom: (insets.bottom || 20) + 20 }]} 
        activeOpacity={0.8}
        onPress={() => router.push("/(drawer)/(tabs)/ventes/nouvelle")}
      >
        <Image source={imageIcons.add} style={styles.addIcon} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#FFF",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tabGroup: {
    flexDirection: "row",
    flex: 2,
    justifyContent: "space-around",
    alignItems: "center",
  },
  centerSpace: {
    flex: 1,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 70,
  },
  tabItemActive: {
    backgroundColor: "#F4F4F4",
    borderRadius: 14,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: 4,
    letterSpacing: 0.5,
  },
  centerButton: {
    position: "absolute",
    left: width / 2 - 30,
    top: -20,
    width: 60,
    height: 60,
    backgroundColor: "#000",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  tabIcon: {
    width: 22,
    height: 22,
    resizeMode: "contain",
  },
  addIcon: {
    width: 30,
    height: 30,
    tintColor: "#FFF",
    resizeMode: "contain",
  },
});
