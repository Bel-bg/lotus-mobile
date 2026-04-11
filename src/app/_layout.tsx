import { Stack, useRouter } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from "react";
import { configureGoogleSignIn, getCurrentFirebaseUser } from '../lib/auth/googleAuth';
import { useAuthStore } from '../store/useAuthStore';
import LoadingOverlay from '../components/ui/LoadingOverlay';

export default function RootLayout() {
  const router = useRouter()
  const { isAuthenticated, isOnboardingComplete } = useAuthStore()
  // useRef pour éviter les redirections multiples
  const hasRedirected = useRef(false)

  // Configurer Google Sign-In une seule fois au démarrage
  useEffect(() => {
    configureGoogleSignIn()
  }, [])

  // Garde de session — si session persistée ET Firebase actif → skip le flow auth
  useEffect(() => {
    if (hasRedirected.current) return

    const firebaseUser = getCurrentFirebaseUser()

    if (isAuthenticated && firebaseUser) {
      // Session valide → aller directement dans l'app
      hasRedirected.current = true
      router.replace('/(drawer)/(tabs)')
    } else if (isAuthenticated && !firebaseUser) {
      // Le store dit "connecté" mais Firebase ne confirme plus → session expirée
      // On laisse le flux normal (splash → ... → google-signin)
      useAuthStore.getState().logout()
    }
    // Si !isAuthenticated → flux normal de démarrage (Splash, onboarding, etc.)
  }, [isAuthenticated])

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <StatusBar style="dark" backgroundColor="#FFFFFF" />
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(drawer)" />
      </Stack>
      <LoadingOverlay />
    </>
  );
}
