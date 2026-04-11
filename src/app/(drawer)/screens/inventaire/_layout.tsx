import { Stack } from "expo-router";

export default function InventaireLayout() {
  return (
    <Stack
      initialRouteName="index"
      screenOptions={{ headerShown: false, animation: "fade" }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="newproduct" />
      <Stack.Screen name="newCategory" />
      <Stack.Screen name="products" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="mouvements" />
    </Stack>
  );
}
