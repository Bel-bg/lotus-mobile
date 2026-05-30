import React, { useMemo, useState, useEffect } from "react";
import { StyleSheet, View, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { initDB } from "@/lib/db/schema";
import { POSScanner } from "@/components/ventes/scan-pos/pos-scanner";
import { ScannedItemsList } from "@/components/ventes/scan-pos/scanned-items-list";
import { TotalBar } from "@/components/ventes/scan-pos/total-bar";
import { CartItem } from "@/components/ventes/scan-pos/types";
import { Colors } from "@/constants/colors";
import CustomAlert from "@/components/customs/Alert";
import { TouchableOpacity, Text } from "react-native";
import { ArrowRight } from "lucide-react-native";
import { createVente } from "@/lib/db/ventes";

export default function ScanPosScreen() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    description: string;
  }>({ visible: false, title: "", description: "" });

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const addFromBarcode = async (barcode: string) => {
    const cleanCode = barcode.trim();
    if (!cleanCode) return;

    try {
      const db = await initDB();
      const product = await db.getFirstAsync<{
        id: string;
        nom: string;
        prix_unitaire: number;
        barcode: string;
      }>("SELECT * FROM produits WHERE barcode = ?", [cleanCode]);

      if (!product) {
        setAlertConfig({
          visible: true,
          title: "Produit non trouvé",
          description: `Le code-barres "${cleanCode}" ne correspond à aucun produit dans votre inventaire.`,
        });
        return;
      }

      setItems((previous) => {
        const index = previous.findIndex(
          (entry) => entry.barcode === product.barcode,
        );
        if (index === -1) {
          return [
            ...previous,
            {
              barcode: product.barcode,
              name: product.nom,
              price: product.prix_unitaire,
              quantity: 1,
            },
          ];
        }

        return previous.map((entry, currentIndex) =>
          currentIndex === index
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry,
        );
      });
    } catch (error) {
      console.error("Erreur recherche produit:", error);
    }
  };

  const updateQuantity = (barcode: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.barcode === barcode
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    );
  };

  const removeItem = (barcode: string) => {
    setItems((prev) => prev.filter((item) => item.barcode !== barcode));
  };

  const handleConfirm = async () => {
    if (items.length === 0) return;

    try {
      const db = await initDB();
      const panier: any[] = [];
      
      for (const item of items) {
        const p = await db.getFirstAsync<any>(
          "SELECT * FROM produits WHERE barcode = ?",
          [item.barcode]
        );
        if (!p) continue;

        panier.push({
          produit: {
            id: p.id,
            nom: p.nom,
            categorie: p.categorie,
            prixUnitaire: p.prix_unitaire,
            prixCarton: p.prix_carton,
            unitesParCarton: p.unites_par_carton,
            typeVente: p.type_vente,
            stockActuel: p.stock_actuel,
            stockMin: p.stock_min,
            stockMax: p.stock_max,
            unite: p.unite,
            createdAt: p.created_at,
            updatedAt: p.updated_at
          },
          quantite: item.quantity,
          sousTotal: item.price * item.quantity
        });
      }

      const vente = await createVente(panier);

      router.push({
        pathname: "/(drawer)/(tabs)/ventes/success",
        params: { id: vente.id, total: vente.total }
      });
    } catch (error: any) {
      console.error("Sale confirmation error:", error);
      setAlertConfig({
        visible: true,
        title: "Erreur de vente",
        description: error.message || "Impossible d'enregistrer la vente.",
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <POSScanner onScan={addFromBarcode} />

      <ScannedItemsList
        items={items}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
      />

      <View style={styles.footer}>
        <TotalBar total={total} />
        {items.length > 0 && (
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
            <Text style={styles.confirmBtnText}>Confirmer la vente</Text>
            <ArrowRight size={20} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>

      <CustomAlert
        isVisible={alertConfig.visible}
        onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
        title={alertConfig.title}
        description={alertConfig.description}
        iconName="AlertCircle"
        color={Colors.danger}
        primaryButtonLabel="Continuer"
        onPrimaryPress={() =>
          setAlertConfig((prev) => ({ ...prev, visible: false }))
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  footer: {
    paddingBottom: 20,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  confirmBtn: {
    backgroundColor: "#0A0A0A",
    height: 54,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  confirmBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 8,
  },
});
