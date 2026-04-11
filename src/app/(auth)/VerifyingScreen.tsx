// ============================================
// LOTUS BUSINESS — Écran : Vérification licence
// ============================================

import LoadingGif from "@/assets/images/loading.gif";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StatusBar, StyleSheet, Text, View } from "react-native";
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import TopBar from "../../components/customs/TopBar";
import ProgressBar from "../../components/ProgressBar";
import StepItem, { StepStatus } from "../../components/StepItem";
import { Colors } from "../../constants/colors";
import { TextStyles } from "../../constants/typography";

type Steps = {
  google: StepStatus;
  licence: StepStatus;
  data: StepStatus;
};

export default function VerifyingScreen() {
  const router = useRouter();
  const [steps, setSteps] = useState<Steps>({
    google: "loading",
    licence: "pending",
    data: "pending",
  });
  const [progress, setProgress] = useState(0);
  const [footerText, setFooterText] = useState(
    "Établissement d'une connexion sécurisée...",
  );

  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
    runVerification();
  }, []);

  const animatedSpinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  async function runVerification() {
    // Étape 1 — Connexion Google
    setSteps({ google: "loading", licence: "pending", data: "pending" });
    setProgress(10);
    await delay(5000);

    setSteps({ google: "done", licence: "loading", data: "pending" });
    setProgress(40);
    setFooterText("Vérification de votre licence...");
    await delay(5000);

    // TODO: Appel réel Firebase ici
    // const result = await verifierLicence(email)

    setSteps({ google: "done", licence: "done", data: "loading" });
    setProgress(75);
    setFooterText("Chargement de vos données...");
    await delay(2000);

    setSteps({ google: "done", licence: "done", data: "done" });
    setProgress(100);
    await delay(500);

    router.replace("/(auth)/ConfigReadyScreen");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <TopBar />

      <View style={styles.container}>
        {/* Zone centrale */}
        <View style={styles.centerBlock}>
          {/* Spinner principal */}
          <View style={styles.spinnerContainer}>
            <Image
              source={LoadingGif}
              style={styles.spinnerInner}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>Vérification en cours...</Text>
          <Text style={styles.subtitle}>
            Nous vérifions votre accès à Lotus Business.
          </Text>

          {/* Steps */}
          <View style={styles.stepsContainer}>
            <StepItem label="Connexion Google" status={steps.google} />
            <StepItem
              label="Vérification de la licence"
              status={steps.licence}
            />
            <StepItem label="Chargement de vos données" status={steps.data} />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <ProgressBar progress={progress} showPercent={false} />
          <Text style={styles.footerText}>{footerText}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
    justifyContent: "space-between",
  },
  centerBlock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  spinnerContainer: {
    marginBottom: 8,
  },
  spinnerOuter: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2.5,
    borderColor: "#E0E0E0",
    borderTopColor: "#0A0A0A",
    alignItems: "center",
    justifyContent: "center",
  },
  spinnerInner: {
    width: 60,
    height: 60,
    opacity: 0.8,
  },
  title: {
    ...TextStyles.h2,
    color: Colors.textPrimary,
    textAlign: "center",
    marginTop: 4,
  },
  subtitle: {
    ...TextStyles.body,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  stepsContainer: {
    width: "100%",
    marginTop: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  footer: {
    gap: 10,
    alignItems: "center",
  },
  footerText: {
    ...TextStyles.caption,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
