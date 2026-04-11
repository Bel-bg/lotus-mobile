// ============================================
// LOTUS BUSINESS — Service : Google Auth
// ============================================
// ─── Types ────────────────────────────────────────────────────────────────────

export type GoogleAuthUser = {
  uid: string
  email: string
  displayName: string
  photoURL: string | null
}

export type GoogleAuthError =
  | { code: 'CANCELLED'; message: string }
  | { code: 'NO_PLAY_SERVICES'; message: string }
  | { code: 'SIGN_IN_FAILED'; message: string }
  | { code: 'SIGN_OUT_FAILED'; message: string }
  | { code: 'NOT_IMPLEMENTED'; message: string }

export type GoogleAuthResult =
  | { success: true; user: GoogleAuthUser }
  | { success: false; error: GoogleAuthError }

// ─── Configuration ────────────────────────────────────────────────────────────

export function configureGoogleSignIn(): void {
  // Logique retirée
}

// ─── Sign In ──────────────────────────────────────────────────────────────────

export async function signInWithGoogle(): Promise<GoogleAuthResult> {
  return {
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'La connexion Google a été retirée.',
    },
  }
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

export async function signOutGoogle(): Promise<void> {
  // Logique retirée
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getCurrentFirebaseUser(): any | null {
  return null
}
