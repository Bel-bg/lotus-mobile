import React, { useCallback, useMemo, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect, useRouter } from 'expo-router'
import Animated, { ZoomIn } from 'react-native-reanimated'
import { ArrowLeft, Plus } from 'lucide-react-native'
import { Colors } from '@/constants/colors'
import { FontFamily } from '@/constants/typography'
import { useStockStore } from '@/store/useStockStore'
import { getStockStatut } from '@/lib/utils/stock'
import { getCategories } from '@/lib/db/produits'
import type { Produit } from '@/types'
import CatalogSearchBar from '@/features/produits/catalog-search-bar'
import FilterChips, { type StockFilter } from '@/features/produits/filter-chips'
import MetricCards from '@/features/produits/metric-cards'
import ProductCard from '@/features/produits/product-card'
import QuickActionSheet from '@/features/produits/quick-action-sheet'
import CustomAlert from '@/components/customs/Alert'
import Loader from '@/components/ui/loader'

const PAGE_SIZE = 20

function useDebounced<T>(value: T, delay: number, enabled: boolean): T {
  const [debounced, setDebounced] = useState(value)
  React.useEffect(() => {
    if (!enabled) {
      setDebounced(value)
      return
    }
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay, enabled])
  return debounced
}

export default function CatalogueScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const produits = useStockStore((s) => s.produits)
  const loadProduits = useStockStore((s) => s.loadProduits)
  const removeProduit = useStockStore((s) => s.removeProduit)
  const isLoading = useStockStore((s) => s.isLoading)

  const [searchExpanded, setSearchExpanded] = useState(false)
  const [search, setSearch] = useState('')
  const [stockFilter, setStockFilter] = useState<StockFilter>('tout')
  const [categorieFilter, setCategorieFilter] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [refreshing, setRefreshing] = useState(false)
  const [quickProduct, setQuickProduct] = useState<Produit | null>(null)
  const [quickMode, setQuickMode] = useState<'entree' | 'sortie'>('entree')
  const [quickVisible, setQuickVisible] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Produit | null>(null)
  const debouncedSearch = useDebounced(search, 300, produits.length > 200)

  useFocusEffect(
    useCallback(() => {
      loadProduits()
      getCategories().then(setCategories).catch(() => {})
    }, [loadProduits])
  )

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    return produits.filter((p) => {
      if (stockFilter !== 'tout' && getStockStatut(p) !== stockFilter) return false
      if (categorieFilter && p.categorie !== categorieFilter) return false
      if (q && !p.nom.toLowerCase().includes(q) && !p.categorie.toLowerCase().includes(q)) {
        return false
      }
      return true
    })
  }, [produits, stockFilter, categorieFilter, debouncedSearch])

  const paginated = useMemo(
    () => filtered.slice(0, page * PAGE_SIZE),
    [filtered, page]
  )

  const alertes = produits.filter((p) => getStockStatut(p) !== 'ok').length
  const valeurStock = produits.reduce((acc, p) => {
    const price =
      p.prixUnitaire ??
      (p.prixCarton && p.unitesParCarton ? p.prixCarton / p.unitesParCarton : 0)
    return acc + price * p.stockActuel
  }, 0)

  const onRefresh = async () => {
    setRefreshing(true)
    await loadProduits()
    setRefreshing(false)
  }

  const openQuick = (p: Produit, mode: 'entree' | 'sortie') => {
    setQuickProduct(p)
    setQuickMode(mode)
    setQuickVisible(true)
  }

  const renderItem = ({ item, index }: { item: Produit; index: number }) => (
    <ProductCard
      produit={item}
      index={index}
      onPress={() =>
        router.push(`/(drawer)/(tabs)/produits/${item.id}` as never)
      }
      onAddStock={() => openQuick(item, 'entree')}
      onEdit={() =>
        router.push({
          pathname: '/(drawer)/(tabs)/produits/edit',
          params: { id: item.id },
        } as never)
      }
      onDelete={() => setDeleteTarget(item)}
    />
  )

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Catalogue</Text>
        <View style={{ width: 40 }} />
      </View> */}

      <CatalogSearchBar
        expanded={searchExpanded}
        value={search}
        onChangeText={setSearch}
        onToggle={() => setSearchExpanded((e) => !e)}
      />

      <FilterChips
        stockFilter={stockFilter}
        categorieFilter={categorieFilter}
        categories={categories}
        onStockFilter={(f) => {
          setStockFilter(f)
          setPage(1)
        }}
        onCategorieFilter={(c) => {
          setCategorieFilter(c)
          setPage(1)
        }}
      />

      {/* <MetricCards total={produits.length} alertes={alertes} valeurStock={valeurStock} /> */}

      {isLoading && produits.length === 0 ? (
        <View style={styles.loaderWrap}>
          <Loader message="Chargement du catalogue…" />
        </View>
      ) : (
        <FlatList
          data={paginated}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={() => {
            if (paginated.length < filtered.length) setPage((p) => p + 1)
          }}
          onEndReachedThreshold={0.3}
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
          ListEmptyComponent={
            <Text style={styles.empty}>Aucun produit trouvé</Text>
          }
        />
      )}

      <Animated.View
        entering={ZoomIn.duration(300)}
        style={[styles.fab, { bottom: insets.bottom + 24 }]}
      >
        <Pressable
          style={styles.fabBtn}
          onPress={() => router.push('/(drawer)/(tabs)/produits/edit' as never)}
        >
          <Plus size={26} color={Colors.textInverse} />
        </Pressable>
      </Animated.View>

      <QuickActionSheet
        visible={quickVisible}
        produit={quickProduct}
        initialMode={quickMode}
        onClose={() => setQuickVisible(false)}
        onSuccess={() => loadProduits()}
      />

      <CustomAlert
        isVisible={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Supprimer le produit ?"
        description={`« ${deleteTarget?.nom} » sera définitivement supprimé.`}
        iconName="AlertTriangle"
        color={Colors.danger}
        primaryButtonLabel="Supprimer"
        onPrimaryPress={async () => {
          if (deleteTarget) {
            await removeProduit(deleteTarget.id)
            setDeleteTarget(null)
          }
        }}
        secondaryButtonLabel="Annuler"
        onSecondaryPress={() => setDeleteTarget(null)}
      />

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { padding: 8 },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 20,
    color: Colors.textPrimary,
  },
  loaderWrap: {
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    textAlign: 'center',
    fontFamily: FontFamily.content,
    color: Colors.textSecondary,
    marginTop: 48,
  },
  fab: {
    position: 'absolute',
    right: 20,
  },
  fabBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
