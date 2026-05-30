// ============================================
// LOTUS BUSINESS — Composant : ProgressBar
// ============================================

import { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated'

interface ProgressBarProps {
  progress: number   // 0 à 100
  label?: string
  showPercent?: boolean
  duration?: number
}

export default function ProgressBar({
  progress,
  label,
  showPercent = true,
  duration = 600,
}: ProgressBarProps) {
  const width = useSharedValue(0)

  useEffect(() => {
    width.value = withTiming(progress, {
      duration,
      easing: Easing.out(Easing.cubic),
    })
  }, [progress])

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }))

  return (
    <View style={styles.container}>
      {(label || showPercent) && (
        <View style={styles.row}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showPercent && (
            <Text style={styles.percent}>{Math.round(progress)}%</Text>
          )}
        </View>
      )}
      <View style={styles.track}>
        <Animated.View style={[styles.fill, barStyle]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B6B6B',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  percent: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B6B6B',
  },
  track: {
    width: '100%',
    height: 15,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#0A0A0A',
    borderRadius: 2,
  },
})
