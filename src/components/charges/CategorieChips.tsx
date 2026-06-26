import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import type { CategorieCharge } from '@/types/charge';
import {
  Droplets,
  Home,
  Package,
  PenLine,
  Truck,
  User,
  Wifi,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ChipConfig = {
  value: CategorieCharge;
  label: string;
  icon: LucideIcon;
};

const CHIPS: ChipConfig[] = [
  { value: 'Loyer', label: 'Loyer', icon: Home },
  { value: 'Énergie', label: 'Énergie', icon: Zap },
  { value: 'Eau', label: 'Eau', icon: Droplets },
  { value: 'Salaire', label: 'Salaire', icon: User },
  { value: 'Transport', label: 'Transport', icon: Truck },
  { value: 'Internet', label: 'Internet', icon: Wifi },
  { value: 'Approvisionnement', label: 'Stock', icon: Package },
  { value: 'Autre', label: 'Autre', icon: PenLine },
];

type Props = {
  value: CategorieCharge | null;
  onChange: (value: CategorieCharge | null) => void;
};

export function getCategorieIcon(categorie: CategorieCharge): LucideIcon {
  return CHIPS.find((chip) => chip.value === categorie)?.icon ?? PenLine;
}

export default function CategorieChips({ value, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      keyboardShouldPersistTaps="handled"
    >
      {CHIPS.map((chip) => {
        const selected = value === chip.value;
        const Icon = chip.icon;

        return (
          <TouchableOpacity
            key={chip.value}
            style={[styles.chip, selected && styles.chipSelected]}
            onPress={() => onChange(selected ? null : chip.value)}
            activeOpacity={0.82}
          >
            <View style={styles.chipInner}>
              <Icon
                size={14}
                color={selected ? Colors.textInverse : Colors.textPrimary}
              />
              <Text
                style={[styles.chipLabel, selected && styles.chipLabelSelected]}
                selectable
              >
                {chip.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingRight: 4,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipSelected: {
    backgroundColor: Colors.textPrimary,
    borderColor: Colors.textPrimary,
  },
  chipInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipLabel: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  chipLabelSelected: {
    color: Colors.textInverse,
  },
});
