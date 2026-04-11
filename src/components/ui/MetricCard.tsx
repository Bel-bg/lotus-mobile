import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { LucideIcon } from 'lucide-react-native';

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  onPress?: () => void;
  style?: any;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  footer?: React.ReactNode;
}

export default function MetricCard({
  label,
  value,
  subValue,
  icon: Icon,
  variant = 'default',
  onPress,
  style,
  trend,
  footer,
}: MetricCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return { valueColor: Colors.successText };
      case 'warning':
        return { valueColor: Colors.warningText };
      case 'danger':
        return { valueColor: Colors.dangerText };
      default:
        return { valueColor: Colors.textPrimary };
    }
  };

  const { valueColor } = getVariantStyles();

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper 
      style={[styles.container, style]} 
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.header}>
        <Text style={styles.label}>{label.toUpperCase()}</Text>
        {Icon && <Icon size={18} color={Colors.textSecondary} />}
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
        {subValue && <Text style={styles.subValue}>{subValue}</Text>}
      </View>

      {footer && <View style={styles.footer}>{footer}</View>}

      {trend && (
        <View style={styles.trendRow}>
          <Text style={styles.trendText}>
            {trend.value}
          </Text>
        </View>
      )}
    </CardWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    minWidth: '45%',
    flex: 1,
    margin: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 10,
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  content: {
    marginTop: 4,
  },
  value: {
    fontFamily: FontFamily.display,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  subValue: {
    fontFamily: FontFamily.content,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    marginTop: 12,
  },
  trendRow: {
    marginTop: 8,
  },
  trendText: {
    fontFamily: FontFamily.content,
    fontSize: 10,
    color: Colors.textSecondary,
  },
});
