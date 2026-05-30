import { Stack, useRouter } from "expo-router";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { useAuthStore } from '../store/useAuthStore';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { useFonts, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter()
  const { isAuthenticated, isOnboardingComplete } = useAuthStore()
  // useRef pour éviter les redirections multiples
  const hasRedirected = useRef(false)

  const [loaded, error] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // Configurer Google Sign-In (Neutralisé)
  useEffect(() => {
    // configureGoogleSignIn()
  }, [])

  useEffect(() => {
    if (Platform.OS !== "android") return

    const hideNavigationBar = async () => {
      try {
        await NavigationBar.setVisibilityAsync("hidden")
      } catch {
        // Certains appareils ou modes de navigation Android ignorent cette API.
      }
    }

    void hideNavigationBar()
  }, [])

  // Garde de session : redirige vers l'accueil uniquement si connecté ET onboarding terminé
  useEffect(() => {
    if (hasRedirected.current) return

    if (isAuthenticated && isOnboardingComplete) {
      hasRedirected.current = true
      router.replace('/(drawer)/(tabs)')
    }
  }, [isAuthenticated, isOnboardingComplete])

  if (!loaded && !error) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(drawer)" />
      </Stack>
      <LoadingOverlay />
    </>
  );
}
