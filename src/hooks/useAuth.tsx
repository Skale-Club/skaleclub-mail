import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'

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

export function useAuth(): AuthState {
    const [user, setUser] = useState<User | null>(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    async function fetchProfile(token: string) {
        try {
            const res = await fetch('/api/users/profile', {
                cache: 'no-store',
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) {
                const data = await res.json()
                setIsAdmin(data.user?.isAdmin === true)
            } else {
                setIsAdmin(false)
            }
        } catch {
            setIsAdmin(false)
        }
    }

    useEffect(() => {
        const getSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (session?.user) {
                    setUser(session.user as User)
                    await fetchProfile(session.access_token)
                }
            } catch (error) {
                console.error('Error getting session:', error)
            } finally {
                setIsLoading(false)
            }
        }

        getSession()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
                    setUser(session.user as User)
                    await fetchProfile(session.access_token)
                } else if (event === 'SIGNED_OUT') {
                    setUser(null)
                    setIsAdmin(false)
                }
            }
        )

        return () => {
            subscription?.unsubscribe()
        }
    }, [])

    return { user, isAdmin, isLoading }
}

// Context for providing auth state
import { createContext, useContext } from 'react'

interface AuthContextType {
    user: User | null
    isAdmin: boolean
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAdmin: false,
    isLoading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const auth = useAuth()
    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuthContext() {
    return useContext(AuthContext)
}
