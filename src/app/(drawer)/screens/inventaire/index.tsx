import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  Package,
  ArrowRightLeft,
  Tags,
  Barcode,
  Plus,
  LayoutGrid,
  ChevronRight,
  ArrowLeft,
  ScanBarcode,
  AlertTriangle,
  InfoIcon,
} from "lucide-react-native";
import { Colors } from "../../../../constants/colors";
import CustomAlert from "../../../../components/customs/Alert";
import { initDB } from "@/lib/db/schema";

const colors = {
  background: "#FAFAFA",
  surface: "#FFFFFF",
  border: "#EAEAEA",
  textPrimary: "#0A0A0A",
  textSecondary: "#6B6B6B",
  accent: "#18181B",
  success: "#16A34A",
  successLight: "#F0FDF4",
  warning: "#D97706",
  warningLight: "#FFFBEB",
  danger: "#DC2626",
  dangerLight: "#FEF2F2",
  primary: "#0A0A0A", // Main brand color
};

export default function InventaireDashboard() {
  const router = useRouter();
  const [alertVisible, setAlertVisible] = useState(false);
  const [produits, setProduits] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const fetchStats = useCallback(async () => {
    try {
      const db = await initDB();
      
      // Fetch all products
      const allProduits = await db.getAllAsync<any>("SELECT * FROM produits");
      setProduits(allProduits);

      // Fetch unique categories
      const distinctCats = await db.getAllAsync<{ nom: string }>(
        "SELECT nom FROM categories"
      );
      setCategories(distinctCats.map(c => c.nom));
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [fetchStats])
  );

  // Calculs dynamiques
  const totalProduits = produits.length;
  const totalCategories = categories.length;
  const valeurStock = produits.reduce((acc, p) => {
    let prix = p.prix_unitaire || (p.prix_carton && p.unites_par_carton ? p.prix_carton / p.unites_par_carton : 0);
    return acc + (prix * p.stock_actuel);
  }, 0);
  
  const valeurMoyenneProduit = totalProduits > 0 ? Math.round(valeurStock / totalProduits) : 0;
  const alertesCount = produits.filter((p) => p.stock_actuel <= p.stock_min).length;
  const produitsEnAlerte = produits.filter((p) => p.stock_actuel <= p.stock_min).slice(0, 3);

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Valeur du stock total */}
        <View style={styles.valeurCard}>
          <View style={styles.valeurHeaderRow}>
            <View style={styles.valeurTitleGroup}>
              <View style={styles.valeurIconShell}>
                <Package size={18} color={"#D97706"} strokeWidth={2.2} />
              </View>
              <View>
                <Text style={styles.valeurEyebrow}>APERÇU INVENTAIRE</Text>
                <Text style={styles.valeurCardLabel}>
                  Valeur estimée du stock
                </Text>
              </View>
            </View>

            <View style={styles.valeurBadge}>
              <View style={styles.valeurBadgeDot} />
              <Text style={styles.valeurBadgeText}>Mis à jour</Text>
            </View>
          </View>

          <View style={styles.valeurMainRow}>
            <Text style={styles.valeurCardValue}>
              {valeurStock.toLocaleString("fr-FR")}
            </Text>
            <Text style={styles.valeurCurrency}>FCFA</Text>
          </View>

          <Text style={styles.valeurDescription}>
            Calcul dynamique basé sur les quantités disponibles et le prix
            unitaire actuel de votre catalogue.
          </Text>


          <View style={styles.valeurDivider} />

        <Text style={styles.sectionTitle}>Action Rapide</Text>
          <MenuButton
            title="Scanner"
            subtitle="Scannage rapide d'un produit"
            icon={Barcode}
            color="#f6a53b"
            onPress={() =>
              router.push("/(drawer)/screens/inventaire/POScan/new")
            }
          />
        </View>

        <Text style={styles.sectionTitle}>Gestion Rapide</Text>

        {/* Navigation Menu */}
        <View>
          <MenuButton
            title="Catalogue Complet"
            subtitle="Voir et filtrer tous les produits"
            icon={LayoutGrid}
            color="#3B82F6"
            onPress={() => router.push("/(drawer)/screens/inventaire/products")}
          />
          <MenuButton
            title="Mouvements de Stock"
            subtitle="Entrées, sorties et ajustements"
            icon={ArrowRightLeft}
            color="#10B981"
            onPress={() =>
              router.push("/(drawer)/screens/inventaire/mouvements")
            }
          />
          <MenuButton
            title="Catégories"
            subtitle={`${totalCategories} catégories configurées`}
            icon={Tags}
            color="#8B5CF6"
            onPress={() =>
              router.push("/(drawer)/screens/inventaire/newCategory")
            }
          />
        </View>

        {/* Derniers Alertes Aperçu */}
        {alertesCount > 0 && (
          <View style={styles.alertPreviewSection}>
            <View style={styles.alertHeader}>
              <Text style={styles.sectionTitleAlert}>
                Produits en rupture imminente
              </Text>
              <TouchableOpacity
                onPress={() =>
                  router.push("/(drawer)/screens/inventaire/products")
                }
              >
                <Text style={styles.seeAllText}>Voir tout</Text>
              </TouchableOpacity>
            </View>

            {produitsEnAlerte.map((prod) => (
                <View key={prod.id} style={styles.alertItem}>
                  <View style={styles.alertItemScanBarcode}>
                    <Text style={styles.alertItemName}>{prod.nom}</Text>
                    <Text style={styles.alertItemCat}>{prod.categorie}</Text>
                  </View>
                  <View style={styles.alertItemBadge}>
                    <Text style={styles.alertItemBadgeText}>
                      Reste {prod.stock_actuel}
                    </Text>
                  </View>
                </View>
              ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => router.push("/(drawer)/screens/inventaire/newproduct")}
      >
        <Plus size={20} color="#FFF" />
      </TouchableOpacity>

      <CustomAlert
        isVisible={alertVisible}
        onClose={() => setAlertVisible(false)}
        title="Zone d'Inventaire"
        description="Cette zone vous permet de gérer votre stock de produits : voir la valeur totale du stock, consulter les alertes de rupture, accéder au catalogue complet, suivre les mouvements de stock et gérer les catégories de produits."
        iconName="Package"
        color={colors.primary}
        primaryButtonLabel="Compris"
        onPrimaryPress={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}

const MenuButton = ({ title, subtitle, icon: Icon, color, onPress }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={[styles.menuIconBox, { backgroundColor: color + "1A" }]}>
      <Icon size={24} color={color} />
    </View>
    <View style={styles.menuContent}>
      <Text style={styles.menuTitle}>{title}</Text>
      <Text style={styles.menuSubtitle}>{subtitle}</Text>
    </View>
    <ChevronRight size={20} color="#D1D5DB" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingTop: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
    paddingBottom: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F7F7F7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary,
    fontFamily: "Outfit_700Bold",
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  valeurCard: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "transparent",
    // borderWidth: 1,
    // borderColor: colors.border,
    // padding: 24,
    // borderRadius: 20,
    // marginBottom: 24,
  },
  valeurGlowPrimary: {
    position: "absolute",
    top: -54,
    right: -28,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(217, 119, 6, 0.04)",
  },
  valeurGlowSecondary: {
    position: "absolute",
    bottom: -66,
    left: -42,
    width: 156,
    height: 156,
    borderRadius: 78,
    backgroundColor: "rgba(10, 10, 10, 0.03)",
  },
  valeurHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 20,
  },
  valeurTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  valeurIconShell: {
    width: 44,
    height: 44,
    borderRadius: 14,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.warningLight,
  },
  valeurEyebrow: {
    fontSize: 10,
    letterSpacing: 1.4,
    marginBottom: 4,
    fontFamily: "Outfit_700Bold",
  },
  valeurCardLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: "Outfit_600SemiBold",
  },
  valeurMainRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  valeurCardValue: {
    color: colors.textPrimary,
    fontSize: 36,
    fontWeight: "700",
    fontFamily: "Outfit_700Bold",
    letterSpacing: -1.2,
  },
  valeurCurrency: {
    color: colors.textSecondary,
    fontSize: 14,
    marginLeft: 8,
    marginBottom: 6,
    fontFamily: "Outfit_600SemiBold",
  },
  valeurDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: "DMSans_400Regular",
    marginBottom: 16,
  },
  valeurBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  valeurBadgeDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: "#86EFAC",
    marginRight: 6,
  },
  valeurBadgeText: {
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "Outfit_500Medium",
  },
  valeurMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  valeurMetaPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: colors.border,
  },
  valeurMetaText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: "Outfit_500Medium",
  },
  valeurDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 18,
  },
  valeurInsightsRow: {
    flexDirection: "row",
    gap: 12,
  },
  insightCard: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#FCFCFC",
    borderWidth: 1,
    borderColor: colors.border,
  },
  insightCardAlert: {
    backgroundColor: "#FCFCFC",
  },
  insightCardAlertDanger: {
    backgroundColor: colors.dangerLight,
    borderColor: "#FDD5D5",
  },
  insightIconShell: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  insightLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 6,
    fontFamily: "Outfit_500Medium",
  },
  insightValue: {
    color: colors.textPrimary,
    fontSize: 22,
    fontFamily: "Outfit_700Bold",
  },
  insightValueDanger: {
    color: colors.danger,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 16,
    fontFamily: "Outfit_700Bold",
  },
  menuContainer: {
    gap: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
  },
  menuIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
    fontFamily: "Outfit_600SemiBold",
  },
  menuSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: "DMSans_400Regular",
  },
  alertPreviewSection: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitleAlert: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.danger,
    fontFamily: "Outfit_700Bold",
  },
  seeAllText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "500",
  },
  alertItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  alertItemScanBarcode: {
    flex: 1,
  },
  alertItemName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  alertItemCat: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  alertItemBadge: {
    backgroundColor: colors.dangerLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  alertItemBadgeText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "600",
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  dropMenuContainer: {
    backgroundColor: colors.surface,
    marginTop: 60,
    marginHorizontal: 20,
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  dropMenuItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontFamily: "Outfit_500Medium",
  },
});
