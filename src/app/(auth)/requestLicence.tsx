import { useState, useRef } from 'react'
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
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { BlurView } from 'expo-blur'
import BackgroundImage from '@/assets/background.png'
import { Colors } from '../../constants/colors'
import { FontFamily } from '../../constants/typography'
import { useAuthStore } from '../../store/useAuthStore'
import CustomAlert from '../../components/customs/Alert'
import { ApiError, registerUser } from '../../lib/auth/backendAuth'
import { useLoadingStore } from '../../store/useLoadingStore'

type FormErrors = Partial<Record<'name' | 'email' | 'phone', string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RequestLicenceScreen() {
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)
  const isLoading = useLoadingStore((state) => state.isLoading)
  const showLoading = useLoadingStore((state) => state.showLoading)
  const hideLoading = useLoadingStore((state) => state.hideLoading)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [successVisible, setSuccessVisible] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')

  const scrollViewRef = useRef<ScrollView>(null)

  const handleFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: 100,
        animated: true,
      })
    }, 100)
  }

  const handleSubmit = async () => {
    const nextErrors: FormErrors = {}
    if (!name.trim()) nextErrors.name = 'Votre nom est requis.'
    if (!EMAIL_PATTERN.test(email.trim())) nextErrors.email = 'Entrez un email valide.'
    if (phone.trim().length < 8) nextErrors.phone = 'Entrez un numéro de téléphone valide.'

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      setAlertMessage(Object.values(nextErrors).filter(Boolean).join('\n'))
      return
    }

    setErrors({})
    showLoading()
    const [firstName, ...lastNameParts] = name.trim().split(/\s+/)

    try {
      const data = await registerUser({
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        firstName,
        lastName: lastNameParts.join(' ') || firstName,
      })

      setUser({
        uid: data.user.id,
        email: data.user.email,
        displayName: [data.user.firstName, data.user.lastName].filter(Boolean).join(' ') || name.trim(),
        photoURL: null,
      })
      setSuccessVisible(true)
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Impossible de créer la licence pour le moment.'
      setErrors({
        email: message,
      })
      setAlertMessage(message)
    } finally {
      hideLoading()
    }
  }

  return (
    <ImageBackground source={BackgroundImage} style={styles.backgroundImage} resizeMode="cover">
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <ScrollView
          ref={scrollViewRef}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brand}>
            <Text style={styles.brandText}>Lotus Business</Text>
          </View>

          {/* Utilisation de BlurView pour la carte */}
          <BlurView intensity={80} tint="light" style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.eyebrow}>Demande de licence</Text>
              <Text style={styles.title}>Obtenez votre accès</Text>
              <Text style={styles.subtitle}>
                Renseignez vos informations. Nous vous enverrons votre licence par email pour continuer l’onboarding.
              </Text>
            </View>

            <View style={styles.form}>
              <Field
                label="Nom complet"
                value={name}
                onFocus={handleFocus}
                onChangeText={(value) => {
                  setName(value)
                  if (errors.name) setErrors((current) => ({ ...current, name: undefined }))
                }}
                placeholder="Ex : Marie Adjoua"
                error={errors.name}
              />
              <Field
                label="Email"
                value={email}
                onFocus={handleFocus}
                onChangeText={(value) => {
                  setEmail(value)
                  if (errors.email) setErrors((current) => ({ ...current, email: undefined }))
                }}
                placeholder="vous@exemple.com"
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Field
                label="Téléphone"
                value={phone}
                onFocus={handleFocus}
                onChangeText={(value) => {
                  setPhone(value)
                  if (errors.phone) setErrors((current) => ({ ...current, phone: undefined }))
                }}
                placeholder="+229 01..."
                error={errors.phone}
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.primaryButtonMuted]}
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.textInverse} />
              ) : (
                <Text style={styles.primaryButtonText}>Envoyer ma demande</Text>
              )}
            </TouchableOpacity>
          </BlurView>

          <TouchableOpacity onPress={() => router.replace('/(auth)/verifyLicence')} activeOpacity={0.75}>
            <Text style={styles.secondaryLink}>J’ai déjà une licence</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert
        isVisible={successVisible}
        onClose={() => setSuccessVisible(false)}
        title="Demande envoyée"
        description="Vérifiez votre boîte mail pour récupérer votre licence Lotus Business."
        iconName="MailCheck"
        color={Colors.success}
        primaryButtonLabel="Entrer ma licence"
        onPrimaryPress={() => {
          setSuccessVisible(false)
          router.replace('/(auth)/verifyLicence')
        }}
      />

      <CustomAlert
        isVisible={Boolean(alertMessage)}
        onClose={() => setAlertMessage('')}
        title="Demande impossible"
        description={alertMessage}
        iconName="AlertTriangle"
        color={Colors.danger}
        primaryButtonLabel="Corriger"
        onPrimaryPress={() => setAlertMessage('')}
      />
    </ImageBackground>
  )
}

function Field({
  label,
  error,
  ...props
}: {
  label: string
  error?: string
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor={Colors.textTertiary}
        style={[styles.input, error ? styles.inputError : null]}
        returnKeyType="next"
      />
      {error ? <Text style={styles.errorText} selectable>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60, // Augmenté pour plus d'espace en haut
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
    borderRadius: 24, // Bordures plus arrondies pour un look moderne
    padding: 24,
    gap: 20,
    overflow: 'hidden', // Crucial pour que BlurView respecte le borderRadius
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)', // Bordure subtile pour l'effet verre
  },
  header: {
    gap: 8,
  },
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
  form: {
    gap: 16,
  },
  field: {
    gap: 8,
  },
  label: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  input: {
    height: 54,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
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
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    // iOS Shadow
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    // Android Elevation
    elevation: 4,
  },
  primaryButtonMuted: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 16,
    color: Colors.textInverse,
  },
  secondaryLink: {
    textAlign: 'center',
    fontFamily: FontFamily.utilityBold,
    fontSize: 14,
    color: Colors.textPrimary,
    opacity: 0.8,
  },
})
