import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import StockBar from './StockBar';

interface ProductRowProps {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  unit?: string;
  onPress?: () => void;
}

export default function ProductRow({
  id,
  name,
  category,
  stock,
  minStock,
  unit = 'unités',
  onPress,
}: ProductRowProps) {
  
  // Determine status label and style
  let statusLabel = 'OK';
  let statusColor: string = Colors.success;
  let statusBg: string = Colors.successLight;
  let statusBorder: string = Colors.successBorder;

  if (stock <= 0) {
    statusLabel = 'Rupture';
    statusColor = Colors.danger;
    statusBg = Colors.dangerLight;
    statusBorder = Colors.dangerBorder;
  } else if (stock <= minStock) {
    statusLabel = 'Faible';
    statusColor = Colors.warning;
    statusBg = Colors.warningLight;
    statusBorder = Colors.warningBorder;
  }

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.category}>{category.toUpperCase()}</Text>
        </View>
        
        <View style={[styles.badge, { backgroundColor: statusBg, borderColor: statusBorder }]}>
          <Text style={[styles.badgeText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <StockBar 
          current={stock} 
          min={minStock} 
          max={stock > 100 ? stock * 1.2 : 100} 
          unit={unit}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
  },
  name: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  category: {
    fontFamily: FontFamily.content,
    fontSize: 10,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 10,
  },
  footer: {
    marginTop: 4,
  },
});

import { Platform } from 'react-native';
