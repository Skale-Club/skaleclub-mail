import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { Session } from '@supabase/supabase-js'

import { useEffect } from 'react'

interface AuthState {
    user: User | null
    session: Session | null
    isLoading: boolean
    error: string | null
}

export const useAuth = () => {
    const [state, setState] = useState<AuthState>({
        user: null,
        session: null,
        isLoading: true,
        error: null,
    })

    useEffect(() => {
        const initializeSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()

                if (session) {
                    setState({
                        session,
                        user: session.user,
                        isLoading: false,
                    })
                } else {
                    setState({
                        user: null,
                        session: null,
                        isLoading: false,
                    })
                }
            } catch (error) {
                setState({
                    error: error instanceof Error ? error.message : 'Failed to get session',
                    isLoading: false,
                })
            }
        }

        initializeSession()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (event === 'SIGNED_IN' && session) {
                    setState({
                        session,
                        user: session.user,
                    })
                } else if (event === 'SIGNED_OUT') {
                    setState({
                        user: null,
                        session: null,
                    })
                }
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const logout = async () => {
        try {
            setState({ isLoading: true })
            const { error } = await supabase.auth.signOut()
            if (error) {
                setState({
                    error: error.message,
                    isLoading: false,
                })
            } else {
                setState({
                    user: null,
                    session: null,
                    isLoading: false,
                })
            }
        } catch (error) {
            setState({
                error: error instanceof Error ? error.message : 'Failed to logout',
                isLoading: false,
            })
        }
    }

    return {
        user: state.user,
        session: state.session,
        isLoading: state.isLoading,
        error: state.error,
        logout,
    }
}
