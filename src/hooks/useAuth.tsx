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
    isLoading: boolean
}

export function useAuth(): AuthState {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Get initial session
        const getSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (session?.user) {
                    setUser(session.user as User)
                }
            } catch (error) {
                console.error('Error getting session:', error)
            } finally {
                setIsLoading(false)
            }
        }

        getSession()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    setUser(session.user as User)
                } else if (event === 'SIGNED_OUT') {
                    setUser(null)
                }
            }
        )

        return () => {
            subscription?.unsubscribe()
        }
    }, [])

    return { user, isLoading }
}

// Context for providing auth state
import { createContext, useContext } from 'react'

interface AuthContextType {
    user: User | null
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
    user: null,
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
