// ============================================
// LOTUS BUSINESS — Composant : TopBar
// ============================================

import { StyleSheet, Text } from "react-native";
import { Image } from "expo-image";
import Animated, { FadeIn } from "react-native-reanimated";

interface TopBarProps {
  showLogo?: boolean;
}

export default function TopBar({ showLogo = true }: TopBarProps) {
  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      {showLogo && (
        <Image
          source={require("../../../assets/images/logo-black.png")}
          style={{ width: 32, height: 32 }}
          contentFit="contain"
        />
      )}
      <Text style={styles.appName}>Lotus</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  appName: {
    fontSize: 26,
    fontWeight: "900",
    color: "#0A0A0A",
    letterSpacing: 1.5,
  },
});
