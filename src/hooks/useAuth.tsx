import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiFetch, clearTokenCache } from '../lib/api-client'
import { supabase } from '../lib/supabase'

interface User {
    id: string
    email: string
    user_metadata?: {
        firstName?: string
        lastName?: string
    }
}

interface AuthState {
    user: User | null
    isAdmin: boolean
    isLoading: boolean
}

const AuthContext = createContext<AuthState>({
    user: null,
    isAdmin: false,
    isLoading: true,
})

function useProvideAuth(): AuthState {
    const [user, setUser] = useState<User | null>(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    async function fetchProfile(token?: string) {
        try {
            const controller = new AbortController()
            const timeout = window.setTimeout(() => controller.abort(), 10_000)
            const data = await apiFetch<{ user?: { isAdmin?: boolean } }>('/api/users/profile', {
                auth: !token,
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                signal: controller.signal,
                retry: false,
            })
            window.clearTimeout(timeout)
            setIsAdmin(data.user?.isAdmin === true)
        } catch {
            setIsAdmin(false)
        }
    }

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // Race against a timeout so the app never stays on the spinner forever
                const sessionResult = await Promise.race([
                    supabase.auth.getSession(),
                    new Promise<never>((_, reject) =>
                        window.setTimeout(() => reject(new Error('Session timeout')), 10_000)
                    ),
                ])

                const { data: { session }, error } = sessionResult

                if (error) throw error

                if (session?.user) {
                    setUser(session.user as User)
                    await fetchProfile(session.access_token)
                } else {
                    setUser(null)
                    setIsAdmin(false)
                }
            } catch (error) {
                console.error('Error getting session:', error)
                setUser(null)
                setIsAdmin(false)
            } finally {
                setIsLoading(false)
            }
        }

        void initializeAuth()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
                    setUser(session.user as User)
                    await fetchProfile(session.access_token)
                } else if (event === 'SIGNED_OUT') {
                    setUser(null)
                    setIsAdmin(false)
                    clearTokenCache()
                }

                setIsLoading(false)
            }
        )

        return () => {
            subscription?.unsubscribe()
        }
    }, [])

    return { user, isAdmin, isLoading }
}

export function useAuth(): AuthState {
    return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const auth = useProvideAuth()
    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuthContext() {
    return useAuth()
}
