// ============================================
// LOTUS BUSINESS — Composant : PermissionItem
// ============================================

import { View, Text, StyleSheet } from 'react-native'
import { LucideIcon } from 'lucide-react-native'

export type PermissionType = 'required' | 'optional'

interface PermissionItemProps {
  icon: LucideIcon
  title: string
  subtitle: string
  type: PermissionType
}

export default function PermissionItem({
  icon: Icon,
  title,
  subtitle,
  type,
}: PermissionItemProps) {
  const isRequired = type === 'required'

  return (
    <View style={styles.container}>
      {/* Icône */}
      <View style={styles.iconBox}>
        <Icon size={18} color="#0A0A0A" />
      </View>

      {/* Texte */}
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {/* Badge */}
      <View style={[styles.badge, isRequired ? styles.badgeRequired : styles.badgeOptional]}>
        <Text style={[styles.badgeText, isRequired ? styles.badgeTextRequired : styles.badgeTextOptional]}>
          {isRequired ? 'REQUIS' : 'OPTIONNEL'}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
  },
  icon: {
    fontSize: 18,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A0A0A',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    color: '#9E9E9E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeRequired: {
    backgroundColor: '#0A0A0A',
  },
  badgeOptional: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#D1D1D1',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badgeTextRequired: {
    color: '#FFFFFF',
  },
  badgeTextOptional: {
    color: '#6B6B6B',
  },
})
