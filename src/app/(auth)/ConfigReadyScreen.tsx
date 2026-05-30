// ============================================
// LOTUS BUSINESS — Écran : Configuration récupérée
// ============================================

import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { StatusBar, StyleSheet, Text, View, Image } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import ProgressBar from '../../components/ProgressBar'
import { FontFamily } from '@/constants/typography'

export default function ConfigReadyScreen() {
  const router = useRouter()

  const checkScale = useSharedValue(0)
  const checkOpacity = useSharedValue(0)
  const titleOpacity = useSharedValue(0)
  const titleY = useSharedValue(12)
  const subtitleOpacity = useSharedValue(0)

  useEffect(() => {
    // Icône check apparaît en spring
    checkOpacity.value = withTiming(1, { duration: 300 })
    checkScale.value = withSpring(1, { damping: 12, stiffness: 180 })

    // Titre
    titleOpacity.value = withDelay(300, withTiming(1, { duration: 400 }))
    titleY.value = withDelay(300, withTiming(0, {
      duration: 400,
      easing: Easing.out(Easing.quad),
    }))

    // Subtitle
    subtitleOpacity.value = withDelay(500, withTiming(1, { duration: 400 }))

    // Navigation auto vers Permissions
    const timer = setTimeout(() => {
      router.replace('/(auth)/PermissionsScreen')
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [{ scale: checkScale.value }],
  }))

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }))

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }))

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>

        {/* Zone centrale */}
        <View style={styles.centerBlock}>

          {/* Icône check */}
          <Animated.View style={[styles.checkContainer, checkStyle]}>
            <Image source={require('@/assets/images/sucess.png')} style={{ width: 72, height: 72, resizeMode: 'contain' }} />
          </Animated.View>

          {/* Titre */}
          <Animated.Text style={[styles.title, titleStyle]}>
            Configuration récupérée !
          </Animated.Text>

          {/* Subtitle */}
          <Animated.Text style={[styles.subtitle, subtitleStyle]}>
            Votre boutique est prête. Préparation{'\n'}de votre espace de travail...
          </Animated.Text>

        </View>

        {/* Barre de progression */}
        <View style={styles.footer}>
          <ProgressBar
            progress={70}
            label="FINALISATION"
            showPercent={true}
            duration={1200}
          />
        </View>

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
    paddingBottom: 48,
    justifyContent: 'space-between',
  },
  centerBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  checkContainer: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  checkIcon: {
    fontSize: 32,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
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
    lineHeight: 22,
    letterSpacing: 0.5,
  },
  footer: {
    gap: 8,
  },
})
