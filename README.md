# ============================================
# LOTUS BUSINESS — Installation des dépendances
# ============================================

# 1. Dépendances Expo core
npx expo install expo-sqlite expo-print expo-sharing expo-file-system expo-font

# 2. Navigation
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context

# 3. Animations & Gestes
npx expo install react-native-reanimated react-native-gesture-handler

# 4. Firebase
npm install firebase
npm install @react-native-google-signin/google-signin

# 5. State management
npm install zustand

# 6. QR Code
npm install react-native-qrcode-svg
npx expo install react-native-svg

# 7. Utilitaires
npm install date-fns
npx expo install expo-image-picker
npx expo install expo-notifications
npx expo install expo-secure-store

# 8. Impression thermique (optionnel — nécessite dev client)
# npm install react-native-thermal-receipt-printer-image-qr

# ============================================
# IMPORTANT : Après installation
# ============================================
# Ajoute dans babel.config.js :
# plugins: ['react-native-reanimated/plugin']
#
# Ajoute dans app.json (plugins) :
# "@react-native-google-signin/google-signin"# lotus-mobile
