import React from "react";
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/colors";
import { FontFamily } from "@/constants/typography";
import { CartItem } from "./types";
import { Plus, Minus, Trash2 } from "lucide-react-native";

type ScannedItemsListProps = {
  items: CartItem[];
  onUpdateQuantity: (barcode: string, delta: number) => void;
  onRemoveItem: (barcode: string) => void;
};

export function ScannedItemsList({ items, onUpdateQuantity, onRemoveItem }: ScannedItemsListProps) {
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Panier ({totalCount})</Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={() => items.forEach(i => onRemoveItem(i.barcode))}>
            <Text style={styles.clearText}>Vider</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.itemsContainer}
        contentContainerStyle={styles.itemsContent}
        showsVerticalScrollIndicator={false}
      >
        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun article scanne</Text>
            <Text style={styles.emptySubText}>Scannez un code-barres pour commencer</Text>
          </View>
        ) : (
          items.map((item) => (
            <View key={item.barcode} style={styles.itemCard}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemPrice}>
                  {item.price.toLocaleString()} FCFA
                </Text>
              </View>

              <View style={styles.itemActions}>
                <View style={styles.quantityControls}>
                  <TouchableOpacity 
                    style={styles.qtyBtn} 
                    onPress={() => onUpdateQuantity(item.barcode, -1)}
                  >
                    <Minus size={16} color={Colors.textPrimary} />
                  </TouchableOpacity>
                  
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  
                  <TouchableOpacity 
                    style={styles.qtyBtn} 
                    onPress={() => onUpdateQuantity(item.barcode, 1)}
                  >
                    <Plus size={16} color={Colors.textPrimary} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={styles.removeBtn}
                  onPress={() => onRemoveItem(item.barcode)}
                >
                  <Trash2 size={18} color={Colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  itemsContainer: {
    flex: 1,
  },
  itemsContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontFamily: FontFamily.display,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  clearText: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Colors.danger,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontFamily: FontFamily.display,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  emptySubText: {
    fontFamily: FontFamily.content,
    fontSize: 13,
    color: Colors.textTertiary,
  },
  itemCard: {
    backgroundColor: Colors.background,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  itemInfo: {
    flex: 1,
    marginRight: 10,
  },
  itemName: {
    fontFamily: FontFamily.display,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  itemPrice: {
    fontFamily: FontFamily.display,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    gap: 8,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    backgroundColor: Colors.background,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quantityText: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: Colors.textPrimary,
    minWidth: 20,
    textAlign: 'center',
  },
  removeBtn: {
    width: 40,
    height: 40,
    backgroundColor: Colors.dangerLight,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
