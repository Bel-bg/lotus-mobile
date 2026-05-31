import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Pressable, LayoutChangeEvent } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import Svg, { Polyline, Circle } from 'react-native-svg'
import { ChevronDown, ChevronUp } from 'lucide-react-native'
import { Colors } from '@/constants/colors'
import { FontFamily } from '@/constants/typography'
import { getProduitStats7J, type ProduitStats7J } from '@/lib/db/produit-stats'
import type { Produit } from '@/types'

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const steps = 24
    const stepTime = 600 / steps
    let step = 0
    const timer = setInterval(() => {
      step++
      const next = Math.round((value * step) / steps)
      setDisplay(next)
      if (step >= steps) clearInterval(timer)
    }, stepTime)
    return () => clearInterval(timer)
  }, [value])
  return (
    <Text style={styles.statValue}>
      {display.toLocaleString('fr-FR')}
      {suffix}
    </Text>
  )
}

function Sparkline({
  data,
  width,
  height,
}: {
  data: number[]
  width: number
  height: number
}) {
  const max = Math.max(...data, 1)
  const pad = 4
  const points = data
    .map((v, i) => {
      const x = pad + (i / Math.max(data.length - 1, 1)) * (width - pad * 2)
      const y = height - pad - (v / max) * (height - pad * 2)
      return `${x},${y}`
    })
    .join(' ')

  const pathLength = width * 2
  const dashOffset = useSharedValue(pathLength)

  useEffect(() => {
    dashOffset.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) })
  }, [data.join(',')])

  const [tooltip, setTooltip] = useState<{ index: number; x: number } | null>(null)

  return (
    <View>
      <Pressable
        onLayout={(e: LayoutChangeEvent) => {}}
        onPress={(e) => {
          const x = e.nativeEvent.locationX
          const idx = Math.min(
            data.length - 1,
            Math.max(0, Math.round((x / width) * (data.length - 1)))
          )
          setTooltip({ index: idx, x })
        }}
      >
        <Svg width={width} height={height}>
          <Polyline
            points={points}
            fill="none"
            stroke={Colors.textPrimary}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {tooltip !== null && (
            <Circle
              cx={pad + (tooltip.index / Math.max(data.length - 1, 1)) * (width - pad * 2)}
              cy={
                height -
                pad -
                (data[tooltip.index] / max) * (height - pad * 2)
              }
              r={4}
              fill={Colors.danger}
            />
          )}
        </Svg>
      </Pressable>
      {tooltip !== null && (
        <Text style={styles.tooltip}>
          {data[tooltip.index]} unité{data[tooltip.index] > 1 ? 's' : ''}
        </Text>
      )}
    </View>
  )
}

interface ProductStatsSectionProps {
  produit: Produit
}

export default function ProductStatsSection({ produit }: ProductStatsSectionProps) {
  const [expanded, setExpanded] = useState(true)
  const [stats, setStats] = useState<ProduitStats7J | null>(null)
  const [chartW, setChartW] = useState(280)
  const heightAnim = useSharedValue(1)

  useEffect(() => {
    getProduitStats7J(produit.id).then(setStats).catch(() => setStats(null))
  }, [produit.id])

  useEffect(() => {
    heightAnim.value = withTiming(expanded ? 1 : 0, { duration: 250 })
  }, [expanded])

  const collapseStyle = useAnimatedStyle(() => ({
    opacity: heightAnim.value,
    maxHeight: heightAnim.value * 320,
  }))

  const prix = produit.prixUnitaire ?? 0
  const valeurImmobilisee = produit.stockActuel * prix

  const dayLabels = stats?.ventesParJour.map((d) => {
    const date = new Date(d.date)
    return date.toLocaleDateString('fr-FR', { weekday: 'short' })
  })

  return (
    <View style={styles.section}>
      <Pressable style={styles.header} onPress={() => setExpanded((e) => !e)}>
        <Text style={styles.title}>Statistiques (7 jours)</Text>
        {expanded ? (
          <ChevronUp size={18} color={Colors.textSecondary} />
        ) : (
          <ChevronDown size={18} color={Colors.textSecondary} />
        )}
      </Pressable>

      <Animated.View style={[styles.body, collapseStyle]}>
        {stats && (
          <>
            <View
              style={styles.chartWrap}
              onLayout={(e) => setChartW(e.nativeEvent.layout.width)}
            >
              <Sparkline
                data={stats.ventesParJour.map((d) => d.quantite)}
                width={chartW}
                height={72}
              />
              <View style={styles.dayRow}>
                {dayLabels?.map((l, i) => (
                  <Text key={i} style={styles.dayLabel}>
                    {l}
                  </Text>
                ))}
              </View>
            </View>

            <View style={styles.grid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Valeur immobilisée</Text>
                <AnimatedNumber value={valeurImmobilisee} suffix=" F" />
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Écoulement</Text>
                <Text style={styles.statValue}>
                  ~{stats.vitesseEcoulement.toFixed(1)} u/j
                </Text>
              </View>
              <View style={[styles.statBox, styles.statBoxWide]}>
                <Text style={styles.statLabel}>Meilleur jour</Text>
                <Text style={styles.statValue}>
                  {stats.meilleurJour
                    ? `${new Date(stats.meilleurJour.date).toLocaleDateString('fr-FR', { weekday: 'long' })} (${stats.meilleurJour.quantite})`
                    : '—'}
                </Text>
              </View>
            </View>
          </>
        )}
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  body: {
    overflow: 'hidden',
    marginTop: 12,
  },
  chartWrap: {
    marginBottom: 16,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  dayLabel: {
    fontFamily: FontFamily.content,
    fontSize: 9,
    color: Colors.textTertiary,
    flex: 1,
    textAlign: 'center',
  },
  tooltip: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 12,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
  },
  statBoxWide: {
    minWidth: '100%',
  },
  statLabel: {
    fontFamily: FontFamily.content,
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 15,
    color: Colors.textPrimary,
  },
})
