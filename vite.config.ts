import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY
const appName = process.env.VITE_APP_NAME || 'Skale Club Mail'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    define: {
        'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
        'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
        'import.meta.env.VITE_APP_NAME': JSON.stringify(appName),
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
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom'],
                    'vendor-router': ['wouter'],
                    'vendor-query': ['@tanstack/react-query'],
                    'vendor-ui': ['lucide-react', 'clsx', 'tailwind-merge'],
                    'vendor-quill': ['react-quill-new'],
                    'vendor-date': ['date-fns'],
                },
            },
        },
        chunkSizeWarningLimit: 500,
    },
})
