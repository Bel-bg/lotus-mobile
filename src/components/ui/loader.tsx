// ============================================
// LOTUS BUSINESS — Dot Spinner Loader
// ============================================
// Reproduction exacte du dot-spinner CSS
// 8 points disposés en cercle, animation pulse décalée

import { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated'

// --- Config ---
const SIZE = 80
const SPEED = 900
const DOT_SIZE = SIZE * 0.20
const COLOR = '#0A0A0A'
const NB_DOTS = 8

const DELAYS = [
  0,
  SPEED * 1.111 * (1 - 0.875),
  SPEED * 1.111 * (1 - 0.75),
  SPEED * 1.111 * (1 - 0.625),
  SPEED * 1.111 * (1 - 0.5),
  SPEED * 1.111 * (1 - 0.375),
  SPEED * 1.111 * (1 - 0.25),
  SPEED * 1.111 * (1 - 0.125),
]

const ROTATIONS = Array.from({ length: NB_DOTS }, (_, i) => (i * 45 * Math.PI) / 180)

// --- Point unique animé ---
function Dot({ rotation, delay }: { rotation: number; delay: number }) {
  const scale = useSharedValue(0.3)
  const opacity = useSharedValue(0.5)
  const totalDuration = Math.round(SPEED * 1.111)

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withTiming(1.2, {
          duration: totalDuration / 2,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      )
    )
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration: totalDuration / 2,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      )
    )
  }, [])

  const dotX = Math.cos(rotation - Math.PI / 2) * (SIZE / 2 - DOT_SIZE / 2)
  const dotY = Math.sin(rotation - Math.PI / 2) * (SIZE / 2 - DOT_SIZE / 2)

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View
      style={[
        styles.dot,
        animStyle,
        {
          left: SIZE / 2 + dotX - DOT_SIZE / 2,
          top: SIZE / 2 + dotY - DOT_SIZE / 2,
        },
      ]}
    />
  )
}

// --- Composant principal ---
interface LoaderProps {
  message?: string
}

export default function Loader({ message = 'Chargement...' }: LoaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.spinner}>
        {ROTATIONS.map((rotation, i) => (
          <Dot key={i} rotation={rotation} delay={DELAYS[i]} />
        ))}
      </View>
      {message && (
        <Animated.Text style={styles.message}>
          {message}
        </Animated.Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  spinner: {
    width: SIZE,
    height: SIZE,
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: COLOR,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#0A0A0A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  message: {
    color: '#6B6B6B',
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
  },
})