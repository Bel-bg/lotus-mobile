// ============================================
// LOTUS BUSINESS — Écran : Setup Terminé
// ============================================

import { useRouter } from 'expo-router'
import { Check } from 'lucide-react-native'
import React from 'react'
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../constants/colors'
import { FontFamily, TextStyles } from '../../constants/typography'
import TopBar from '../../components/customs/TopBar'
import PrimaryButton from '../../components/PrimaryButton'
import { useAuthStore } from '../../store/useAuthStore'

export default function SetupFinishScreen() {
  const router = useRouter()
  const boutique = useAuthStore((state) => state.boutique)
  const boutiqueNom = boutique?.nom || 'Boutique Adjoua'

  const handleStart = () => {
    router.replace('/(drawer)/(tabs)')
  }

  return (
    <SafeAreaView style={styles.safeArea} >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <TopBar />

      <ScrollView style={styles.container}  contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        
        {/* Zone centrale */}
        <View style={styles.centerBlock}>
          <View style={styles.checkMarkContainer}>
            <Image source={require('@/assets/images/sucess.png')} style={styles.checkMark} resizeMode="contain" />
          </View>

          <Text style={styles.title}>Tout est prêt !</Text>
          <Text style={styles.subtitle}>
            Votre boutique <Text style={styles.boldText}>'{boutiqueNom}'</Text> est configurée. 
            Vous pouvez maintenant commencer à gérer vos stocks et vos ventes.
          </Text>

          {/* Liste des fonctionnalités */}
          <View style={styles.featureList}>
            <FeatureItem label="GESTION D'INVENTAIRE ACTIVÉE" />
            <FeatureItem label="RAPPORTS JOURNALIERS AUTOMATISÉS" />
            <FeatureItem label="SAUVEGARDE GOOGLE DRIVE CONNECTÉE" />
          </View>
        </View>

        {/* Bouton d'action et Aide */}
        <View style={styles.footer}>
          <PrimaryButton 
            label="Commencer à utiliser Lotus Business" 
            onPress={handleStart} 
          />
          
          <TouchableOpacity activeOpacity={0.7} style={styles.helpLink}>
            <Text style={styles.helpText}>
              Besoin d'aide ? <Text style={styles.underlineText}>Consultez notre guide rapide</Text>
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

function FeatureItem({ label }: { label: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureCheckContainer}>
        <Check color="#0A0A0A" size={14} strokeWidth={3} />
      </View>
      <Text style={styles.featureLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  centerBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  checkMarkContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  checkMark: {
    width: 150,
    height: 150,
  },
  title: {
    ...TextStyles.h1,
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    ...TextStyles.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  boldText: {
    fontFamily: FontFamily.semiBold,
    color: Colors.textPrimary,
  },
  featureList: {
    width: '100%',
    gap: 12,
    paddingBottom: 50,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  featureCheckContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureLabel: {
    ...TextStyles.label,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
    gap: 20,
  },
  helpLink: {
    paddingVertical: 4,
  },
  helpText: {
    ...TextStyles.bodySm,
    color: Colors.textSecondary,
  },
  underlineText: {
    textDecorationLine: 'underline',
    color: Colors.textPrimary,
    fontFamily: FontFamily.medium,
  },
})