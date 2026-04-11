import React from 'react';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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
    // Échelle : de 1 (fermé) à 0.82 (ouvert)
    const scale = interpolate(progress.value, [0, 1], [1, 0.82], Extrapolation.CLAMP);
    
    // Décalage vers le bas (translation Y)
    const translateY = interpolate(progress.value, [0, 1], [0, 40], Extrapolation.CLAMP);
    
    // Border Radius : de 0 à 32
    const borderRadius = interpolate(progress.value, [0, 1], [0, 32], Extrapolation.CLAMP);

    return {
      transform: [
        { scale }, 
        { translateY },
        { translateX: interpolate(progress.value, [0, 1], [0, -10], Extrapolation.CLAMP) } // Léger ajustement X
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
            name="sauvegarde"
            options={{
              title: 'PDF',
            }}
          />
          <Tabs.Screen
            name="profil/index"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="ventes/nouvelle"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="ventes/success"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="ventes/facture-generated"
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
    backgroundColor: '#F5F5F5',
  },
  animatedWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 10 },
    // shadowOpacity: 0.3,
    // shadowRadius: 20,
    // elevation: 10,
  },
});
