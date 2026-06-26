import { useMemo, useState } from 'react'
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
import { Link, useRouter } from 'expo-router'
import BackgroundImage from '@/assets/background.png'
import { Colors } from '../../constants/colors'
import { FontFamily } from '../../constants/typography'
import { useAuthStore } from '../../store/useAuthStore'
import { ApiError, authUserToLicence, loginWithLicence } from '../../lib/auth/backendAuth'
import { isExpirationPast } from '../../lib/db/auth-session'
import { AuthUser } from '../../types'
import CustomAlert from '../../components/customs/Alert'
import { useLoadingStore } from '../../store/useLoadingStore'

const LICENCE_PATTERN = /^LOT-\d{4}-[a-z]{4}-\d{4}$/

function formatLicenceCode(value: string) {
  const raw = value
    .replace(/^lot/i, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 12)

  const first = raw.slice(0, 4).replace(/\D/g, '')
  const second = raw.slice(4, 8).replace(/[^a-zA-Z]/g, '').toLowerCase()
  const third = raw.slice(8, 12).replace(/\D/g, '')

  return ['LOT', first, second, third].filter(Boolean).join('-')
}

export default function VerifyLicenceScreen() {
  const router = useRouter()
  const setBackendSession = useAuthStore((state) => state.setBackendSession)
  const setLicence = useAuthStore((state) => state.setLicence)
  const setTentativesRestantes = useAuthStore((state) => state.setTentativesRestantes)
  const tentativesRestantes = useAuthStore((state) => state.tentativesRestantes)
  const isLoading = useLoadingStore((state) => state.isLoading)
  const showLoading = useLoadingStore((state) => state.showLoading)
  const hideLoading = useLoadingStore((state) => state.hideLoading)

  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [alertMessage, setAlertMessage] = useState('')

  const isCodeValid = useMemo(() => LICENCE_PATTERN.test(code), [code])

  const handleVerify = async () => {
    if (!isCodeValid) {
      const nextTentatives = Math.max(tentativesRestantes - 1, 0)
      setTentativesRestantes(nextTentatives)
      const message = 'Entrez une licence au format LOT-1234-abcd-5678.'
      setError(message)
      setAlertMessage(message)
      if (nextTentatives === 0) router.replace('/(auth)/licenceError')
      return
    }

    showLoading()
    setError('')

    try {
      const session = await loginWithLicence(code)

      setTentativesRestantes(3)
      setBackendSession({
        token: session.token,
        user: session.user,
        licence: session.licence,
      })

      if (session.licence.statut === 'suspendu') {
        router.replace('/(auth)/licenceSuspendue')
        return
      }

      if (session.licence.statut === 'expire' || isExpirationPast(session.user.expirationDate)) {
        router.replace('/(auth)/licenceExpiree')
        return
      }

      router.replace('/(auth)/successLicence')
    } catch (err) {
      const nextTentatives = Math.max(tentativesRestantes - 1, 0)
      setTentativesRestantes(nextTentatives)

      if (err instanceof ApiError) {
        const backendUser =
          typeof err.payload === 'object' && err.payload && 'user' in err.payload
            ? (err.payload as { user?: AuthUser }).user
            : undefined

        if (backendUser?.licenseStatus) {
          const licence = authUserToLicence(backendUser)
          setLicence(licence.statut, licence)

          if (licence.statut === 'suspendu') {
            router.replace('/(auth)/licenceSuspendue')
            return
          }

          if (licence.statut === 'expire' || isExpirationPast(backendUser.expirationDate)) {
            router.replace('/(auth)/licenceExpiree')
            return
          }
        }
      }

      const message =
        err instanceof ApiError
          ? err.message
          : 'Impossible de vérifier cette licence pour le moment.'
      setError(message)
      setAlertMessage(message)
      if (nextTentatives === 0) router.replace('/(auth)/licenceError')
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
              <Text style={styles.eyebrow}>Vérification licence</Text>
              <Text style={styles.title}>Activez votre accès</Text>
              <Text style={styles.subtitle}>
                Saisissez votre code licence pour continuer la configuration de votre boutique.
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Code licence</Text>
              <TextInput
                value={code}
                onChangeText={(value) => {
                  setCode(formatLicenceCode(value))
                  if (error) setError('')
                }}
                placeholder="LOT-1234-abcd-5678"
                placeholderTextColor={Colors.textTertiary}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={18}
                style={[styles.input, error ? styles.inputError : null]}
                returnKeyType="done"
                onSubmitEditing={handleVerify}
              />
              {error ? <Text style={styles.errorText} selectable>{error}</Text> : null}
              <Text style={styles.helper}>
                Tentatives restantes : {tentativesRestantes}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, (!isCodeValid || isLoading) && styles.primaryButtonMuted]}
              onPress={handleVerify}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              <Text style={styles.primaryButtonText}>
                Vérifier ma licence
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Vous n’avez pas encore de licence ?</Text>
            <Link href="/(auth)/requestLicence" asChild>
              <TouchableOpacity activeOpacity={0.75}>
                <Text style={styles.footerLink}>Faire une demande</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/(auth)/licenceOublier" asChild>
              <TouchableOpacity activeOpacity={0.75}>
                <Text style={styles.footerLink}>Licence oubliée ?</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert
        isVisible={Boolean(alertMessage)}
        onClose={() => setAlertMessage('')}
        title="Le Code Licence est invalide"
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
    borderWidth: 1,
    borderColor: 'rgba(224,224,224,0.86)',
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.88)',
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
  icon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
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
    borderColor: Colors.border,
    borderRadius: 15,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    fontFamily: FontFamily.utilityBold,
    fontSize: 16,
    color: Colors.textPrimary,
    letterSpacing: 0.8,
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
  helper: {
    fontFamily: FontFamily.content,
    fontSize: 12,
    color: Colors.textTertiary,
  },
  primaryButton: {
    height: 54,
    borderRadius: 15,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 16px rgba(0,0,0,0.16)',
  },
  primaryButtonMuted: {
    backgroundColor: Colors.accentHover,
  },
  primaryButtonText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 15,
    color: Colors.textInverse,
  },
  footer: {
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontFamily: FontFamily.content,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  footerlinks:{
    alignItems: 'center',
    gap: 8,
    justifyContent: "center"
  },
  footerLink: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 14,
    color: Colors.textPrimary,
    textDecorationLine: 'underline',
  },
})
