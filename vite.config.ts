import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ulzqxfeodxkyawfhjtpm.supabase.co'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsenF4ZmVvZHhreWF3ZmhqdHBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMTQ0NjYsImV4cCI6MjA4OTY5MDQ2Nn0.qb6G26CEIY-0HQ-9oxo1wSh7kvUNdSE13eR40io8VtU'
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
