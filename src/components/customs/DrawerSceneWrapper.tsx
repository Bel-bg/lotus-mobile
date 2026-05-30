import { useDrawerProgress } from '@react-navigation/drawer';
import React from 'react';
import { Platform, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';

export function DrawerSceneWrapper({ children }: { children: React.ReactNode }) {
  const progress = useDrawerProgress();
  const { width } = useWindowDimensions();

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 1], [1, 0.85]);
    const borderRadius = interpolate(progress.value, [0, 1], [0, 30]);
    

    return {
      transform: [{ scale }],
      borderRadius,
      overflow: 'hidden',
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
