import React from 'react';
import { Tabs } from 'expo-router';
import TabsBar from '@/components/customs/TabsBar';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  useSharedValue,
  withSpring,
  useDerivedValue,
} from 'react-native-reanimated';
import { DrawerProgressContext } from 'react-native-drawer-layout';
import { Platform, StyleSheet, View } from 'react-native';

// Spring config qui mime le ressenti natif iOS/Android
const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
  mass: 0.8,
  overshootClamping: false,
};

export default function TabsLayout() {
  const fallback = useSharedValue(0);
  const drawerProgress = React.useContext(DrawerProgressContext);
  const rawProgress = drawerProgress ?? fallback;

  // On passe le progress brut dans un spring pour adoucir les variations
  const smoothProgress = useDerivedValue(() =>
    withSpring(rawProgress.value, SPRING_CONFIG)
  );

  const animatedStyle = useAnimatedStyle(() => {
    const p = smoothProgress.value;

    // Scale : 1 → 0.88 (légèrement moins agressif que 0.85)
    const scale = interpolate(p, [0, 1], [1, 0.88], Extrapolation.CLAMP);

    // Border radius : 0 → 28
    const borderRadius = interpolate(p, [0, 1], [0, 28], Extrapolation.CLAMP);

    // Décalage vertical subtil (descend légèrement quand ouvert)
    const translateY = interpolate(p, [0, 1], [0, 8], Extrapolation.CLAMP);

    // Ombre progressive — iOS uniquement (Android gère ça via elevation)
    const shadowOpacity = interpolate(p, [0, 1], [0, 0.25], Extrapolation.CLAMP);
    const shadowRadius = interpolate(p, [0, 1], [0, 20], Extrapolation.CLAMP);
    const elevation = interpolate(p, [0, 1], [0, 12], Extrapolation.CLAMP);

    return {
      transform: [{ scale }, { translateY }],
      borderRadius,
      overflow: 'hidden',
      // Ombre native selon la plateforme
      ...(Platform.OS === 'ios'
        ? {
            shadowColor: '#000',
            shadowOffset: { width: -4, height: 0 },
            shadowOpacity,
            shadowRadius,
          }
        : { elevation }),
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.animatedWrapper, animatedStyle]}>
        <Tabs
          tabBar={(props) => <TabsBar {...props} />}
          screenOptions={{
            headerShown: false,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{ title: 'HOME' }}
          />
          <Tabs.Screen
            name="analytics/index"
            options={{ title: 'STOCK' }}
          />
          <Tabs.Screen
            name="bilan/index"
            options={{ title: 'BILAN' }}
          />
          <Tabs.Screen
            name="move/index"
            options={{ title: 'MOUVEMENTS' }}
          />
          <Tabs.Screen
            name="produits"
            options={{ href: null }}
          />
        </Tabs>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  animatedWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
