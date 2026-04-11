// ============================================
// LOTUS BUSINESS — Écran : Connexion Google
// ============================================

import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LinkButton from "../../components/LinkButton";
import TopBar from "../../components/customs/TopBar";
import { useAuthStore } from "../../store/useAuthStore";

export default function GoogleSignInScreen() {
  const router = useRouter();
  // const { setUser } = useAuthStore()

  const handleSkip = () => {
    router.replace("/(drawer)/(tabs)");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <TopBar />

      <View style={styles.container}>
        {/* Zone centrale */}
        <View style={styles.centerBlock}>
          <Text style={styles.title}>Connectez-vous{"\n"}avec Google</Text>
          <Text style={styles.subtitle}>
            Sauvegardez automatiquement votre inventaire et vos ventes sur votre
            Google Drive pour ne jamais perdre vos données.
          </Text>
        </View>

        {/* Boutons */}
        <View style={styles.actionsBlock}>
          {/* Bouton Google */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleSkip}
            activeOpacity={0.85}
          >
            <Image
              source={require("../../../assets/images/google.png")}
              style={styles.googleLogo}
              resizeMode="contain"
            />
            <Text style={styles.googleButtonText}>Continuer avec Google</Text>
          </TouchableOpacity>

          {/* Ignorer */}
          <LinkButton
            highlight="Ignorer pour l'instant "
            onPress={handleSkip}
          />

          {/* Notice légale */}
          <Text style={styles.legal}>
            En continuant, vous autorisez Lotus Business à synchroniser vos
            données avec votre compte Google.{"\n"}
            Vos données sont chiffrées et sécurisées.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingBottom: 32,
  },
  centerBlock: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0A0A0A",
    letterSpacing: -0.5,
    lineHeight: 36,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B6B6B",
    lineHeight: 22,
    fontWeight: "400",
  },
  actionsBlock: {
    gap: 12,
    alignItems: "center",
  },
  errorContainer: {
    width: "100%",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  errorText: {
    fontSize: 13,
    color: "#DC2626",
    textAlign: "center",
    fontWeight: "500",
  },
  googleButton: {
    width: "100%",
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  googleButtonLoading: {
    backgroundColor: "#F5F5F5",
    borderColor: "#E0E0E0",
  },
  googleLogo: {
    width: 20,
    height: 20,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0A0A0A",
  },
  legal: {
    fontSize: 12,
    color: "#9E9E9E",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 8,
  },
});
