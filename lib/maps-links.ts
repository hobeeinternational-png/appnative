export type MapCoordinate = { lat: number; lng: number };
export type CurrentCoordinate = { lat: number; lng: number };

const coordinateText = ({ lat, lng }: MapCoordinate) => `${lat},${lng}`;

export function googleMapsSearchUrl(destination: MapCoordinate) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coordinateText(destination))}`;
}

export function googleMapsDirectionsUrl(destination: MapCoordinate, origin?: CurrentCoordinate) {
  const originQuery = origin ? `&origin=${encodeURIComponent(coordinateText(origin))}` : "";
  return `https://www.google.com/maps/dir/?api=1${originQuery}&destination=${encodeURIComponent(coordinateText(destination))}&travelmode=driving`;
}
