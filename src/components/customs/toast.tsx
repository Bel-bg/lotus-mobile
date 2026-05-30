import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Animated,
  Modal,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors } from '@/constants/colors'
import { FontSize, TextStyles } from '@/constants/typography'

const TOAST_MAX_CHARACTERS = 72
const TOAST_DURATION = 2200

export interface CustomToastProps {
  visible: boolean
  text: string
  color?: string
  onHide?: () => void
}

function limitToastText(text: string) {
  const cleanText = text.trim()

  if (cleanText.length <= TOAST_MAX_CHARACTERS) {
    return cleanText
  }

  return `${cleanText.slice(0, TOAST_MAX_CHARACTERS - 1).trimEnd()}…`
}

export default function CustomToast({
  visible,
  text,
  color = Colors.success,
  onHide,
}: CustomToastProps) {
  const insets = useSafeAreaInsets()
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(24)).current
  const mountedRef = useRef(visible)
  const [isMounted, setIsMounted] = useState(visible)

  const displayText = useMemo(() => limitToastText(text), [text])

  useEffect(() => {
    let dismissTimer: ReturnType<typeof setTimeout> | undefined

    const hideToast = (shouldNotify = false) => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 24,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (!finished) {
          return
        }

        mountedRef.current = false
        setIsMounted(false)

        if (shouldNotify) {
          onHide?.()
        }
      })
    }

    if (visible) {
      mountedRef.current = true
      setIsMounted(true)

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start()

      dismissTimer = setTimeout(() => {
        hideToast(true)
      }, TOAST_DURATION)
    } else if (mountedRef.current) {
      hideToast(false)
    }

    return () => {
      if (dismissTimer) {
        clearTimeout(dismissTimer)
      }
    }
  }, [onHide, opacity, translateY, visible])

  if (!isMounted) {
    return null
  }

  return (
    <Modal
      transparent
      visible={isMounted}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onHide}
    >
      <View pointerEvents="none" style={styles.overlay}>
        <Animated.View
          style={[
            styles.toast,
            {
              backgroundColor: color,
              marginBottom: Math.max(insets.bottom, 16) + 12,
              opacity,
              transform: [{ translateY }],
            },
          ]}
        >
          <Text numberOfLines={2} style={styles.text}>
            {displayText}
          </Text>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  toast: {
    minHeight: 48,
    maxWidth: 360,
    width: '100%',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  text: {
    ...TextStyles.buttonSm,
    color: Colors.textInverse,
    fontSize: FontSize.base,
    textAlign: 'center',
  },
})
