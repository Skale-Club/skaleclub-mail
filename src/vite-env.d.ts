/// <reference types="vite/client" />

interface Window {
    __APP_CONFIG__?: {
        VITE_SUPABASE_URL?: string
        VITE_SUPABASE_ANON_KEY?: string
        VITE_APP_NAME?: string
    }
}
