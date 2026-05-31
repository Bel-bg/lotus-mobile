import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Package, AlertTriangle, Coins } from 'lucide-react-native'
import { Colors } from '@/constants/colors'
import { FontFamily } from '@/constants/typography'
import { useAuthStore } from '@/store/useAuthStore'

interface MetricCardsProps {
  total: number
  alertes: number
  valeurStock: number
}

export default function MetricCards({ total, alertes, valeurStock }: MetricCardsProps) {
  const devise = useAuthStore((s) => s.boutique?.devise ?? 'FCFA')

  return (
    <View style={styles.row}>
      <View style={styles.card}>
        <View style={[styles.icon, { backgroundColor: Colors.surface }]}>
          <Package size={18} color={Colors.textPrimary} />
        </View>
        <Text style={styles.label}>Produits</Text>
        <Text style={styles.value}>{total}</Text>
      </View>

      <View style={[styles.card, alertes > 0 && styles.cardAlert]}>
        <View style={[styles.icon, { backgroundColor: Colors.warningLight }]}>
          <AlertTriangle size={18} color={Colors.warning} />
        </View>
        <Text style={styles.label}>Alertes</Text>
        <Text style={[styles.value, alertes > 0 && styles.valueAlert]}>{alertes}</Text>
      </View>

      <View style={styles.card}>
        <View style={[styles.icon, { backgroundColor: Colors.surface }]}>
          <Coins size={18} color={Colors.textPrimary} />
        </View>
        <Text style={styles.label}>Valeur stock</Text>
        <Text style={styles.value} numberOfLines={1}>
          {valeurStock >= 1_000_000
            ? `${(valeurStock / 1_000_000).toFixed(1)}M`
            : valeurStock >= 1000
              ? `${Math.round(valeurStock / 1000)}k`
              : valeurStock.toLocaleString('fr-FR')}
        </Text>
        <Text style={styles.currency}>{devise}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardAlert: {
    borderColor: Colors.warningBorder,
    backgroundColor: Colors.warningLight,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  label: {
    fontFamily: FontFamily.content,
    fontSize: 10,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  value: {
    fontFamily: FontFamily.display,
    fontSize: 17,
    color: Colors.textPrimary,
  },
  valueAlert: {
    color: Colors.danger,
  },
  currency: {
    fontFamily: FontFamily.content,
    fontSize: 9,
    color: Colors.textSecondary,
  },
})
