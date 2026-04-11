import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { LucideIcon } from 'lucide-react-native';

interface SaleRowProps {
  id: string;
  productName: string;
  quantity: number;
  timeAgo: string;
  totalPrice: string;
  icon: LucideIcon;
  onPress?: () => void;
}

export default function SaleRow({
  id,
  productName,
  quantity,
  timeAgo,
  totalPrice,
  icon: Icon,
  onPress,
}: SaleRowProps) {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Icon size={20} color={Colors.textSecondary} />
      </View>
      
      <View style={styles.info}>
        <Text style={styles.productName}>
          {productName} <Text style={styles.quantity}>x{quantity}</Text>
        </Text>
        <Text style={styles.time}>{timeAgo}</Text>
      </View>
      
      <View style={styles.priceContainer}>
        <Text style={styles.price}>{totalPrice}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  productName: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  quantity: {
    fontFamily: FontFamily.content,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  time: {
    fontFamily: FontFamily.content,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 15,
    color: Colors.textPrimary,
  },
});
