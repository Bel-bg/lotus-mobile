// ============================================
// LOTUS BUSINESS — Onboarding (3 slides)
// ============================================

import { useRouter } from 'expo-router'
import { useCallback, useRef, useState } from 'react'
import { useAuthStore } from '../../../store/useAuthStore'
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

const { width, height } = Dimensions.get('window')

const SLIDES = [
  {
    id: '1',
    illustration: require('../../../../assets/images/onboarding-1.png'),
    title: 'Votre boutique,\ntout en un.',
    subtitle: 'Gérez vos stocks, ventes et bilans\ndepuis votre téléphone.',
    buttonLabel: 'Commencer',
    linkLabel: 'Déjà un compte ?',
    linkAction: 'signin',
    linkHighlight: 'Se connecter',
  },
  {
    id: '2',
    illustration: require('../../../../assets/images/onboarding-2.png'),
    title: 'Vendez en\n3 secondes.',
    subtitle: 'Sélectionnez vos produits, confirmez la\nvente — le stock se met à jour tout seul.',
    buttonLabel: 'Suivant',
    linkLabel: '',
    linkAction: 'skip',
    linkHighlight: "Passer l'introduction",
  },
  {
    id: '3',
    illustration: require('../../../../assets/images/onboarding-3.png'),
    title: 'Bilans auto,\nzéro stress.',
    subtitle: 'Clôturez votre journée en un tap. Vos bilans et factures sont sauvegardés sur Google Drive automatiquement.',
    buttonLabel: 'Commencer maintenant',
    linkLabel: 'Déjà configuré ?',
    linkAction: 'signin',
    linkHighlight: 'Se connecter',
  },
]

export default function OnboardingScreen() {
  const router = useRouter()
  const { setOnboardingComplete } = useAuthStore()
  const scrollRef = useRef<ScrollView>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const buttonScale = useSharedValue(1)

  // Détecte le slide actif via le scroll
  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width)
    if (index !== activeIndex) setActiveIndex(index)
  }, [activeIndex])

  const handleNext = useCallback(() => {
    if (activeIndex < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({
        x: (activeIndex + 1) * width,
        animated: true,
      })
    } else {
      setOnboardingComplete(true)
      router.replace('/(auth)/google-signin')
    }
  }, [activeIndex, router, setOnboardingComplete])

  const handleLinkPress = useCallback(() => {
    setOnboardingComplete(true)
    router.replace('/(auth)/google-signin')
  }, [router, setOnboardingComplete])

  const buttonAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }))

  const currentSlide = SLIDES[activeIndex]

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Carrousel horizontal */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        bounces={false}
        style={styles.scrollView}
      >
        {SLIDES.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            <Image
              source={slide.illustration}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>
        ))}
      </ScrollView>

      {/* Contenu bas — fixe, change selon activeIndex */}
      <View style={styles.bottomZone}>

        {/* Dots */}
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* Titre */}
        <Text style={styles.title}>{currentSlide.title}</Text>

        {/* Sous-titre */}
        <Text style={styles.subtitle}>{currentSlide.subtitle}</Text>

        {/* Bouton */}
        <Animated.View style={[styles.buttonWrapper, buttonAnimStyle]}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleNext}
            onPressIn={() => {
              buttonScale.value = withTiming(0.97, { duration: 80 })
            }}
            onPressOut={() => {
              buttonScale.value = withTiming(1, { duration: 80 })
            }}
            activeOpacity={1}
          >
            <Text style={styles.buttonText}>{currentSlide.buttonLabel}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Lien bas */}
        {/* <TouchableOpacity onPress={handleLinkPress} style={styles.linkContainer}>
          {currentSlide.linkLabel ? (
            <Text style={styles.linkText}>
              {currentSlide.linkLabel}{' '}
              <Text style={styles.linkHighlight}>{currentSlide.linkHighlight}</Text>
            </Text>
          ) : (
            <Text style={styles.linkHighlight}>{currentSlide.linkHighlight}</Text>
          )}
        </TouchableOpacity> */}

      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    height: height * 0.46,
    flexGrow: 0,
  },
  slide: {
    width,
    height: height * 0.46,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  bottomZone: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 24,
  },
  dot: {
    height: 7,
    borderRadius: 4,
  },
  dotActive: {
    width: 20,
    backgroundColor: '#0A0A0A',
  },
  dotInactive: {
    width: 7,
    backgroundColor: '#D1D1D1',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0A0A0A',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 34,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  buttonWrapper: {
    width: '100%',
    marginBottom: 16,
  },
  button: {
    width: '100%',
    height: 52,
    backgroundColor: '#0A0A0A',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  linkContainer: {
    paddingVertical: 8,
  },
  linkText: {
    fontSize: 13,
    color: '#6B6B6B',
    textAlign: 'center',
  },
  linkHighlight: {
    fontSize: 13,
    color: '#0A0A0A',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
})