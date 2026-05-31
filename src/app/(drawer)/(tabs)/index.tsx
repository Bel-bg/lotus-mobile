import React, { useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { ScanLine, Plus } from "lucide-react-native";
import CustomTopBar from "@/components/customs/customTopBar";
import { Colors } from "@/constants/colors";
import { FontFamily } from "@/constants/typography";
import { useStockStore } from "@/store/useStockStore";
import CatalogPreview from "@/features/produits/catalog-preview";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const loadProduits = useStockStore((state) => state.loadProduits);
  const produits = useStockStore((state) => state.produits);

  useFocusEffect(
    useCallback(() => {
      loadProduits();
    }, [loadProduits])
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <CustomTopBar type="home" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeEyebrow}>BONJOUR,</Text>
          <Text style={styles.welcomeTitle}>Tableau de bord</Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.scanBtn}
            onPress={() => router.push("/(drawer)/screens/inventaire/POScan/new")}
            activeOpacity={0.8}
          >
            <ScanLine size={22} color={Colors.textPrimary} />
            <Text style={styles.scanBtnText}>Scanner</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push("/(drawer)/(tabs)/produits/edit")}
            activeOpacity={0.8}
          >
            <Plus size={20} color="#FFF" />
            <Text style={styles.addBtnText}>Nouveau produit</Text>
          </TouchableOpacity>
        </View>

        {produits.length === 0 ? (
          <View style={styles.emptyHint}>
            <Text style={styles.emptyTitle}>Votre catalogue est vide</Text>
            <Text style={styles.emptySubtitle}>
              Ajoutez vos premiers produits pour suivre le stock et les ventes.
            </Text>
            <TouchableOpacity
              style={styles.primaryAddBtn}
              onPress={() => router.push("/(drawer)/(tabs)/produits/edit")}
            >
              <Plus size={18} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.primaryAddBtnText}>Ajouter un produit</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <CatalogPreview />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "android" ? 0 : 0,
  },
  scrollContent: {
    paddingBottom: 120,
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
  welcomeTitle: {
    fontFamily: FontFamily.display,
    fontSize: 24,
    color: Colors.textPrimary,
  },
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 8,
  },
  scanBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scanBtnText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  addBtn: {
    flex: 1.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.textPrimary,
  },
  addBtnText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 14,
    color: "#FFFFFF",
  },
  emptyHint: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  emptyTitle: {
    fontFamily: FontFamily.display,
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontFamily: FontFamily.content,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  primaryAddBtn: {
    backgroundColor: "#0A0A0A",
    borderRadius: 14,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    width: "100%",
  },
  primaryAddBtnText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 14,
    color: "#FFFFFF",
  },
});
