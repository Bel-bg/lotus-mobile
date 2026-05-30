// ============================================
// LOTUS BUSINESS — Composant : StepItem
// ============================================

import React, { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
  useAnimatedStyle,
  withTiming,
  withRepeat,
  useSharedValue,
} from 'react-native-reanimated'

import { Check, X } from 'lucide-react-native'

export type StepStatus = 'pending' | 'loading' | 'done' | 'error'

interface StepItemProps {
  label: string
  status: StepStatus
}

function StepIcon({ status }: { status: StepStatus }) {
  const rotation = useSharedValue(0)

  useEffect(() => {
    if (status === 'loading') {
      rotation.value = withRepeat(
        withTiming(360, { duration: 900 }),
        -1,
        false
      )
    } else {
      rotation.value = 0
    }
  }, [status])

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))

  if (status === 'done') {
    return (
      <View style={[styles.icon, styles.iconDone]}>
        <Check color="#FFFFFF" size={14} strokeWidth={3} />
      </View>
    )
  }

  if (status === 'error') {
    return (
      <View style={[styles.icon, styles.iconError]}>
        <X color="#FFFFFF" size={14} strokeWidth={3} />
      </View>
    )
  }

  if (status === 'loading') {
    return (
      <Animated.View style={[styles.icon, styles.iconLoading, spinStyle]}>
        <View style={styles.spinnerArc} />
      </Animated.View>
    )
  }

  // pending
  return <View style={[styles.icon, styles.iconPending]} />
}

export default function StepItem({ label, status }: StepItemProps) {
  const isActive = status === 'loading'
  const isDone = status === 'done'

  return (
    <View style={styles.container}>
      <StepIcon status={status} />
      <Text style={[
        styles.label,
        isActive && styles.labelActive,
        isDone && styles.labelDone,
      ]}>
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  icon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconDone: {
    backgroundColor: '#16A34A',
  },
  iconError: {
    backgroundColor: '#DC2626',
  },
  iconLoading: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderTopColor: '#0A0A0A',
    backgroundColor: 'transparent',
  },
  iconPending: {
    borderWidth: 2,
    borderColor: '#D1D1D1',
    backgroundColor: 'transparent',
  },
  spinnerArc: {
    width: 0,
    height: 0,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  errorMark: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  label: {
    fontSize: 14,
    color: '#9E9E9E',
    fontWeight: '400',
  },
  labelActive: {
    color: '#0A0A0A',
    fontWeight: '500',
  },
  labelDone: {
    color: '#6B6B6B',
  },
})
