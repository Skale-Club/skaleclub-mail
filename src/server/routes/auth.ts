import { Router, Request, Response } from 'express'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const router = Router()

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const REFRESH_TOKEN_COOKIE_NAME = 'sb_refresh_token'
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
    const cookies: Record<string, string> = {}
    if (!cookieHeader) return cookies
    
    cookieHeader.split(';').forEach(cookie => {
        const [name, ...rest] = cookie.trim().split('=')
        if (name) {
            cookies[name.trim()] = rest.join('=').trim()
        }
    })
    return cookies
}

function setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: COOKIE_MAX_AGE,
        path: '/api/auth',
    })
}

function clearRefreshTokenCookie(res: Response) {
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/auth',
    })
}

const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
})

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
})

const resetPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
})

const updatePasswordSchema = z.object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
})

router.post('/register', (req: Request, res: Response) => {
    res.status(403).json({ error: 'Self-registration is disabled. Please contact an administrator.' })
})

router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = loginSchema.parse(req.body)

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            return res.status(401).json({ error: error.message })
        }

        setRefreshTokenCookie(res, data.session.refresh_token)

        res.json({
            message: 'Login successful',
            user: data.user,
            accessToken: data.session.access_token,
            expiresIn: data.session.expires_in,
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.post('/logout', async (req: Request, res: Response) => {
    try {
        const cookies = parseCookies(req.headers.cookie)
        const refreshToken = cookies[REFRESH_TOKEN_COOKIE_NAME]

        if (refreshToken) {
            try {
                await supabase.auth.refreshSession({ refresh_token: refreshToken })
                await supabase.auth.signOut()
            } catch {
                // Ignore errors during cleanup
            }
        }

        clearRefreshTokenCookie(res)
        res.json({ message: 'Logged out successfully' })
    } catch (error) {
        clearRefreshTokenCookie(res)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.get('/me', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' })
        }

        const token = authHeader.replace('Bearer ', '')

        const { data, error } = await supabase.auth.getUser(token)

        if (error) {
            return res.status(401).json({ error: error.message })
        }

        res.json({ user: data.user })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.post('/reset-password', async (req: Request, res: Response) => {
    try {
        const { email } = resetPasswordSchema.parse(req.body)

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
        })

        if (error) {
            return res.status(400).json({ error: error.message })
        }

        res.json({ message: 'Password reset email sent' })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.post('/update-password', async (req: Request, res: Response) => {
    try {
        const { password } = updatePasswordSchema.parse(req.body)
        const authHeader = req.headers.authorization

        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' })
        }

        const token = authHeader.replace('Bearer ', '')

        const userClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: { Authorization: `Bearer ${token}` },
            },
        })

        const { error } = await userClient.auth.updateUser({ password })

        if (error) {
            return res.status(400).json({ error: error.message })
        }

        res.json({ message: 'Password updated successfully' })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.post('/refresh', async (req: Request, res: Response) => {
    try {
        const cookies = parseCookies(req.headers.cookie)
        let refreshToken = cookies[REFRESH_TOKEN_COOKIE_NAME]

        if (!refreshToken) {
            refreshToken = req.body?.refreshToken
        }

        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token required' })
        }

        const { data, error } = await supabase.auth.refreshSession({
            refresh_token: refreshToken,
        })

        if (error || !data.session) {
            clearRefreshTokenCookie(res)
            return res.status(401).json({ error: error?.message || 'Session error' })
        }

        setRefreshTokenCookie(res, data.session.refresh_token)

        res.json({
            user: data.user,
            accessToken: data.session.access_token,
            expiresIn: data.session.expires_in,
        })
    } catch (error) {
        clearRefreshTokenCookie(res)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
