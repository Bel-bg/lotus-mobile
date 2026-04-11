// ============================================
// LOTUS BUSINESS — Composant : TopBar
// ============================================

import { Image, StyleSheet, Text, View } from "react-native";

interface TopBarProps {
  showLogo?: boolean;
}

export default function TopBar({ showLogo = true }: TopBarProps) {
  return (
    <View style={styles.container}>
      {showLogo && (
        <Image
          source={require("../../../assets/images/logo-black.png")}
          style={{ width: 30, height: 30 }}
        />
      )}
      <Text style={styles.appName}>Lotus</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0A0A0A",
    letterSpacing: 1.5,
  },
});
