import 'react-native-gesture-handler'
import { Stack, useRouter } from "expo-router";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from 'expo-status-bar';
import { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';  
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';         
import { useAuthStore } from '../store/useAuthStore';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { useFonts, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter()

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



  useEffect(() => {
    if (Platform.OS !== "android") return
    const hideNavigationBar = async () => {
      try {
        await NavigationBar.setVisibilityAsync("hidden")
      } catch {}
    }
    void hideNavigationBar()
  }, [])

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1}}>
      <BottomSheetModalProvider>
        <StatusBar style="dark"  />
        <Stack screenOptions={{ headerShown: false }} >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(drawer)" />
        </Stack>
        <LoadingOverlay />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}