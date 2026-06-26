import { Image, ImageBackground, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import BackgroundImage from '@/assets/background.png'
import { Colors } from '../../constants/colors'
import { FontFamily } from '../../constants/typography'
import { useAuthStore } from '../../store/useAuthStore'
import { saveAuthSession } from '../../lib/db/auth-session'

function formatDate(value?: string) {
  if (!value) return 'Non définie'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

export default function SuccessLicenceScreen() {
  const router = useRouter()
  const licence = useAuthStore((state) => state.licence)
  const email = useAuthStore((state) => state.email)
  const displayName = useAuthStore((state) => state.displayName)
  const token = useAuthStore((state) => state.token)
  const authUser = useAuthStore((state) => state.authUser)

  // Persiste la session dans SQLite dès l'affichage de l'écran
  useEffect(() => {
    if (token && authUser) {
      saveAuthSession({ token, user: authUser }).catch(console.error)
    }
  }, [token, authUser])

  const details = [
    { label: 'Nom', value: licence?.nom ?? displayName ?? 'Utilisateur Lotus' },
    { label: 'Email', value: licence?.email ?? email ?? 'client@lotusbusiness.app' },
    { label: 'Téléphone', value: licence?.telephone ?? 'Non renseigné' },
    { label: 'Licence', value: licence?.type === 'premium' ? 'Premium' : 'Free' },
    { label: 'Échéance', value: formatDate(licence?.dateExpiration) },
  ]

  return (
    <ImageBackground source={BackgroundImage} style={styles.backgroundImage} resizeMode="cover">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brand}>
          <Text style={styles.brandText}>Lotus Business</Text>
        </View>

        <View style={styles.card}>
          {/* <View style={styles.successIconWrap}>
            <Image source={require('../../../assets/images/sucess.png')} style={styles.successIcon} />
          </View> */}

          <View style={styles.header}>
            <Text style={styles.eyebrow}>Licence validée</Text>
            <Text style={styles.title}>Bienvenue à bord</Text>
            <Text style={styles.subtitle}>
              Votre licence est active. Vérifiez les informations ci-dessous avant de configurer votre entreprise.
            </Text>
          </View>

          <View style={styles.detailsCard}>
            {details.map((item) => (
              <View key={item.label} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{item.label}</Text>
                <Text style={styles.detailValue} selectable>{item.value}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/(auth)/formSheet')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Configurer ma Boutique</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.replace('/(auth)/verifyLicence')} activeOpacity={0.75}>
          <Text style={styles.secondaryLink}>Utiliser une autre licence</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 42,
    paddingBottom: 32,
    gap: 24,
  },
  brand: {
    alignItems: 'center',
  },
  brandText: {
    fontFamily: FontFamily.display,
    fontSize: 28,
    color: Colors.textPrimary,
    letterSpacing: 1.5,
  },
  card: {
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 22,
    gap: 18,
    justifyContent: 'center',
    boxShadow: '0 14px 36px rgba(0,0,0,0.10)',
  },
  successIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    width: 38,
    height: 38,
    resizeMode: 'contain',
  },
  header: {
    gap: 8,
  },
  eyebrow: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 11,
    color: Colors.successText,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  title: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 28,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: FontFamily.content,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  detailsCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 18,
    backgroundColor: Colors.background,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
  },
  detailLabel: {
    fontFamily: FontFamily.content,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  detailValue: {
    flex: 1,
    textAlign: 'right',
    fontFamily: FontFamily.utilityBold,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  primaryButton: {
    height: 54,
    borderRadius: 15,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 16px rgba(0,0,0,0.16)',
  },
  primaryButtonText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 15,
    color: Colors.textInverse,
  },
  secondaryLink: {
    textAlign: 'center',
    fontFamily: FontFamily.utilityBold,
    fontSize: 14,
    color: Colors.textPrimary,
    textDecorationLine: 'underline',
  },
})
