import React from 'react'
import { ScrollView, Pressable, Text, StyleSheet, View } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { Colors } from '@/constants/colors'
import { FontFamily } from '@/constants/typography'
import type { StockStatut } from '@/types'

export type StockFilter = 'tout' | StockStatut

const STOCK_FILTERS: { key: StockFilter; label: string }[] = [
  { key: 'tout', label: 'Tout' },
  { key: 'faible', label: 'Faible' },
  { key: 'critique', label: 'Critique' },
  { key: 'rupture', label: 'Rupture' },
]

interface FilterChipsProps {
  stockFilter: StockFilter
  categorieFilter: string | null
  categories: string[]
  onStockFilter: (f: StockFilter) => void
  onCategorieFilter: (c: string | null) => void
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string
  active: boolean
  onPress: () => void
}) {
  const underline = useSharedValue(active ? 1 : 0)

  React.useEffect(() => {
    underline.value = withSpring(active ? 1 : 0, { damping: 14, stiffness: 160 })
  }, [active])

  const lineStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: underline.value }],
    opacity: underline.value,
  }))

  return (
    <Pressable onPress={onPress} style={styles.chip}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
      <Animated.View style={[styles.underline, lineStyle]} />
    </Pressable>
  )
}

export default function FilterChips({
  stockFilter,
  categorieFilter,
  categories,
  onStockFilter,
  onCategorieFilter,
}: FilterChipsProps) {
  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {STOCK_FILTERS.map((f) => (
          <Chip
            key={f.key}
            label={f.label}
            active={stockFilter === f.key}
            onPress={() => onStockFilter(f.key)}
          />
        ))}
        <View style={styles.divider} />
        <Chip
          label="Toutes catégories"
          active={categorieFilter === null}
          onPress={() => onCategorieFilter(null)}
        />
        {categories.map((cat) => (
          <Chip
            key={cat}
            label={cat}
            active={categorieFilter === cat}
            onPress={() => onCategorieFilter(cat)}
          />
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  row: {
    paddingHorizontal: 20,
    gap: 16,
    alignItems: 'flex-end',
  },
  chip: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  chipText: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.textPrimary,
  },
  underline: {
    height: 2,
    backgroundColor: Colors.textPrimary,
    width: '100%',
    marginTop: 4,
    borderRadius: 1,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
    alignSelf: 'center',
  },
})
