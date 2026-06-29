import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  Platform,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { ScanLine, Plus } from "lucide-react-native";
import CustomTopBar from "@/components/customs/customTopBar";
import { Colors } from "@/constants/colors";
import { FontFamily } from "@/constants/typography";
import { useStockStore } from "@/store/useStockStore";
import CatalogPreview from "@/features/produits/catalog-preview";
import HomeFab from "@/components/customs/HomeFab";
import AdsOverlay from "@/components/ads/adsOverlays";
import AdsImage from "@/assets/ads/ad4.png";
import BannerAdsWithProgress from "@/components/ads/bannerAds";
import {
  bannerImages,
  bannerImagesRemote,
  bannerImagesMix,
} from "@/components/ads/bannerData";
import { useUiStore } from "@/contexts/useUiStore";
import QuickAccess from "@/components/customs/quickAcess";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const loadProduits = useStockStore((state) => state.loadProduits);
  const produits = useStockStore((state) => state.produits);
  const [showAds, setShowAds] = useState(true);
  const [isAdsCompleted, setIsAdsCompleted] = useState(false);
  const setAdOverlayActive = useUiStore((state) => state.setAdOverlayActive);
  const handleBannerPress = () => {
    console.log("Banner pressé !");
  };

  const handleAdsFinish = () => {
    setIsAdsCompleted(true);
    setShowAds(false);
    console.log(" Pub terminée !");
  };

  const handleRedirect = () => {
    console.log(" Redirection vers la page premium !");
    router.push("/premium");
  };
  useFocusEffect(
    useCallback(() => {
      loadProduits();
    }, [loadProduits]),
  );

  useEffect(() => {
    setAdOverlayActive(showAds);
    return () => setAdOverlayActive(false);
  }, [showAds, setAdOverlayActive]);

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
            onPress={() =>
              router.push("/(drawer)/screens/inventaire/POScan/new")
            }
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
            <Text style={styles.addBtnText}>Ajouter</Text>
          </TouchableOpacity>
        </View>

        {produits.length === 0 ? (
          <View style={styles.emptyHint}>
            <Image
              source={require("@/assets/images/empty.png")}
              style={styles.emptyImage}
            />
            <Text style={styles.emptyTitle}>Votre catalogue est vide</Text>
            <Text style={styles.emptySubtitle}>
              Ajoutez vos premiers produits pour suivre le stock et les ventes.
            </Text>
          </View>
        ) : (
          <CatalogPreview />
        )}

        <BannerAdsWithProgress
          banners={bannerImages}
          redirectPath="/promotions"
          autoPlay={true}
          interval={2000}
          height={120}
          borderRadius={12}
          onBannerPress={handleBannerPress}
        />
<QuickAccess />
      </ScrollView>
      {/* <View style={{ flex: 1, top: -150 }}>
        <HomeFab />
      </View> */}
      {showAds && (
        <AdsOverlay
          onFinish={handleAdsFinish}
          imageSource={AdsImage}
          redirectPath="/premium"
          onRedirect={handleRedirect}
        />
      )}
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
    marginTop: 30,
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
  },
  emptyImage: {
    width: 200,
    height: 200,
    resizeMode: "cover",
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
