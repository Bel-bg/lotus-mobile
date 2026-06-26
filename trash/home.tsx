import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Platform,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  Package,
  Search,
  ScanLine,
  ShoppingCart,
  AlertTriangle,
  Coins,
  Sparkles,
  TrendingUp,
  ChevronRight,
  Eye,
  Plus,
} from "lucide-react-native";
import CustomTopBar from "@/components/customs/customTopBar";
import StoreName from "@/components/ui/StoreName";
import { Colors } from "@/constants/colors";
import { FontFamily, FontSize } from "@/constants/typography";
import { useStockStore } from "@/store/useStockStore";
import { useAuthStore } from "@/store/useAuthStore";
import { initDB } from "@/lib/db/schema";
import { createProduit } from "@/lib/db/produits";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tout");
  const [categories, setCategories] = useState<string[]>(["Tout"]);
  const [isSeeding, setIsSeeding] = useState(false);

  // Zustand Store values
  const loadProduits = useStockStore((state) => state.loadProduits);
  const produits = useStockStore((state) => state.produits);
  const isLoading = useStockStore((state) => state.isLoading);
  const boutique = useAuthStore((state) => state.boutique);

  const fetchCategories = useCallback(async () => {
    try {
      const db = await initDB();
      const distinctCats = await db.getAllAsync<{ categorie: string }>(
        "SELECT DISTINCT categorie FROM produits"
      );
      // Extraire les noms de catégories uniques
      const catNames = distinctCats
        .map((c) => c.categorie)
        .filter((c) => c && c !== "Autres");
      setCategories(["Tout", ...catNames, "Autres"]);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProduits();
      fetchCategories();
    }, [loadProduits, fetchCategories])
  );

  // Calculations for dynamic insights
  const totalProducts = produits.length;
  const alertesCount = produits.filter((p) => p.stockActuel <= p.stockMin).length;
  
  const stockValue = produits.reduce((acc, p) => {
    const price = p.prixUnitaire || (p.prixCarton && p.unitesParCarton ? p.prixCarton / p.unitesParCarton : 0);
    return acc + (price * p.stockActuel);
  }, 0);

  // Filter products by search and category
  const filteredProducts = produits.filter((p) => {
    const matchesSearch = p.nom.toLowerCase().includes(search.toLowerCase()) || 
                          p.categorie.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "Tout" || p.categorie === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Seeding interactive demonstration data
  const handleSeedExemples = async () => {
    setIsSeeding(true);
    try {
      const db = await initDB();
      
      // 1. Seed categories in SQLite categories table
      const catsToSeed = ["Boissons", "Épicerie", "Conserves", "Cosmétiques", "Entretien"];
      for (const cat of catsToSeed) {
        await db.runAsync(
          "INSERT OR IGNORE INTO categories (id, nom) VALUES (?, ?)",
          [`cat_${cat.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`, cat]
        );
      }

      // 2. Seed default products
      const dummyProducts = [
        {
          nom: "Coca Cola 1.5L",
          categorie: "Boissons",
          prixUnitaire: 800,
          prixCarton: 4500,
          unitesParCarton: 6,
          typeVente: "les_deux" as const,
          stockActuel: 45,
          stockMin: 12,
          unite: "bouteilles",
        },
        {
          nom: "Riz Parfumé 5Kg",
          categorie: "Épicerie",
          prixUnitaire: 5500,
          prixCarton: null,
          unitesParCarton: null,
          typeVente: "piece" as const,
          stockActuel: 5,
          stockMin: 10,
          unite: "sacs",
        },
        {
          nom: "Lait Concentré Bonnet Rouge",
          categorie: "Conserves",
          prixUnitaire: 450,
          prixCarton: 21000,
          unitesParCarton: 48,
          typeVente: "les_deux" as const,
          stockActuel: 120,
          stockMin: 20,
          unite: "boîtes",
        },
        {
          nom: "Crème Hydratante Coco",
          categorie: "Cosmétiques",
          prixUnitaire: 2500,
          prixCarton: null,
          unitesParCarton: null,
          typeVente: "piece" as const,
          stockActuel: 0,
          stockMin: 8,
          unite: "pots",
        },
        {
          nom: "Savon Liquide Vaisselle",
          categorie: "Entretien",
          prixUnitaire: 1200,
          prixCarton: 12000,
          unitesParCarton: 12,
          typeVente: "les_deux" as const,
          stockActuel: 18,
          stockMin: 5,
          unite: "flacons",
        },
      ];

      for (const p of dummyProducts) {
        await createProduit(p);
      }

      await loadProduits();
      await fetchCategories();
    } catch (error) {
      console.error("Error seeding products:", error);
    } finally {
      setIsSeeding(false);
    }
  };

  // Render Product Card
  const renderProductCard = ({ item }: { item: any }) => {
    const isAlert = item.stockActuel <= item.stockMin;
    const isOutOfStock = item.stockActuel <= 0;

    // Define stock status color styles
    let stockBg: string = Colors.successLight;
    let stockBorder: string = Colors.successBorder;
    let stockColor: string = Colors.successText;
    let stockLabel = `Stock: ${item.stockActuel}`;

    if (isOutOfStock) {
      stockBg = Colors.dangerLight;
      stockBorder = Colors.dangerBorder;
      stockColor = Colors.dangerText;
      stockLabel = "Rupture";
    } else if (isAlert) {
      stockBg = Colors.warningLight;
      stockBorder = Colors.warningBorder;
      stockColor = Colors.warningText;
      stockLabel = `Faible: ${item.stockActuel}`;
    }

    const priceText = item.prixUnitaire
      ? `${item.prixUnitaire.toLocaleString("fr-FR")} ${boutique?.devise || "FCFA"}`
      : `${item.prixCarton?.toLocaleString("fr-FR")} ${boutique?.devise || "FCFA"} / c`;

    return (
      <TouchableOpacity
        style={styles.productCard}
        activeOpacity={0.8}
        onPress={() => router.push(`/(drawer)/screens/inventaire/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.productCategory} numberOfLines={1}>
            {item.categorie.toUpperCase()}
          </Text>
        </View>

        <Text style={styles.productName} numberOfLines={2}>
          {item.nom}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>{priceText}</Text>
          {item.typeVente === "les_deux" && item.prixCarton && (
            <Text style={styles.cartonPrice}>
              Carton: {item.prixCarton.toLocaleString("fr-FR")} {boutique?.devise || "FCFA"}
            </Text>
          )}
        </View>

        <View style={styles.cardFooter}>
          <View style={[styles.stockBadge, { backgroundColor: stockBg, borderColor: stockBorder }]}>
            <Text style={[styles.stockBadgeText, { color: stockColor }]}>
              {stockLabel}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.quickSellBtn}
            onPress={() => router.push("/(drawer)/(tabs)/ventes/nouvelle")}
            activeOpacity={0.7}
          >
            <Plus size={14} color="#FFF" strokeWidth={3} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Render Empty State
  const renderEmptyState = () => {
    if (isLoading || isSeeding) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#0A0A0A" />
          <Text style={styles.emptyText}>Mise à jour du catalogue...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Package size={48} color={Colors.textTertiary} strokeWidth={1.5} />
        </View>
        <Text style={styles.emptyTitle}>Votre Catalogue est vide</Text>
        <Text style={styles.emptySubtitle}>
          Ajoutez vos produits pour gérer vos stocks et générer des ventes.
        </Text>

        <View style={styles.emptyActions}>
          <TouchableOpacity
            style={styles.primaryAddBtn}
            onPress={() => router.push("/(drawer)/screens/inventaire/newproduct")}
            activeOpacity={0.8}
          >
            <Plus size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.primaryAddBtnText}>Ajouter un produit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.seedBtn}
            onPress={handleSeedExemples}
            activeOpacity={0.8}
          >
            <Sparkles size={18} color="#0A0A0A" style={{ marginRight: 8 }} />
            <Text style={styles.seedBtnText}>Générer des exemples</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Filtrer les capsules doublons et les valeurs vides
  const filterCategories = categories.filter((c, i) => categories.indexOf(c) === i);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <CustomTopBar type="home" />

      {isSeeding && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.loadingOverlayText}>Génération des exemples en cours...</Text>
        </View>
      )}

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.catalogGrid}
        columnWrapperStyle={styles.gridRow}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeEyebrow}>BONJOUR, GÉRANT 👋</Text>
              <StoreName size="lg" showIcon={true} />
            </View>

            {/* Metrics cards row */}
            {totalProducts > 0 && (
              <View style={styles.metricsContainer}>
                {/* Metric 1 */}
                <View style={styles.metricCard}>
                  <View style={[styles.metricIconBox, { backgroundColor: "#F3F4F6" }]}>
                    <Package size={18} color="#0A0A0A" />
                  </View>
                  <Text style={styles.metricLabel}>Produits</Text>
                  <Text style={styles.metricValue}>{totalProducts}</Text>
                </View>

                {/* Metric 2 */}
                <View style={styles.metricCard}>
                  <View style={[styles.metricIconBox, { backgroundColor: "#FEF3C7" }]}>
                    <TrendingUp size={18} color="#D97706" />
                  </View>
                  <Text style={styles.metricLabel}>Valeur Stock</Text>
                  <Text style={styles.metricValue} numberOfLines={1} adjustsFontSizeToFit>
                    {stockValue.toLocaleString("fr-FR")}
                  </Text>
                  <Text style={styles.metricCurrency}>{boutique?.devise || "FCFA"}</Text>
                </View>

                {/* Metric 3 */}
                <View style={[styles.metricCard, alertesCount > 0 && styles.metricCardAlert]}>
                  <View
                    style={[
                      styles.metricIconBox,
                      { backgroundColor: alertesCount > 0 ? Colors.dangerLight : "#EFF6FF" },
                    ]}
                  >
                    <AlertTriangle size={18} color={alertesCount > 0 ? Colors.danger : Colors.info} />
                  </View>
                  <Text style={styles.metricLabel}>Ruptures</Text>
                  <Text style={[styles.metricValue, alertesCount > 0 && styles.metricValueAlert]}>
                    {alertesCount}
                  </Text>
                </View>
              </View>
            )}

            {/* Search & Scan Box */}
            <View style={styles.searchWrapper}>
              <View style={styles.searchBox}>
                <Search size={18} color={Colors.textSecondary} style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Rechercher dans le catalogue..."
                  placeholderTextColor={Colors.textSecondary}
                  value={search}
                  onChangeText={setSearch}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch("")} style={styles.clearBtn}>
                    <Text style={styles.clearBtnText}>Effacer</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={styles.scanBtnIcon}
                onPress={() => router.push("/(drawer)/screens/inventaire/POScan/new")}
                activeOpacity={0.7}
              >
                <ScanLine size={22} color="#0A0A0A" />
              </TouchableOpacity>
            </View>

            {/* Categories horizontal list */}
            {totalProducts > 0 && (
              <View style={styles.categoriesSection}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoriesScroll}
                >
                  {filterCategories.map((cat) => {
                    const isActive = activeCategory === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                        onPress={() => setActiveCategory(cat)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {totalProducts > 0 && (
              <View style={styles.catalogTitleSection}>
                <Text style={styles.catalogTitle}>Mon Catalogue</Text>
                <Text style={styles.catalogSubtitle}>
                  {filteredProducts.length} produit{filteredProducts.length > 1 ? "s" : ""} trouvé{filteredProducts.length > 1 ? "s" : ""}
                </Text>
              </View>
            )}
          </>
        }
        renderItem={renderProductCard}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "android" ? 10 : 0,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.75)",
    zIndex: 9999,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingOverlayText: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 16,
    color: "#FFFFFF",
    marginTop: 15,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeEyebrow: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 10,
    color: Colors.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  metricsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#F0F0F0",
    borderRadius: 16,
    padding: 12,
    alignItems: "flex-start",
  },
  metricCardAlert: {
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
  },
  metricIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  metricLabel: {
    fontFamily: FontFamily.content,
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  metricValue: {
    fontFamily: FontFamily.display,
    fontSize: 18,
    color: Colors.textPrimary,
    fontWeight: "bold",
  },
  metricValueAlert: {
    color: Colors.dangerText,
  },
  metricCurrency: {
    fontFamily: FontFamily.utility,
    fontSize: 9,
    color: Colors.textSecondary,
    marginTop: -2,
  },
  searchWrapper: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 16,
    alignItems: "center",
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.content,
    fontSize: 14,
    color: Colors.textPrimary,
    height: "100%",
  },
  clearBtn: {
    padding: 4,
  },
  clearBtnText: {
    fontFamily: FontFamily.utility,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  scanBtnIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  categoriesSection: {
    marginBottom: 24,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 99,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryPillActive: {
    backgroundColor: "#0A0A0A",
  },
  categoryText: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },
  catalogTitleSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  catalogTitle: {
    fontFamily: FontFamily.display,
    fontSize: 20,
    color: Colors.textPrimary,
    fontWeight: "bold",
  },
  catalogSubtitle: {
    fontFamily: FontFamily.content,
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  catalogGrid: {
    paddingHorizontal: 12,
    paddingBottom: 120, // Avoid bottom bar overlapping
  },
  gridRow: {
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  productCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#EFEFEF",
    padding: 12,
    marginBottom: 14,
    // Soft premium shadow
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  cardHeader: {
    marginBottom: 4,
  },
  productCategory: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 9,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  productName: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 14,
    color: Colors.textPrimary,
    height: 38,
    marginBottom: 8,
  },
  priceRow: {
    marginBottom: 12,
  },
  productPrice: {
    fontFamily: FontFamily.display,
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: "bold",
  },
  cartonPrice: {
    fontFamily: FontFamily.content,
    fontSize: 10,
    color: Colors.infoText,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  stockBadgeText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 10,
  },
  quickSellBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#0A0A0A",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingVertical: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  emptyTitle: {
    fontFamily: FontFamily.display,
    fontSize: 18,
    color: Colors.textPrimary,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontFamily: FontFamily.content,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 30,
  },
  emptyActions: {
    width: "100%",
    gap: 12,
  },
  primaryAddBtn: {
    backgroundColor: "#0A0A0A",
    borderRadius: 14,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  primaryAddBtnText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 14,
    color: "#FFFFFF",
  },
  seedBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    width: "100%",
  },
  seedBtnText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 14,
    color: "#0A0A0A",
  },
  emptyText: {
    fontFamily: FontFamily.content,
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 12,
  },
});
