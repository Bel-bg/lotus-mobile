// ============================================
// LOTUS BUSINESS — Service : Infos (canal news)
// ============================================

import { getAuthSession } from "@/lib/db/auth-session";
import { CanalMessageWithReactions } from "../types/canal.types";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "https://lotus-business-server.onrender.com/api/info";

export interface InfoItem {
  id: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  imageUrls?: string[] | null;
  published: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface FetchInfosResult {
  data: CanalMessageWithReactions[];
  error?: string;
}

/**
 * Mappe une info backend vers un message du canal
 */
function mapInfoToMessage(info: InfoItem): CanalMessageWithReactions {
  // Le backend peut renvoyer imageUrl (une image) ou imageUrls (plusieurs)
  const images: string[] = [];

  if (info.imageUrls && info.imageUrls.length > 0) {
    images.push(...info.imageUrls);
  } else if (info.imageUrl) {
    images.push(info.imageUrl);
  }

  return {
    id: info.id,
    // Combine le titre et le contenu en un seul bloc de message
    content: `**${info.title}**\n\n${info.content}`,
    imageUrls: images.length > 0 ? images : undefined,
    sentAt: info.createdAt,
    isAdmin: true,
    reactions: [],
  };
}

/**
 * Récupère les infos publiées depuis l'API et les retourne sous forme de messages canal.
 */
export async function fetchInfosAsMessages(): Promise<FetchInfosResult> {
  const session = await getAuthSession();

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (session?.token) {
    headers["Authorization"] = `Bearer ${session.token}`;
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/admin/infos`, { headers });
  } catch {
    return {
      data: [],
      error: "Impossible de joindre le serveur Lotus Business.",
    };
  }

  if (!response.ok) {
    return {
      data: [],
      error: `Erreur serveur (${response.status})`,
    };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return { data: [], error: "Réponse invalide du serveur." };
  }

  // Le backend peut retourner directement un tableau ou { infos: [...] }
  let items: InfoItem[];

  if (Array.isArray(payload)) {
    items = payload as InfoItem[];
  } else if (
    typeof payload === "object" &&
    payload !== null &&
    "infos" in payload &&
    Array.isArray((payload as { infos: unknown }).infos)
  ) {
    items = (payload as { infos: InfoItem[] }).infos;
  } else {
    return { data: [], error: "Format de réponse inattendu." };
  }

  // Filtre les non-publiées et trie par date croissante (plus ancien en haut)
  const published = items
    .filter((item) => item.published)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

  return { data: published.map(mapInfoToMessage) };
}
