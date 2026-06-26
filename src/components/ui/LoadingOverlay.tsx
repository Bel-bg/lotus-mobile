import React from 'react'
import { StyleSheet, View } from 'react-native'
import Loader from './loader'
import { useLoadingStore } from '../../store/useLoadingStore'

export default function LoadingOverlay() {
  const isLoading = useLoadingStore((state) => state.isLoading)

  if (!isLoading) return null

  return (
    <View style={styles.overlay}>
      <Loader />
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    
    zIndex: 9999,
    elevation: 9999,
  },
})
