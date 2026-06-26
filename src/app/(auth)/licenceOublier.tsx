import { useState } from 'react'
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
import BackgroundImage from '@/assets/background.png'
import CustomAlert from '../../components/customs/Alert'
import { Colors } from '../../constants/colors'
import { FontFamily } from '../../constants/typography'
import { ApiError, forgotLicenceKey } from '../../lib/auth/backendAuth'
import { useLoadingStore } from '../../store/useLoadingStore'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LicenceOublierScreen() {
  const router = useRouter()
  const isLoading = useLoadingStore((state) => state.isLoading)
  const showLoading = useLoadingStore((state) => state.showLoading)
  const hideLoading = useLoadingStore((state) => state.hideLoading)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [alertMessage, setAlertMessage] = useState('')

  const handleSubmit = async () => {
    if (!EMAIL_PATTERN.test(email.trim())) {
      const message = 'Entrez un email valide.'
      setError(message)
      setAlertMessage(message)
      return
    }

    showLoading()
    setError('')

    try {
      const data = await forgotLicenceKey(email.trim().toLowerCase())
      setSuccessMessage(data.message || `Clé renvoyée à ${data.email}`)
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Impossible de renvoyer la clé pour le moment.'
      setError(message)
      setAlertMessage(message)
    } finally {
      hideLoading()
    }
  }

  return (
    <ImageBackground source={BackgroundImage} style={styles.backgroundImage} resizeMode="cover">
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brand}>
            <Text style={styles.brandText}>Lotus Business</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.eyebrow}>Licence oubliée</Text>
              <Text style={styles.title}>Récupérez votre clé</Text>
              <Text style={styles.subtitle}>
                Entrez l’email utilisé à l’inscription. Votre clé de licence sera renvoyée par email.
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={(value) => {
                  setEmail(value)
                  if (error) setError('')
                }}
                placeholder="vous@exemple.com"
                placeholderTextColor={Colors.textTertiary}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                style={[styles.input, error ? styles.inputError : null]}
                returnKeyType="send"
                onSubmitEditing={handleSubmit}
              />
              {error ? <Text style={styles.errorText} selectable>{error}</Text> : null}
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.primaryButtonMuted]}
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              <Text style={styles.primaryButtonText}>
                Renvoyer ma clé
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.replace('/(auth)/verifyLicence')} activeOpacity={0.75}>
            <Text style={styles.secondaryLink}>Retour à la connexion</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert
        isVisible={Boolean(successMessage)}
        onClose={() => setSuccessMessage('')}
        title="Email envoyé"
        description={successMessage}
        iconName="MailCheck"
        color={Colors.success}
        primaryButtonLabel="Entrer ma licence"
        onPrimaryPress={() => {
          setSuccessMessage('')
          router.replace('/(auth)/verifyLicence')
        }}
      />

      <CustomAlert
        isVisible={Boolean(alertMessage)}
        onClose={() => setAlertMessage('')}
        title="Récupération impossible"
        description={alertMessage}
        iconName="AlertTriangle"
        color={Colors.danger}
        primaryButtonLabel="Compris"
        onPrimaryPress={() => setAlertMessage('')}
      />
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1 },
  keyboard: { flex: 1 },
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
    borderColor: 'rgba(224,224,224,0.86)',
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 22,
    gap: 18,
    boxShadow: '0 14px 36px rgba(0,0,0,0.10)',
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  icon: { width: 30, height: 30, resizeMode: 'contain' },
  header: { gap: 8 },
  eyebrow: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 11,
    color: Colors.textTertiary,
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
  field: { gap: 8 },
  label: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  input: {
    height: 54,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 15,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    fontFamily: FontFamily.content,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  inputError: {
    borderColor: Colors.dangerBorder,
    backgroundColor: Colors.dangerLight,
  },
  errorText: {
    fontFamily: FontFamily.content,
    fontSize: 12.5,
    color: Colors.danger,
    lineHeight: 18,
  },
  primaryButton: {
    height: 54,
    borderRadius: 15,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 16px rgba(0,0,0,0.16)',
  },
  primaryButtonMuted: { backgroundColor: Colors.accentHover },
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
