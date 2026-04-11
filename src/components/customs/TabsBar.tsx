import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import { BarChart3, Box, Cloudy, Home, Plus } from "lucide-react-native";
import React from "react";
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const VISIBLE_TABS = ["index", "stock/index", "bilan/index", "sauvegarde"] as const;

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
                {route.name === "index" ? (
                  <Home size={22} color={isFocused ? "#000" : "#999"} strokeWidth={2} />
                ) : (
                  <Box size={22} color={isFocused ? "#000" : "#999"} strokeWidth={2} />
                )}
                <Text style={[styles.tabLabel, { color: isFocused ? "#000" : "#999" }]}>
                  {route.name === "index" ? "HOME" : "STOCK"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Center Button Placeholder Spacing */}
        <View style={styles.centerSpace} />

        {/* Right Tabs */}
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
                {route.name === "bilan/index" ? (
                  <BarChart3 size={22} color={isFocused ? "#000" : "#999"} strokeWidth={2} />
                ) : (
                  <Cloudy size={22} color={isFocused ? "#000" : "#999"} strokeWidth={2} />
                )}
                <Text style={[styles.tabLabel, { color: isFocused ? "#000" : "#999" }]}>
                  {route.name === "bilan/index" ? "BILAN" : "Sauvegardes"}
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
        <Plus size={30} color="#FFF" strokeWidth={2.5} />
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
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
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
    top: -25,
    width: 60,
    height: 60,
    backgroundColor: "#000",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
});
