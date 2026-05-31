import React, { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { Colors } from '@/constants/colors'
import { FontFamily } from '@/constants/typography'
import { getStockColor, getStockPourcentage } from '@/lib/utils/stock'
import type { Produit } from '@/types'
import { getStockStatut } from '@/lib/utils/stock'

interface AnimatedStockBarProps {
  produit: Produit
  duration?: number
  showLabels?: boolean
  height?: number
}

export default function AnimatedStockBar({
  produit,
  duration = 600,
  showLabels = true,
  height = 8,
}: AnimatedStockBarProps) {
  const statut = getStockStatut(produit)
  const targetPct = getStockPourcentage(produit) / 100
  const fill = useSharedValue(0)

  useEffect(() => {
    fill.value = withTiming(targetPct, {
      duration,
      easing: Easing.out(Easing.cubic),
    })
  }, [targetPct, duration])

  const barStyle = useAnimatedStyle(() => ({
    width: `${fill.value * 100}%`,
    backgroundColor: getStockColor(statut),
  }))

  return (
    <View style={styles.wrap}>
      {showLabels && (
        <View style={styles.header}>
          <Text style={styles.label}>Stock</Text>
          <Text style={styles.value}>
            {produit.stockActuel} {produit.unite}
          </Text>
        </View>
      )}
      <View style={[styles.track, { height }]}>
        <Animated.View style={[styles.fill, { height }, barStyle]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontFamily: FontFamily.content,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  value: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 12,
    color: Colors.textPrimary,
  },
  track: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: 4,
  },
})
