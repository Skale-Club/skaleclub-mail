import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { apiFetch } from '../lib/api-client'

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

    async function fetchProfile() {
        try {
            const data = await apiFetch<{ user?: { isAdmin?: boolean } }>('/api/users/profile')
            setIsAdmin(data.user?.isAdmin === true)
        } catch {
            setIsAdmin(false)
        }
    }

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const { data: { user: authUser }, error } = await supabase.auth.getUser()

                if (error) {
                    throw error
                }

                if (authUser) {
                    setUser(authUser as User)
                    await fetchProfile()
                } else {
                    setUser(null)
                    setIsAdmin(false)
                }
            } catch (error) {
                console.error('Error getting session:', error)
            } finally {
                setIsLoading(false)
            }
        }

        void initializeAuth()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
                    setUser(session.user as User)
                    await fetchProfile()
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
