import { Stack } from 'expo-router'

export default function ProduitsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="catalogue" />
      <Stack.Screen name="[id]" />
      <Stack.Screen
        name="edit"
        options={{
          presentation: 'formSheet',
          sheetAllowedDetents: [0.92],
          sheetGrabberVisible: true,
        }}
      />
    </Stack>
  )
}
