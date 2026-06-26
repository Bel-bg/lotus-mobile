import { Image, ImageBackground, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router'
import BackgroundImage from '@/assets/background.png'
import { Colors } from '../../constants/colors'
import { FontFamily } from '../../constants/typography'

export default function LicenceErrorScreen() {
  const router = useRouter()

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

          <View style={styles.header}>
            <Text style={styles.eyebrow}>Licence introuvable</Text>
            <Text style={styles.title}>Accès non validé</Text>
            <Text style={styles.subtitle} selectable>
              Cette licence semble invalide, expirée ou introuvable. Vérifiez le code reçu par email ou demandez une nouvelle licence.
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.replace('/(auth)/verifyLicence')}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Réessayer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.replace('/(auth)/requestLicence')}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryButtonText}>Demander une licence</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.helpText}>
          Besoin d’aide ? Contactez le support Lotus Business avec votre email de demande.
        </Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    padding: 22,
    gap: 18,
    boxShadow: '0 14px 36px rgba(0,0,0,0.10)',
  },
  errorIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: Colors.dangerLight,
    borderWidth: 1,
    borderColor: Colors.dangerBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIcon: {
    width: 34,
    height: 34,
    resizeMode: 'contain',
  },
  header: {
    gap: 8,
  },
  eyebrow: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 11,
    color: Colors.danger,
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
  actions: {
    gap: 12,
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
