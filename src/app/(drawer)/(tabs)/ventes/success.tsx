import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { CheckCircle2, X, ChevronDown, Printer, ShoppingCart, UserCheck } from "lucide-react-native";
import LottieView from "lottie-react-native";
import { Colors } from "@/constants/colors";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FontFamily } from "@/constants/typography";

export default function SaleSuccessScreen() {
  const router = useRouter();
  const { id, total } = useLocalSearchParams();

  const [showCreance, setShowCreance] = useState(false);
  const [creanceData, setCreanceData] = useState({
    nom: "",
    prenom: "",
    numero: "",
    adresse: "",
  });
  const [creanceSaved, setCreanceSaved] = useState(false);
  const [showLottie, setShowLottie] = useState(true);

  const collapseAnim = useRef(new Animated.Value(0)).current;
  const lottieRef = useRef(null);

  const formattedTotal = total
    ? Number(total).toLocaleString("fr-FR") + " FCFA"
    : "0 FCFA";

  useEffect(() => {
    const timer = setTimeout(() => setShowLottie(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const toggleCreance = () => {
    const toValue = showCreance ? 0 : 1;
    setShowCreance(!showCreance);
    Animated.spring(collapseAnim, {
      toValue,
      useNativeDriver: false,
      tension: 60,
      friction: 10,
    }).start();
  };

  const collapseHeight = collapseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 350],
  });

  const chevronRotation = collapseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const handleSaveCreance = () => {
    // TODO: enregistrer en base SQLite / Supabase
    setCreanceSaved(true);
    setShowCreance(false);
    Animated.spring(collapseAnim, {
      toValue: 0,
      useNativeDriver: false,
    }).start();
  };

  const allCreanceFieldsFilled =
    creanceData.nom.trim() &&
    creanceData.prenom.trim() &&
    creanceData.numero.trim();

  return (
    <SafeAreaView style={styles.container}>
      {/* Lottie confettis */}
      {showLottie && (
        <View style={styles.lottieOverlay} pointerEvents="none">
          <LottieView
            ref={lottieRef}
            source={require("@/assets/Lottie/coffeti.json")} 
            autoPlay
            loop={false}
            style={StyleSheet.absoluteFill}
          />
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace("/(drawer)/(tabs)")}
          style={styles.closeButton}
        >
          <X size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lotus Business</Text>
        <View style={{ width: 38 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Icône succès */}
          <View style={styles.iconWrapper}>
            <Image source={require("@/assets/images/sucess.png")} style={{width: 150, height: 150, alignSelf: "center"}} />
          </View>

          <Text style={styles.successTitle}>Vente enregistrée</Text>
          <Text style={styles.successSub}>
            Stock mis à jour · Transaction sauvegardée
          </Text>

          {/* Carte récapitulatif */}
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>RÉCAPITULATIF</Text>
              <Text style={styles.cardId}>#{id || "—"}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.cardRow}>
              <Text style={styles.totalLabel}>Total payé</Text>
              <Text style={styles.totalValue}>{formattedTotal}</Text>
            </View>
          </View>

          {/* Section créance */}
          <View style={styles.creanceSection}>
            <TouchableOpacity
              style={[
                styles.creanceToggle,
                creanceSaved && styles.creanceToggleSaved,
              ]}
              onPress={toggleCreance}
              activeOpacity={0.75}
            >
              <View style={styles.creanceToggleLeft}>
                <UserCheck
                  size={18}
                  color={creanceSaved ? "#16A34A" : Colors.textPrimary}
                />
                <Text
                  style={[
                    styles.creanceToggleText,
                    creanceSaved && { color: "#16A34A" },
                  ]}
                >
                  {creanceSaved
                    ? "Créance enregistrée"
                    : "Enregistrer comme créance"}
                </Text>
              </View>
              {!creanceSaved && (
                <Animated.View
                  style={{ transform: [{ rotate: chevronRotation }] }}
                >
                  <ChevronDown size={18} color={Colors.textSecondary} />
                </Animated.View>
              )}
            </TouchableOpacity>

            {/* Champs créancier — collapse animé */}
            <Animated.View
              style={[styles.creanceFields, { maxHeight: collapseHeight, overflow: "hidden" }]}
            >
              <View style={styles.creanceForm}>
                <View style={styles.row2col}>
                  <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.fieldLabel}>Nom</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ahouansou"
                      placeholderTextColor="#C0C0C0"
                      value={creanceData.nom}
                      onChangeText={(v) =>
                        setCreanceData((p) => ({ ...p, nom: v }))
                      }
                    />
                  </View>
                  <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>Prénom</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Kofi"
                      placeholderTextColor="#C0C0C0"
                      value={creanceData.prenom}
                      onChangeText={(v) =>
                        setCreanceData((p) => ({ ...p, prenom: v }))
                      }
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Numéro de téléphone</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="+229 97 000 000"
                    placeholderTextColor="#C0C0C0"
                    keyboardType="phone-pad"
                    value={creanceData.numero}
                    onChangeText={(v) =>
                      setCreanceData((p) => ({ ...p, numero: v }))
                    }
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Adresse (optionnel)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Cotonou, Haie Vive..."
                    placeholderTextColor="#C0C0C0"
                    value={creanceData.adresse}
                    onChangeText={(v) =>
                      setCreanceData((p) => ({ ...p, adresse: v }))
                    }
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.saveCreanceBtn,
                    !allCreanceFieldsFilled && styles.saveBtnDisabled,
                  ]}
                  onPress={handleSaveCreance}
                  disabled={!allCreanceFieldsFilled}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveCreanceBtnText}>
                    Enregistrer la créance
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>

          {/* Actions principales */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primaryBtn}
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: "/(drawer)/(tabs)/ventes/facture-generated",
                  params: { id, total },
                })
              }
            >
              <Text style={styles.primaryBtnText}>Imprimer la facture</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              activeOpacity={0.7}
              onPress={() =>
                router.replace("/(drawer)/(tabs)/ventes/nouvelle")
              }
            >
              <Text style={styles.secondaryBtnText}>Nouvelle vente</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? 30 : 0,
  },

  /* Lottie */
  lottieOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 99,
  },

  /* Header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
  },
  closeButton: { padding: 6 },
  headerTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.textPrimary,
  },

  /* Scroll */
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 48,
    alignItems: "center",
  },

  /* Icône */
  iconWrapper: { marginBottom: 20 },
  iconBg: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
  },

  /* Titres */
  successTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    color: Colors.textPrimary,
    marginBottom: 6,
    textAlign: "center",
  },
  successSub: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },

  /* Card */
  card: {
    width: "100%",
    backgroundColor: "#F8F8F8",
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: Colors.textSecondary,
    letterSpacing: 1.2,
  },
  cardId: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: "#ECECEC",
    marginVertical: 14,
  },
  totalLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  totalValue: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    color: Colors.textPrimary,
  },

  /* Créance */
  creanceSection: {
    width: "100%",
    marginBottom: 28,
    borderRadius: 8,
    overflow: "hidden",
  },
  creanceToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FAFAFA",
  },
  creanceToggleSaved: {
    backgroundColor: "#F0FDF4",
  },
  creanceToggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  creanceToggleText: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  creanceFields: {},
  creanceForm: {
    padding: 16,
    gap: 12,
  },
  row2col: {
    flexDirection: "row",
  },
  fieldGroup: {
    gap: 5,
  },
  fieldLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: "#FAFAFA",
  },
  saveCreanceBtn: {
    marginTop: 4,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },
  saveBtnDisabled: {
    backgroundColor: "#D0D0D0",
  },
  saveCreanceBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: "#fff",
  },

  /* Actions */
  actions: {
    width: "100%",
    gap: 12,
    alignItems: "center",
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
    width: "100%",
    height: 54,
    borderRadius: 15,
  },
  primaryBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: "#fff",
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  secondaryBtnText: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
});