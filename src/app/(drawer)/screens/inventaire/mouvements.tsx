import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Search, FileText } from 'lucide-react-native';

const colors = {
  background: '#FAFAFA',
  surface: '#FFFFFF',
  border: '#EAEAEA',
  textPrimary: '#0A0A0A',
  textSecondary: '#6B6B6B',
  primary: '#0A0A0A',
  success: '#16A34A',
  danger: '#DC2626',
};

// Mocks temporaires
const DUMMY_MOUVEMENTS = [
  { id: 'm1', produit: 'Coca Cola 1.5L', type: 'entree', qte: 50, date: '2026-04-09T10:30:00Z', note: 'Livraison BRASSERIE' },
  { id: 'm2', produit: 'Savon BF', type: 'sortie', qte: 2, date: '2026-04-09T11:15:00Z', note: 'Vente #VNT-1023' },
  { id: 'm3', produit: 'Riz Oncle Ben\'s 1Kg', type: 'sortie', qte: 1, date: '2026-04-08T16:45:00Z', note: 'Ajustement (Périmé)' },
  { id: 'm4', produit: 'Eau Minérale FIFA 1.5L', type: 'entree', qte: 100, date: '2026-04-08T09:00:00Z', note: 'Livraison' },
];

export default function MouvementsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const renderItem = ({ item }: any) => {
    const isEntree = item.type === 'entree';
    return (
      <View style={styles.card}>
        <View style={[styles.iconBox, { backgroundColor: isEntree ? '#F0FDF4' : '#FEF2F2' }]}>
          {isEntree ? <ArrowDownRight size={20} color={colors.success} /> : <ArrowUpRight size={20} color={colors.danger} />}
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.produit}</Text>
          <View style={styles.cardSubInfo}>
            <Text style={styles.cardDate}>{new Date(item.date).toLocaleDateString()} • </Text>
            <Text style={styles.cardNote}>{item.note}</Text>
          </View>
        </View>
        <View style={styles.qtyBox}>
          <Text style={[styles.qtyText, { color: isEntree ? colors.success : colors.danger }]}>
            {isEntree ? '+' : '-'}{item.qte}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mouvements de stock</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Chercher un produit ou ref..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>Enregistrer une Entrée</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
            <Text style={[styles.actionBtnText, { color: colors.textPrimary }]}>Sortie Manuelle</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.listSectionTitle}>Historique récent</Text>

        <FlatList
          data={DUMMY_MOUVEMENTS}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
        />
      </View>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  actionBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  listSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardSubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  cardNote: {
    fontSize: 12,
    color: '#3B82F6',
  },
  qtyBox: {
    marginLeft: 10,
  },
  qtyText: {
    fontSize: 16,
    fontWeight: '700',
  }
});
