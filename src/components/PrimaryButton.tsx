// ============================================
// LOTUS BUSINESS — Composant : PrimaryButton
// ============================================

import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { Colors } from '@/constants/colors'
import { FontFamily, FontSize } from '@/constants/typography'

interface PrimaryButtonProps {
  label: string
  onPress: () => void
  disabled?: boolean
  style?: ViewStyle
}

export default function PrimaryButton({
  label,
  onPress,
  disabled = false,
  style,
}: PrimaryButtonProps) {
  const scale = useSharedValue(1)

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View style={[styles.wrapper, style, animStyle]}>
      <TouchableOpacity
        style={[styles.button, disabled && styles.disabled]}
        onPress={onPress}
        onPressIn={() => { scale.value = withTiming(0.97, { duration: 80 }) }}
        onPressOut={() => { scale.value = withTiming(1, { duration: 80 }) }}
        activeOpacity={1}
        disabled={disabled}
      >
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  button: {
    width: '100%',
    height: 52,
    backgroundColor: Colors.black,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    backgroundColor: Colors.borderStrong,
  },
  label: {
    color: Colors.textInverse,
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.lg,
    letterSpacing: 0.2,
  },
})
