// ============================================
// LOTUS BUSINESS — Écran : Ajout stock par scan
// ============================================
// Interface d'ajout de produit via scan de code-barres

import { useState } from "react";
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Modal, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, ChevronDown } from "lucide-react-native";
import { openDatabaseSync } from "expo-sqlite";
import { initDB } from "@/lib/db/schema";
// Simple ID generator to replace missing uuid package
const generateId = () => Math.random().toString(36).substring(2, 15);
import ScanSpace from "@/components/POS/scanSpace";
import ScanForm from "@/components/POS/scanForm";
import CustomAlert from "@/components/customs/Alert";
import { Colors } from "@/constants/colors";
import { FontFamily } from "@/constants/typography";

export default function NewPOSScreen() {
  const router = useRouter();
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);

  // Alert state
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    description: string;
  }>({ visible: false, title: '', description: '' });

  const handleScan = (barcode: string) => {
    setScannedBarcode(barcode);
  };

  const handleSubmit = async (data: {
    barcode: string;
    nom: string;
    prix: number;
    quantite: number;
    categorie: string;
  }) => {
    try {
      // Ensure DB and Tables are initialized
      const db = await initDB();
      
      // Check if barcode already exists
      const existing = await db.getFirstAsync<{ id: string }>(
        "SELECT id FROM produits WHERE barcode = ?",
        [data.barcode]
      );

      if (existing) {
        setAlertConfig({
          visible: true,
          title: "Produit déjà répertorié",
          description: `Un produit avec le code-barres "${data.barcode}" existe déjà dans votre base de données.`,
        });
        return;
      }

      await db.runAsync(
        `INSERT INTO produits (id, nom, prix_unitaire, stock_actuel, stock_min, barcode, type_vente, categorie)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [generateId(), data.nom, data.prix, data.quantite, 20, data.barcode, 'piece', data.categorie || 'Autres']
      );
      router.back();
    } catch (error: any) {
      console.error("Erreur ajout produit:", error);
      setAlertConfig({
        visible: true,
        title: "Erreur d'enregistrement",
        description: error.message || "Une erreur est survenue lors de l'ajout du produit.",
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Search space is now global background in this screen */}
      <ScanSpace onScan={handleScan} />

      {/* Bottom Sheet for Scan Form */}
      <Modal
        visible={!!scannedBarcode}
        transparent
        animationType="slide"
        onRequestClose={() => setScannedBarcode(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalDismiss} 
            activeOpacity={1} 
            onPress={() => setScannedBarcode(null)} 
          />
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.sheetContainer}
          >
            <View style={styles.sheetHandleWrap}>
              <View style={styles.sheetHandle} />
            </View>
            
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Détails du produit</Text>
              <TouchableOpacity onPress={() => setScannedBarcode(null)}>
                <ChevronDown size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.sheetContent}
              contentContainerStyle={styles.sheetScroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {scannedBarcode && (
                <ScanForm 
                  barcode={scannedBarcode} 
                  onSubmit={handleSubmit} 
                />
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <CustomAlert
        isVisible={alertConfig.visible}
        onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
        title={alertConfig.title}
        description={alertConfig.description}
        iconName="AlertTriangle"
        color={Colors.danger}
        primaryButtonLabel="Compris"
        onPrimaryPress={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalDismiss: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '80%',
    paddingBottom: 40,
  },
  sheetHandleWrap: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  sheetTitle: {
    fontFamily: FontFamily.display,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sheetContent: {
    paddingHorizontal: 24,
  },
  sheetScroll: {
    paddingBottom: 20,
  },
});