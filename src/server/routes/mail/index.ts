import { Router } from 'express'
import mailboxRoutes from './mailboxes'
import messageRoutes from './messages'
import sendRoutes from './send'
import syncRoutes from './sync'
import filterRoutes from './filters'
import signatureRoutes from './signatures'
import contactRoutes from './contacts'

const router = Router()

router.use('/mailboxes', mailboxRoutes)
router.use('/mailboxes', messageRoutes)
router.use('/mailboxes', sendRoutes)
router.use('/mailboxes', syncRoutes)
router.use('/mailboxes', filterRoutes)
router.use('/mailboxes', signatureRoutes)
router.use('/contacts', contactRoutes)

export default router