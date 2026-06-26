import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Minus, Plus, Check } from 'lucide-react-native'
import { Colors } from '@/constants/colors'
import { FontFamily } from '@/constants/typography'
import type { Produit } from '@/types'
import { useStockStore } from '@/store/useStockStore'
import CustomToast from '@/components/customs/toast'

type Mode = 'entree' | 'sortie'

export interface QuickActionSheetProps {
  visible: boolean
  produit: Produit | null
  initialMode?: Mode
  onClose: () => void
  onSuccess?: () => void
}

const SPRING = { damping: 22, stiffness: 220 }

export default function QuickActionSheet({
  visible,
  produit,
  initialMode = 'entree',
  onClose,
  onSuccess,
}: QuickActionSheetProps) {
  const insets = useSafeAreaInsets()
  const entreeStock = useStockStore((s) => s.entreeStock)
  const sortieStock = useStockStore((s) => s.sortieStock)

  const [mode, setMode] = useState<Mode>(initialMode)
  const [qty, setQty] = useState(1)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [toast, setToast] = useState({ visible: false, text: '' })

  const translateY = useSharedValue(400)
  const modeProgress = useSharedValue(initialMode === 'entree' ? 0 : 1)

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rapidInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  const stockActuel = produit?.stockActuel ?? 0
  const sortieBlocked = mode === 'sortie' && qty > stockActuel
  const wouldReachZero = mode === 'sortie' && stockActuel - qty <= 0

  useEffect(() => {
    if (visible) {
      setMode(initialMode)
      setQty(1)
      setNote('')
      setSuccess(false)
      modeProgress.value = initialMode === 'entree' ? 0 : 1
      translateY.value = withSpring(0, SPRING)
    } else {
      translateY.value = withTiming(400, { duration: 220 })
    }
  }, [visible, initialMode])

  const closeSheet = useCallback(() => {
    translateY.value = withTiming(400, { duration: 200 }, (finished) => {
      if (finished) runOnJS(onClose)()
    })
  }, [onClose])

  const clearRapid = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
    if (rapidInterval.current) clearInterval(rapidInterval.current)
    longPressTimer.current = null
    rapidInterval.current = null
  }

  const changeQty = (delta: number) => {
    setQty((q) => Math.max(1, q + delta))
  }

  const onPressIn = (delta: number) => {
    changeQty(delta)
    longPressTimer.current = setTimeout(() => {
      rapidInterval.current = setInterval(() => changeQty(delta * 5), 120)
    }, 500)
  }

  const switchMode = (next: Mode) => {
    setMode(next)
    modeProgress.value = withTiming(next === 'entree' ? 0 : 1, { duration: 200 })
  }

  const handleSave = async () => {
    if (!produit || sortieBlocked || saving) return
    setSaving(true)
    try {
      if (mode === 'entree') {
        await entreeStock(produit.id, qty, note.trim() || undefined)
      } else {
        await sortieStock(produit.id, qty, note.trim() || undefined)
      }
      setSuccess(true)
      setToast({
        visible: true,
        text: mode === 'entree' ? 'Entrée enregistrée' : 'Sortie enregistrée',
      })
      onSuccess?.()
      setTimeout(() => {
        setSuccess(false)
        closeSheet()
      }, 600)
    } catch {
      setToast({ visible: true, text: 'Erreur lors de l\'enregistrement' })
    } finally {
      setSaving(false)
    }
  }

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  const toggleBgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      modeProgress.value,
      [0, 1],
      [Colors.successLight, Colors.dangerLight]
    ),
  }))

  const saveBtnStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      modeProgress.value,
      [0, 1],
      [Colors.success, Colors.danger]
    ),
  }))

  if (!produit) return null

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={closeSheet}>
      <Pressable style={styles.backdrop} onPress={closeSheet} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[styles.sheet, { paddingBottom: insets.bottom + 16 }, sheetStyle]}
        >
          <View style={styles.handle} />
          <Text style={styles.productName} numberOfLines={1}>{produit.nom}</Text>
          <Text style={styles.stockCtx}>
            Stock actuel : <Text style={styles.stockBold}>{stockActuel}</Text>
          </Text>

          <Animated.View style={[styles.toggleRow, toggleBgStyle]}>
            <Pressable
              style={[styles.toggleBtn, mode === 'entree' && styles.toggleBtnActive]}
              onPress={() => switchMode('entree')}
            >
              <Text style={[styles.toggleText, mode === 'entree' && styles.toggleTextActive]}>
                Entrée
              </Text>
            </Pressable>
            <Pressable
              style={[styles.toggleBtn, mode === 'sortie' && styles.toggleBtnActive]}
              onPress={() => switchMode('sortie')}
            >
              <Text style={[styles.toggleText, mode === 'sortie' && styles.toggleTextActive]}>
                Sortie
              </Text>
            </Pressable>
          </Animated.View>

          <View style={styles.stepperRow}>
            <Pressable
              style={[styles.stepBtn, wouldReachZero && styles.stepBtnDanger]}
              onPressIn={() => onPressIn(-1)}
              onPressOut={clearRapid}
            >
              <Minus size={22} color={wouldReachZero ? Colors.danger : Colors.textPrimary} />
            </Pressable>
            <TextInput
              style={styles.qtyInput}
              keyboardType="number-pad"
              value={String(qty)}
              onChangeText={(t) => {
                const n = parseInt(t.replace(/\D/g, ''), 10)
                setQty(Number.isFinite(n) && n > 0 ? n : 1)
              }}
            />
            <Pressable
              style={styles.stepBtn}
              onPressIn={() => onPressIn(1)}
              onPressOut={clearRapid}
            >
              <Plus size={22} color={Colors.textPrimary} />
            </Pressable>
          </View>

          {sortieBlocked && (
            <Text style={styles.errorMsg}>
              Quantité supérieure au stock disponible ({stockActuel})
            </Text>
          )}

          <TextInput
            style={styles.noteInput}
            placeholder="Note (optionnel)"
            placeholderTextColor={Colors.textTertiary}
            value={note}
            onChangeText={setNote}
            multiline
          />

          <Pressable
            disabled={sortieBlocked || saving || success}
            onPress={handleSave}
          >
            <Animated.View style={[styles.saveBtn, saveBtnStyle, (sortieBlocked || saving) && styles.saveBtnDisabled]}>
              {success ? (
                <Check size={22} color={Colors.textInverse} strokeWidth={3} />
              ) : (
                <Text style={styles.saveBtnText}>
                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                </Text>
              )}
            </Animated.View>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>

      <CustomToast
        visible={toast.visible}
        text={toast.text}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
  },
  keyboard: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  productName: {
    fontFamily: FontFamily.display,
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  stockCtx: {
    fontFamily: FontFamily.content,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  stockBold: {
    fontFamily: FontFamily.utilityBold,
    color: Colors.textPrimary,
  },
  toggleRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: Colors.background,
  },
  toggleText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  toggleTextActive: {
    color: Colors.textPrimary,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 12,
  },
  stepBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepBtnDanger: {
    borderColor: Colors.dangerBorder,
    backgroundColor: Colors.dangerLight,
  },
  qtyInput: {
    minWidth: 72,
    textAlign: 'center',
    fontFamily: FontFamily.display,
    fontSize: 28,
    color: Colors.textPrimary,
    paddingVertical: 8,
  },
  errorMsg: {
    fontFamily: FontFamily.content,
    fontSize: 12,
    color: Colors.danger,
    textAlign: 'center',
    marginBottom: 12,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    fontFamily: FontFamily.content,
    fontSize: 14,
    color: Colors.textPrimary,
    minHeight: 44,
    marginBottom: 16,
  },
  saveBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.45,
  },
  saveBtnText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 15,
    color: Colors.textInverse,
  },
})
