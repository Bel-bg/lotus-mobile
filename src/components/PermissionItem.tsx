// ============================================
// LOTUS BUSINESS — Composant : PermissionItem
// ============================================

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { LucideIcon } from 'lucide-react-native'

export type PermissionType = 'required' | 'optional'
export type PermissionStatus = 'pending' | 'granted' | 'denied' | 'coming_soon'

interface PermissionItemProps {
  icon: LucideIcon
  title: string
  subtitle: string
  type: PermissionType
  status?: PermissionStatus
  color?: string
  onPress?: () => void
}

export default function PermissionItem({
  icon: Icon,
  title,
  subtitle,
  type,
  status = 'pending',
  color = '#0A0A0A',
  onPress,
}: PermissionItemProps) {
  const isRequired = type === 'required'
  const isGranted = status === 'granted'

  return (
    <TouchableOpacity 
      style={[styles.container, isGranted && styles.containerGranted]} 
      onPress={onPress}
      activeOpacity={0.7}
      disabled={isGranted || status === 'coming_soon'}
    >
      {/* Icône */}
      <View style={[styles.iconBox, isGranted && styles.iconBoxGranted]}>
        <Icon size={18} color={isGranted ? '#FFFFFF' : color} />
      </View>

      {/* Texte */}
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {/* Badge */}
      <View style={[
        styles.badge, 
        isGranted ? styles.badgeGranted 
        : isRequired ? styles.badgeRequired 
        : styles.badgeOptional
      ]}>
        <Text style={[
          styles.badgeText, 
          isGranted ? styles.badgeTextGranted 
          : isRequired ? styles.badgeTextRequired 
          : styles.badgeTextOptional
        ]}>
          {isGranted ? 'ACTIVÉ' : status === 'coming_soon' ? 'À VENIR' : isRequired ? 'REQUIS' : 'OPTIONNEL'}
        </Text>
      </View>
    </TouchableOpacity>
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
  containerGranted: {
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
    borderWidth: 1,
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
  iconBoxGranted: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
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
  badgeGranted: {
    backgroundColor: '#4CAF50',
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
  badgeTextGranted: {
    color: '#FFFFFF',
  },
})
