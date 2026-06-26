// ============================================
// LOTUS BUSINESS — Modal : Seuils de stock
// ============================================

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet'
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import {
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import PrimaryButton from '@/components/PrimaryButton'
import CustomToast from '@/components/customs/toast'
import { Colors } from '@/constants/colors'
import { FontFamily, FontSize } from '@/constants/typography'
import { getStockConfig, saveStockConfig } from '@/lib/db/stock-config'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StockConfigSheetRef {
  open: () => void
  close: () => void
}

type Props = {
  onSuccess?: () => void
}

// ─── Niveaux ──────────────────────────────────────────────────────────────────

const NIVEAUX = [
  {
    key: 'faible',
    label: 'Faible',
    description: 'Stock ≤ seuil → alerte critique',
    color: Colors.danger,
    bg: Colors.dangerLight,
    border: Colors.dangerBorder,
  },
  {
    key: 'moyen',
    label: 'Moyen',
    description: 'Seuil Faible < stock ≤ ce seuil',
    color: Colors.warning,
    bg: Colors.warningLight,
    border: Colors.warningBorder,
  },
  {
    key: 'bon',
    label: 'Bon',
    description: 'Stock > seuil Moyen',
    color: Colors.success,
    bg: Colors.successLight,
    border: Colors.successBorder,
    readOnly: true,
  },
] as const

// ─── Composant ────────────────────────────────────────────────────────────────

const StockConfigSheet = forwardRef<StockConfigSheetRef, Props>(
  ({ onSuccess }, ref) => {
    const insets = useSafeAreaInsets()
    const sheetRef = useRef<BottomSheetModal>(null)

    const [seuilFaible, setSeuilFaible] = useState('')
    const [seuilMoyen, setSeuilMoyen] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [errors, setErrors] = useState<{ faible?: string; moyen?: string }>({})
    const [toast, setToast] = useState({ visible: false, text: '', color: Colors.success })

    // Charge les valeurs actuelles à l'ouverture
    const loadConfig = useCallback(async () => {
      try {
        const config = await getStockConfig()
        setSeuilFaible(String(config.seuilFaible))
        setSeuilMoyen(String(config.seuilMoyen))
      } catch {
        setSeuilFaible('10')
        setSeuilMoyen('30')
      }
    }, [])

    useImperativeHandle(ref, () => ({
      open: () => {
        void loadConfig()
        setErrors({})
        sheetRef.current?.present()
      },
      close: () => sheetRef.current?.dismiss(),
    }))

    const renderBackdrop = useCallback(
      (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.45}
          pressBehavior="close"
        />
      ),
      [],
    )

    const validate = (): { faible: number; moyen: number } | null => {
      const faible = parseInt(seuilFaible.trim(), 10)
      const moyen = parseInt(seuilMoyen.trim(), 10)
      const nextErrors: { faible?: string; moyen?: string } = {}

      if (isNaN(faible) || faible < 0) {
        nextErrors.faible = 'Entrez un nombre entier positif'
      }
      if (isNaN(moyen) || moyen < 0) {
        nextErrors.moyen = 'Entrez un nombre entier positif'
      }
      if (!nextErrors.faible && !nextErrors.moyen && faible >= moyen) {
        nextErrors.faible = 'Le seuil Faible doit être inférieur au seuil Moyen'
      }

      setErrors(nextErrors)
      return Object.keys(nextErrors).length === 0 ? { faible, moyen } : null
    }

    const handleSave = async () => {
      const values = validate()
      if (!values) return

      setIsSaving(true)
      try {
        await saveStockConfig({ seuilFaible: values.faible, seuilMoyen: values.moyen })
        setToast({ visible: true, text: 'Seuils enregistrés', color: Colors.success })
        sheetRef.current?.dismiss()
        onSuccess?.()
      } catch (err: any) {
        setToast({ visible: true, text: err?.message ?? 'Erreur lors de la sauvegarde', color: Colors.danger })
      } finally {
        setIsSaving(false)
      }
    }

    return (
      <>
        <BottomSheetModal
          ref={sheetRef}
          snapPoints={['55%', '75%']}
          enablePanDownToClose
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
          android_keyboardInputMode="adjustResize"
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={styles.handle}
          backgroundStyle={styles.background}
        >
          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.content,
              { paddingBottom: Math.max(insets.bottom, 24) },
            ]}
          >
            {/* En-tête */}
            <View style={styles.header}>
              <Text style={styles.title}>Niveaux de stock</Text>
              <Text style={styles.subtitle}>
                Définissez les seuils qui déterminent si un stock est faible, moyen ou bon.
              </Text>
            </View>

            {/* Aperçu visuel des 3 niveaux */}
            <View style={styles.levelsRow}>
              {NIVEAUX.map((n) => (
                <View
                  key={n.key}
                  style={[styles.levelBadge, { backgroundColor: n.bg, borderColor: n.border }]}
                >
                  <View style={[styles.levelDot, { backgroundColor: n.color }]} />
                  <Text style={[styles.levelLabel, { color: n.color }]}>{n.label}</Text>
                </View>
              ))}
            </View>

            {/* Seuil Faible */}
            <View style={styles.field}>
              <View style={styles.fieldHeader}>
                <View style={[styles.fieldDot, { backgroundColor: Colors.danger }]} />
                <Text style={styles.fieldLabel}>Seuil Faible</Text>
              </View>
              <Text style={styles.fieldHint}>
                Un stock ≤ à cette valeur sera signalé comme <Text style={{ color: Colors.danger, fontFamily: FontFamily.utilityBold }}>Faible</Text>
              </Text>
              <View style={styles.inputRow}>
                <BottomSheetTextInput
                  value={seuilFaible}
                  onChangeText={(t) => {
                    setSeuilFaible(t.replace(/[^0-9]/g, ''))
                    setErrors((e) => ({ ...e, faible: undefined }))
                  }}
                  placeholder="ex : 10"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="number-pad"
                  style={[styles.input, errors.faible ? styles.inputError : null]}
                />
                <View style={styles.unitTag}>
                  <Text style={styles.unitText}>unités</Text>
                </View>
              </View>
              {errors.faible ? (
                <Text style={styles.errorText}>{errors.faible}</Text>
              ) : null}
            </View>

            {/* Seuil Moyen */}
            <View style={styles.field}>
              <View style={styles.fieldHeader}>
                <View style={[styles.fieldDot, { backgroundColor: Colors.warning }]} />
                <Text style={styles.fieldLabel}>Seuil Moyen</Text>
              </View>
              <Text style={styles.fieldHint}>
                Un stock entre Faible et cette valeur sera signalé comme <Text style={{ color: Colors.warning, fontFamily: FontFamily.utilityBold }}>Moyen</Text>
              </Text>
              <View style={styles.inputRow}>
                <BottomSheetTextInput
                  value={seuilMoyen}
                  onChangeText={(t) => {
                    setSeuilMoyen(t.replace(/[^0-9]/g, ''))
                    setErrors((e) => ({ ...e, moyen: undefined }))
                  }}
                  placeholder="ex : 30"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="number-pad"
                  style={[styles.input, errors.moyen ? styles.inputError : null]}
                />
                <View style={styles.unitTag}>
                  <Text style={styles.unitText}>unités</Text>
                </View>
              </View>
              {errors.moyen ? (
                <Text style={styles.errorText}>{errors.moyen}</Text>
              ) : null}
            </View>

            {/* Niveau Bon — lecture seule */}
            <View style={[styles.field, styles.readOnlyField]}>
              <View style={styles.fieldHeader}>
                <View style={[styles.fieldDot, { backgroundColor: Colors.success }]} />
                <Text style={styles.fieldLabel}>Bon</Text>
                <View style={styles.autoTag}>
                  <Text style={styles.autoTagText}>Automatique</Text>
                </View>
              </View>
              <Text style={styles.fieldHint}>
                Tout stock <Text style={{ color: Colors.success, fontFamily: FontFamily.utilityBold }}>supérieur au seuil Moyen</Text> est considéré comme bon.
              </Text>
            </View>

            <PrimaryButton
              label={isSaving ? 'Enregistrement...' : 'Enregistrer les seuils'}
              onPress={() => void handleSave()}
              disabled={isSaving}
            />
          </BottomSheetScrollView>
        </BottomSheetModal>

        <CustomToast
          visible={toast.visible}
          text={toast.text}
          color={toast.color}
          onHide={() => setToast((t) => ({ ...t, visible: false }))}
        />
      </>
    )
  },
)

StockConfigSheet.displayName = 'StockConfigSheet'
export default StockConfigSheet

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  background: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 20,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 4,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontFamily: FontFamily.displaySemi,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: FontSize.sm * 1.6,
  },
  levelsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  levelBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  levelDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
  },
  levelLabel: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.sm,
  },
  field: {
    gap: 8,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  fieldDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  fieldLabel: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  fieldHint: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: FontSize.sm * 1.55,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  unitTag: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unitText: {
    fontFamily: FontFamily.utility,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  errorText: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.sm,
    color: Colors.danger,
  },
  readOnlyField: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  autoTag: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: Colors.successLight,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.successBorder,
  },
  autoTagText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.xs,
    color: Colors.successText,
  },
})
