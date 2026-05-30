import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="splash" />
      <Stack.Screen
        name="formSheet"
        options={{
          presentation: 'formSheet',
          sheetGrabberVisible: false,
          sheetAllowedDetents: [1.0],
          sheetInitialDetentIndex: 0,
          sheetExpandsWhenScrolledToEdge: false,
          headerShown: false,
          animation: 'slide_from_bottom',
        }}
      />
    </Stack>
  );
}
