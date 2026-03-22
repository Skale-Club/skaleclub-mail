import { Router } from 'express'
import mailboxRoutes from './mailboxes'
import messageRoutes from './messages'
import sendRoutes from './send'
import syncRoutes from './sync'

const router = Router()

router.use('/mailboxes', mailboxRoutes)
router.use('/mail/mailboxes', messageRoutes)
router.use('/mail/mailboxes', sendRoutes)
router.use('/mail/mailboxes', syncRoutes)

export default router
