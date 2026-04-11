import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import {
  LucideIcon,
  Package,
  AlertTriangle,
  ArrowRightLeft,
  Tags,
  Plus,
  LayoutGrid,
  ChevronRight,
  ArrowLeft,
  LayersPlus,
  Info,
} from "lucide-react-native";
import { DUMMY_PRODUITS, DUMMY_CATEGORIES } from "./dummyData";
import { Colors } from "../../../../constants/colors";
import CustomAlert from "../../../../components/customs/Alert";

const { width } = Dimensions.get("window");

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

  // Calculs depuis les dummy data
  const totalProduits = DUMMY_PRODUITS.length;
  const valeurStock = DUMMY_PRODUITS.reduce((acc, p) => {
    let prix =
      p.prixPiece ||
      (p.prixCarton && p.unitesParCarton
        ? p.prixCarton / p.unitesParCarton
        : 0);
    return acc + prix * p.stockActuel;
  }, 0);

  const alertesCount = DUMMY_PRODUITS.filter(
    (p) => p.stockActuel <= p.stockMin,
  ).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Custom */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
          activeOpacity={0.75}
        >
          <ArrowLeft size={20} color={Colors.textPrimary} strokeWidth={2.4} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} selectable>
          Inventaires
        </Text>

        <TouchableOpacity
          onPress={() => setAlertVisible(true)}
          style={styles.iconButton}
          activeOpacity={0.75}
        >
          <Info size={18} color={Colors.textPrimary} strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Valeur du stock total */}
        <View style={styles.valeurCard}>
          <Text style={styles.valeurCardLabel}>Valeur estimée du stock</Text>
          <Text style={styles.valeurCardValue}>
            {valeurStock.toLocaleString("fr-FR")} FCFA
          </Text>
          <View style={styles.valeurBadge}>
            <Text style={styles.valeurBadgeText}>Mis à jour à l'instant</Text>
          </View>
        </View>
        {/* Kpis Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={[styles.iconWrapper, { backgroundColor: "#F3F4F6" }]}>
              <Package size={20} color={colors.textPrimary} />
            </View>
            <Text style={styles.metricLabel}>Total Produits</Text>
            <Text style={styles.metricValue}>{totalProduits}</Text>
          </View>

          <View style={styles.metricCard}>
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: colors.warningLight },
              ]}
            >
              <AlertTriangle size={20} color={colors.warning} />
            </View>
            <Text style={styles.metricLabel}>Alertes Stock</Text>
            <Text
              style={[
                styles.metricValue,
                {
                  color: alertesCount > 0 ? colors.danger : colors.textPrimary,
                },
              ]}
            >
              {alertesCount}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Gestion Rapide</Text>

        {/* Navigation Menu */}
        <View style={styles.menuContainer}>
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
            subtitle={`${DUMMY_CATEGORIES.length} catégories configurées`}
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

            {DUMMY_PRODUITS.filter((p) => p.stockActuel <= p.stockMin)
              .slice(0, 3)
              .map((prod) => (
                <View key={prod.id} style={styles.alertItem}>
                  <View style={styles.alertItemInfo}>
                    <Text style={styles.alertItemName}>{prod.nom}</Text>
                    <Text style={styles.alertItemCat}>{prod.categorie}</Text>
                  </View>
                  <View style={styles.alertItemBadge}>
                    <Text style={styles.alertItemBadgeText}>
                      Reste {prod.stockActuel}
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
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 6,
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
    fontFamily: "DMSans_700Bold",
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
  metricsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  metricCard: {
    width: (width - 56) / 2,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    elevation: 0.5,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
    fontFamily: "DMSans_500Medium",
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    fontFamily: "DMSans_700Bold",
  },
  valeurCard: {
    backgroundColor: colors.accent,
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  valeurCardLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    marginBottom: 8,
    fontFamily: "DMSans_500Medium",
  },
  valeurCardValue: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 16,
    fontFamily: "DMSans_700Bold",
  },
  valeurBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  valeurBadgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "DMSans_500Medium",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 16,
    fontFamily: "DMSans_700Bold",
  },
  menuContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 8,
    marginBottom: 24,
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
    fontFamily: "DMSans_600SemiBold",
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
    fontFamily: "DMSans_700Bold",
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
  alertItemInfo: {
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
    fontFamily: "DMSans_500Medium",
  },
});
