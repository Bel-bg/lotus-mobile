import DrawerContent from '@/components/customs/Drawer';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { Platform } from 'react-native';

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        // 'slide' déplace le contenu ET le drawer ensemble — effet natif
        drawerType: 'slide',
        // Pas d'overlay sombre : le scale + shadow du contenu suffit
        overlayColor: 'transparent',
        // Fond transparent pour que le scale de (tabs)/_layout soit visible
        sceneStyle: { backgroundColor: 'transparent' },
        drawerStyle: {
          width: '65%',
          backgroundColor: 'transparent',
        },
        // Vélocité minimum du swipe pour déclencher l'ouverture (valeur par défaut : 0.5)
        swipeMinVelocity: 1,
        // Zone de détection du swipe depuis le bord gauche (px)
        swipeEdgeWidth: Platform.OS === 'ios' ? 60 : 40,
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{ title: 'Main App' }}
      />
      <Drawer.Screen
        name="alertes-stock"
        options={{ title: 'Alertes stock' }}
      />
      <Drawer.Screen
        name="historique-bilans"
        options={{ title: 'Historique des bilans' }}
      />
      <Drawer.Screen
        name="documents"
        options={{ title: 'Exports et PDF' }}
      />
      <Drawer.Screen
        name="premium"
        options={{
          title: 'Premium',
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="aide"
        options={{ title: 'Aide' }}
      />
      <Drawer.Screen
        name="notifications"
        options={{ title: 'Notifications' }}
      />
    </Drawer>
  );
}
