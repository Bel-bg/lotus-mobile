# 🪷 Lotus Business — Agent Instructions

> Ce fichier est le contexte permanent du projet. Il doit rester dans le feed à tout moment.
> Lis-le entièrement avant chaque action de code.

---

## 🎯 Vision du projet

**Lotus Business** est un SaaS de gestion de boutique pour commerçants africains.
Il est composé de deux produits :

1. **App mobile** (React Native) — pour les commerçants clients
2. **Dashboard web** (Next.js) — pour l'administrateur Lotus Business

Ce fichier concerne uniquement **l'app mobile React Native**.

---

## 🏗️ Stack technique — App Mobile

| Technologie | Usage |
|---|---|
| **React Native** | Framework mobile |
| **TypeScript** | Langage principal |
| **Expo** | Toolchain & build |
| **expo-sqlite** | Base de données locale offline |
| **expo-print** | Génération PDF factures & bilans |
| **expo-sharing** | Partage fichiers PDF |
| **expo-file-system** | Gestion fichiers locaux |
| **react-native-thermal-receipt-printer** | Impression Bluetooth thermique |
| **react-native-qrcode-svg** | QR Code sur les factures |
| **@react-native-google-signin/google-signin** | Authentification Google OAuth |
| **Firebase Auth** | Vérification identité Google |
| **Firebase Firestore** | Vérification licence en ligne |
| **@react-navigation/native** | Navigation entre écrans |
| **@react-navigation/bottom-tabs** | Tab bar principale |
| **react-native-reanimated** | Animations fluides |
| **react-native-gesture-handler** | Gestes tactiles |
| **zustand** | State management global |
| **date-fns** | Manipulation des dates |

---

## 🎨 Design System

```typescript
// Couleurs
const colors = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  border: '#E0E0E0',
  textPrimary: '#0A0A0A',
  textSecondary: '#6B6B6B',
  accent: '#0A0A0A',
  success: '#16A34A',
  successLight: '#F0FDF4',
  successBorder: '#BBF7D0',
  warning: '#D97706',
  warningLight: '#FFFBEB',
  warningBorder: '#FCD34D',
  danger: '#DC2626',
  dangerLight: '#FEF2F2',
  dangerBorder: '#FCA5A5',
}

// Typographie
const typography = {
  fontFamily: 'DMSans',
  sizes: {
    xs: 11,
    sm: 12,
    md: 13,
    base: 14,
    lg: 15,
    xl: 16,
    '2xl': 18,
    '3xl': 20,
    '4xl': 22,
    '5xl': 24,
    '6xl': 28,
  },
  weights: {
    regular: '400',
    medium: '500',
    bold: '700',
  }
}

// Espacements
const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
}

// Border radius
const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
}
```

---

## 📁 Architecture des fichiers

```
lotus-business-mobile/
├── app/                          # Expo Router (App Router)
│   ├── (auth)/
│   │   ├── splash.tsx            # Écran 1 — Splash
│   │   ├── loading.tsx           # Écran 2 — Loading app
│   │   ├── onboarding/
│   │   │   ├── slide1.tsx        # Écran 3
│   │   │   ├── slide2.tsx        # Écran 4
│   │   │   └── slide3.tsx        # Écran 5
│   │   ├── permissions.tsx       # Écran 6
│   │   ├── google-signin.tsx     # Écran 7
│   │   └── setup-boutique.tsx    # Écran 8
│   ├── (security)/
│   │   ├── verifying.tsx         # Écran 9 — Vérification licence
│   │   ├── access-denied.tsx     # Écran 10 — Accès refusé
│   │   └── banned.tsx            # Écran 11 — Banni permanent
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Tab bar + FAB
│   │   ├── index.tsx             # Écran 12 — Accueil
│   │   ├── stock/
│   │   │   ├── index.tsx         # Écran 13 — Stock
│   │   │   ├── [id].tsx          # Écran 15 — Détail produit
│   │   │   ├── add.tsx           # Écran 16 — Ajouter produit
│   │   │   ├── edit/[id].tsx     # Écran 17 — Modifier produit
│   │   │   └── entree/[id].tsx   # Écran 23 — Entrée stock
│   │   ├── bilan/
│   │   │   ├── index.tsx         # Écran 14 — Bilan
│   │   │   └── historique.tsx    # Écran 27 — Historique bilans
│   │   ├── profil/
│   │   │   └── index.tsx         # Écran 15 — Profil
│   │   ├── ventes/
│   │   │   ├── nouvelle.tsx      # Écran 16 — Nouvelle vente (FAB)
│   │   │   ├── confirmation.tsx  # Écran 17 — Confirmation vente
│   │   │   ├── success.tsx       # Écran 18 — Succès vente
│   │   │   ├── [id].tsx          # Écran 19 — Détail vente
│   │   │   └── historique.tsx    # Écran 20 — Historique ventes
│   │   ├── alertes.tsx           # Écran 25 — Alertes stock
│   │   ├── pdf-preview.tsx       # Écran 26 — Aperçu PDF
│   │   ├── bilan-success.tsx     # Écran 28 — Succès clôture
│   │   ├── empty-state.tsx       # Écran 29 — Empty state
│   │   ├── drive-error.tsx       # Écran 30 — Erreur Drive
│   │   └── reconnect-google.tsx  # Écran 31 — Reconnexion Google
│   └── _layout.tsx
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── Avatar.tsx
│   │   ├── StockBar.tsx
│   │   ├── MetricCard.tsx
│   │   └── EmptyState.tsx
│   ├── layout/
│   │   ├── TabBar.tsx            # Tab bar custom avec FAB
│   │   └── Header.tsx
│   ├── ventes/
│   │   ├── ProductCard.tsx
│   │   ├── Stepper.tsx
│   │   └── OrderSummary.tsx
│   ├── stock/
│   │   ├── ProductRow.tsx
│   │   └── MovementRow.tsx
│   ├── facture/
│   │   ├── FactureTemplate.tsx   # Template HTML → PDF
│   │   └── QRCode.tsx
│   └── bilan/
│       └── BilanTemplate.tsx     # Template HTML → PDF
│
├── lib/
│   ├── db/
│   │   ├── schema.ts             # Schéma SQLite
│   │   ├── produits.ts           # CRUD produits
│   │   ├── ventes.ts             # CRUD ventes
│   │   └── bilans.ts             # CRUD bilans
│   ├── firebase/
│   │   ├── config.ts             # Config Firebase
│   │   └── licence.ts            # Vérification licence Firestore
│   ├── google/
│   │   └── drive.ts              # Upload Drive
│   ├── pdf/
│   │   ├── generateFacture.ts    # Génération PDF facture
│   │   └── generateBilan.ts      # Génération PDF bilan
│   └── utils/
│       ├── formatCurrency.ts     # Format FCFA
│       ├── formatDate.ts         # Format dates
│       └── generateRef.ts        # Génération numéros facture
│
├── store/
│   ├── useAuthStore.ts           # Auth + licence state
│   ├── useStockStore.ts          # State produits
│   ├── useVentesStore.ts         # State ventes du jour
│   └── useBilanStore.ts          # State bilan journalier
│
├── constants/
│   ├── colors.ts
│   ├── typography.ts
│   └── config.ts                 # Config app (devise, etc.)
│
├── types/
│   ├── produit.ts
│   ├── vente.ts
│   ├── bilan.ts
│   └── licence.ts
│
└── assets/
    ├── fonts/
    │   └── DMSans/
    ├── images/
    │   └── logo.png
    └── icons/

```

---

## 🗄️ Schéma SQLite

```sql
-- Produits
CREATE TABLE produits (
  id TEXT PRIMARY KEY,
  nom TEXT NOT NULL,
  categorie TEXT,
  prix_unitaire REAL NOT NULL,
  stock_actuel INTEGER NOT NULL DEFAULT 0,
  stock_min INTEGER DEFAULT 20,
  unite TEXT DEFAULT 'unités',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Ventes
CREATE TABLE ventes (
  id TEXT PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  total REAL NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Items d'une vente
CREATE TABLE vente_items (
  id TEXT PRIMARY KEY,
  vente_id TEXT NOT NULL REFERENCES ventes(id),
  produit_id TEXT NOT NULL REFERENCES produits(id),
  produit_nom TEXT NOT NULL,
  quantite INTEGER NOT NULL,
  prix_unitaire REAL NOT NULL,
  sous_total REAL NOT NULL
);

-- Mouvements de stock
CREATE TABLE mouvements (
  id TEXT PRIMARY KEY,
  produit_id TEXT NOT NULL REFERENCES produits(id),
  type TEXT NOT NULL CHECK(type IN ('entree', 'sortie')),
  quantite INTEGER NOT NULL,
  reference TEXT,
  note TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Bilans journaliers
CREATE TABLE bilans (
  id TEXT PRIMARY KEY,
  date TEXT UNIQUE NOT NULL,
  stock_matin TEXT NOT NULL,
  stock_soir TEXT,
  ca_total REAL DEFAULT 0,
  nb_ventes INTEGER DEFAULT 0,
  depenses REAL DEFAULT 0,
  benefice REAL DEFAULT 0,
  cloture_at TEXT,
  pdf_local_path TEXT,
  pdf_drive_url TEXT
);
```

---

## 🔐 Logique de vérification de licence

```typescript
// lib/firebase/licence.ts

async function verifierLicence(email: string): Promise<LicenceStatus> {
  const docRef = doc(db, 'licences', email)
  const docSnap = await getDoc(docRef)

  // Email non trouvé dans Firestore
  if (!docSnap.exists()) {
    await incrementerTentatives(email)
    const tentatives = await getTentatives(email)
    if (tentatives >= 3) return 'banni'
    return 'non_autorise'
  }

  const data = docSnap.data()

  // Vérififications statut
  if (data.statut === 'banni') return 'banni'
  if (data.statut === 'suspendu') return 'suspendu'

  // Vérification expiration
  const expiration = data.date_expiration.toDate()
  if (expiration < new Date()) return 'expire'

  // Réinitialiser les tentatives si succès
  await resetTentatives(email)
  return 'actif'
}

type LicenceStatus =
  | 'actif'
  | 'non_autorise'
  | 'suspendu'
  | 'expire'
  | 'banni'
```

---

## 🧾 Format Facture PDF

```
Format papier : 58mm (thermique) ou A5 (PDF)
Numérotation  : VNT-YYYY-XXXX (auto-incrémenté SQLite)
Contenu       :
  - Logo Lotus Business (centré)
  - Nom & infos boutique
  - Numéro de facture + date/heure
  - Liste produits (nom, quantité, prix unitaire, sous-total)
  - Total
  - QR Code (numéro facture + montant + date)
  - "Merci pour votre achat !"
  - "Powered by Lotus Business"

Générateur    : expo-print (HTML → PDF)
Impression    : react-native-thermal-receipt-printer (Bluetooth)
Imprimantes   : Xprinter XP-58 / GOOJPRT
```

---

## 📊 Format Bilan Journalier PDF

```
Contenu :
  - Logo Lotus Business
  - Nom boutique + date
  - Récapitulatif : CA total, nb ventes, dépenses, bénéfice net
  - Tableau mouvements stocks (produit, stock matin, stock soir, diff)
  - Liste des ventes du jour (référence, produits, montant, heure)
  - Signature / cachet zone

Déclencheur   : Bouton "Clôturer la journée"
Sauvegarde    : Local (expo-file-system) + Google Drive
```

---

## 🌍 Contexte métier

- **Devise** : FCFA (Franc CFA)
- **Pays cible** : Bénin (et Afrique de l'Ouest)
- **Format téléphone** : +229 XX XX XX XX
- **Langue** : Français uniquement
- **Connexion** : Offline first — toutes les données en local SQLite
- **Sync cloud** : Uniquement les PDFs → Google Drive

---

## 📱 Navigation

```
Stack Auth (premier lancement) :
  Splash → Loading → Onboarding (x3) → Permissions
  → Google Sign In → Setup Boutique → Vérification licence
  → [Accès accordé] → App principale

Stack Sécurité :
  Vérification → Accès refusé (max 3x) → Banni

App principale (Tab Bar) :
  Tab 1 : Accueil (index)
  Tab 2 : Stock
  FAB   : Nouvelle Vente (modal)
  Tab 3 : Bilan
  Tab 4 : Profil
```

---

## ⚙️ Règles de développement

1. **Offline first** — toujours écrire dans SQLite d'abord, Drive en arrière-plan
2. **TypeScript strict** — pas de `any`, types définis dans `/types`
3. **Composants réutilisables** — UI dans `/components/ui` uniquement
4. **Zustand pour le state global** — pas de prop drilling
5. **Animations avec Reanimated** — toutes les transitions d'écran animées
6. **Gestion d'erreurs** — chaque appel Firebase/Drive dans un try/catch
7. **Format FCFA** — toujours via `formatCurrency.ts`, jamais inline
8. **Dates** — toujours via `date-fns` et `formatDate.ts`
9. **IDs** — toujours `uuid v4` pour SQLite
10. **Un fichier = une responsabilité** — pas de fichiers de plus de 200 lignes

---

## 🚫 Ce qu'il ne faut jamais faire

- ❌ Hardcoder un email de licence dans le code
- ❌ Stocker des données sensibles en AsyncStorage (utiliser SQLite)
- ❌ Appeler Drive/Firebase sans vérifier la connexion réseau d'abord
- ❌ Générer un PDF sans vérifier que expo-print est disponible
- ❌ Modifier le schéma SQLite sans migration
- ❌ Utiliser `console.log` en production (utiliser un logger dédié)

---

## 🔄 Statuts de licence Firestore

| Statut | Accès app | Description |
|---|---|---|
| `actif` | ✅ Complet | Licence valide |
| `suspendu` | ⛔ Bloqué | Suspendu par admin |
| `expire` | ⛔ Bloqué | Date expiration dépassée |
| `non_autorise` | ⚠️ Avertissement | Email inconnu (max 3x) |
| `banni` | 🔴 Permanent | 3 tentatives échouées |

---

*Lotus Business — Gérez votre boutique, simplement. 🪷*
*Dernière mise à jour : mars 2026*
