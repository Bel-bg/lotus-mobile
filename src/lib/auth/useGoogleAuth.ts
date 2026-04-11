import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { useState } from 'react';
import { auth } from '../../constants/config';

// Requis pour finaliser l'authentification avec certaines plateformes web
WebBrowser.maybeCompleteAuthSession();

/**
 * Hook personnalisé pour gérer l'authentification Google via OAuth
 * Compatible avec Expo Go sans code natif
 */
export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    // Sur Expo SDK 55+, le proxy Expo n'existe plus.
    // La librairie exige que l'ID client de la plateforme sur laquelle on teste soit fourni.
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'A_DEFINIR',
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'A_DEFINIR',
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'A_DEFINIR',
    // On force la redirectUri pour correspondre EXACTEMENT à celle de votre fichier JSON
    redirectUri: 'https://auth.expo.io/@belmonde/lotus',
  });

  /**
   * Lance le processus de connexion Google
   * et connecte l'utilisateur dans Firebase
   */
  const signInWithGoogle = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Lance la fenêtre d'authentification OAuth
      const result = await promptAsync();

      // 2. Vérifie que l'authentification a réussi
      if (result?.type === 'success') {
        // 3. Récupère l'id_token pour Firebase
        const { id_token } = result.params;

        if (!id_token) {
          throw new Error('Jeton d\'identification (id_token) absent de la réponse Google.');
        }

        // 4. Crée un credential pour Firebase
        const credential = GoogleAuthProvider.credential(id_token);
        
        // 5. Connecte l'utilisateur dans Firebase
        const userCredential = await signInWithCredential(auth, credential);
        
        console.log('Connexion Google réussie pour:', userCredential.user.email);
        return userCredential.user;
      } else {
        console.log('L\'authentification a été annulée ou n\'a pas abouti:', result?.type);
        setError('Connexion annulée.');
        return null;
      }
    } catch (err: any) {
      console.error('Erreur lors de la connexion Google:', err);
      setError(err?.message || 'Une erreur inattendue est survenue.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signInWithGoogle,
    isLoading,
    error,
    request // utile pour désactiver le bouton si non prêt
  };
}
