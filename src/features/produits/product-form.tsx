import React, { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  ActivityIndicator,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from 'react-native-reanimated'
import { ChevronDown, Check } from 'lucide-react-native'
import Selector, { SelectorOption } from '@/components/customs/Selector'
import { Colors } from '@/constants/colors'
import { FontFamily } from '@/constants/typography'
import type { Produit, ProduitForm, TypeVente } from '@/types'
import { initDB } from '@/lib/db/schema'

const UNITES = ['pièce', 'kg', 'litre', 'boîte', 'sachet', 'unités']

const TYPE_OPTIONS: { value: TypeVente; label: string }[] = [
  { value: 'piece', label: 'Pièce' },
  { value: 'carton', label: 'Carton' },
  { value: 'les_deux', label: 'Les deux' },
]

export interface ProductFormValues {
  nom: string
  categorie: string
  typeVente: TypeVente
  prixUnitaire: string
  prixCarton: string
  unitesParCarton: string
  unite: string
  stockMin: string
  stockMax: string
  echangeable: boolean
}

export function produitToFormValues(p?: Produit | null): ProductFormValues {
  if (!p) {
    return {
      nom: '',
      categorie: 'Autres',
      typeVente: 'piece',
      prixUnitaire: '',
      prixCarton: '',
      unitesParCarton: '',
      unite: 'pièce',
      stockMin: '10',
      stockMax: '',
      echangeable: false,
    }
  }
  return {
    nom: p.nom,
    categorie: p.categorie,
    typeVente: p.typeVente,
    prixUnitaire: p.prixUnitaire != null ? String(p.prixUnitaire) : '',
    prixCarton: p.prixCarton != null ? String(p.prixCarton) : '',
    unitesParCarton: p.unitesParCarton != null ? String(p.unitesParCarton) : '',
    unite: p.unite || 'pièce',
    stockMin: String(p.stockMin),
    stockMax: p.stockMax != null ? String(p.stockMax) : '',
    echangeable: false,
  }
}

export function formValuesToProduitForm(v: ProductFormValues, stockActuel: number): ProduitForm {
  return {
    nom: v.nom.trim(),
    categorie: v.categorie,
    typeVente: v.typeVente,
    prixUnitaire: v.typeVente !== 'carton' ? parseFloat(v.prixUnitaire) || null : null,
    prixCarton: v.typeVente !== 'piece' ? parseFloat(v.prixCarton) || null : null,
    unitesParCarton:
      v.typeVente !== 'piece' ? parseInt(v.unitesParCarton, 10) || null : null,
    stockActuel,
    stockMin: parseInt(v.stockMin, 10) || 0,
    stockMax: v.stockMax.trim() ? parseInt(v.stockMax, 10) : undefined,
    unite: v.unite,
  }
}

function Field({
  label,
  error,
  children,
  shake,
}: {
  label: string
  error?: string
  children: React.ReactNode
  shake?: boolean
}) {
  const tx = useSharedValue(0)
  useEffect(() => {
    if (shake) {
      tx.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(-4, { duration: 50 }),
        withTiming(4, { duration: 50 }),
        withTiming(0, { duration: 50 })
      )
    }
  }, [shake])
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }] }))
  return (
    <Animated.View style={[styles.field, style]}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </Animated.View>
  )
}

function ConditionalBlock({ visible, children }: { visible: boolean; children: React.ReactNode }) {
  const progress = useSharedValue(visible ? 1 : 0)
  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, { duration: 200 })
  }, [visible])
  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    maxHeight: progress.value * 400,
    overflow: 'hidden',
  }))
  if (!visible) return null
  return <Animated.View style={style}>{children}</Animated.View>
}

interface ProductFormProps {
  initial?: Produit | null
  saving?: boolean
  success?: boolean
  onSubmit: (form: ProduitForm) => Promise<void>
}

export default function ProductForm({
  initial,
  saving,
  success,
  onSubmit,
}: ProductFormProps) {
  const [values, setValues] = useState(() => produitToFormValues(initial))
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormValues, string>>>({})
  const [shakeKey, setShakeKey] = useState<string | null>(null)
  const [categories, setCategories] = useState<SelectorOption[]>([])
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [uniteOpen, setUniteOpen] = useState(false)

  const fetchCategories = useCallback(async () => {
    const db = await initDB()
    const rows = await db.getAllAsync<{ nom: string }>(
      'SELECT nom FROM categories ORDER BY nom ASC'
    )
    setCategories(rows.map((r) => ({ label: r.nom, value: r.nom })))
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const set = <K extends keyof ProductFormValues>(key: K, val: ProductFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: val }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const validate = (): boolean => {
    const next: typeof errors = {}
    if (!values.nom.trim()) next.nom = 'Nom requis'
    if (values.typeVente !== 'carton' && !values.prixUnitaire.trim()) {
      next.prixUnitaire = 'Prix unitaire requis'
    }
    if (values.typeVente !== 'piece') {
      if (!values.prixCarton.trim()) next.prixCarton = 'Prix carton requis'
      if (!values.unitesParCarton.trim()) next.unitesParCarton = 'Unités/carton requis'
    }
    if (!values.stockMin.trim()) next.stockMin = 'Seuil requis'
    setErrors(next)
    const firstKey = Object.keys(next)[0]
    if (firstKey) setShakeKey(firstKey)
    return Object.keys(next).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    const stockActuel = initial?.stockActuel ?? 0
    await onSubmit(formValuesToProduitForm(values, stockActuel))
  }

  const showUnitaire = values.typeVente === 'piece' || values.typeVente === 'les_deux'
  const showCarton = values.typeVente === 'carton' || values.typeVente === 'les_deux'

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Field label="Nom *" error={errors.nom} shake={shakeKey === 'nom'}>
        <TextInput
          style={styles.input}
          value={values.nom}
          onChangeText={(t) => set('nom', t)}
          placeholder="Nom du produit"
          placeholderTextColor={Colors.textTertiary}
        />
      </Field>

      <Field label="Catégorie">
        <Pressable style={styles.selector} onPress={() => setSelectorOpen(true)}>
          <Text style={styles.selectorText}>{values.categorie}</Text>
          <ChevronDown size={18} color={Colors.textSecondary} />
        </Pressable>
      </Field>

      <Text style={styles.sectionLabel}>Type de vente</Text>
      <View style={styles.segmented}>
        {TYPE_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            style={[
              styles.segment,
              values.typeVente === opt.value && styles.segmentActive,
            ]}
            onPress={() => set('typeVente', opt.value)}
          >
            <Text
              style={[
                styles.segmentText,
                values.typeVente === opt.value && styles.segmentTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ConditionalBlock visible={showUnitaire}>
        <Field label="Prix unitaire *" error={errors.prixUnitaire} shake={shakeKey === 'prixUnitaire'}>
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            value={values.prixUnitaire}
            onChangeText={(t) => set('prixUnitaire', t)}
            placeholder="0"
          />
        </Field>
      </ConditionalBlock>

      <ConditionalBlock visible={showCarton}>
        <Field label="Prix carton *" error={errors.prixCarton} shake={shakeKey === 'prixCarton'}>
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            value={values.prixCarton}
            onChangeText={(t) => set('prixCarton', t)}
          />
        </Field>
        <Field
          label="Unités par carton *"
          error={errors.unitesParCarton}
          shake={shakeKey === 'unitesParCarton'}
        >
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={values.unitesParCarton}
            onChangeText={(t) => set('unitesParCarton', t)}
          />
        </Field>
      </ConditionalBlock>

      <Field label="Unité">
        <Pressable style={styles.selector} onPress={() => setUniteOpen(true)}>
          <Text style={styles.selectorText}>{values.unite}</Text>
          <ChevronDown size={18} color={Colors.textSecondary} />
        </Pressable>
      </Field>

      <View style={styles.row2}>
        <View style={styles.half}>
          <Field label="Seuil alerte min *" error={errors.stockMin} shake={shakeKey === 'stockMin'}>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={values.stockMin}
              onChangeText={(t) => set('stockMin', t)}
            />
          </Field>
        </View>
        <View style={styles.half}>
          <Field label="Stock max (opt.)">
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={values.stockMax}
              onChangeText={(t) => set('stockMax', t)}
            />
          </Field>
        </View>
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Produit échangeable / retour accepté</Text>
        <Switch
          value={values.echangeable}
          onValueChange={(v) => set('echangeable', v)}
          trackColor={{ false: Colors.border, true: Colors.textPrimary }}
        />
      </View>

      <Pressable
        style={[styles.saveBtn, (saving || Object.keys(errors).length > 0) && styles.saveDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {success ? (
          <Check size={22} color={Colors.textInverse} strokeWidth={3} />
        ) : saving ? (
          <ActivityIndicator color={Colors.textInverse} />
        ) : (
          <Text style={styles.saveText}>Enregistrer</Text>
        )}
      </Pressable>

      <Selector
        visible={selectorOpen}
        title="Catégorie"
        options={categories.length ? categories : [{ label: 'Autres', value: 'Autres' }]}
        selectedValue={values.categorie}
        onClose={() => setSelectorOpen(false)}
        onSelect={(o) => set('categorie', o.value)}
      />
      <Selector
        visible={uniteOpen}
        title="Unité"
        options={UNITES.map((u) => ({ label: u, value: u }))}
        selectedValue={values.unite}
        onClose={() => setUniteOpen(false)}
        onSelect={(o) => set('unite', o.value)}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  field: { marginBottom: 16 },
  label: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: FontFamily.content,
    fontSize: 15,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  error: {
    fontFamily: FontFamily.content,
    fontSize: 11,
    color: Colors.danger,
    marginTop: 4,
  },
  sectionLabel: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  segmentActive: {
    backgroundColor: Colors.textPrimary,
  },
  segmentText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  segmentTextActive: {
    color: Colors.textInverse,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
  },
  selectorText: {
    fontFamily: FontFamily.content,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  row2: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingVertical: 8,
  },
  switchLabel: {
    fontFamily: FontFamily.content,
    fontSize: 13,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 12,
  },
  saveBtn: {
    backgroundColor: Colors.textPrimary,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveDisabled: { opacity: 0.5 },
  saveText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 15,
    color: Colors.textInverse,
  },
})
