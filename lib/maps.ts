import * as Location from "expo-location";
import { Linking, Platform } from "react-native";

import { googleMapsDirectionsUrl, type CurrentCoordinate, type MapCoordinate } from "@/lib/maps-links";

export { googleMapsDirectionsUrl, googleMapsSearchUrl } from "@/lib/maps-links";
export type { CurrentCoordinate, MapCoordinate } from "@/lib/maps-links";

export function nativeDirectionsUrl(destination: MapCoordinate) {
  const coordinate = `${destination.lat},${destination.lng}`;
  if (Platform.OS === "ios") return `comgooglemaps://?daddr=${encodeURIComponent(coordinate)}&directionsmode=driving`;
  return `google.navigation:q=${encodeURIComponent(coordinate)}&mode=d`;
}

export async function getCurrentCoordinate(): Promise<CurrentCoordinate | null> {
  const servicesEnabled = await Location.hasServicesEnabledAsync();
  if (!servicesEnabled) return null;
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") return null;
  const lastKnown = await Location.getLastKnownPositionAsync({ maxAge: 60_000, requiredAccuracy: 300 });
  const location = lastKnown ?? await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  return { lat: location.coords.latitude, lng: location.coords.longitude };
}

export async function openGpsNavigation(destination: MapCoordinate, origin?: CurrentCoordinate) {
  const nativeUrl = nativeDirectionsUrl(destination);
  if (await Linking.canOpenURL(nativeUrl)) {
    await Linking.openURL(nativeUrl);
    return { opened: "native" as const, url: nativeUrl };
  }
  const googleUrl = googleMapsDirectionsUrl(destination, origin);
  await Linking.openURL(googleUrl);
  return { opened: "web" as const, url: googleUrl };
}

export async function navigateFromCurrentLocation(destination: MapCoordinate) {
  const origin = await getCurrentCoordinate();
  return openGpsNavigation(destination, origin ?? undefined);
}
