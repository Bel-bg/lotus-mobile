import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StatusBar, StyleSheet, Text, View, ImageBackground, TouchableOpacity } from "react-native";
import CustomAlert from "../../components/customs/Alert";
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import ProgressBar from "../../components/ProgressBar";
import StepItem, { StepStatus } from "../../components/StepItem";
import { Colors } from "../../constants/colors";
import { AUTH_WHITELIST, GOOGLE_AUTH_CONFIG } from "../../constants/auth";
import { FontFamily, TextStyles } from "../../constants/typography";
import { useAuthStore } from "../../store/useAuthStore";
import BackgroundImage from "@/assets/background.png";
import {ChevronsRight} from "lucide-react-native"

type Steps = {
  google: StepStatus;
  licence: StepStatus;
  data: StepStatus;
};

export default function VerifyingScreen() {
  const router = useRouter();
  const hasRun = useRef(false);
  const setUser = useAuthStore((s) => s.setUser);

  const [steps, setSteps] = useState<Steps>({
    google: "loading",
    licence: "pending",
    data: "pending",
  });
  const [progress, setProgress] = useState(0);
  const [footerText, setFooterText] = useState(
    "Établissement d'une connexion sécurisée...",
  );

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertData, setAlertData] = useState<{
    title: string;
    description: string;
    iconName: any;
    color: string;
    primaryButtonLabel?: string;
    onPrimaryPress: () => void;
    secondaryButtonLabel?: string;
    onSecondaryPress?: () => void;
  }>({
    title: "",
    description: "",
    iconName: "AlertTriangle" as any,
    color: Colors.danger,
    primaryButtonLabel: "Compris",
    onPrimaryPress: () => setAlertVisible(false),
  });

  const showAlert = (
    title: string,
    description: string,
    iconName: any = "AlertTriangle",
    color: string = Colors.danger,
    onPress?: () => void,
    primaryButtonLabel = "Compris",
    secondaryButtonLabel?: string,
    onSecondaryPress?: () => void
  ) => {
    setAlertData({
      title,
      description,
      iconName,
      color,
      primaryButtonLabel,
      secondaryButtonLabel,
      onSecondaryPress,
      onPrimaryPress: () => {
        setAlertVisible(false);
        if (onPress) onPress();
      },
    });
    setAlertVisible(true);
  };

  const rotation = useSharedValue(0);

  // Un seul useEffect, avec le guard hasRun
  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false,
    );

    GoogleSignin.configure({
      webClientId: GOOGLE_AUTH_CONFIG.webClientId,
      offlineAccess: false,
    });

    if (!hasRun.current) {
      hasRun.current = true;
      runVerification();
    }
  }, []);

  const animatedSpinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  async function runVerification() {
    try {
      setSteps({ google: "loading", licence: "pending", data: "pending" });
      setProgress(10);
      setFooterText("Connexion à votre compte Google...");

      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      const googleUser = userInfo.data?.user;
      const email = googleUser?.email ?? "";

      if (!email) {
        setSteps({ google: "error", licence: "pending", data: "pending" });
        setFooterText("Impossible de récupérer l'email Google.");
        showAlert(
          "Erreur de connexion",
          "Impossible de récupérer l'adresse email de votre compte Google.",
          "XCircle",
          Colors.danger,
          () => router.back(),
        );
        return;
      }

      const isAuthorized = AUTH_WHITELIST.includes(email);

      if (!isAuthorized) {
        await GoogleSignin.signOut();
        router.replace("/(auth)/RejectScreen");
        return;
      }

      // ✅ Étape 1 validée — alimentation du store avec les données Google
      setUser({
        uid: googleUser?.id ?? email,
        email,
        displayName: googleUser?.name ?? email.split('@')[0],
        photoURL: googleUser?.photo ?? null,
      });

      // Email autorisé → validation séquentielle visuelle
      setSteps({ google: "done", licence: "pending", data: "pending" });
      setProgress(33);
      setFooterText("Connexion Google réussie...");
      await delay(600);

      setSteps({ google: "done", licence: "done", data: "pending" });
      setProgress(66);
      setFooterText("Licence acceptée...");
      await delay(600);

      setSteps({ google: "done", licence: "done", data: "done" });
      setProgress(100);
      setFooterText("Données chargées avec succès !");
      await delay(500);

      router.push("/(auth)/formSheet");
    } catch (err: any) {
      if (err.code === "SIGN_IN_CANCELLED") {
        setSteps({ google: "error", licence: "pending", data: "pending" });
        setFooterText("Connexion Google annulée.");
        showAlert(
          "Connexion annulée",
          "Vous avez annulé la connexion Google.",
          "XCircle",
          Colors.danger,
          () => router.back(),
        );
        return;
      }

      console.error("Erreur Google Sign-In:", err);
      setSteps({ google: "error", licence: "error", data: "error" });
      setFooterText(`Erreur : ${err?.code || "Inconnue"} - ${err?.message || err}`);
      showAlert(
        "Échec de la connexion",
        `Code d'erreur : ${err?.code}\nMessage : ${err?.message}\n\nSi le code est 10 (DEVELOPER_ERROR), vérifiez que le SHA-1 correspond bien à celui du projet.`,
        "XCircle",
        Colors.danger,
      );
    }
  }

  return (
    <ImageBackground
          source={BackgroundImage}
          style={styles.backgroundImage}
          resizeMode="cover">

    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <View style={styles.header}>
        <View style={{justifyContent:"center",alignItems:"center",marginVertical:12}}>
        
        <Text style={{ fontFamily: FontFamily.display, fontSize: 28, letterSpacing: 1.5, lineHeight: 36 }}>Lotus Business</Text>
        </View>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => {
            showAlert(
              "Attention",
              "Certaines fonctionnalités risquent de ne pas fonctionner sans authentification.",
              "AlertTriangle",
              Colors.warning,
              () => router.push("/(auth)/formSheet"),
              "Continuer",
              "Annuler",
              () => setAlertVisible(false)
            );
          }}
        >
          <View style={{flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "center",}}>
            <Text style={styles.skipText}>Passer</Text>
           <ChevronsRight color={Colors.textPrimary} size={20} strokeWidth={2.5} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <View style={styles.centerBlock}>
          <View style={styles.stepsContainer}>
            <StepItem label="Connexion Google" status={steps.google} />
            <StepItem
              label="Vérification de la licence"
              status={steps.licence}
            />
            <StepItem label="Chargement de vos données" status={steps.data} />
          </View>
        </View>

        <View style={styles.footer}>
          <ProgressBar progress={progress} showPercent={false} />
          <Text style={styles.footerText}>{footerText}</Text>
        </View>
      </View>

      <CustomAlert
        isVisible={alertVisible}
        onClose={() => setAlertVisible(false)}
        title={alertData.title}
        description={alertData.description}
        iconName={alertData.iconName}
        color={alertData.color}
        primaryButtonLabel={alertData.primaryButtonLabel || "Compris"}
        onPrimaryPress={alertData.onPrimaryPress}
        secondaryButtonLabel={alertData.secondaryButtonLabel}
        onSecondaryPress={alertData.onSecondaryPress}
      />
    </SafeAreaView>
    </ImageBackground>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
  },
  skipText: {
    ...TextStyles.buttonSm,
    fontFamily: FontFamily.medium,
    color: Colors.textPrimary,
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
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 100,
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
    fontFamily: FontFamily.display,
    color: Colors.textPrimary,
    textAlign: "center",
    marginTop: 4,
  },
  subtitle: {
    ...TextStyles.body,
    fontFamily: FontFamily.content,
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
    fontFamily: FontFamily.content,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
