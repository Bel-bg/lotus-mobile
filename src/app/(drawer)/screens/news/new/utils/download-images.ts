import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";

export async function downloadChannelImages(
  urls: string[],
): Promise<{ success: boolean; savedCount: number; error?: string }> {
  if (urls.length === 0) {
    return { success: false, savedCount: 0, error: "Aucune image à télécharger." };
  }

  const permission = await MediaLibrary.requestPermissionsAsync();
  if (!permission.granted) {
    return {
      success: false,
      savedCount: 0,
      error: "Autorisez l'accès à la galerie pour enregistrer les images.",
    };
  }

  let savedCount = 0;

  for (let index = 0; index < urls.length; index += 1) {
    const url = urls[index];
    const extension = url.includes(".png") ? "png" : "jpg";
    const targetUri = `${FileSystem.cacheDirectory}lotus-channel-${Date.now()}-${index}.${extension}`;

    try {
      const downloaded = await FileSystem.downloadAsync(url, targetUri);
      await MediaLibrary.saveToLibraryAsync(downloaded.uri);
      savedCount += 1;
    } catch {
      continue;
    }
  }

  if (savedCount === 0) {
    return {
      success: false,
      savedCount: 0,
      error: "Impossible d'enregistrer les images pour le moment.",
    };
  }

  return { success: true, savedCount };
}
