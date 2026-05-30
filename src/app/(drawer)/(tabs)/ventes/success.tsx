import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { CheckCircle2, FileText, X } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FontFamily } from "@/constants/typography";

export default function SaleSuccessScreen() {
  const router = useRouter();
  const { id, total } = useLocalSearchParams();

  const formattedTotal = total 
    ? Number(total).toLocaleString('fr-FR') + ' FCFA'
    : '0 FCFA';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace("/(drawer)/(tabs)")}
          style={styles.closeButton}
        >
          <X size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>BoutiqueApp</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.successIconContainer}>
          <View
            style={[styles.iconBg, { backgroundColor: Colors.successLight }]}
          >
            <CheckCircle2 size={60} color={Colors.success} strokeWidth={2.5} />
          </View>
        </View>

        <Text style={styles.successTitle}>Vente réussie !</Text>
        <Text style={styles.successSub}>
          Le stock a été mis à jour et la transaction{"\n"}est enregistrée.
        </Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>RÉCAPITULATIF</Text>
            <Text style={styles.summaryId}>ID: #{id || 'ERREUR'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total payé</Text>
            <Text style={styles.totalValue}>{formattedTotal}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() =>
            router.push({
              pathname: "/(drawer)/(tabs)/ventes/facture-generated",
              params: { id, total }
            })
          }
        >
          <Text style={styles.primaryBtnText}>Générer la facture</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.replace("/(drawer)/(tabs)/ventes/nouvelle")}
        >
          <Text style={styles.secondaryBtnText}>Nouvelle vente</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footerSpacing} />
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
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  successIconContainer: {
    marginBottom: 30,
  },
  iconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  successTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  successSub: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 40,
  },
  summaryCard: {
    width: "100%",
    backgroundColor: "#F9F9F9",
    borderRadius: 20,
    padding: 20,
    marginBottom: 40,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontFamily: FontFamily.bold,
    // fontSize: FontSize.xs,
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  summaryId: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 15,
  },
  totalLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  totalValue: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    color: Colors.textPrimary,
  },
  primaryBtn: {
    backgroundColor: "#000",
    width: "100%",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  primaryBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: "#fff",
  },
  secondaryBtn: {
    width: "100%",
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryBtnText: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  footerSpacing: {
    height: 40,
  },
});
