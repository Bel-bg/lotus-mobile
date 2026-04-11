// ============================================
// LOTUS BUSINESS — Écran : Permissions
// ============================================

import { useRouter } from 'expo-router'
import { StatusBar, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import TopBar from '../../components/customs/TopBar'
import PermissionItem from '../../components/PermissionItem'
import PrimaryButton from '../../components/PrimaryButton'

import { Bell, Folder, Cloud, Shield } from 'lucide-react-native'

const PERMISSIONS = [
  {
    icon: Bell,
    title: 'Notifications',
    subtitle: "ALERTES D'INVENTAIRE",
    type: 'required' as const,
  },
  {
    icon: Folder,
    title: 'Stockage',
    subtitle: 'IMAGES PRODUITS',
    type: 'required' as const,
  },
  {
    icon: Cloud,
    title: 'Google Drive',
    subtitle: 'SAUVEGARDE CLOUD',
    type: 'optional' as const,
  },
]

export default function PermissionsScreen() {
  const router = useRouter()

  const handleAuthorize = async () => {
    // TODO: Demander les permissions réelles via expo-notifications + expo-file-system
    router.replace('/(auth)/setup-finish')
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <TopBar />

      <View style={styles.container}>

        {/* Zone centrale */}
        <View style={styles.centerBlock}>

          {/* Icône bouclier */}
          <View style={styles.shieldContainer}>
            <Shield color="#0A0A0A" size={28} strokeWidth={2.5} />
          </View>

          <Text style={styles.title}>Autorisations requises</Text>
          <Text style={styles.subtitle}>
            Pour offrir une expérience de gestion optimale,
            BoutiqueApp nécessite les accès suivants.
          </Text>

          {/* Liste permissions */}
          <View style={styles.permissionsList}>
            {PERMISSIONS.map((permission, i) => (
              <PermissionItem key={i} {...permission} />
            ))}
          </View>

          {/* Notice confidentialité */}
          <Text style={styles.privacy}>
            Vos données sont chiffrées et ne sont jamais partagées.{'\n'}
            Consultez notre{' '}
            <Text style={styles.privacyLink}>Politique de Confidentialité</Text>.
          </Text>

        </View>

        {/* Bouton */}
        <PrimaryButton
          label="Autoriser et continuer"
          onPress={handleAuthorize}
        />

      </View>
    </SafeAreaView>
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
    justifyContent: 'space-between',
  },
  centerBlock: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 24,
    gap: 16,
  },
  shieldContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  shieldIcon: {
    fontSize: 26,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0A0A0A',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 8,
  },
  permissionsList: {
    width: '100%',
    gap: 10,
    marginTop: 8,
  },
  privacy: {
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  privacyLink: {
    color: '#0A0A0A',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
})
