import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';

interface StockBarProps {
  current: number;
  min: number;
  max: number;
  label?: string;
  unit?: string;
}

export default function StockBar({ current, min, max, label, unit = 'unités' }: StockBarProps) {
  // Calculate percentage
  const percentage = Math.min(Math.max((current / max) * 100, 0), 100);
  
  // Determine color
  let barColor: string = Colors.success;
  if (current <= 0) {
    barColor = Colors.danger;
  } else if (current <= min) {
    barColor = Colors.warning;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label || 'Stock'}</Text>
        <Text style={styles.value}>{current} {unit}</Text>
      </View>
      
      <View style={styles.barContainer}>
        <View 
          style={[
            styles.barFilled, 
            { width: `${percentage}%`, backgroundColor: barColor }
          ]} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontFamily: FontFamily.content,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  value: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 12,
    color: Colors.textPrimary,
  },
  barContainer: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  barFilled: {
    height: '100%',
    borderRadius: 3,
  },
});
