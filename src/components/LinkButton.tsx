// ============================================
// LOTUS BUSINESS — Composant : LinkButton
// ============================================

import { TouchableOpacity, Text, StyleSheet } from 'react-native'

interface LinkButtonProps {
  label?: string
  highlight: string
  onPress: () => void
}

export default function LinkButton({ label, highlight, onPress }: LinkButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Text style={styles.text}>
        {label ? `${label} ` : ''}
        <Text style={styles.highlight}>{highlight}</Text>
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  text: {
    fontSize: 13,
    color: '#6B6B6B',
    textAlign: 'center',
  },
  highlight: {
    fontSize: 13,
    color: '#0A0A0A',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
})
