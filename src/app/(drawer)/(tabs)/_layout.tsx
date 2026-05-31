import React from 'react';
import { Tabs } from 'expo-router';
import TabsBar from '@/components/customs/TabsBar';
import Animated, { 
  useAnimatedStyle, 
  interpolate, 
  Extrapolation 
} from 'react-native-reanimated';
import { useDrawerProgress } from '@react-navigation/drawer';
import { StyleSheet, View } from 'react-native';

export default function TabsLayout() {
  const progress = useDrawerProgress();

  const animatedStyle = useAnimatedStyle(() => {
    // Échelle : de 1 (fermé) à 0.85 (ouvert)
    const scale = interpolate(progress.value, [0, 1], [1, 0.85], Extrapolation.CLAMP);
    
    // Border Radius : de 0 à 32
    const borderRadius = interpolate(progress.value, [0, 1], [0, 32], Extrapolation.CLAMP);

    return {
      transform: [
        { scale }
      ],
      borderRadius,
      overflow: 'hidden',
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
            options={{
              title: 'HOME',
            }}
          />
          <Tabs.Screen
            name="stock/index"
            options={{
              title: 'STOCK',
            }}
          />
          <Tabs.Screen
            name="bilan/index"
            options={{
              title: 'BILAN',
            }}
          />
          <Tabs.Screen
            name="move/index"
            options={{
              title: 'MOUVEMENTS',
            }}
          />
          <Tabs.Screen
            name="produits"
            options={{
              href: null,
            }}
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
