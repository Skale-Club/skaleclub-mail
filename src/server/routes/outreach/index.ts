import { Router } from 'express'
import emailAccountsRouter from './email-accounts'
import leadsRouter from './leads'
import campaignsRouter from './campaigns'

const router = Router()

// Email Accounts routes
router.use('/email-accounts', emailAccountsRouter)

// Leads routes
router.use('/leads', leadsRouter)

// Campaigns routes
router.use('/campaigns', campaignsRouter)

export default router
