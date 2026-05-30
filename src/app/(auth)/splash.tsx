// ============================================
// **************  Splash Screen **************
// ============================================

import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { Dimensions, StatusBar, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated";
import { NAVIGATION_CONFIG } from "../../store/config";
import { useAuthStore } from "../../store/useAuthStore";
import { FontFamily } from "@/constants";
import { initDB, getBoutique, isBoutiqueConfigured } from "../../lib/db";

const { width } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();

  // Animation values
  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);
  const logoTranslationY = useSharedValue(20);
  const textOpacity = useSharedValue(0);
  const textLetterSpacing = useSharedValue(10);
  const taglineOpacity = useSharedValue(0);
  const progressWidth = useSharedValue(0);

  // Résultat de la vérification DB (null = en cours)
  const dbCheckResult = useRef<boolean | null>(null);

  const { isAuthenticated, setOnboardingComplete, setBoutique } = useAuthStore();

  /**
   * Vérifie la DB pendant l'animation.
   * - Initialise SQLite si ce n'est pas déjà fait
   * - Interroge réellement la table boutique
   * - Resynchronise le store si nécessaire
   */
  const checkDatabase = useCallback(async () => {
    try {
      await initDB();

      if (!isAuthenticated) {
        dbCheckResult.current = false;
        return;
      }

      const configured = await isBoutiqueConfigured();

      if (configured) {
        // Resynchroniser le store avec les données réelles de la DB
        const boutique = await getBoutique();
        if (boutique) setBoutique(boutique);
        setOnboardingComplete(true);
      } else {
        setOnboardingComplete(false);
      }

      dbCheckResult.current = configured;
    } catch (error) {
      console.warn('[SplashScreen] Erreur vérification DB :', error);
      // En cas d'erreur DB, on se base sur le store persisté
      dbCheckResult.current = null;
    }
  }, [isAuthenticated, setBoutique, setOnboardingComplete]);

  const handleInitialNavigation = useCallback(() => {
    if (!isAuthenticated) {
      router.replace("/(auth)/google-signin");
      return;
    }

    // Priorité : résultat DB (source de vérité), sinon store persisté
    const isReady = dbCheckResult.current ?? false;

    if (!isReady) {
      router.replace("/(auth)/google-signin");
      return;
    }

    // Connecté + boutique configurée en DB → accueil direct
    router.replace("/(drawer)/(tabs)");
  }, [isAuthenticated, router]);

  useEffect(() => {
    StatusBar.setBarStyle("dark-content");

    // Lancer la vérification DB en parallèle de l'animation
    checkDatabase();

    // Phase 1: Logo Entrance (Scale + Fade + Bounce)
    logoScale.value = withTiming(1, {
      duration: 1000,
      easing: Easing.bezier(0.34, 1.56, 0.64, 1), // Custom bounce easing
    });
    logoOpacity.value = withTiming(1, { duration: 800 });
    logoTranslationY.value = withTiming(0, { duration: 1000 });

    // Phase 2: Logo Floating (Subtle loop)
    logoTranslationY.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(-10, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );

    // Phase 3: Text Entrance (Tightening effect)
    textOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
    textLetterSpacing.value = withDelay(
      600,
      withTiming(-0.5, {
        duration: 1200,
        easing: Easing.out(Easing.exp),
      })
    );

    // Phase 4: Tagline Entrance
    taglineOpacity.value = withDelay(1400, withTiming(1, { duration: 600 }));

    // Phase 5: Progress Bar
    progressWidth.value = withTiming(width, {
      duration: NAVIGATION_CONFIG.splashDureeMs,
      easing: Easing.linear,
    });

    // Final Action: Navigation (après la durée du splash)
    const timer = setTimeout(() => {
      runOnJS(handleInitialNavigation)();
    }, NAVIGATION_CONFIG.splashDureeMs);

    return () => clearTimeout(timer);
  }, []);

  // Animated Styles
  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { translateY: logoTranslationY.value },
    ],
    opacity: logoOpacity.value,
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    letterSpacing: textLetterSpacing.value,
  }));

  const animatedTaglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: progressWidth.value,
  }));

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />

      {/* Main Content */}
      <View style={styles.content}>
        <Animated.Image
          source={require("../../../assets/images/logo.png")}
          style={[styles.logo, animatedLogoStyle]}
          resizeMode="contain"
        />
        <Animated.Text style={[styles.appName, animatedTextStyle]}>
          Lotus Business
        </Animated.Text>

        <Animated.Text style={[styles.tagline, animatedTaglineStyle]}>
          Gérez votre boutique, simplement.
        </Animated.Text>
      </View>
      {/* Elegant Progress Bar */}
      <View style={styles.progressContainer}>
        <Animated.View style={[styles.progressBar, animatedProgressStyle]} />
      </View>

      {/* auhor */}
      <Text style={styles.auhor}>Made by L!txx</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    marginTop: -40, // Offset for better visual balance
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 24,
  },
  appName: {
    fontSize: 32,
    fontFamily: FontFamily.display,
    color: "#0A0A0A",
  },
  tagline: {
    fontSize: 14,
    fontFamily: FontFamily.content,
    color: "#0A0A0A",
    marginTop: 8,
  },
  progressContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: 20,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  progressBar: {
    height: "150%",
    backgroundColor: "#0A0A0A",
  },
  auhor: {
    position: "absolute",
    bottom: 50,
    fontSize: 11,
    color: "#A1A1A1",
    letterSpacing: 1,
  },
});