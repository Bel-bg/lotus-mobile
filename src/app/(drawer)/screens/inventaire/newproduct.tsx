import { ArrowLeft, Save, Plus, ChevronDown } from 'lucide-react-native';
import { View, Text, ScrollView, TextInput, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { initDB } from '@/lib/db/schema';
import CustomAlert from '../../../../components/customs/Alert';
import AddCategoryModal from '../../../../components/inventaire/AddCategoryModal';
import Selector, { SelectorOption } from '../../../../components/customs/Selector';
import { Colors } from '@/constants/colors';
import { useFocusEffect, useRouter } from 'expo-router';
import { useState } from 'react';
import React from 'react';

// Generators
const generateId = () => Math.random().toString(36).substring(2, 15);
const generateReference = () => 'REF' + Math.floor(100000 + Math.random() * 900000);

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

export default function NewProductScreen() {
  const router = useRouter();

  // Form state
  const [nom, setNom] = useState('');
  const [categorie, setCategorie] = useState('Autres');
  const [categories, setCategories] = useState<SelectorOption[]>([]);
  const [prix, setPrix] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSelectorVisible, setIsSelectorVisible] = useState(false);

  const fetchCategories = React.useCallback(async () => {
    try {
      const db = await initDB();
      const rows = await db.getAllAsync<{nom: string}>("SELECT nom FROM categories ORDER BY nom ASC");
      setCategories(rows.map(r => ({ label: r.nom, value: r.nom })));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchCategories();
    }, [fetchCategories])
  );

  // Alert state
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    description: string;
    icon: 'AlertTriangle' | 'CheckCircle';
    color: string;
  }>({ visible: false, title: '', description: '', icon: 'AlertTriangle', color: colors.danger });

  const handleSave = async () => {
    if (!nom.trim() || !prix.trim()) {
      setAlertConfig({
        visible: true,
        title: "Champs requis",
        description: "Veuillez remplir le nom et le prix du produit.",
        icon: 'AlertTriangle',
        color: colors.danger
      });
      return;
    }

    try {
      const db = await initDB();
      
      // Check if product already exists
      const existing = await db.getFirstAsync<{ id: string }>(
        "SELECT id FROM produits WHERE nom = ?",
        [nom.trim()]
      );

      if (existing) {
        setAlertConfig({
          visible: true,
          title: "Produit existant",
          description: `Un produit nommé "${nom}" existe déjà dans votre inventaire.`,
          icon: 'AlertTriangle',
          color: colors.danger
        });
        return;
      }

      // Insert new product with automatic reference
      await db.runAsync(
        `INSERT INTO produits (
          id, nom, categorie, prix_unitaire, barcode, 
          type_vente, stock_actuel, stock_min
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          generateId(),
          nom.trim(),
          categorie || 'Autres',
          parseFloat(prix) || 0,
          generateReference(),
          'piece',
          0, // Initial stock 0 by default
          10 // Default alert threshold
        ]
      );

      router.back();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouveau Produit</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        
        {/* Section Infos principales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identification du produit</Text>
          <Text style={styles.sectionSubtitle}>Saisissez les informations de base</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom du produit <Text style={{color: colors.danger}}>*</Text></Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ex: Coca Cola 1.5L"
              value={nom}
              onChangeText={setNom}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Catégorie</Text>
            <TouchableOpacity 
              style={styles.selectorTrigger} 
              onPress={() => setIsSelectorVisible(true)}
            >
              <Text style={styles.selectorValue}>{categorie}</Text>
              <ChevronDown size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.addCatLink} 
              onPress={() => setIsModalVisible(true)}
            >
              <Plus size={14} color="#3B82F6" style={{marginRight: 4}} />
              <Text style={styles.addCatLinkText}>Créer une nouvelle catégorie</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section Prix */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tarification</Text>
          <Text style={styles.sectionSubtitle}>Prix de vente final au client</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prix Unitaire (FCFA) <Text style={{color: colors.danger}}>*</Text></Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ex: 500"
              keyboardType="numeric"
              value={prix}
              onChangeText={setPrix}
            />
          </View>
        </View>

      </ScrollView>

      {/* Footer Bouton */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Save size={20} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.saveButtonText}>Enregistrer le produit</Text>
        </TouchableOpacity>
      </View>

      <CustomAlert
        isVisible={alertConfig.visible}
        onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
        title={alertConfig.title}
        description={alertConfig.description}
        iconName={alertConfig.icon as any}
        color={alertConfig.color}
        primaryButtonLabel="Compris"
        onPrimaryPress={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />

      <AddCategoryModal 
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSuccess={(name) => {
          fetchCategories();
          setCategorie(name);
        }}
      />

      <Selector 
        visible={isSelectorVisible}
        title="Choisir une catégorie"
        options={categories}
        selectedValue={categorie}
        onClose={() => setIsSelectorVisible(false)}
        onSelect={(opt) => setCategorie(opt.value)}
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
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 15,
    color: colors.textPrimary,
  },
  selectorTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  selectorValue: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  addCatLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingLeft: 4,
  },
  addCatLinkText: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '600',
  },
  footer: {
    backgroundColor: colors.surface,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  }
});
