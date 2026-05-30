import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Platform,
} from "react-native";
import {
  Search,
  X,
  Plus,
  Minus,
  ArrowRight,
  ShoppingCart,
  ScanLine,
} from "lucide-react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { initDB } from "@/lib/db/schema";
import { createVente } from "@/lib/db/ventes";
import { Colors } from "@/constants/colors";
import CustomAlert from "@/components/customs/Alert";
import { FontFamily } from "@/constants/typography";


export default function NewSaleScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tout");
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [produits, setProduits] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    description: string;
  }>({ visible: false, title: "", description: "" });

  const fetchData = useCallback(async () => {
    try {
      const db = await initDB();
      const allProduits = await db.getAllAsync<any>("SELECT * FROM produits");
      setProduits(allProduits);

      const distinctCats = await db.getAllAsync<{ nom: string }>(
        "SELECT nom FROM categories"
      );
      setCategories(["Tout", ...distinctCats.map(c => c.nom)]);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const updateCart = (id: string, delta: number) => {
    const p = produits.find(prod => prod.id === id);
    if (!p) return;

    setCart((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      
      if (next > p.stock_actuel) {
        setAlertConfig({
          visible: true,
          title: "Stock insuffisant",
          description: `Il ne reste que ${p.stock_actuel} unités de ${p.nom}.`,
        });
        return prev;
      }

      if (next === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  const filteredProducts = produits.filter((p) => {
    const matchesSearch = p.nom.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "Tout" || p.categorie === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const cartItemsCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = Object.entries(cart).reduce((acc, [id, qty]) => {
    const p = produits.find((prod) => prod.id === id);
    return acc + (p?.prix_unitaire || 0) * qty;
  }, 0);

  const selectedProducts = Object.entries(cart).map(([id, qty]) => {
    const p = produits.find((prod) => prod.id === id)!;
    return { ...p, qty };
  });

  const handleConfirm = async () => {
    if (selectedProducts.length === 0) return;

    try {
      const db = await initDB();
      const panier: any[] = [];
      
      for (const item of selectedProducts) {
        const p = await db.getFirstAsync<any>(
          "SELECT * FROM produits WHERE id = ?",
          [item.id]
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
          quantite: item.qty,
          sousTotal: item.prix_unitaire * item.qty
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <X size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Nouvelle vente</Text>
        <TouchableOpacity
          onPress={() => router.push("/(drawer)/(tabs)/ventes/Scan_POS")}
          style={styles.scanButton}
        >
          <ScanLine size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        {/* <View style={{ width: 40 }} /> */}
      </View>
<ScrollView>
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                activeCategory === cat && styles.categoryChipActive,
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === cat && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productList}
        columnWrapperStyle={styles.productRow}
        renderItem={({ item }) => {
          const qty = cart[item.id] || 0;
          return (
            <View
              style={[styles.productCard, qty > 0 && styles.productCardActive]}
            >
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.nom}</Text>
                <Text style={styles.productStock}>
                  Stock disponible: {item.stock_actuel} {item.unite || 'u'}
                </Text>
              </View>

              <View style={styles.stepper}>
                <TouchableOpacity
                  onPress={() => updateCart(item.id, -1)}
                  style={styles.stepperBtn}
                >
                  <Minus
                    size={16}
                    color={qty > 0 ? Colors.textPrimary : Colors.borderStrong}
                  />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{qty}</Text>
                <TouchableOpacity
                  onPress={() => updateCart(item.id, 1)}
                  style={styles.stepperBtn}
                >
                  <Plus size={16} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
</ScrollView>



      {cartItemsCount > 0 && (
        <View style={styles.summaryPanel}>
          <View style={styles.handle} />
          <View style={styles.summaryHeader}>
            <View style={styles.summaryTitleRow}>
              <ShoppingCart size={18} color={Colors.textPrimary} />
              <Text style={styles.summaryTitle}>
                {cartItemsCount} produits sélectionnés
              </Text>
            </View>
          </View>

          <ScrollView style={[styles.cartList, { maxHeight: 150 }]}>
            {selectedProducts.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <Text style={styles.cartItemName}>
                  {item.nom} x{item.qty}
                </Text>
                <Text style={styles.cartItemPrice}>
                  {(item.prix_unitaire * item.qty).toLocaleString()} FCFA
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {cartTotal.toLocaleString()} FCFA
            </Text>
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setCart({})}>
              <Text style={styles.cancelBtnText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <Text style={styles.confirmBtnText}>Confirmer</Text>
              <ArrowRight size={20} color={Colors.textInverse} />
            </TouchableOpacity>
          </View>

          <Text style={styles.footerNote}>
            LE STOCK SERA MIS À JOUR AUTOMATIQUEMENT
          </Text>
        </View>
      )}

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  closeButton: {
    padding: 8,
  },
  scanButton: {
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
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
    backgroundColor: "#F5F5F5",
    marginRight: 10,
    minWidth: 80,
    alignItems: "center",
  },
  categoryChipActive: {
    backgroundColor: "#000",
  },
  categoryText: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  categoryTextActive: {
    color: "#fff",
  },
  productList: {
    paddingHorizontal: 15,
    paddingBottom: 250, // Space for summary panel
  },
  productRow: {
    justifyContent: "space-between",
  },
  productCard: {
    width: "48%",
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "transparent",
  },
  productCardActive: {
    borderColor: "#000",
    backgroundColor: "#fff",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  stepperBtn: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyText: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  summaryPanel: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 40 : 25,
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
    backgroundColor: "#EAEAEA",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 15,
  },
  summaryHeader: {
    marginBottom: 15,
  },
  summaryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
    justifyContent: "space-between",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
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
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  cancelBtn: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    height: 56,
    flex: 1,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  confirmBtn: {
    backgroundColor: "#000",
    borderRadius: 12,
    height: 56,
    flex: 2,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: "#fff",
    marginRight: 10,
  },
  footerNote: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    color: Colors.textSecondary,
    textAlign: "center",
    letterSpacing: 0.5,
  },
});
