import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, ArrowLeft, Filter, Plus } from 'lucide-react-native';
import { DUMMY_PRODUITS, DUMMY_CATEGORIES, DummyProduit } from './dummyData';

const colors = {
  background: '#FAFAFA',
  surface: '#FFFFFF',
  border: '#EAEAEA',
  textPrimary: '#0A0A0A',
  textSecondary: '#6B6B6B',
  primary: '#0A0A0A',
  success: '#16A34A',
  successLight: '#F0FDF4',
  warning: '#D97706',
  danger: '#DC2626',
  dangerLight: '#FEF2F2',
};

export default function ProductsListScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Tout');

  const filteredProducts = DUMMY_PRODUITS.filter(p => {
    const matchCat = activeCategory === 'Tout' || p.categorie === activeCategory;
    const matchSearch = p.nom.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const renderProduct = ({ item }: { item: DummyProduit }) => {
    const isAlert = item.stockActuel <= item.stockMin;
    const prixAffiche = item.prixPiece 
      ? `${item.prixPiece.toLocaleString('fr-FR')} FCFA / pièce`
      : `${item.prixCarton?.toLocaleString('fr-FR')} FCFA / carton`;

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => router.push(`/(drawer)/screens/inventaire/${item.id}`)}
      >
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.nom}</Text>
          <Text style={styles.cardCategory}>{item.categorie}</Text>
          <Text style={styles.cardPrice}>{prixAffiche}</Text>
          {item.typeVente === 'les_deux' && <Text style={styles.cardPriceSecondary}>{item.prixCarton?.toLocaleString('fr-FR')} FCFA / carton</Text>}
        </View>
        <View style={styles.cardStatusBox}>
          <View style={[styles.stockBadge, isAlert ? styles.stockBadgeAlert : styles.stockBadgeOk]}>
            <Text style={[styles.stockBadgeText, isAlert ? styles.stockBadgeTextAlert : styles.stockBadgeTextOk]}>
              {item.stockActuel} en stock
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Catalogue</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/(drawer)/screens/inventaire/newproduct')}>
          <Plus size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Rechercher un produit..."
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Categories Horizontal Scroll */}
      <View style={styles.categoriesWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['Tout', ...DUMMY_CATEGORIES]}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.categoryPill, activeCategory === item && styles.categoryPillActive]}
              onPress={() => setActiveCategory(item)}
            >
              <Text style={[styles.categoryPillText, activeCategory === item && styles.categoryPillTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id}
        renderItem={renderProduct}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucun produit trouvé.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: colors.surface,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: 'DMSans_700Bold',
  },
  addButton: {
    padding: 8,
    marginRight: -8,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFF',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    fontFamily: 'DMSans_400Regular',
    height: '100%',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  categoriesWrapper: {
    height: 60,
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
  },
  categoryPillText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    fontFamily: 'DMSans_500Medium',
  },
  categoryPillTextActive: {
    color: '#FFF',
  },
  listContent: {
    padding: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardInfo: {
    flex: 1,
    paddingRight: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
    fontFamily: 'DMSans_600SemiBold',
  },
  cardCategory: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
    fontFamily: 'DMSans_400Regular',
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: 'DMSans_700Bold',
  },
  cardPriceSecondary: {
    fontSize: 13,
    color: '#3B82F6',
    marginTop: 2,
    fontWeight: '500',
  },
  cardStatusBox: {
    alignItems: 'flex-end',
  },
  stockBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  stockBadgeOk: {
    backgroundColor: colors.successLight,
  },
  stockBadgeAlert: {
    backgroundColor: colors.dangerLight,
  },
  stockBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stockBadgeTextOk: {
    color: colors.success,
  },
  stockBadgeTextAlert: {
    color: colors.danger,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: colors.textSecondary,
    fontSize: 15,
  }
});
