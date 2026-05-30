import { Stack } from "expo-router";

export default function HistoriqueLayout() {
  return (
    <Stack
      initialRouteName="index"
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="historique" options={{ presentation: "modal" }} />
    </Stack>
  );
}
