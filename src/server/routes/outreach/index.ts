import { Router } from 'express'
import emailAccountsRouter from './email-accounts'
import leadsRouter from './leads'
import campaignsRouter from './campaigns'
import { isPlatformAdmin } from '../../lib/admin'

const router = Router()

router.use(async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'] as string | undefined

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        if (!await isPlatformAdmin(userId)) {
            return res.status(403).json({ error: 'Forbidden' })
        }

        next()
    } catch (error) {
        console.error('Error in outreach admin middleware:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Email Accounts routes
router.use('/email-accounts', emailAccountsRouter)

// Leads routes
router.use('/leads', leadsRouter)

// Campaigns routes
router.use('/campaigns', campaignsRouter)

export default router
