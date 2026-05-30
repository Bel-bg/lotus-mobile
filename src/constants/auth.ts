/**
 * LOTUS BUSINESS — Configuration Authentification Google
 *
 * webClientId  : ID du client Web OAuth 2.0 (Google Cloud Console → lotus-2e40b)
 *                Utilisé par @react-native-google-signin sur Android.
 *
 * AUTH_WHITELIST : Synchronisé avec .env ALLOWED_EMAILS
 *                  Seuls ces emails peuvent accéder à l'application.
 */

export const GOOGLE_AUTH_CONFIG = {
  webClientId:
    "599834592828-k4k1eldkssvog42m1aij1e64np27ar69.apps.googleusercontent.com",
};

// Synchronisé avec .env → ALLOWED_EMAILS=belmondefio@gmail.com,issamigan334@gmail.com,client3@gmail.com
export const AUTH_WHITELIST = [
  "belmondefio@gmail.com",
  "issamigan334@gmail.com",
  "client3@gmail.com",
];
