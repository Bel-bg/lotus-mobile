import DrawerContent from '@/components/customs/Drawer';
import { Drawer } from 'expo-router/drawer';
import React from 'react';

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        drawerStyle: {
          width: '80%',
          backgroundColor: '#FFFFFF',
        },
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: 'Main App',
        }}
      />
      <Drawer.Screen
        name="historique-ventes"
        options={{
          title: 'Historique des ventes',
        }}
      />
      <Drawer.Screen
        name="alertes-stock"
        options={{
          title: 'Alertes stock',
        }}
      />
      <Drawer.Screen
        name="historique-bilans"
        options={{
          title: 'Historique des bilans',
        }}
      />
      <Drawer.Screen
        name="documents"
        options={{
          title: 'Exports et PDF',
        }}
      />
      <Drawer.Screen
        name="premium"
        options={{
          title: 'Premium',
          drawerItemStyle: {
            display: 'none',
          },
        }}
      />
      <Drawer.Screen
        name="aide"
        options={{
          title: 'Aide',
        }}
      />
      <Drawer.Screen
        name="notifications"
        options={{
          title: 'Notifications',
        }}
      />
    </Drawer>
  );
}
