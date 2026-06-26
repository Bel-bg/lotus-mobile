import { AuthUser, LicenceStatut } from '../../types'
import { getDB, initDB } from './schema'

export interface LocalAuthSession {
  token: string
  user: AuthUser
}

interface AuthSessionRow {
  token: string | null
  user_id: string | null
  email: string | null
  display_name: string | null
  phone: string | null
  license_key: string | null
  license_type: string | null
  license_status: string | null
  expiration_date: string | null
  user_json: string | null
}

export function mapBackendStatus(status?: string | null): LicenceStatut {
  switch ((status ?? '').toUpperCase()) {
    case 'ACTIVE':
      return 'actif'
    case 'EXPIRED':
      return 'expire'
    case 'SUSPENDED':
      return 'suspendu'
    default:
      return 'non_autorise'
  }
}

export function isExpirationPast(expirationDate?: string | null): boolean {
  if (!expirationDate) return false
  const expiration = new Date(expirationDate)
  if (Number.isNaN(expiration.getTime())) return false
  return expiration.getTime() < Date.now()
}

export async function saveAuthSession(session: LocalAuthSession): Promise<void> {
  await initDB()
  const db = getDB()
  const displayName = [session.user.firstName, session.user.lastName].filter(Boolean).join(' ')

  await db.runAsync(
    `
      INSERT OR REPLACE INTO auth_session (
        id, token, user_id, email, display_name, phone, license_key,
        license_type, license_status, expiration_date, user_json, updated_at
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      session.token,
      session.user.id,
      session.user.email,
      displayName,
      session.user.phone ?? null,
      session.user.licenseKey,
      session.user.licenseType,
      session.user.licenseStatus,
      session.user.expirationDate,
      JSON.stringify(session.user),
      new Date().toISOString(),
    ],
  )
}

export async function getAuthSession(): Promise<LocalAuthSession | null> {
  await initDB()
  const db = getDB()
  const row = await db.getFirstAsync<AuthSessionRow>(
    'SELECT * FROM auth_session WHERE id = 1',
  )

  if (!row?.token || !row.user_json) return null

  try {
    return {
      token: row.token,
      user: JSON.parse(row.user_json) as AuthUser,
    }
  } catch {
    if (!row.user_id || !row.email || !row.license_key || !row.expiration_date) {
      return null
    }

    return {
      token: row.token,
      user: {
        id: row.user_id,
        email: row.email,
        phone: row.phone ?? undefined,
        firstName: row.display_name ?? undefined,
        licenseKey: row.license_key,
        licenseType: row.license_type ?? 'FREE',
        licenseStatus: row.license_status ?? 'ACTIVE',
        expirationDate: row.expiration_date,
      },
    }
  }
}

export async function clearAuthSession(): Promise<void> {
  await initDB()
  await getDB().runAsync('DELETE FROM auth_session WHERE id = 1')
}

export async function getLocalLicenceStatus(): Promise<LicenceStatut | null> {
  const session = await getAuthSession()
  if (!session) return null

  const backendStatus = mapBackendStatus(session.user.licenseStatus)
  if (backendStatus === 'suspendu') return 'suspendu'
  if (backendStatus === 'expire' || isExpirationPast(session.user.expirationDate)) {
    return 'expire'
  }

  return backendStatus === 'actif' ? 'actif' : 'non_autorise'
}
