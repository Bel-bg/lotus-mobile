import { useState } from 'react';

/**
 * Hook personnalisé (Neutralisé)
 * Anciennement utilisé pour gérer l'authentification Google via OAuth
 */
export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    setError('La connexion Google a été retirée.');
    setIsLoading(false);
    return null;
  };

  return {
    signInWithGoogle,
    isLoading,
    error,
    request: null
  };
}
