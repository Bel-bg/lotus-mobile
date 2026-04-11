import { Colors } from "@/constants/colors";
import { FontFamily } from "@/constants/typography";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  CheckCircle2,
  Cloud,
  FileText,
  ShieldCheck,
  Zap,
} from "lucide-react-native";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BENEFITS = [
  {
    title: "Sauvegarde intelligente",
    description: "Tes documents et bilans restent synchronisés et accessibles.",
    Icon: Cloud,
  },
  {
    title: "Historique complet",
    description: "Retrouve ventes, bilans et mouvements importants en un seul endroit.",
    Icon: FileText,
  },
  {
    title: "Suivi quotidien",
    description: "Alertes stock, vue claire des activités et contrôle plus rapide.",
    Icon: Zap,
  },
  {
    title: "Données sécurisées",
    description: "Tes informations restent protégées et stables dans le temps.",
    Icon: ShieldCheck,
  },
];

export default function PremiumScreen() {
  const router = useRouter();

  const handleSubscribe = React.useCallback(() => {
    Alert.alert(
      "Souscription Premium",
      "Le parcours de paiement sera branché ici. Les 30 jours gratuits restent inclus avant l'abonnement.",
    );
  }, []);

  const handleRestore = React.useCallback(() => {
    Alert.alert(
      "Abonnement existant",
      "La restauration de l'abonnement sera reliée ici.",
    );
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            style={styles.backButton}
          >
            <ArrowLeft size={18} color={Colors.textPrimary} strokeWidth={2.4} />
          </TouchableOpacity>

          <Text style={styles.headerTitle} selectable>
            Lotus Premium
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.heroCard}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>30 JOURS GRATUITS</Text>
          </View>

          <Text style={styles.heroTitle} selectable>
            L&apos;application fonctionne avec un abonnement Premium.
          </Text>

          <Text style={styles.heroDescription} selectable>
            Il n&apos;y a pas de version gratuite permanente. Tu profites de 30 jours
            offerts, puis tu dois souscrire pour continuer à utiliser l&apos;app.
          </Text>

          <View style={styles.heroPoints}>
            <View style={styles.heroPoint}>
              <CheckCircle2 size={16} color={Colors.successText} strokeWidth={2.2} />
              <Text style={styles.heroPointText}>Essai activé immédiatement</Text>
            </View>
            <View style={styles.heroPoint}>
              <CheckCircle2 size={16} color={Colors.successText} strokeWidth={2.2} />
              <Text style={styles.heroPointText}>Aucune coupure après l&apos;essai si tu souscris</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>AVANTAGES</Text>
          <Text style={styles.sectionTitle} selectable>
            L&apos;essentiel pour gérer ta boutique
          </Text>

          <View style={styles.benefitsList}>
            {BENEFITS.map((benefit) => {
              const Icon = benefit.Icon;

              return (
                <View key={benefit.title} style={styles.benefitCard}>
                  <View style={styles.benefitIconWrap}>
                    <Icon size={18} color={Colors.textPrimary} strokeWidth={2.1} />
                  </View>

                  <View style={styles.benefitBody}>
                    <Text style={styles.benefitTitle} selectable>
                      {benefit.title}
                    </Text>
                    <Text style={styles.benefitDescription} selectable>
                      {benefit.description}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.planCard}>
          <Text style={styles.planLabel}>ABONNEMENT</Text>
          <Text style={styles.planTitle} selectable>
            Premium
          </Text>
          <Text style={styles.planTrial} selectable>
            30 jours gratuits
          </Text>
          <Text style={styles.planDescription} selectable>
            Ensuite, l&apos;abonnement devient obligatoire pour garder l&apos;accès à
            toutes les fonctionnalités de l&apos;application.
          </Text>

          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.primaryButton}
            onPress={handleSubscribe}
          >
            <Text style={styles.primaryButtonText}>Commencer mes 30 jours</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.secondaryButton}
            onPress={handleRestore}
          >
            <Text style={styles.secondaryButtonText}>J&apos;ai déjà un abonnement</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F1E8",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 28,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.72)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 17,
    color: Colors.textPrimary,
    letterSpacing: -0.25,
  },
  headerSpacer: {
    width: 38,
    height: 38,
  },
  heroCard: {
    backgroundColor: "#111111",
    borderRadius: 24,
    padding: 18,
    gap: 12,
    boxShadow: "0 16px 34px rgba(17, 17, 17, 0.16)",
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "#F6D58B",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 10,
    color: "#312100",
    letterSpacing: 0.7,
  },
  heroTitle: {
    fontFamily: FontFamily.display,
    fontSize: 24,
    lineHeight: 29,
    color: Colors.textInverse,
    letterSpacing: -0.7,
  },
  heroDescription: {
    fontFamily: FontFamily.content,
    fontSize: 13,
    lineHeight: 20,
    color: "rgba(255, 255, 255, 0.78)",
  },
  heroPoints: {
    gap: 8,
  },
  heroPoint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heroPointText: {
    flex: 1,
    fontFamily: FontFamily.utility,
    fontSize: 12,
    color: "#F8F6F0",
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 10,
    color: "#8C7450",
    letterSpacing: 0.9,
  },
  sectionTitle: {
    fontFamily: FontFamily.display,
    fontSize: 21,
    lineHeight: 26,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  benefitsList: {
    gap: 10,
  },
  benefitCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "rgba(255, 255, 255, 0.78)",
    borderRadius: 18,
    padding: 14,
  },
  benefitIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F2E6CF",
    alignItems: "center",
    justifyContent: "center",
  },
  benefitBody: {
    flex: 1,
    gap: 3,
  },
  benefitTitle: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 14,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  benefitDescription: {
    fontFamily: FontFamily.content,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  planCard: {
    backgroundColor: "#FFFDF8",
    borderRadius: 24,
    padding: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: "#E7DDCB",
  },
  planLabel: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 10,
    color: "#8C7450",
    letterSpacing: 0.9,
  },
  planTitle: {
    fontFamily: FontFamily.display,
    fontSize: 22,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  planTrial: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 16,
    color: "#A46A00",
  },
  planDescription: {
    fontFamily: FontFamily.content,
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: Colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  primaryButtonText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 13,
    color: Colors.textInverse,
    letterSpacing: 0.3,
  },
  secondaryButton: {
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: "#F3EADB",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 12,
    color: Colors.textPrimary,
  },
});
