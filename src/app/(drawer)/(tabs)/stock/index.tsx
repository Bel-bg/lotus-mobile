import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { Search, AlertTriangle, Package, XCircle } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import ProductRow from '@/components/stock/ProductRow';
import CustomTopBar from '@/components/customs/customTopBar';

// Mock data
const MOCK_PRODUCTS = [
  { id: '1', name: 'Savon', category: 'HYGIÈNE', stock: 142, minStock: 20 },
  { id: '2', name: 'Huile Palme', category: 'ALIMENTAIRE', stock: 38, minStock: 40 },
  { id: '3', name: 'Sucre', category: 'ALIMENTAIRE', stock: 8, minStock: 20 },
  { id: '4', name: 'Lait concentré', category: 'ALIMENTAIRE', stock: 95, minStock: 20 },
  { id: '5', name: 'Spaghetti', category: 'ALIMENT', stock: 55, minStock: 20 },
];

export default function StockScreen() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredProducts = MOCK_PRODUCTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    if (activeFilter === 'alerts') return matchesSearch && p.stock <= p.minStock && p.stock > 0;
    if (activeFilter === 'out') return matchesSearch && p.stock <= 0;
    return matchesSearch;
  });

  const stats = {
    total: MOCK_PRODUCTS.length,
    alerts: MOCK_PRODUCTS.filter(p => p.stock <= p.minStock && p.stock > 0).length,
    out: MOCK_PRODUCTS.filter(p => p.stock <= 0).length,
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomTopBar type="stock" />

      <View style={styles.filterBar}>
        <TouchableOpacity 
          style={[styles.filterPill, activeFilter === 'all' && styles.filterPillActive]}
          onPress={() => setActiveFilter('all')}
        >
          <Text style={[styles.filterText, activeFilter === 'all' && styles.filterTextActive]}>
            {stats.total} PRODUITS
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterPill, activeFilter === 'alerts' && styles.filterPillActiveWarning]}
          onPress={() => setActiveFilter('alerts')}
        >
          <Text style={[styles.filterText, activeFilter === 'alerts' && styles.filterTextActiveWarning]}>
            {stats.alerts} ALERTES
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filterPill, activeFilter === 'out' && styles.filterPillActiveDanger]}
          onPress={() => setActiveFilter('out')}
        >
          <Text style={[styles.filterText, activeFilter === 'out' && styles.filterTextActiveDanger]}>
            {stats.out} RUPTURES
          </Text>
        </TouchableOpacity>
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

      <ScrollView 
        style={styles.productList}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredProducts.map(product => (
          <ProductRow
            key={product.id}
            {...product}
          />
        ))}

        {filteredProducts.length === 0 && (
          <View style={styles.emptyState}>
            <Package size={48} color={Colors.border} />
            <Text style={styles.emptyText}>Aucun produit trouvé</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterPill: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 10,
  },
  filterPillActive: {
    backgroundColor: '#EAEAEA',
  },
  filterPillActiveWarning: {
    backgroundColor: Colors.warningLight,
    borderColor: Colors.warningBorder,
    borderWidth: 1,
  },
  filterPillActiveDanger: {
    backgroundColor: Colors.dangerLight,
    borderColor: Colors.dangerBorder,
    borderWidth: 1,
  },
  filterText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 10,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  filterTextActive: {
    color: Colors.textPrimary,
  },
  filterTextActiveWarning: {
    color: Colors.warningText,
  },
  filterTextActiveDanger: {
    color: Colors.dangerText,
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
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontFamily: FontFamily.content,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  productList: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Space for custom tab bar
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontFamily: FontFamily.content,
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 10,
  },
});
