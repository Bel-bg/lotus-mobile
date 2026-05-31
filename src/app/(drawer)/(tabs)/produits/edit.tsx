import React, { useCallback, useState } from 'react'
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { X } from 'lucide-react-native'
import { Colors } from '@/constants/colors'
import { FontFamily } from '@/constants/typography'
import { getProduitById } from '@/lib/db/produits'
import { useStockStore } from '@/store/useStockStore'
import type { Produit, ProduitForm } from '@/types'
import ProductForm from '@/features/produits/product-form'

export default function ProduitEditScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const addProduit = useStockStore((s) => s.addProduit)
  const editProduit = useStockStore((s) => s.editProduit)

  const [produit, setProduit] = useState<Produit | null>(null)
  const [loading, setLoading] = useState(!!id)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const productId = id ? (Array.isArray(id) ? id[0] : id) : undefined
  const isEdit = !!productId

  useFocusEffect(
    useCallback(() => {
      if (!productId) {
        setLoading(false)
        return
      }
      setLoading(true)
      getProduitById(productId)
        .then(setProduit)
        .finally(() => setLoading(false))
    }, [productId])
  )

  const handleSubmit = async (form: ProduitForm) => {
    setSaving(true)
    try {
      if (isEdit && productId) {
        await editProduit(productId, form)
        setSuccess(true)
        setTimeout(() => {
          router.replace(`/(drawer)/(tabs)/produits/${productId}` as never)
        }, 500)
      } else {
        const created = await addProduit(form)
        setSuccess(true)
        setTimeout(() => {
          router.replace(`/(drawer)/(tabs)/produits/${created.id}` as never)
        }, 500)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isEdit ? 'Modifier le produit' : 'Nouveau produit'}
        </Text>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <X size={22} color={Colors.textPrimary} />
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.textPrimary} />
      ) : (
        <ProductForm
          initial={produit}
          saving={saving}
          success={success}
          onSubmit={handleSubmit}
        />
      )}
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 18,
    color: Colors.textPrimary,
  },
})
