import { Stack } from "expo-router";

export default function MyHobeeLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}><Stack.Screen name="index" /><Stack.Screen name="roles" /><Stack.Screen name="work" /></Stack>;
}
