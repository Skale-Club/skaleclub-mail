import { Router, Request, Response } from 'express'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const router = Router()

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Validation schemas
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

// Public registration is disabled — only admins can create users via /api/users
router.post('/register', (req: Request, res: Response) => {
    res.status(403).json({ error: 'Self-registration is disabled. Please contact an administrator.' })
})

// Login
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

        res.json({
            message: 'Login successful',
            session: data.session,
            user: data.user,
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Logout
router.post('/logout', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' })
        }

        const token = authHeader.replace('Bearer ', '')

        const { error } = await supabase.auth.admin.signOut(token)

        if (error) {
            return res.status(400).json({ error: error.message })
        }

        res.json({ message: 'Logged out successfully' })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Get current user
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

// Request password reset
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

// Update password
router.post('/update-password', async (req: Request, res: Response) => {
    try {
        const { password } = updatePasswordSchema.parse(req.body)
        const authHeader = req.headers.authorization

        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' })
        }

        const token = authHeader.replace('Bearer ', '')

        // Create a new Supabase client with the user's token
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

// Refresh token
router.post('/refresh', async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body

        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token required' })
        }

        const { data, error } = await supabase.auth.refreshSession({
            refresh_token: refreshToken,
        })

        if (error) {
            return res.status(401).json({ error: error.message })
        }

        res.json({
            session: data.session,
        })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
