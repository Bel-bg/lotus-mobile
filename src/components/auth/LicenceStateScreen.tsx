import { Image, ImageBackground, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router'
import BackgroundImage from '@/assets/background.png'
import { Colors } from '../../constants/colors'
import { FontFamily } from '../../constants/typography'
import { useAuthStore } from '../../store/useAuthStore'

type LicenceStateVariant = 'expired' | 'suspended'

function formatDate(value?: string) {
  if (!value) return 'Non définie'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

export default function LicenceStateScreen({ variant }: { variant: LicenceStateVariant }) {
  const router = useRouter()
  const licence = useAuthStore((state) => state.licence)
  const logout = useAuthStore((state) => state.logout)
  const isExpired = variant === 'expired'

  const copy = isExpired
    ? {
        eyebrow: 'Licence expirée',
        title: 'Votre accès a expiré',
        subtitle:
          'La date de validité de votre licence est dépassée. Renouvelez votre accès pour retrouver votre espace de travail.',
        help: 'Si vous venez de renouveler, reconnectez-vous avec la nouvelle clé reçue par email.',
        color: Colors.warningText,
        border: Colors.warningBorder,
        light: Colors.warningLight,
      }
    : {
        eyebrow: 'Licence suspendue',
        title: 'Votre accès est suspendu',
        subtitle:
          'Cette licence a été suspendue par l’administration Lotus Business. Contactez le support pour régulariser votre compte.',
        help: 'Gardez votre clé et votre email à portée de main pour accélérer le traitement.',
        color: Colors.danger,
        border: Colors.dangerBorder,
        light: Colors.dangerLight,
      }

  const handleUseAnotherLicence = () => {
    logout()
    router.replace('/(auth)/verifyLicence')
  }

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

        <View style={[styles.card, { borderColor: copy.border }]}>
          <View style={[styles.iconWrap, { backgroundColor: copy.light, borderColor: copy.border }]}>
            <Image source={require('../../../assets/icons/shield.png')} style={styles.icon} />
          </View>

          <View style={styles.header}>
            <Text style={[styles.eyebrow, { color: copy.color }]}>{copy.eyebrow}</Text>
            <Text style={styles.title}>{copy.title}</Text>
            <Text style={styles.subtitle} selectable>
              {copy.subtitle}
            </Text>
          </View>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Licence</Text>
              <Text style={styles.detailValue} selectable>{licence?.code ?? 'Non définie'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue} selectable>{licence?.email ?? 'Non défini'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Échéance</Text>
              <Text style={styles.detailValue} selectable>{formatDate(licence?.dateExpiration)}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleUseAnotherLicence}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Utiliser une autre licence</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.replace('/(auth)/requestLicence')}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryButtonText}>Demander une nouvelle licence</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.helpText} selectable>{copy.help}</Text>
      </ScrollView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 42,
    paddingBottom: 32,
    gap: 24,
  },
  brand: { alignItems: 'center' },
  brandText: {
    fontFamily: FontFamily.display,
    fontSize: 28,
    color: Colors.textPrimary,
    letterSpacing: 1.5,
  },
  card: {
    borderWidth: 1,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 22,
    gap: 18,
    boxShadow: '0 14px 36px rgba(0,0,0,0.10)',
  },
  iconWrap: {
    width: 68,
    height: 68,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { width: 34, height: 34, resizeMode: 'contain' },
  header: { gap: 8 },
  eyebrow: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 11,
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
  actions: { gap: 12 },
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
  secondaryButton: {
    height: 52,
    borderRadius: 15,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  helpText: {
    textAlign: 'center',
    fontFamily: FontFamily.content,
    fontSize: 12.5,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
})
