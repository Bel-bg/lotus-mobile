import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, Tags, Trash2 } from 'lucide-react-native';
import { DUMMY_CATEGORIES, DUMMY_PRODUITS } from './dummyData';

const colors = {
  background: '#FAFAFA',
  surface: '#FFFFFF',
  border: '#EAEAEA',
  textPrimary: '#0A0A0A',
  textSecondary: '#6B6B6B',
  primary: '#0A0A0A',
  danger: '#DC2626',
};

export default function CategoriesScreen() {
  const router = useRouter();
  const [newCatName, setNewCatName] = useState('');
  const [categories, setCategories] = useState([...DUMMY_CATEGORIES]);

  const handleAddCat = () => {
    if (newCatName.trim() && !categories.includes(newCatName.trim())) {
      setCategories([...categories, newCatName.trim()]);
      setNewCatName('');
    }
  };

  const getProductCount = (catName: string) => {
    return DUMMY_PRODUITS.filter(p => p.categorie === catName).length;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Catégories</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Ajouter une catégorie */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ajouter une catégorie</Text>
          <View style={styles.addForm}>
            <TextInput 
              style={styles.input} 
              placeholder="Ex: Confiseries"
              value={newCatName}
              onChangeText={setNewCatName}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddCat}>
              <Plus size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Liste des catégories */}
        <Text style={[styles.sectionTitle, { marginTop: 20, marginBottom: 12 }]}>Catégories existantes</Text>
        
        {categories.map((cat, index) => (
          <View key={index} style={styles.catItem}>
            <View style={styles.catInfo}>
              <View style={styles.iconBox}>
                <Tags size={18} color={colors.textSecondary} />
              </View>
              <View>
                <Text style={styles.catName}>{cat}</Text>
                <Text style={styles.catCount}>{getProductCount(cat)} produit(s)</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.deleteButton}>
              <Trash2 size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        ))}

      </ScrollView>

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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  addForm: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 15,
    marginRight: 12,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  catInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  catName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  catCount: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  }
});
