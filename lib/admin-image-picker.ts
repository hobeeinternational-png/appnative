import { Platform } from "react-native";

import type { AdminImageCandidate } from "@/lib/admin";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function chooseAdminImages(limit: number): Promise<AdminImageCandidate[]> {
  if (Platform.OS === "web") return chooseWebImages(limit);
  const ImagePicker = await import("expo-image-picker");
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: limit > 1,
    selectionLimit: limit,
    quality: 0.82,
  });
  return result.canceled ? [] : result.assets.map((asset) => ({ uri: asset.uri, fileName: asset.fileName, mimeType: asset.mimeType, fileSize: asset.fileSize }));
}

function chooseWebImages(limit: number): Promise<AdminImageCandidate[]> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ACCEPTED_IMAGE_TYPES.join(",");
    input.multiple = limit > 1;
    input.onchange = () => {
      const files = Array.from(input.files ?? []).slice(0, limit);
      resolve(files.map((file) => ({ uri: URL.createObjectURL(file), fileName: file.name, mimeType: file.type, fileSize: file.size })));
    };
    input.oncancel = () => resolve([]);
    input.click();
  });
}
