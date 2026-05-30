import Constants from 'expo-constants';
import {
  GoogleSignin,
  statusCodes,
  type SignInSuccessResponse,
} from '@react-native-google-signin/google-signin';

const ALLOWED_EMAILS: string[] = Constants.expoConfig?.extra?.allowedEmails ?? [];

export async function signInWithGoogle(): Promise<SignInSuccessResponse> {
  await GoogleSignin.hasPlayServices();

  const result = await GoogleSignin.signIn();

  // En v16, signIn() retourne { type: 'success' | 'cancelled', data: ... }
  if (result.type === 'cancelled') {
    throw Object.assign(new Error('Connexion Google annulée.'), {
      code: statusCodes.SIGN_IN_CANCELLED,
    });
  }

  // Ici result est forcément SignInSuccessResponse
  const email = result.data.user.email ?? '';

  if (!ALLOWED_EMAILS.includes(email)) {
    await GoogleSignin.signOut();
    throw Object.assign(
      new Error(`L'adresse ${email} n'est pas autorisée à accéder à Lotus Business.`),
      { code: 'ACCESS_DENIED' }
    );
  }

  return result;
}