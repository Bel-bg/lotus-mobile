import React, { useCallback, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router'

import { copyText } from '@/lib/utils/clipboard'
import Animated, {
  FadeInDown,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated'
import {
  ArrowLeft,
  Pencil,
  Plus,
  Minus,
  Trash2,
  Copy,
  ChevronRight,
} from 'lucide-react-native'
import { Colors } from '@/constants/colors'
import { FontFamily } from '@/constants/typography'
import { getProduitById } from '@/lib/db/produits'
import { getMouvementsByProduit } from '@/lib/db/mouvements'
import { getStockStatut, getStockLabel, getStockColor, getStockBgColor } from '@/lib/utils/stock'
import type { Produit, Mouvement } from '@/types'
import AnimatedStockBar from '@/features/produits/animated-stock-bar'
import QuickActionSheet from '@/features/produits/quick-action-sheet'
import ProductStatsSection from '@/features/produits/product-stats-section'
import CustomAlert from '@/components/customs/Alert'
import CustomToast from '@/components/customs/toast'
import Loader from '@/components/ui/loader'
import { useStockStore } from '@/store/useStockStore'
import { useAuthStore } from '@/store/useAuthStore'

function RuptureBanner() {
  const opacity = useSharedValue(1)
  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.55, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      false
    )
  }, [])
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }))
  return (
    <Animated.View style={[styles.ruptureBanner, style]}>
      <Text style={styles.ruptureText}>RUPTURE DE STOCK</Text>
    </Animated.View>
  )
}

export default function ProduitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const removeProduit = useStockStore((s) => s.removeProduit)
  const loadProduits = useStockStore((s) => s.loadProduits)
  const devise = useAuthStore((s) => s.boutique?.devise ?? 'FCFA')

  const [produit, setProduit] = useState<Produit | null>(null)
  const [mouvements, setMouvements] = useState<Mouvement[]>([])
  const [loading, setLoading] = useState(true)
  const [quickVisible, setQuickVisible] = useState(false)
  const [quickMode, setQuickMode] = useState<'entree' | 'sortie'>('entree')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [toast, setToast] = useState({ visible: false, text: '' })

  const productId = Array.isArray(id) ? id[0] : id

  const load = useCallback(async () => {
    if (!productId) return
    setLoading(true)
    try {
      const [p, m] = await Promise.all([
        getProduitById(productId),
        getMouvementsByProduit(productId),
      ])
      setProduit(p)
      setMouvements(m.slice(0, 5))
    } finally {
      setLoading(false)
    }
  }, [productId])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load])
  )

  const copyCode = async () => {
    if (!produit?.barcode) return
    const ok = await copyText(produit.barcode)
    setToast({ visible: true, text: ok ? 'Code copié' : produit.barcode })
  }

  const openQuick = (mode: 'entree' | 'sortie') => {
    setQuickMode(mode)
    setQuickVisible(true)
  }

  const handleDelete = async () => {
    if (!produit) return
    await removeProduit(produit.id)
    setDeleteConfirm(false)
    router.back()
  }

  if (loading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Loader message="Chargement…" />
      </View>
    )
  }

  if (!produit) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.error}>Produit introuvable</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Retour</Text>
        </Pressable>
      </View>
    )
  }

  const statut = getStockStatut(produit)
  const prix = produit.prixUnitaire ?? produit.prixCarton

  const quickActions = [
    { key: 'entree', label: '+ Entrée', icon: Plus, onPress: () => openQuick('entree') },
    { key: 'sortie', label: '- Sortie', icon: Minus, onPress: () => openQuick('sortie') },
    {
      key: 'edit',
      label: 'Modifier',
      icon: Pencil,
      onPress: () =>
        router.push({
          pathname: '/(drawer)/(tabs)/produits/edit',
          params: { id: produit.id },
        } as never),
    },
    {
      key: 'delete',
      label: 'Supprimer',
      icon: Trash2,
      onPress: () => setDeleteConfirm(true),
    },
  ]

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {statut === 'rupture' && <RuptureBanner />}

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={22} color={Colors.textPrimary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{produit.nom}</Text>
          <View style={[styles.statusPill, { backgroundColor: getStockBgColor(statut) }]}>
            <Text style={[styles.statusPillText, { color: getStockColor(statut) }]}>
              {getStockLabel(statut).toUpperCase()}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/(drawer)/(tabs)/produits/edit',
              params: { id: produit.id },
            } as never)
          }
          style={styles.iconBtn}
        >
          <Pencil size={20} color={Colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(0)} style={styles.hero}>
          <View style={styles.heroRow}>
            <Text style={styles.heroLabel}>Catégorie</Text>
            <Text style={styles.heroValue}>{produit.categorie}</Text>
          </View>
          <Pressable style={styles.heroRow} onPress={copyCode} disabled={!produit.barcode}>
            <Text style={styles.heroLabel}>Code produit</Text>
            <View style={styles.barcodeRow}>
              <Text style={styles.heroValue} selectable>
                {produit.barcode ?? '—'}
              </Text>
              {produit.barcode ? <Copy size={14} color={Colors.textSecondary} /> : null}
            </View>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80)} style={styles.section}>
          <Text style={styles.sectionTitle}>Tarification</Text>
          <Text style={styles.row}>
            Prix de vente :{' '}
            <Text style={styles.rowBold}>
              {prix != null ? `${prix.toLocaleString('fr-FR')} ${devise}` : '—'}
            </Text>
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160)} style={styles.section}>
          <Text style={styles.sectionTitle}>Stock</Text>
          <AnimatedStockBar produit={produit} duration={800} />
          <View style={styles.stockGrid}>
            <View style={styles.stockCell}>
              <Text style={styles.cellLabel}>Actuel</Text>
              <Text style={styles.cellValue}>{produit.stockActuel}</Text>
            </View>
            <View style={styles.stockCell}>
              <Text style={styles.cellLabel}>Min</Text>
              <Text style={styles.cellValue}>{produit.stockMin}</Text>
            </View>
            <View style={styles.stockCell}>
              <Text style={styles.cellLabel}>Max</Text>
              <Text style={styles.cellValue}>{produit.stockMax ?? '—'}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240)} style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.actionsRow}>
            {quickActions.map((a, i) => (
              <Animated.View key={a.key} entering={ZoomIn.delay(i * 50)}>
                <Pressable style={styles.actionChip} onPress={a.onPress}>
                  <a.icon size={18} color={Colors.textPrimary} />
                  <Text style={styles.actionLabel}>{a.label}</Text>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(320)}>
          <ProductStatsSection produit={produit} />
        </Animated.View>

        <View style={styles.section}>
          <View style={styles.histHeader}>
            <Text style={styles.sectionTitle}>Historique</Text>
            <Pressable
              onPress={() =>
                router.replace('/(drawer)/(tabs)/move')
              }
            >
              <Text style={styles.voirTout}>
                Voir tout <ChevronRight size={14} />
              </Text>
            </Pressable>
          </View>
          {mouvements.length === 0 ? (
            <Text style={styles.rowMuted}>Aucun mouvement récent</Text>
          ) : (
            mouvements.map((m) => (
              <View key={m.id} style={styles.mvtRow}>
                <Text
                  style={[
                    styles.mvtType,
                    { color: m.type === 'entree' ? Colors.success : Colors.danger },
                  ]}
                >
                  {m.type === 'entree' ? '+' : '−'}
                  {m.quantite}
                </Text>
                <Text style={styles.mvtNote} numberOfLines={1}>
                  {m.note || '—'}
                </Text>
                <Text style={styles.mvtDate}>
                  {new Date(m.createdAt).toLocaleDateString('fr-FR')}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <QuickActionSheet
        visible={quickVisible}
        produit={produit}
        initialMode={quickMode}
        onClose={() => setQuickVisible(false)}
        onSuccess={() => {
          load()
          loadProduits()
        }}
      />

      <CustomAlert
        isVisible={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        title="Supprimer ce produit ?"
        description="Cette action est irréversible."
        iconName="AlertTriangle"
        color={Colors.danger}
        primaryButtonLabel="Supprimer"
        onPrimaryPress={handleDelete}
        secondaryButtonLabel="Annuler"
        onSecondaryPress={() => setDeleteConfirm(false)}
      />

      <CustomToast
        visible={toast.visible}
        text={toast.text}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { fontFamily: FontFamily.content, color: Colors.danger },
  link: { fontFamily: FontFamily.utilityBold, marginTop: 12, color: Colors.textPrimary },
  ruptureBanner: {
    backgroundColor: Colors.danger,
    paddingVertical: 8,
    alignItems: 'center',
  },
  ruptureText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 12,
    color: Colors.textInverse,
    letterSpacing: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconBtn: { padding: 8 },
  headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  headerTitle: {
    fontFamily: FontFamily.display,
    fontSize: 17,
    color: Colors.textPrimary,
  },
  statusPill: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusPillText: { fontFamily: FontFamily.utilityBold, fontSize: 10 },
  scroll: { padding: 20, paddingBottom: 40 },
  hero: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroLabel: { fontFamily: FontFamily.content, fontSize: 13, color: Colors.textSecondary },
  heroValue: { fontFamily: FontFamily.displaySemi, fontSize: 14, color: Colors.textPrimary },
  barcodeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  section: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  row: { fontFamily: FontFamily.content, fontSize: 14, color: Colors.textSecondary, marginBottom: 6 },
  rowBold: { fontFamily: FontFamily.displaySemi, color: Colors.textPrimary },
  rowMuted: { fontFamily: FontFamily.content, fontSize: 13, color: Colors.textTertiary },
  stockGrid: { flexDirection: 'row', gap: 8, marginTop: 12 },
  stockCell: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  cellLabel: { fontFamily: FontFamily.content, fontSize: 11, color: Colors.textSecondary },
  cellValue: { fontFamily: FontFamily.displaySemi, fontSize: 16, color: Colors.textPrimary },
  actionsSection: { marginBottom: 16 },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  actionLabel: { fontFamily: FontFamily.utilityBold, fontSize: 12, color: Colors.textPrimary },
  histHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  voirTout: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 13,
    color: Colors.textSecondary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mvtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  mvtType: { fontFamily: FontFamily.utilityBold, fontSize: 14, width: 48 },
  mvtNote: { flex: 1, fontFamily: FontFamily.content, fontSize: 13, color: Colors.textPrimary },
  mvtDate: { fontFamily: FontFamily.content, fontSize: 11, color: Colors.textTertiary },
})
