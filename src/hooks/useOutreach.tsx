import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface OutreachState {
    isEnabled: boolean
    isLoading: boolean
}

export function useOutreach(): OutreachState {
    const [state, setState] = useState<OutreachState>({
        isEnabled: true,
        isLoading: true,
    })

    useEffect(() => {
        async function checkOutreach() {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (!session?.access_token) {
                    setState({ isEnabled: false, isLoading: false })
                    return
                }

                const res = await fetch('/api/system/outreach', {
                    headers: { Authorization: `Bearer ${session.access_token}` },
                })

                if (res.ok) {
                    const data = await res.json()
                    setState({ isEnabled: data.outreach_enabled, isLoading: false })
                } else {
                    setState({ isEnabled: true, isLoading: false })
                }
            } catch {
                setState({ isEnabled: true, isLoading: false })
            }
        }

        checkOutreach()
    }, [])

    return state
}
