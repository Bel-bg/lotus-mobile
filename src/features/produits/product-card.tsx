import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  FadeInDown,
} from 'react-native-reanimated'
import { Plus, Pencil, Trash2 } from 'lucide-react-native'
import { Colors } from '@/constants/colors'
import { FontFamily } from '@/constants/typography'
import type { Produit } from '@/types'
import {
  getStockStatut,
  getStockLabel,
  getStockColor,
  getStockBgColor,
} from '@/lib/utils/stock'
import AnimatedStockBar from './animated-stock-bar'
import { useAuthStore } from '@/store/useAuthStore'

const SWIPE_ACTION_W = 72
const SPRING = { damping: 18, stiffness: 180 }

interface ProductCardProps {
  produit: Produit
  index: number
  selectionMode?: boolean
  selected?: boolean
  onPress: () => void
  onLongPress?: () => void
  onToggleSelect?: () => void
  onAddStock: () => void
  onEdit: () => void
  onDelete: () => void
}

function formatPrice(produit: Produit, devise: string) {
  if (produit.typeVente === 'carton' && produit.prixCarton != null) {
    return `${produit.prixCarton.toLocaleString('fr-FR')} ${devise} / carton`
  }
  if (produit.prixUnitaire != null) {
    return `${produit.prixUnitaire.toLocaleString('fr-FR')} ${devise}`
  }
  return '—'
}

function RuptureBadge() {
  const opacity = useSharedValue(1)
  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.45, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      false
    )
  }, [])
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }))
  return (
    <Animated.View style={[styles.statusBadge, styles.ruptureBadge, style]}>
      <Text style={[styles.statusText, { color: Colors.danger }]}>RUPTURE</Text>
    </Animated.View>
  )
}

export default function ProductCard({
  produit,
  index,
  selectionMode,
  selected,
  onPress,
  onLongPress,
  onToggleSelect,
  onAddStock,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const devise = useAuthStore((s) => s.boutique?.devise ?? 'FCFA')
  const statut = getStockStatut(produit)
  const translateX = useSharedValue(0)

  const pan = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .onUpdate((e) => {
      if (selectionMode) return
      translateX.value = Math.min(0, Math.max(e.translationX, -SWIPE_ACTION_W * 3))
    })
    .onEnd(() => {
      if (selectionMode) return
      const open = translateX.value < -SWIPE_ACTION_W
      translateX.value = withSpring(open ? -SWIPE_ACTION_W * 3 : 0, SPRING)
    })

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  const closeSwipe = () => {
    translateX.value = withSpring(0, SPRING)
  }

  const handleAction = (fn: () => void) => {
    closeSwipe()
    fn()
  }

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).springify()}>
      <View style={styles.swipeContainer}>
        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.actionBtn, styles.actionGreen]}
            onPress={() => handleAction(onAddStock)}
          >
            <Plus size={20} color="#FFF" />
            <Text style={styles.actionLabel}>Stock</Text>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, styles.actionDark]}
            onPress={() => handleAction(onEdit)}
          >
            <Pencil size={18} color="#FFF" />
          </Pressable>
          <Pressable
            style={[styles.actionBtn, styles.actionRed]}
            onPress={() => handleAction(onDelete)}
          >
            <Trash2 size={18} color="#FFF" />
          </Pressable>
        </View>

        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.card, cardStyle]}>
            <Pressable
              onPress={selectionMode ? onToggleSelect : onPress}
              onLongPress={onLongPress}
              style={({ pressed }) => [
                styles.cardInner,
                pressed && { opacity: 0.92 },
                selected && styles.cardSelected,
              ]}
            >
              <View style={styles.topRow}>
                <View style={styles.titleBlock}>
                  <Text style={styles.name} numberOfLines={1}>{produit.nom}</Text>
                  <View style={styles.catPill}>
                    <Text style={styles.catText}>{produit.categorie}</Text>
                  </View>
                </View>
                {statut === 'rupture' ? (
                  <RuptureBadge />
                ) : (
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStockBgColor(statut) },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: getStockColor(statut) }]}>
                      {getStockLabel(statut).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.price}>{formatPrice(produit, devise)}</Text>
              {produit.typeVente === 'les_deux' && produit.prixCarton != null && (
                <Text style={styles.priceSecondary}>
                  Carton : {produit.prixCarton.toLocaleString('fr-FR')} {devise}
                </Text>
              )}

              <AnimatedStockBar produit={produit} showLabels />
            </Pressable>
          </Animated.View>
        </GestureDetector>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  swipeContainer: {
    marginBottom: 12,
    marginHorizontal: 20,
    position: 'relative',
  },
  actionsRow: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  actionBtn: {
    width: SWIPE_ACTION_W,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  actionGreen: { backgroundColor: Colors.success },
  actionDark: { backgroundColor: Colors.textPrimary },
  actionRed: { backgroundColor: Colors.danger },
  actionLabel: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 9,
    color: '#FFF',
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardInner: { padding: 16 },
  cardSelected: {
    borderColor: Colors.textPrimary,
    borderWidth: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleBlock: { flex: 1, marginRight: 8 },
  name: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  catPill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  catText: {
    fontFamily: FontFamily.content,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ruptureBadge: {
    backgroundColor: Colors.dangerLight,
  },
  statusText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 10,
  },
  price: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  priceSecondary: {
    fontFamily: FontFamily.content,
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
})
