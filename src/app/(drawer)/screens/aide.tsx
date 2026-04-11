import { Colors } from "@/constants/colors";
import { FontFamily } from "@/constants/typography";
import CustomTopBar from "@/components/customs/customTopBar";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "expo-router";
import {
  BarChart3,
  ChevronRight,
  Package,
  ShoppingCart,
  User,
} from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface FocusArea {
  label: string;
  value: string;
  helper: string;
  tone: "info" | "success" | "warning" | "default";
}

const FOCUS_AREAS: FocusArea[] = [
  {
    label: "Vente",
    value: "1 min",
    helper: "pour enregistrer",
    tone: "info",
  },
  {
    label: "Stock",
    value: "2 min",
    helper: "pour corriger",
    tone: "warning",
  },
  {
    label: "Bilan",
    value: "Fin de jour",
    helper: "pour clôturer",
    tone: "success",
  },
  {
    label: "Sync",
    value: "Google",
    helper: "pour sauvegarder",
    tone: "default",
  },
];

interface HelpGuide {
  id: string;
  title: string;
  description: string;
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  color: string;
  onPress: () => void;
}

export default function AideScreen() {
  const router = useRouter();
  const boutiqueNom = useAuthStore(
    (state) => state.boutique?.nom ?? "Boutique Lotus",
  );

  const guides: HelpGuide[] = [
    {
      id: "1",
      title: "Enregistrer une vente",
      description: "Appuyez sur le bouton central puis validez le panier.",
      Icon: ShoppingCart,
      color: Colors.info,
      onPress: () => router.push("/ventes/nouvelle"),
    },
    {
      id: "2",
      title: "Gérer mes alertes stock",
      description: "Traitez rapidement les articles en rupture ou faibles.",
      Icon: Package,
      color: Colors.warning,
      onPress: () => router.replace("/alertes-stock"),
    },
    {
      id: "3",
      title: "Clôturer et Bilan",
      description: "Calculez vos gains et préparez vos rapports PDF.",
      Icon: BarChart3,
      color: Colors.success,
      onPress: () => router.replace("/bilan"),
    },
    {
      id: "4",
      title: "Compte & Sauvegarde",
      description: "Gérez votre compte Google et vos options cloud.",
      Icon: User,
      color: Colors.textSecondary,
      onPress: () => router.replace("/profil"),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <CustomTopBar type="aide" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerMessage} selectable>
            Quelques entrées simples pour retrouver les actions clés de Lotus
            Business sans chercher dans toute l'app.
          </Text>
        </View>

        <View style={styles.metricsGrid}>
          {FOCUS_AREAS.map((item, index) => (
            <View key={index} style={styles.metricCard}>
              <Text style={styles.metricLabel}>{item.label}</Text>
              <Text
                style={[
                  styles.metricValue,
                  item.tone === "success" && { color: Colors.successText },
                  item.tone === "info" && { color: Colors.infoText },
                  item.tone === "warning" && { color: Colors.warningText },
                ]}
                selectable
              >
                {item.value}
              </Text>
              <Text style={styles.metricHelper}>{item.helper}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionDot} />
          <Text style={styles.sectionTitle} selectable>
            Guides rapides
          </Text>
        </View>

        <View style={styles.list}>
          {guides.map((guide) => {
            const IconComp = guide.Icon;
            return (
              <TouchableOpacity
                key={guide.id}
                style={styles.guideCard}
                onPress={guide.onPress}
                activeOpacity={0.82}
              >
                <View style={styles.iconBox}>
                  <IconComp size={22} color={guide.color} strokeWidth={2.2} />
                </View>

                <View style={styles.guideBody}>
                  <Text style={styles.guideTitle} selectable>
                    {guide.title}
                  </Text>
                  <Text style={styles.guideDesc} selectable>
                    {guide.description}
                  </Text>
                </View>

                <ChevronRight
                  size={18}
                  color={Colors.textTertiary}
                  strokeWidth={2.4}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.footerNote} selectable>
          Cette page d'aide sert surtout d'accès guidé tant que les tutoriels
          détaillés ne sont pas encore branchés.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.footerButton, styles.footerButtonSecondary]}
          onPress={() => router.replace("/")}
          activeOpacity={0.8}
        >
          <Text style={styles.footerButtonSecondaryText}>RETOUR ACCUEIL</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.footerButton, styles.footerButtonPrimary]}
          onPress={() => router.push("/ventes/nouvelle")}
          activeOpacity={0.85}
        >
          <Text style={styles.footerButtonText}>COMMENCER UNE VENTE</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBFBFA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  headerTitle: {
    fontFamily: FontFamily.display,
    fontSize: 18,
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontFamily: FontFamily.content,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
  placeholder: {
    width: 38,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 160,
    gap: 20,
  },
  banner: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  bannerMessage: {
    fontFamily: FontFamily.content,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#F3F2F0",
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  metricLabel: {
    fontFamily: FontFamily.utility,
    fontSize: 10,
    color: Colors.textSecondary,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  metricValue: {
    fontFamily: FontFamily.display,
    fontSize: 18,
    color: Colors.textPrimary,
    marginTop: 4,
  },
  metricHelper: {
    fontFamily: FontFamily.content,
    fontSize: 11,
    color: Colors.textTertiary,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#CFCFCF",
  },
  sectionTitle: {
    fontFamily: FontFamily.display,
    fontSize: 16,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  list: {
    gap: 12,
  },
  guideCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.background,
    borderRadius: 18,
    padding: 14,
    boxShadow: "0 12px 28px rgba(15, 23, 42, 0.05)",
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FBFBFA",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  guideBody: {
    flex: 1,
    gap: 4,
  },
  guideTitle: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 15,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  guideDesc: {
    fontFamily: FontFamily.content,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  footerNote: {
    fontFamily: FontFamily.content,
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: "#FBFBFA",
    borderTopWidth: 1,
    borderTopColor: "#F0F0EE",
    gap: 10,
  },
  footerButton: {
    minHeight: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  footerButtonPrimary: {
    backgroundColor: Colors.textPrimary,
  },
  footerButtonSecondary: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  footerButtonText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 12,
    color: Colors.textInverse,
    letterSpacing: 0.8,
  },
  footerButtonSecondaryText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 12,
    color: Colors.textPrimary,
    letterSpacing: 0.8,
  },
});
