// ============================================
// LOTUS BUSINESS — Écran : Connexion Google
// ============================================

import { useRouter } from "expo-router";
import {
  Image,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackgroundImage from "@/assets/yo.png";
import { FontFamily } from "../../constants/typography";

export default function GoogleSignInScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={BackgroundImage}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginVertical: 12,
          }}
        >
          <Text
            style={{
              fontFamily: FontFamily.display,
              fontSize: 28,
              letterSpacing: 1.5,
              lineHeight: 36,
            }}
          >
            Lotus Business
          </Text>
        </View>

        <View style={styles.container}>
          {/* Zone centrale */}
          <View style={styles.centerBlock}>
            <Text style={styles.title}>
              Votre boutique,{"\n"}sous contrôle.
            </Text>
            <Text style={styles.subtitle}>
              Stocks, ventes, factures et bilans gérés{"\n"}
              depuis votre téléphone. Simple,{"\n"}
              rapide et automatique.
            </Text>
          </View>
          <View style={styles.actionsBlock}>
            
            <TouchableOpacity
              style={styles.googleButton}
              onPress={() => router.push("/(auth)/verifyLicence")}
              activeOpacity={0.85}
            >
              {/* <Image
                source={require("../../../assets/icons/licence.png")}
                style={styles.googleLogo}
                resizeMode="contain"
              /> */}
              <Text style={styles.googleButtonText}>Commencer</Text>
            </TouchableOpacity>
            {/* Notice légale */}
            <Text style={styles.legal}>
              En continuant, vous acceptée les règles et politiques de
              confidentialité de Lotus Business. {"\n"}
              <Text style={{ textDecorationLine: "underline" }}>
                Lire les termes et conditions
              </Text>
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
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
    fontFamily: FontFamily.displaySemi,
    color: "#0A0A0A",
    letterSpacing: -0.5,
    lineHeight: 36,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FontFamily.content,
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
    fontFamily: FontFamily.content,
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
    fontFamily: FontFamily.utilityBold,
    color: "#0A0A0A",
  },
  legal: {
    fontSize: 12,
    fontFamily: FontFamily.content,
    color: "#ffffffff",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 8,
  },
});
