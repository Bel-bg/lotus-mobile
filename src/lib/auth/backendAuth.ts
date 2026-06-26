import { AuthUser, Licence } from '../../types'
import { mapBackendStatus, saveAuthSession } from '../db/auth-session'

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ??
  'https://lotus-business-server.onrender.com'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public payload?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Impossible de joindre le serveur Lotus Business.', 0)
  }

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload && 'message' in payload
        ? String((payload as { message?: unknown }).message)
        : 'La requête a échoué.'
    throw new ApiError(message, response.status, payload)
  }

  return payload as T
}

export function authUserToLicence(user: AuthUser): Licence {
  return {
    code: user.licenseKey,
    email: user.email,
    nom: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
    telephone: user.phone,
    type: user.licenseType?.toUpperCase() === 'PREMIUM' ? 'premium' : 'free',
    statut: mapBackendStatus(user.licenseStatus),
    dateCreation: new Date().toISOString(),
    dateExpiration: user.expirationDate,
  }
}

export async function registerUser(input: {
  email: string
  phone: string
  firstName: string
  lastName: string
}) {
  return postJson<{
    message: string
    user: AuthUser
    emailSent: boolean
  }>('/api/auth/register', input)
}

export async function loginWithLicence(licenseKey: string) {
  const data = await postJson<{
    message: string
    token: string
    user: AuthUser
  }>('/api/auth/login', { licenseKey })

  await saveAuthSession({ token: data.token, user: data.user })

  return {
    ...data,
    licence: authUserToLicence(data.user),
  }
}

export async function forgotLicenceKey(email: string) {
  return postJson<{
    message: string
    email: string
  }>('/api/auth/forgot-key', { email })
}
