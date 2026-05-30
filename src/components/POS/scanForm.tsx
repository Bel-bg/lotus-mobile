// ============================================
// LOTUS BUSINESS — Composant : ScanForm
// ============================================
// Formulaire d'ajout de produit au stock

import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/colors";
import { FontFamily } from "@/constants/typography";
import { Barcode, Package, DollarSign, Layers, ChevronDown, Plus } from "lucide-react-native";
import { initDB } from "@/lib/db/schema";
import Selector, { SelectorOption } from "../customs/Selector";
import AddCategoryModal from "../inventaire/AddCategoryModal";
import { useFocusEffect } from "expo-router";

interface ScanFormProps {
  barcode: string;
  onSubmit: (data: { 
    barcode: string; 
    nom: string; 
    prix: number; 
    quantite: number;
    categorie: string;
  }) => void;
}

export default function ScanForm({ barcode, onSubmit }: ScanFormProps) {
  const [nom, setNom] = useState("");
  const [prix, setPrix] = useState("");
  const [quantite, setQuantite] = useState("1");
  const [categorie, setCategorie] = useState("Autres");
  const [categories, setCategories] = useState<SelectorOption[]>([]);
  const [isSelectorVisible, setIsSelectorVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const fetchCategories = React.useCallback(async () => {
    try {
      const db = await initDB();
      const rows = await db.getAllAsync<{nom: string}>("SELECT nom FROM categories ORDER BY nom ASC");
      setCategories(rows.map(r => ({ label: r.nom, value: r.nom })));
    } catch (e) {
      console.error(e);
    }
  }, []);

  React.useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = () => {
    const p = parseFloat(prix);
    const q = parseInt(quantite, 10);
    
    if (!nom.trim() || isNaN(p) || isNaN(q)) return;
    
    onSubmit({
      barcode,
      nom: nom.trim(),
      prix: p,
      quantite: q,
      categorie,
    });
    setNom("");
    setPrix("");
    setQuantite("1");
    setCategorie("Autres");
  };

  return (
    <View style={styles.container}>
      <View style={styles.barcodeCard}>
        <View style={styles.iconCircle}>
          <Barcode size={20} color={Colors.accent} />
        </View>
        <View>
          <Text style={styles.labelSmall}>Code-barres détecté</Text>
          <Text style={styles.barcodeValue}>{barcode}</Text>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Package size={14} color={Colors.textSecondary} />
          <Text style={styles.label}>Nom du produit</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Ex: Savon Lux"
          value={nom}
          onChangeText={setNom}
          placeholderTextColor={Colors.textTertiary}
        />
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Layers size={14} color={Colors.textSecondary} />
          <Text style={styles.label}>Catégorie</Text>
        </View>
        <TouchableOpacity 
          style={styles.selectorTrigger}
          onPress={() => setIsSelectorVisible(true)}
        >
          <Text style={styles.selectorValue}>{categorie}</Text>
          <ChevronDown size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.addCatBtn}
          onPress={() => setIsAddModalVisible(true)}
        >
          <Plus size={12} color={Colors.accent} />
          <Text style={styles.addCatText}>Nouvelle catégorie</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <View style={styles.labelRow}>
            <DollarSign size={14} color={Colors.textSecondary} />
            <Text style={styles.label}>Prix (FCFA)</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="0"
            value={prix}
            onChangeText={setPrix}
            keyboardType="numeric"
            placeholderTextColor={Colors.textTertiary}
          />
        </View>

        <View style={[styles.inputGroup, { flex: 1 }]}>
          <View style={styles.labelRow}>
            <Layers size={14} color={Colors.textSecondary} />
            <Text style={styles.label}>Quantité</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="1"
            value={quantite}
            onChangeText={setQuantite}
            keyboardType="number-pad"
            placeholderTextColor={Colors.textTertiary}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Ajouter au stock</Text>
      </TouchableOpacity>

      <Selector 
        visible={isSelectorVisible}
        title="Choisir une catégorie"
        options={categories}
        selectedValue={categorie}
        onClose={() => setIsSelectorVisible(false)}
        onSelect={(opt) => setCategorie(opt.value)}
      />

      <AddCategoryModal 
        isVisible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onSuccess={(name) => {
          fetchCategories();
          setCategorie(name);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  barcodeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelSmall: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  barcodeValue: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  inputGroup: {
    marginBottom: 4,
  },
  input: {
    height: 60,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 18,
    paddingHorizontal: 18,
    fontSize: 16,
    fontFamily: FontFamily.medium,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  selectorTrigger: {
    height: 60,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
  },
  selectorValue: {
    fontFamily: FontFamily.medium,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  addCatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 2,
    gap: 4,
  },
  addCatText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 12,
    color: Colors.accent,
  },
  button: {
    height: 64,
    backgroundColor: Colors.accent,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: Colors.textInverse,
    fontFamily: FontFamily.bold,
    fontSize: 17,
  },
});