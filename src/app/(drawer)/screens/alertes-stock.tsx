import CustomAlert from "@/components/customs/Alert";
import { Colors } from "@/constants/colors";
import { FontFamily } from "@/constants/typography";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Package,
  Settings2,
  ShoppingCart,
  TriangleAlert,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AlertLevel = "rupture" | "faible";

interface StockAlertItem {
  id: string;
  name: string;
  level: AlertLevel;
  stock: number;
  threshold: number;
  accent: string;
  surface: string;
  abbreviation: string;
}

const STOCK_ALERTS: StockAlertItem[] = [
  {
    id: "1",
    name: "Sucre",
    level: "rupture",
    stock: 0,
    threshold: 20,
    accent: Colors.danger,
    surface: "#FFF1EE",
    abbreviation: "SU",
  },
  {
    id: "2",
    name: "Huile Palme",
    level: "faible",
    stock: 8,
    threshold: 25,
    accent: Colors.warning,
    surface: "#FFF4DC",
    abbreviation: "HP",
  },
  {
    id: "3",
    name: "Savon poudre",
    level: "faible",
    stock: 12,
    threshold: 24,
    accent: Colors.warning,
    surface: "#F3F3F1",
    abbreviation: "SP",
  },
];

const GROUP_LABELS: Record<AlertLevel, string> = {
  rupture: "Rupture de stock",
  faible: "Stock faible",
};

function getProgress(alert: StockAlertItem) {
  if (alert.stock <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((alert.stock / alert.threshold) * 100));
}

export default function AlertesStockScreen() {
  const router = useRouter();
  const [showAlert, setShowAlert] = useState(false);

  const groupedAlerts = React.useMemo(
    () => ({
      rupture: STOCK_ALERTS.filter((item) => item.level === "rupture"),
      faible: STOCK_ALERTS.filter((item) => item.level === "faible"),
    }),
    [],
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
          activeOpacity={0.75}
        >
          <ArrowLeft size={20} color={Colors.textPrimary} strokeWidth={2.4} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} selectable>
          Alertes stock
        </Text>

        <TouchableOpacity
          onPress={() => router.replace("/stock")}
          style={styles.iconButton}
          activeOpacity={0.75}
        >
          <Settings2 size={18} color={Colors.textPrimary} strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
      >
        <View style={styles.banner}>
          <View style={styles.bannerIconWrap}>
            <TriangleAlert
              size={18}
              color={Colors.warningText}
              strokeWidth={2.3}
            />
          </View>

          <View style={styles.bannerTextWrap}>
            <Text style={styles.bannerTitle} selectable>
              3 produits necessitent votre attention
            </Text>
            <Text style={styles.bannerMessage} selectable>
              Verifiez les niveaux d'inventaire critique avant la prochaine
              vente.
            </Text>
          </View>
        </View>

        {(["rupture", "faible"] as const).map((level) => {
          const items = groupedAlerts[level];

          if (!items.length) {
            return null;
          }

          return (
            <View key={level} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View
                  style={[
                    styles.sectionDot,
                    level === "rupture"
                      ? styles.sectionDotDanger
                      : styles.sectionDotWarning,
                  ]}
                />
                <Text
                  style={[
                    styles.sectionTitle,
                    level === "rupture"
                      ? styles.sectionTitleDanger
                      : styles.sectionTitleWarning,
                  ]}
                  selectable
                >
                  {GROUP_LABELS[level]}
                </Text>
              </View>

              <View style={styles.cardList}>
                {items.map((alert) => {
                  const progress = getProgress(alert);

                  return (
                    <View key={alert.id} style={styles.productCard}>
                      <View
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 12,
                          justifyContent: "space-between",
                        }}
                      >
                        <View
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <View
                            style={[
                              styles.thumbnail,
                              { backgroundColor: alert.surface },
                            ]}
                          >
                            <Text
                              style={[
                                styles.thumbnailText,
                                { color: alert.accent },
                              ]}
                              selectable
                            >
                              {alert.abbreviation}
                            </Text>
                            <Package
                              size={16}
                              color={alert.accent}
                              strokeWidth={2.2}
                              style={styles.thumbnailIcon}
                            />
                          </View>

                          <Text style={styles.productName} selectable>
                            {alert.name}
                          </Text>
                        </View>

                        <View style={styles.stockBlock}>
                          <Text
                            style={[
                              styles.stockValue,
                              level === "rupture"
                                ? styles.stockValueDanger
                                : styles.stockValueWarning,
                            ]}
                            selectable
                          >
                            {alert.stock}
                          </Text>
                          <Text style={styles.stockLabel} selectable>
                            UNITES
                          </Text>
                        </View>
                      </View>

                      {level !== "rupture" ? (
                        <View style={styles.progressTrack}>
                          <View
                            style={[
                              styles.progressFill,
                              {
                                width: `${progress}%`,
                                backgroundColor: alert.accent,
                              },
                            ]}
                          />
                        </View>
                      ) : (
                        <Text style={styles.helperText} selectable>
                          Seuil minimum: {alert.threshold} unites
                        </Text>
                      )}
                      <TouchableOpacity
                        style={styles.orderButton}
                        onPress={() => setShowAlert(true)}
                        activeOpacity={0.82}
                      >
                        <ShoppingCart
                          size={15}
                          color={Colors.textInverse}
                          strokeWidth={2.3}
                        />
                        <Text style={styles.orderButtonText}>Commander</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => router.replace("/stock")}
          activeOpacity={0.85}
        >
          <Text style={styles.footerButtonText}>METTRE A JOUR LES STOCKS</Text>
        </TouchableOpacity>
      </View>
      <CustomAlert
        isVisible={showAlert}
        onClose={() => setShowAlert(false)}
        title="Contacter le fournisseur"
        description="Pour commander ce produit, veuillez contacter votre fournisseur directement ou passer par le module de gestion des commandes."
        iconName="PhoneCall"
        color={Colors.info}
        primaryButtonLabel="Compris"
        onPrimaryPress={() => setShowAlert(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBFBFA",
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
    color: Colors.textPrimary,
    fontFamily: "DMSans_700Bold",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 120,
    gap: 18,
  },
  banner: {
    flexDirection: "row",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.warningBorder,
    backgroundColor: Colors.warningLight,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  bannerIconWrap: {
    width: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerTextWrap: {
    flex: 1,
    gap: 4,
  },
  bannerTitle: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 14,
    color: Colors.warningText,
    lineHeight: 20,
  },
  bannerMessage: {
    fontFamily: FontFamily.content,
    fontSize: 12,
    color: Colors.warningText,
    lineHeight: 18,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
  },
  sectionDotDanger: {
    backgroundColor: Colors.danger,
  },
  sectionDotWarning: {
    backgroundColor: Colors.warning,
  },
  sectionTitle: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  sectionTitleDanger: {
    color: Colors.dangerText,
  },
  sectionTitleWarning: {
    color: Colors.warningText,
  },
  cardList: {
    gap: 14,
  },
  productCard: {
    borderRadius: 18,
    backgroundColor: Colors.background,
    padding: 14,
    gap: 10,
    boxShadow: "0 12px 28px rgba(15, 23, 42, 0.05)",
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  thumbnailText: {
    fontFamily: FontFamily.display,
    fontSize: 16,
    letterSpacing: -0.3,
  },
  thumbnailIcon: {
    position: "absolute",
    right: 6,
    bottom: 6,
    opacity: 0.22,
  },
  productName: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 17,
    color: Colors.textPrimary,
  },
  stockBlock: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  stockValue: {
    fontFamily: FontFamily.display,
    fontSize: 28,
    fontVariant: ["tabular-nums"],
    lineHeight: 30,
  },
  stockValueDanger: {
    color: Colors.danger,
  },
  stockValueWarning: {
    color: Colors.warning,
  },
  stockLabel: {
    fontFamily: FontFamily.utility,
    fontSize: 10,
    color: Colors.textTertiary,
    letterSpacing: 1,
    marginBottom: 3,
  },
  progressTrack: {
    width: 84,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#F0F0EE",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  helperText: {
    fontFamily: FontFamily.content,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  orderButton: {
    minHeight: 42,
    borderRadius: 8,
    backgroundColor: Colors.textPrimary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  orderButtonText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 13,
    color: Colors.textInverse,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: "#FBFBFA",
  },
  footerButton: {
    minHeight: 50,
    borderRadius: 10,
    backgroundColor: Colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  footerButtonText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 12,
    color: Colors.textInverse,
    letterSpacing: 0.7,
  },
});
