import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  FlatList,
  Platform
} from 'react-native';
import { Search, X, Plus, Minus, ArrowRight, ShoppingCart } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { useRouter } from 'expo-router';

// Mock data
const PRODUCTS = [
  { id: '1', name: 'Savon Lux', category: 'HYGIÈNE', price: 2200, stock: 142 },
  { id: '2', name: 'Huile Palme', category: 'ALIMENTAIRE', price: 2200, stock: 38 },
  { id: '3', name: 'Sucre', category: 'ALIMENTAIRE', price: 1000, stock: 8 },
  { id: '4', name: 'Lait concentré', category: 'ALIMENTAIRE', price: 1800, stock: 95 },
  { id: '5', name: 'Sac Riz 5kg', category: 'ALIMENTAIRE', price: 4500, stock: 12 },
];

const CATEGORIES = ['TOUS', 'HYGIÈNE', 'ALIMENTAIRE'];

export default function NewSaleScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('TOUS');
  const [cart, setCart] = useState<{[key: string]: number}>({});

  const updateCart = (id: string, delta: number) => {
    setCart(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  const filteredProducts = PRODUCTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'TOUS' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const cartItemsCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = Object.entries(cart).reduce((acc, [id, qty]) => {
    const p = PRODUCTS.find(prod => prod.id === id);
    return acc + (p?.price || 0) * qty;
  }, 0);

  const selectedProducts = Object.entries(cart).map(([id, qty]) => {
    const p = PRODUCTS.find(prod => prod.id === id)!;
    return { ...p, qty };
  });

  const handleConfirm = () => {
    if (cartItemsCount > 0) {
      // Navigate to success or confirmation
      router.push('/(drawer)/(tabs)/ventes/success');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Nouvelle vente</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color={Colors.textSecondary} />
          <TextInput
            placeholder="Rechercher un produit..."
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={Colors.textSecondary}
          />
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.categoryChip, activeCategory === cat && styles.categoryChipActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.productList}
        columnWrapperStyle={styles.productRow}
        renderItem={({ item }) => {
          const qty = cart[item.id] || 0;
          return (
            <View style={[styles.productCard, qty > 0 && styles.productCardActive]}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productStock}>Stock disponible: {item.stock} u</Text>
              </View>
              
              <View style={styles.stepper}>
                <TouchableOpacity onPress={() => updateCart(item.id, -1)} style={styles.stepperBtn}>
                  <Minus size={16} color={qty > 0 ? Colors.textPrimary : Colors.borderStrong} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{qty}</Text>
                <TouchableOpacity onPress={() => updateCart(item.id, 1)} style={styles.stepperBtn}>
                  <Plus size={16} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {cartItemsCount > 0 && (
        <View style={styles.summaryPanel}>
          <View style={styles.handle} />
          <View style={styles.summaryHeader}>
            <View style={styles.summaryTitleRow}>
              <ShoppingCart size={18} color={Colors.textPrimary} />
              <Text style={styles.summaryTitle}>{cartItemsCount} produits sélectionnés</Text>
            </View>
          </View>
          
          <ScrollView style={[styles.cartList, { maxHeight: 150 }]}>
            {selectedProducts.map(item => (
              <View key={item.id} style={styles.cartItem}>
                <Text style={styles.cartItemName}>{item.name} x{item.qty}</Text>
                <Text style={styles.cartItemPrice}>{(item.price * item.qty).toLocaleString()} FCFA</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{cartTotal.toLocaleString()} FCFA</Text>
          </View>

          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
            <Text style={styles.confirmBtnText}>Confirmer la vente</Text>
            <ArrowRight size={20} color={Colors.textInverse} />
          </TouchableOpacity>
          
          <Text style={styles.footerNote}>LE STOCK SERA MIS À JOUR AUTOMATIQUEMENT</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    marginRight: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  categoryChipActive: {
    backgroundColor: '#000',
  },
  categoryText: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  categoryTextActive: {
    color: '#fff',
  },
  productList: {
    paddingHorizontal: 15,
    paddingBottom: 250, // Space for summary panel
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  productCardActive: {
    borderColor: '#000',
    backgroundColor: '#fff',
  },
  productInfo: {
    marginBottom: 15,
    height: 60,
  },
  productName: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  productStock: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  stepperBtn: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  summaryPanel: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 40 : 25,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#EAEAEA',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 15,
  },
  summaryHeader: {
    marginBottom: 15,
  },
  summaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: Colors.textPrimary,
    marginLeft: 10,
  },
  cartList: {
    marginBottom: 15,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cartItemName: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  cartItemPrice: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginBottom: 20,
  },
  totalLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  totalValue: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: Colors.textPrimary,
  },
  confirmBtn: {
    backgroundColor: '#000',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  confirmBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: '#fff',
    marginRight: 10,
  },
  footerNote: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    color: Colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
