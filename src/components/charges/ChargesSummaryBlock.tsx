import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { formatMontant } from '@/lib/utils/formatters';
import type { CategorieCharge } from '@/types/charge';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getCategorieIcon } from './CategorieChips';

type Props = {
  total: number;
  parCategorie: Partial<Record<CategorieCharge, number>>;
};

export default function ChargesSummaryBlock({ total, parCategorie }: Props) {
  const rows = Object.entries(parCategorie).filter(([, value]) => value > 0) as [
    CategorieCharge,
    number,
  ][];

  if (total <= 0) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title} selectable>
          Charges annexes
        </Text>
        <Text style={styles.total} selectable>
          − {formatMontant(total)}
        </Text>
      </View>

      <View style={styles.divider} />

      {rows.map(([categorie, montant]) => {
        const Icon = getCategorieIcon(categorie);

        return (
          <View key={categorie} style={styles.row}>
            <View style={styles.rowLeft}>
              <Icon size={15} color={Colors.textSecondary} />
              <Text style={styles.rowLabel} selectable>
                {categorie}
              </Text>
            </View>
            <Text style={styles.rowAmount} selectable>
              {formatMontant(montant)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    padding: 16,
    gap: 12,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontFamily: FontFamily.displaySemi,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  total: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.base,
    color: Colors.dangerText,
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  rowLabel: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  rowAmount: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
});
