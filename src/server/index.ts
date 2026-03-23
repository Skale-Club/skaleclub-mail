import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { createClient } from '@supabase/supabase-js'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { users } from '../db/schema'
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
import templateRoutes from './routes/templates'
import outreachRoutes from './routes/outreach'
import outlookRoutes from './routes/outlook'
import mailRoutes from './routes/mail'
import nativeMailboxRoutes from './routes/native-mailboxes'
import { createSMTPServer } from './smtp-server'
import { createIMAPServer } from './imap-server'

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet())
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:9000',
    credentials: true,
}))

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' },
})
app.use('/api/', limiter)

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many authentication attempts, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
})
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/reset-password', authLimiter)

const trackingLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' },
})
app.use('/t/', trackingLimiter)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
)

const PUBLIC_PATHS = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/reset-password',
    '/api/auth/refresh',
]

app.use('/api', async (req, res, next) => {
    const path = req.path

    if (PUBLIC_PATHS.some(p => path === p)) {
        return next()
    }

    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
        return res.status(401).json({ error: 'Invalid or expired token' })
    }

    req.headers['x-user-id'] = user.id

    const existing = await db.query.users.findFirst({
        where: eq(users.id, user.id),
    })

    if (!existing) {
        await db.insert(users).values({
            id: user.id,
            email: user.email!,
            firstName: user.user_metadata?.firstName || null,
            lastName: user.user_metadata?.lastName || null,
            isAdmin: false,
            emailVerified: true,
        })
    }

    next()
})

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
app.use('/api/templates', templateRoutes)
app.use('/api/outreach', outreachRoutes)
app.use('/api/outlook', outlookRoutes)
app.use('/api/mail', mailRoutes)
app.use('/api/native-mailboxes', nativeMailboxRoutes)

app.use('/t', trackRoutes)

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Error:', err.message)
    console.error('Stack:', err.stack)

    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    })
})

app.use((_req: express.Request, res: express.Response) => {
    res.status(404).json({ error: 'Not found' })
})

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
        console.log('SkaleClub Mail API ready')

        import('./jobs').then(({ startSyncWorker }) => startSyncWorker())

        // Start native SMTP + IMAP servers
        const smtpServer = createSMTPServer()
        const imapServer = createIMAPServer()
        smtpServer.start()
        imapServer.start()
    })
}

export default app
