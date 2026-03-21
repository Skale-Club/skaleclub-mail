import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

const app = express()
const PORT = process.env.PORT || 9001

// Security middleware
app.use(helmet())
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:9000',
    credentials: true,
}))

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' },
})
app.use('/api/', limiter)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Auth middleware - extract user ID from Supabase JWT
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
)

app.use('/api', async (req, res, next) => {
    // Skip auth for auth routes
    if (req.path.startsWith('/auth')) {
        return next()
    }

    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
        return next()
    }

    try {
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error } = await supabase.auth.getUser(token)

        if (!error && user) {
            req.headers['x-user-id'] = user.id
        }
    } catch {
        // Continue without user context
    }

    next()
})

// API Routes
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import organizationRoutes from './routes/organizations'
import serverRoutes from './routes/servers'
import domainRoutes from './routes/domains'
import messageRoutes from './routes/messages'
import webhookRoutes from './routes/webhooks'
import credentialRoutes from './routes/credentials'
import routeRoutes from './routes/routes'
import systemRoutes from './routes/system'
import trackRoutes from './routes/track'

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/organizations', organizationRoutes)
app.use('/api/servers', serverRoutes)
app.use('/api/domains', domainRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/webhooks', webhookRoutes)
app.use('/api/credentials', credentialRoutes)
app.use('/api/routes', routeRoutes)
app.use('/api/system', systemRoutes)

// Public tracking endpoints — no auth, no rate-limit (high-volume pixel requests)
app.use('/t', trackRoutes)

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err.message)
    console.error('Stack:', err.stack)

    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    })
})

// 404 handler
app.use((req: express.Request, res: express.Response) => {
    res.status(404).json({ error: 'Not found' })
})

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📧 SkaleClub Mail API ready`)
})

export default app
