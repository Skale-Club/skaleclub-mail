import { defineConfig, loadEnv, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

function appConfigPlugin(config: {
    supabaseUrl: string
    supabaseAnonKey: string
    appName: string
}): Plugin {
    return {
        name: 'app-config-dev-endpoint',
        configureServer(server) {
            server.middlewares.use('/app-config.js', (_req, res) => {
                res.setHeader('Content-Type', 'application/javascript')
                res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
                res.end(`window.__APP_CONFIG__ = ${JSON.stringify({
                    VITE_SUPABASE_URL: config.supabaseUrl,
                    VITE_SUPABASE_ANON_KEY: config.supabaseAnonKey,
                    VITE_APP_NAME: config.appName,
                })};`)
            })
        },
    }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || ''
    const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || ''
    const appName = env.VITE_APP_NAME || 'Skale Club Mail'

    return {
        plugins: [
            react(),
            appConfigPlugin({ supabaseUrl, supabaseAnonKey, appName }),
        ],
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
    }
})
