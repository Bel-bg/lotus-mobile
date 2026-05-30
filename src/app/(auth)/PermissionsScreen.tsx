// ============================================
// LOTUS BUSINESS — Écran : Permissions
// ============================================

import { useRouter } from 'expo-router'
import * as Notifications from 'expo-notifications'
import { useState } from 'react'
import { ActivityIndicator, StatusBar, StyleSheet, Text, View, PermissionsAndroid, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import PermissionItem, { PermissionStatus, PermissionType } from '../../components/PermissionItem'
import PrimaryButton from '../../components/PrimaryButton'
import { useAuthStore } from '../../store/useAuthStore'
import CustomAlert from '../../components/customs/Alert'
import { FontFamily } from '@/constants/typography'

import { Bell, Cloud, Shield, Bluetooth, Radio } from 'lucide-react-native'

interface PermissionConfig {
  id: string
  icon: any
  iconName: string
  title: string
  subtitle: string
  type: PermissionType
  color: string
  initialStatus: PermissionStatus
  alertTitle: string
  alertDescription: string
}

const PERMISSIONS: PermissionConfig[] = [
  {
    id: 'notifications',
    icon: Bell,
    iconName: 'Bell',
    title: 'Notifications',
    subtitle: "ALERTES D'INVENTAIRE",
    type: 'required',
    color: '#F44336', // Rouge
    initialStatus: 'pending',
    alertTitle: 'Activer les notifications',
    alertDescription: 'Soyez alerté en temps réel en cas de rupture de stock ou pour les mises à jour importantes.',
  },
  {
    id: 'bluetooth',
    icon: Bluetooth,
    iconName: 'Bluetooth',
    title: 'Bluetooth',
    subtitle: "CONNEXION MATÉRIEL",
    type: 'required',
    color: '#2196F3', // Bleu
    initialStatus: 'pending',
    alertTitle: 'Activer le Bluetooth',
    alertDescription: 'Nécessaire pour connecter rapidement vos imprimantes thermiques et autres équipements.',
  },
  {
    id: 'nearby',
    icon: Radio,
    iconName: 'Radio',
    title: 'Appareils à proximité',
    subtitle: "DÉTECTION IMPRIMANTE",
    type: 'required',
    color: '#FF9800', // Orange
    initialStatus: 'pending',
    alertTitle: 'Appareils à proximité',
    alertDescription: 'Permet à Lotus Business de détecter et communiquer avec votre matériel localement.',
  },
  {
    id: 'drive',
    icon: Cloud,
    iconName: 'Cloud',
    title: 'Google Drive',
    subtitle: "SAUVEGARDE CLOUD",
    type: 'optional',
    color: '#9C27B0', // Violet
    initialStatus: 'coming_soon',
    alertTitle: 'Google Drive',
    alertDescription: 'La sauvegarde automatique sur Google Drive sera bientôt disponible.',
  },
]

export default function PermissionsScreen() {
  const router = useRouter()
  const setOnboardingComplete = useAuthStore((s) => s.setOnboardingComplete)
  
  const [permissionsState, setPermissionsState] = useState<Record<string, PermissionStatus>>(
    PERMISSIONS.reduce((acc, perm) => ({ ...acc, [perm.id]: perm.initialStatus }), {})
  )
  const [selectedPermission, setSelectedPermission] = useState<PermissionConfig | null>(null)
  const [alertVisible, setAlertVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  const handlePermissionPress = (perm: PermissionConfig) => {
    setSelectedPermission(perm)
    setAlertVisible(true)
  }

  const requestNotificationPermission = async () => {
    try {
      const response = await Notifications.requestPermissionsAsync({
        android: {},
      }) as any; // Cast as any to fix TypeScript issue with expo-notifications types
      if (response.status === 'granted' || response.granted) {
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        })
        setPermissionsState(prev => ({ ...prev, notifications: 'granted' }))
      } else {
        setPermissionsState(prev => ({ ...prev, notifications: 'denied' }))
      }
    } catch (e) {
      console.warn('Permission notification error:', e)
    }
  }

  const requestBluetoothPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          {
            title: 'Permission Bluetooth',
            message: 'Lotus Business a besoin du Bluetooth pour connecter vos appareils.',
            buttonNeutral: 'Plus tard',
            buttonNegative: 'Annuler',
            buttonPositive: 'OK',
          }
        )
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setPermissionsState(prev => ({ ...prev, bluetooth: 'granted' }))
        } else {
          setPermissionsState(prev => ({ ...prev, bluetooth: 'denied' }))
        }
      } catch (err) {
        console.warn(err)
      }
    } else {
      setPermissionsState(prev => ({ ...prev, bluetooth: 'granted' }))
    }
  }

  const requestNearbyPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          {
            title: 'Appareils à proximité',
            message: 'Lotus Business a besoin de détecter les appareils proches.',
            buttonNeutral: 'Plus tard',
            buttonNegative: 'Annuler',
            buttonPositive: 'OK',
          }
        )
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setPermissionsState(prev => ({ ...prev, nearby: 'granted' }))
        } else {
          setPermissionsState(prev => ({ ...prev, nearby: 'denied' }))
        }
      } catch (err) {
        console.warn(err)
      }
    } else {
      setPermissionsState(prev => ({ ...prev, nearby: 'granted' }))
    }
  }

  const handleAuthorizeConfirm = async () => {
    if (!selectedPermission) return
    setAlertVisible(false)

    // Petite pause pour laisser l'alerte se fermer avant la pop-up système
    setTimeout(async () => {
      switch (selectedPermission.id) {
        case 'notifications':
          await requestNotificationPermission()
          break
        case 'bluetooth':
          await requestBluetoothPermission()
          break
        case 'nearby':
          await requestNearbyPermission()
          break
        default:
          break
      }
    }, 300)
  }

  const handleContinue = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setOnboardingComplete(true)
      router.replace('/(auth)/setup-finish')
    }, 500)
  }

  const allRequiredGranted = PERMISSIONS
    .filter(p => p.type === 'required')
    .every(p => permissionsState[p.id] === 'granted')

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
<View style={{paddingTop: 50}} />
  
        {/* Zone centrale */}
        <View style={styles.centerBlock}>

          <Text style={styles.title}>Autorisations requises</Text>
          <Text style={styles.subtitle}>
            Pour offrir une expérience de gestion optimale,
            Lotus Business nécessite les accès suivants.
          </Text>

          {/* Liste permissions */}
          <View style={styles.permissionsList}>
            {PERMISSIONS.map((permission) => (
              <PermissionItem 
                key={permission.id}
                icon={permission.icon}
                title={permission.title}
                subtitle={permission.subtitle}
                type={permission.type}
                color={permission.color}
                status={permissionsState[permission.id]}
                onPress={() => handlePermissionPress(permission)}
              />
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
          label={
            loading 
              ? 'Finalisation...' 
              : allRequiredGranted 
                ? 'Continuer' 
                : 'Autoriser les accès requis'
          }
          onPress={handleContinue}
          disabled={loading || !allRequiredGranted}
        />

      </View>

      {selectedPermission && (
        <CustomAlert
          isVisible={alertVisible}
          onClose={() => setAlertVisible(false)}
          title={selectedPermission.alertTitle}
          description={selectedPermission.alertDescription}
          iconName={selectedPermission.iconName as any}
          color={selectedPermission.color}
          primaryButtonLabel="Autoriser"
          onPrimaryPress={handleAuthorizeConfirm}
          secondaryButtonLabel="Plus tard"
          onSecondaryPress={() => setAlertVisible(false)}
        />
      )}
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
  title: {
    fontSize: 22,
    fontFamily: FontFamily.display,
    color: '#0A0A0A',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FontFamily.content,
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
    fontFamily: FontFamily.content,
    color: '#9E9E9E',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  privacyLink: {
    color: '#0A0A0A',
    fontFamily: FontFamily.utilityBold,
    textDecorationLine: 'underline',
  },
})
