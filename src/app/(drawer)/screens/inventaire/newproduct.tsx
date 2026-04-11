import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, SafeAreaView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Save } from 'lucide-react-native';

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

  // Mode state
  const [vendPiece, setVendPiece] = useState(true);
  const [vendCarton, setVendCarton] = useState(false);

  // Form state
  const [nom, setNom] = useState('');
  const [categorie, setCategorie] = useState('Général');
  const [prixPiece, setPrixPiece] = useState('');
  const [prixCarton, setPrixCarton] = useState('');
  const [unitesParCarton, setUnitesParCarton] = useState('');
  const [stockActuel, setStockActuel] = useState('');
  const [stockMin, setStockMin] = useState('10');

  const handleSave = () => {
    // Ici on devrait interagir avec le usStore / SQLite
    console.log("Saving product: ", { nom, vendPiece, vendCarton });
    router.back();
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
        
        {/* Section Infos générales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations générales</Text>
          
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
            <TextInput 
              style={styles.input} 
              placeholder="Ex: Boissons"
              value={categorie}
              onChangeText={setCategorie}
            />
          </View>
        </View>

        {/* Section Conditionnement & Prix */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vente et Tarifs</Text>
          <Text style={styles.sectionSubtitle}>Spécifiez comment ce produit est vendu</Text>

          {/* Switch Vente par pièce */}
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>Vente à l'unité (Pièce)</Text>
              <Text style={styles.switchDesc}>Le produit peut être vendu individuellement.</Text>
            </View>
            <Switch 
              value={vendPiece} 
              onValueChange={setVendPiece}
              trackColor={{ false: colors.border, true: colors.success }}
            />
          </View>
          
          {vendPiece && (
            <View style={styles.priceContainer}>
              <Text style={styles.label}>Prix par pièce (FCFA)</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Ex: 500"
                keyboardType="numeric"
                value={prixPiece}
                onChangeText={setPrixPiece}
              />
            </View>
          )}

          {/* Switch Vente par carton */}
          <View style={[styles.switchRow, { marginTop: 20 }]}>
            <View>
              <Text style={styles.switchLabel}>Vente en gros (Carton / Pack)</Text>
              <Text style={styles.switchDesc}>Le produit peut être vendu par lot complet.</Text>
            </View>
            <Switch 
              value={vendCarton} 
              onValueChange={setVendCarton}
              trackColor={{ false: colors.border, true: colors.success }}
            />
          </View>

          {vendCarton && (
            <View style={styles.priceContainer}>
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>Prix du carton</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="Ex: 10000"
                    keyboardType="numeric"
                    value={prixCarton}
                    onChangeText={setPrixCarton}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Unités / Carton</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="Ex: 24"
                    keyboardType="numeric"
                    value={unitesParCarton}
                    onChangeText={setUnitesParCarton}
                  />
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Section Stock */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gestion du stock</Text>

          {vendCarton && !vendPiece ? (
            <Text style={styles.infoText}>Le stock de ce produit sera comptabilisé en cartons complets.</Text>
          ) : vendCarton && vendPiece ? (
            <Text style={styles.infoText}>Pour faciliter la gestion, votre stock total sera comptabilisé en unités individuelles (pièces).</Text>
          ) : null}

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Quantité initiale <Text style={{color: colors.danger}}>*</Text></Text>
              <TextInput 
                style={styles.input} 
                placeholder="0"
                keyboardType="numeric"
                value={stockActuel}
                onChangeText={setStockActuel}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Alerte seuil min</Text>
              <TextInput 
                style={styles.input} 
                placeholder="10"
                keyboardType="numeric"
                value={stockMin}
                onChangeText={setStockMin}
              />
            </View>
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  switchDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    maxWidth: 240,
  },
  priceContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  row: {
    flexDirection: 'row',
  },
  infoText: {
    fontSize: 12,
    color: '#3B82F6',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
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
