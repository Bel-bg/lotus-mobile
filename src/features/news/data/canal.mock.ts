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

const now = Date.now();
const h = (n: number) => new Date(now - 1000 * 60 * 60 * n).toISOString();
const d = (n: number) => new Date(now - 1000 * 60 * 60 * 24 * n).toISOString();

export const MOCK_CANAL_MESSAGES: CanalMessageWithReactions[] = [
  {
    id: "1",
    content:
      "👋 Bienvenue sur le canal officiel **Lotus Business** ! Retrouvez ici toutes les annonces produit, astuces de gestion et nouveautés en avant-première. Activez les notifications pour ne rien rater.",
    sentAt: d(30),
    isAdmin: true,
    reactions: [
      { emoji: "👍", count: 18, userReacted: false },
      { emoji: "❤️", count: 12, userReacted: false },
    ],
  },
  {
    id: "2",
    content:
      "📦 **Conseil stock** — Vous le savez : une rupture de stock, c'est une vente perdue. Définissez un seuil d'alerte sur vos articles les plus vendus dans Paramètres → Stock → Alertes. Lotus vous prévient avant que le problème arrive.",
    sentAt: d(21),
    isAdmin: true,
    reactions: [
      { emoji: "💡", count: 9, userReacted: false },
      { emoji: "👍", count: 6, userReacted: true },
    ],
  },
  {
    id: "3",
    content:
      "🚀 **Mise à jour v1.1** — La gestion multi-boutique est disponible. Vous pouvez désormais basculer entre vos points de vente sans vous déconnecter. Retrouvez le détail complet dans les notes de version.",
    imageUrls: [
      "https://picsum.photos/seed/lotus-update1/800/450",
      "https://picsum.photos/seed/lotus-update2/800/450",
    ],
    imageSizeLabel: "98 ko",
    sentAt: d(18),
    isAdmin: true,
    reactions: [
      { emoji: "🔥", count: 22, userReacted: true },
      { emoji: "👍", count: 14, userReacted: false },
      { emoji: "🎉", count: 7, userReacted: false },
    ],
  },
  {
    id: "4",
    content:
      "🖨️ **Impression thermique** — Votre imprimante Bluetooth ne se connecte pas ? Vérifiez que le Bluetooth est bien activé sur votre appareil, puis allez dans Paramètres → Imprimante → Scanner. Si le problème persiste, éteignez et rallumez l'imprimante avant de relancer le scan.",
    sentAt: d(15),
    isAdmin: true,
    reactions: [
      { emoji: "🙏", count: 11, userReacted: false },
      { emoji: "👍", count: 5, userReacted: false },
    ],
  },
  {
    id: "5",
    content:
      "📊 **Astuce fin de mois** — Exportez votre bilan mensuel en PDF en un tap : Tableau de bord → Rapports → Exporter. Envoyez-le directement à votre comptable ou sauvegardez-le sur Google Drive. Votre historique est conservé sur 12 mois.",
    imageUrls: [
      "https://picsum.photos/seed/lotus-rapport1/400/500",
      "https://picsum.photos/seed/lotus-rapport2/400/500",
      "https://picsum.photos/seed/lotus-rapport3/400/500",
    ],
    imageSizeLabel: "215 ko",
    sentAt: d(12),
    isAdmin: true,
    reactions: [
      { emoji: "💡", count: 17, userReacted: true },
      { emoji: "❤️", count: 8, userReacted: false },
    ],
  },
  {
    id: "6",
    content:
      "🎁 **Offre spéciale** — Parrainez un(e) commerçant(e) et obtenez **1 mois offert** sur votre abonnement. Votre filleul(e) bénéficie également de 2 semaines gratuites. Partagez votre code depuis Profil → Parrainage.",
    sentAt: d(9),
    isAdmin: true,
    reactions: [
      { emoji: "🔥", count: 31, userReacted: false },
      { emoji: "🎉", count: 19, userReacted: true },
      { emoji: "👍", count: 13, userReacted: false },
    ],
  },
  {
    id: "7",
    content:
      "🔴 **Mise à jour v1.2** — Les alertes stock en temps réel arrivent sur votre tableau de bord. Synchronisation Google Drive optimisée et correctifs sur le scanner de codes-barres. Mettez à jour depuis le Play Store.",
    imageUrls: [
      "https://picsum.photos/seed/lotus-v12a/800/450",
      "https://picsum.photos/seed/lotus-v12b/800/450",
      "https://picsum.photos/seed/lotus-v12c/800/450",
    ],
    imageSizeLabel: "176 ko",
    sentAt: d(6),
    isAdmin: true,
    reactions: [
      { emoji: "🚀", count: 25, userReacted: true },
      { emoji: "👍", count: 18, userReacted: false },
      { emoji: "❤️", count: 9, userReacted: false },
    ],
  },
  {
    id: "8",
    content:
      "💳 **Gérez vos clients** — Ajoutez vos clients réguliers dans l'onglet Clients et suivez leurs achats. Vous pouvez leur attribuer un tarif préférentiel ou noter leurs préférences pour un service plus personnalisé.",
    sentAt: d(4),
    isAdmin: true,
    reactions: [
      { emoji: "💡", count: 14, userReacted: false },
      { emoji: "👍", count: 7, userReacted: false },
    ],
  },
  {
    id: "9",
    content:
      "⚡ **Saviez-vous ?** — Le mode hors-ligne de Lotus Business enregistre toutes vos ventes même sans connexion. La synchronisation se fait automatiquement dès que vous retrouvez du réseau. Aucune vente n'est perdue.",
    imageUrls: [
      "https://picsum.photos/seed/lotus-offline1/400/500",
      "https://picsum.photos/seed/lotus-offline2/400/500",
    ],
    imageSizeLabel: "134 ko",
    sentAt: d(2),
    isAdmin: true,
    reactions: [
      { emoji: "🔥", count: 20, userReacted: false },
      { emoji: "😍", count: 11, userReacted: true },
      { emoji: "👍", count: 8, userReacted: false },
    ],
  },
  {
    id: "10",
    content:
      "🔴 **Nouveauté catalogue v1.3** — Ajout des variantes produit (taille, couleur, modèle), nouvelle vue grille dans le catalogue et amélioration des performances sur les boutiques avec +500 articles. Disponible dès maintenant.",
    imageUrls: [
      "https://picsum.photos/seed/lotus-v13a/400/500",
      "https://picsum.photos/seed/lotus-v13b/400/500",
      "https://picsum.photos/seed/lotus-v13c/400/500",
      "https://picsum.photos/seed/lotus-v13d/400/500",
    ],
    imageSizeLabel: "312 ko",
    sentAt: h(3),
    isAdmin: true,
    reactions: [
      { emoji: "🎉", count: 28, userReacted: false },
      { emoji: "🔥", count: 16, userReacted: true },
      { emoji: "❤️", count: 10, userReacted: false },
    ],
  },
];
