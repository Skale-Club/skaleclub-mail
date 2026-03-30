export interface StoredSession {
    userId: string
    email: string
    accessToken: string
    refreshToken: string
    userMetadata: {
        firstName?: string
        lastName?: string
        avatarUrl?: string
    }
}

export interface SessionInfo {
    userId: string
    email: string
    userMetadata: StoredSession['userMetadata']
}

const SESSIONS_KEY = 'skaleclub-sessions'
const ACTIVE_SESSION_KEY = 'skaleclub-active-session'

function isBrowser(): boolean {
    return typeof window !== 'undefined'
}

export function getStoredSessions(): StoredSession[] {
    if (!isBrowser()) return []
    try {
        const raw = localStorage.getItem(SESSIONS_KEY)
        if (!raw) return []
        return JSON.parse(raw) as StoredSession[]
    } catch {
        return []
    }
}

export function addStoredSession(session: StoredSession): void {
    const sessions = getStoredSessions()
    const existing = sessions.findIndex(s => s.userId === session.userId)
    if (existing >= 0) {
        sessions[existing] = session
    } else {
        sessions.push(session)
    }
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}

export function updateStoredSessionTokens(userId: string, accessToken: string, refreshToken: string): void {
    const sessions = getStoredSessions()
    const idx = sessions.findIndex(s => s.userId === userId)
    if (idx >= 0) {
        sessions[idx].accessToken = accessToken
        sessions[idx].refreshToken = refreshToken
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
    }
}

export function removeStoredSession(userId: string): void {
    const sessions = getStoredSessions().filter(s => s.userId !== userId)
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}

export function getActiveSessionId(): string | null {
    if (!isBrowser()) return null
    return localStorage.getItem(ACTIVE_SESSION_KEY)
}

export function setActiveSessionId(userId: string): void {
    if (!isBrowser()) return
    localStorage.setItem(ACTIVE_SESSION_KEY, userId)
}

export function clearAllSessions(): void {
    if (!isBrowser()) return
    localStorage.removeItem(SESSIONS_KEY)
    localStorage.removeItem(ACTIVE_SESSION_KEY)
}

export function toSessionInfo(session: StoredSession): SessionInfo {
    return {
        userId: session.userId,
        email: session.email,
        userMetadata: session.userMetadata,
    }
}

export function supabaseSessionToStored(session: { access_token: string; refresh_token: string; user: { id: string; email?: string; user_metadata?: { firstName?: string; lastName?: string; avatarUrl?: string } } }): StoredSession {
    return {
        userId: session.user.id,
        email: session.user.email ?? '',
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        userMetadata: {
            firstName: session.user.user_metadata?.firstName,
            lastName: session.user.user_metadata?.lastName,
            avatarUrl: session.user.user_metadata?.avatarUrl,
        },
    }
}
