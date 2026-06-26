import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { formatMontant } from '@/lib/utils/formatters';
import type { Charge } from '@/types/charge';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getCategorieIcon } from './CategorieChips';

type Props = {
  charge: Charge;
  onLongPress?: () => void;
};

function formatChargeDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, (month ?? 1) - 1, day ?? 1));
}

export default function ChargeListItem({ charge, onLongPress }: Props) {
  const Icon = getCategorieIcon(charge.categorie);

  return (
    <Pressable
      style={styles.row}
      onLongPress={onLongPress}
      delayLongPress={400}
    >
      <View style={styles.iconWrap}>
        <Icon size={16} color={Colors.textPrimary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.label} numberOfLines={1} selectable>
          {charge.label}
        </Text>
        <Text style={styles.meta} selectable>
          {charge.categorie} · {formatChargeDate(charge.date)}
        </Text>
      </View>
      <Text style={styles.amount} selectable>
        {formatMontant(charge.montant)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontFamily: FontFamily.displaySemi,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  meta: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  amount: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
});
