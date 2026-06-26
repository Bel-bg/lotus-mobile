import React, { useEffect, useRef } from 'react'
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { Search, X, ArrowLeft } from 'lucide-react-native'
import { Colors } from '@/constants/colors'
import { FontFamily } from '@/constants/typography'
import { router } from 'expo-router'

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
  const inputRef = useRef<TextInput>(null)

  // Titre : slide vers le haut + fade out quand expanded
  const titleOpacity = useSharedValue(1)
  const titleY = useSharedValue(0)

  // Input : slide depuis le bas + fade in quand expanded
  const inputOpacity = useSharedValue(0)
  const inputY = useSharedValue(8)
  const inputWidth = useSharedValue(0)

  useEffect(() => {
    titleOpacity.value = withTiming(expanded ? 0 : 1, { duration: 200 })
    titleY.value = withTiming(expanded ? -6 : 0, { duration: 200 })

    inputOpacity.value = withTiming(expanded ? 1 : 0, { duration: 250 })
    inputY.value = withTiming(expanded ? 0 : 8, { duration: 250 })
    inputWidth.value = withTiming(expanded ? 1 : 0, { duration: 250 })

    if (expanded) {
      setTimeout(() => inputRef.current?.focus(), 260)
    } else {
      inputRef.current?.blur()
    }
  }, [expanded])

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }))

  const inputStyle = useAnimatedStyle(() => ({
    opacity: inputOpacity.value,
    transform: [{ translateY: inputY.value }],
    // flex ne s'anime pas, on simule avec pointerEvents + position
    position: 'absolute',
    left: 0,
    right: 0,
  }))

  return (
    <View style={styles.wrap}>
      {/* Gauche : retour */}
      <Pressable style={styles.iconBtn} onPress={() => router.replace('/(drawer)/(tabs)')}>
        <ArrowLeft size={20} color={Colors.textPrimary} />
      </Pressable>

      {/* Centre : titre OU input, superposés */}
      <View style={styles.center}>
        {/* Titre "Catalogue" */}
        <Animated.Text style={[styles.title, titleStyle]}>
          Catalogue
        </Animated.Text>

        {/* Input de recherche qui surgit par dessus */}
        <Animated.View
          style={[styles.inputBox, inputStyle]}
          pointerEvents={expanded ? 'auto' : 'none'}
        >
          <Search size={14} color={Colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Rechercher un produit..."
            placeholderTextColor={Colors.textTertiary}
            value={value}
            onChangeText={onChangeText}
          />
          {value.length > 0 && (
            <Pressable onPress={() => onChangeText('')} hitSlop={8}>
              <X size={14} color={Colors.textSecondary} />
            </Pressable>
          )}
        </Animated.View>
      </View>

      {/* Droite : loupe / fermer */}
      <Pressable style={styles.iconBtn} onPress={onToggle}>
        {expanded ? (
          <X size={20} color={Colors.textPrimary} />
        ) : (
          <Search size={20} color={Colors.textPrimary} />
        )}
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 10,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    position: 'relative',
  },
  title: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.content,
    fontSize: 14,
    color: Colors.textPrimary,
  },
})