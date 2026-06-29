import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, Image } from 'react-native';
import { CheckCircle2, WifiOff, AlertCircle, X } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useRouter, useLocalSearchParams } from 'expo-router';

type PrintStatus = 'success' | 'disconnected' | 'failed';

const STATUS_CONFIG = {
  success: {
    icon: CheckCircle2,
    iconColor: '#16A34A',
    iconBg: '#DCFCE7',
    title: 'Impression réussie',
    subtitle: 'La facture a été imprimée avec succès.',
  },
  disconnected: {
    icon: WifiOff,
    iconColor: '#D97706',
    iconBg: '#FEF3C7',
    title: 'Imprimante non connectée',
    subtitle: 'Vérifiez la connexion Bluetooth ou Wi-Fi\nde votre imprimante.',
  },
  failed: {
    icon: AlertCircle,
    iconColor: '#DC2626',
    iconBg: '#FEE2E2',
    title: 'Impression échouée',
    subtitle: 'Une erreur est survenue. Réessayez\nou vérifiez votre imprimante.',
  },
};

export default function FactureGeneratedScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<PrintStatus>('success');

  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(drawer)/(tabs)')} style={styles.closeButton}>
          <X size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lotus Business</Text>
        <View style={{ width: 38 }} />
      </View>

      <View style={styles.content}>
        {/* Icône statut */}
        <View style={{paddingTop: -50, marginBottom: 50}}>
        <Image source={require("@/assets/images/sucess.png")} style={{width: 150, height: 150, alignSelf: "center"}} />
        </View>
        {/* <View style={[styles.iconBg, { backgroundColor: cfg.iconBg }]}>
          <Icon size={48} color={cfg.iconColor} strokeWidth={2} />
        </View> */}

        <Text style={styles.title}>{cfg.title}</Text>
        <Text style={styles.subtitle}>{cfg.subtitle}</Text>

        {/* Bouton principal contextuel */}
        {status === 'success' ? (
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => router.replace('/(drawer)/(tabs)')}
          >
            <Text style={styles.primaryBtnText}>Terminer</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => setStatus('success')} // ← remplace par ton appel d'impression réel
          >
            <Text style={styles.primaryBtnText}>Réessayer</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.secondaryBtn}
          activeOpacity={0.7}
          onPress={() => router.replace('/(drawer)/(tabs)')}
        >
          <Text style={styles.secondaryBtnText}>
            {status === 'success' ? "Retour à l\'accueil" : "Ignorer et fermer"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sélecteur de statut — DEV ONLY, retire en prod */}
      {/* {__DEV__ && (
        <View style={styles.devSwitcher}>
          {(['success', 'disconnected', 'failed'] as PrintStatus[]).map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.devBtn, status === s && styles.devBtnActive]}
              onPress={() => setStatus(s)}
            >
              <Text style={[styles.devBtnText, status === s && styles.devBtnTextActive]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )} */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  closeButton: { padding: 6 },
  headerTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.textPrimary,
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
  },
  primaryBtn: {
    backgroundColor: '#111',
    width: '100%',
    height: 54,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: '#fff',
  },
  secondaryBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },

  /* DEV switcher */
  devSwitcher: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 32,
  },
  devBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  devBtnActive: {
    backgroundColor: '#111',
    borderColor: '#111',
  },
  devBtnText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  devBtnTextActive: {
    color: '#fff',
  },
});