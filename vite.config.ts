import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '', '')
    return {
        plugins: [react()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        define: {
            'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
            'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
            'import.meta.env.VITE_APP_NAME': JSON.stringify(env.VITE_APP_NAME),
        },
        server: {
            port: 9000,
            host: '127.0.0.1',
            proxy: {
                '/api': {
                    target: 'http://localhost:9001',
                    changeOrigin: true,
                },
            },
        },
        build: {
            outDir: 'dist/client',
            emptyOutDir: true,
        },
    }
})
