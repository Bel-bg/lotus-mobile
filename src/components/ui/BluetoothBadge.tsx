// ============================================
// LOTUS BUSINESS — Composant : BluetoothBadge
// ============================================

import { useRouter } from 'expo-router'
import { Bluetooth } from 'lucide-react-native'
import React, { useEffect, useRef } from 'react'
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from 'react-native'
import { Colors } from '../../constants/colors'
import { FontFamily } from '../../constants/typography'
import { useBluetoothStore } from '../../store/useBluetoothStore'

export default function BluetoothBadge() {
  const router = useRouter()
  const isConnected = useBluetoothStore((state) => state.isConnected)

  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (isConnected) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.6,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      )
      pulse.start()
      return () => pulse.stop()
    } else {
      pulseAnim.setValue(1)
    }
  }, [isConnected, pulseAnim])

  const handlePress = () => {
    router.push('/(drawer)/screens/Bt')
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.container}
      activeOpacity={0.75}
    >
      {/* Icône Bluetooth */}
      <Bluetooth
        size={12}
        color={isConnected ? Colors.success : Colors.textTertiary}
        strokeWidth={2.5}
      />
      <Text style={[styles.text, isConnected ? styles.textConnected : styles.textDisconnected]}>
        {isConnected ? 'Connecté' : 'Non connecté'}
      </Text>

      

      {/* Point de statut */}
      <View style={styles.dotWrapper}>
        {isConnected && (
          <Animated.View
            style={[
              styles.dotPulse,
              { transform: [{ scale: pulseAnim }] },
            ]}
          />
        )}
        <View
          style={[
            styles.dot,
            isConnected ? styles.dotConnected : styles.dotDisconnected,
          ]}
        />
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderRadius: 12,
    paddingHorizontal: 8,
    position: 'relative',
  },
  text: {
    fontSize: 11,
    fontFamily: FontFamily.display,
    marginRight: 5,
  },
  textConnected: {
    color: Colors.success,
  },
  textDisconnected: {
    color: Colors.textTertiary,
  },
  dotWrapper: {
    position: 'absolute',
    top: 7,
    right: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  dotConnected: {
    backgroundColor: Colors.success,
  },
  dotDisconnected: {
    backgroundColor: Colors.danger,
  },
  dotPulse: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
    opacity: 0.35,
  },
})