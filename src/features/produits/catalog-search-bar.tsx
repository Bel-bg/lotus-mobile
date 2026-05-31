import React, { useEffect } from 'react'
import { View, TextInput, StyleSheet, Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { Search, X } from 'lucide-react-native'
import { Colors } from '@/constants/colors'
import { FontFamily } from '@/constants/typography'

interface CatalogSearchBarProps {
  expanded: boolean
  value: string
  onChangeText: (t: string) => void
  onToggle: () => void
}

export default function CatalogSearchBar({
  expanded,
  value,
  onChangeText,
  onToggle,
}: CatalogSearchBarProps) {
  const height = useSharedValue(expanded ? 48 : 0)
  const opacity = useSharedValue(expanded ? 1 : 0)

  useEffect(() => {
    height.value = withTiming(expanded ? 48 : 0, { duration: 250 })
    opacity.value = withTiming(expanded ? 1 : 0, { duration: 250 })
  }, [expanded])

  const boxStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: opacity.value,
    overflow: 'hidden',
  }))

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.iconBtn} onPress={onToggle}>
        {expanded ? (
          <X size={20} color={Colors.textPrimary} />
        ) : (
          <Search size={20} color={Colors.textPrimary} />
        )}
      </Pressable>
      <Animated.View style={[styles.inputBox, boxStyle]}>
        <Search size={16} color={Colors.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.input}
          placeholder="Rechercher un produit…"
          placeholderTextColor={Colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          autoFocus={expanded}
        />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 10,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.content,
    fontSize: 14,
    color: Colors.textPrimary,
  },
})
