import { CanalMessageWithReactions } from "../types/canal.types";

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
yesterday.setHours(14, 41, 0, 0);

const yesterday2 = new Date(yesterday);
yesterday2.setHours(16, 12, 0, 0);

export const MOCK_CHANNEL = {
  name: "Lotus Business",
  avatarLabel: "LB",
  subscriberCount: 3240,
  isMuted: true,
  shareUrl: "https://lotusbusiness.app/canal/officiel",
  description:
    "Canal officiel Lotus Business. Annonces produit, mises à jour et conseils pour votre activité.",
  createdAt: "2024-03-12",
};

export const MOCK_CANAL_MESSAGES: CanalMessageWithReactions[] = [
  {
    id: "1",
    content:
      "🔴 **Nouveauté catalogue** — Export PDF des bilans mensuels, synchronisation Drive améliorée et correctifs de stock.",
    imageUrls: [
      "https://picsum.photos/seed/lotus-a/400/500",
      "https://picsum.photos/seed/lotus-b/400/500",
      "https://picsum.photos/seed/lotus-c/400/500",
      "https://picsum.photos/seed/lotus-d/400/500",
      "https://picsum.photos/seed/lotus-e/400/500",
    ],
    imageSizeLabel: "312 ko",
    sentAt: yesterday.toISOString(),
    isAdmin: true,
    reactions: [
      { emoji: "👍", count: 2, userReacted: false },
      { emoji: "😍", count: 1, userReacted: false },
      { emoji: "😢", count: 1, userReacted: false },
    ],
  },
  {
    id: "2",
    content:
      "🔴 **Mise à jour v1.2** — Les alertes stock temps réel arrivent sur votre tableau de bord. Pensez à activer les notifications.",
    imageUrls: [
      "https://picsum.photos/seed/lotus-f/800/450",
      "https://picsum.photos/seed/lotus-g/800/450",
      "https://picsum.photos/seed/lotus-h/800/450",
    ],
    imageSizeLabel: "124 ko",
    sentAt: yesterday2.toISOString(),
    isAdmin: true,
    reactions: [
      { emoji: "👍", count: 5, userReacted: true },
      { emoji: "🔥", count: 3, userReacted: false },
      { emoji: "❤️", count: 1, userReacted: false },
    ],
  },
  {
    id: "3",
    content:
      "👋 Bienvenue sur le canal officiel Lotus Business ! Retrouvez ici les annonces produit et les conseils pour gérer votre activité.",
    sentAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    isAdmin: true,
    reactions: [],
  },
];
