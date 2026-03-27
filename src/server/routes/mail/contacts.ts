import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { db } from '../../../db'
import { contacts } from '../../../db/schema'
import { eq, and, or, ilike, sql, desc } from 'drizzle-orm'

const router = Router()

function detectDelimiter(firstLine: string): string {
    const commaCount = (firstLine.match(/,/g) || []).length
    const semicolonCount = (firstLine.match(/;/g) || []).length
    return semicolonCount > commaCount ? ';' : ','
}

function parseCsvLine(line: string, delimiter: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
        const char = line[i]

        if (inQuotes) {
            if (char === '"') {
                if (i + 1 < line.length && line[i + 1] === '"') {
                    current += '"'
                    i++
                } else {
                    inQuotes = false
                }
            } else {
                current += char
            }
        } else {
            if (char === '"') {
                inQuotes = true
            } else if (char === delimiter) {
                result.push(current.trim())
                current = ''
            } else {
                current += char
            }
        }
    }

    result.push(current.trim())
    return result
}

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// List contacts
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        if (!userId) return res.status(401).json({ error: 'Unauthorized' })

        const page = Math.max(1, parseInt(req.query.page as string) || 1)
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50))
        const search = (req.query.search as string || '').trim()
        const offset = (page - 1) * limit

        const conditions = [eq(contacts.userId, userId)]
        if (search) {
            conditions.push(
                or(
                    ilike(contacts.email, `%${search}%`),
                    ilike(contacts.firstName, `%${search}%`),
                    ilike(contacts.lastName, `%${search}%`),
                    ilike(contacts.company, `%${search}%`),
                )!
            )
        }

        const where = and(...conditions)

        const [items, [{ count }]] = await Promise.all([
            db.select()
                .from(contacts)
                .where(where)
                .orderBy(desc(contacts.lastEmailedAt), desc(contacts.createdAt))
                .limit(limit)
                .offset(offset),
            db.select({ count: sql<number>`count(*)` })
                .from(contacts)
                .where(where),
        ])

        const total = Number(count)

        res.json({
            contacts: items,
            total,
            page,
            limit,
            hasMore: offset + items.length < total,
        })
    } catch (error) {
        console.error('Error listing contacts:', error)
        res.status(500).json({ error: 'Failed to list contacts' })
    }
})

// Autocomplete search (fast, limited results)
router.get('/search', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        if (!userId) return res.status(401).json({ error: 'Unauthorized' })

        const query = (req.query.q as string || '').trim()
        if (!query || query.length < 1) {
            return res.json({ contacts: [] })
        }

        const results = await db.select({
            id: contacts.id,
            email: contacts.email,
            firstName: contacts.firstName,
            lastName: contacts.lastName,
            company: contacts.company,
        })
            .from(contacts)
            .where(
                and(
                    eq(contacts.userId, userId),
                    or(
                        ilike(contacts.email, `%${query}%`),
                        ilike(contacts.firstName, `%${query}%`),
                        ilike(contacts.lastName, `%${query}%`),
                    )!
                )
            )
            .orderBy(desc(contacts.emailedCount), desc(contacts.lastEmailedAt))
            .limit(10)

        res.json({ contacts: results })
    } catch (error) {
        console.error('Error searching contacts:', error)
        res.status(500).json({ error: 'Failed to search contacts' })
    }
})

// Create contact
router.post('/', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        if (!userId) return res.status(401).json({ error: 'Unauthorized' })

        const schema = z.object({
            email: z.string().email(),
            firstName: z.string().optional(),
            lastName: z.string().optional(),
            company: z.string().optional(),
        })

        const data = schema.parse(req.body)

        const [contact] = await db.insert(contacts).values({
            userId,
            email: data.email.toLowerCase(),
            firstName: data.firstName || null,
            lastName: data.lastName || null,
            company: data.company || null,
        }).onConflictDoNothing().returning()

        if (!contact) {
            return res.status(409).json({ error: 'Contact already exists' })
        }

        res.status(201).json({ contact })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }
        console.error('Error creating contact:', error)
        res.status(500).json({ error: 'Failed to create contact' })
    }
})

// Update contact
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        if (!userId) return res.status(401).json({ error: 'Unauthorized' })

        const contactId = req.params.id

        const schema = z.object({
            email: z.string().email().optional(),
            firstName: z.string().optional(),
            lastName: z.string().optional(),
            company: z.string().optional(),
        })

        const data = schema.parse(req.body)

        const updateData: Record<string, unknown> = { updatedAt: new Date() }
        if (data.email !== undefined) updateData.email = data.email.toLowerCase()
        if (data.firstName !== undefined) updateData.firstName = data.firstName
        if (data.lastName !== undefined) updateData.lastName = data.lastName
        if (data.company !== undefined) updateData.company = data.company

        const [updated] = await db.update(contacts)
            .set(updateData)
            .where(and(
                eq(contacts.id, contactId),
                eq(contacts.userId, userId),
            ))
            .returning()

        if (!updated) {
            return res.status(404).json({ error: 'Contact not found' })
        }

        res.json({ contact: updated })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }
        console.error('Error updating contact:', error)
        res.status(500).json({ error: 'Failed to update contact' })
    }
})

// Delete contact
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        if (!userId) return res.status(401).json({ error: 'Unauthorized' })

        const contactId = req.params.id

        const [deleted] = await db.delete(contacts)
            .where(and(
                eq(contacts.id, contactId),
                eq(contacts.userId, userId),
            ))
            .returning()

        if (!deleted) {
            return res.status(404).json({ error: 'Contact not found' })
        }

        res.json({ success: true })
    } catch (error) {
        console.error('Error deleting contact:', error)
        res.status(500).json({ error: 'Failed to delete contact' })
    }
})

// Import CSV
router.post('/import-csv', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        if (!userId) return res.status(401).json({ error: 'Unauthorized' })

        const schema = z.object({
            csvContent: z.string().min(1),
        })

        const { csvContent } = schema.parse(req.body)

        const lines = csvContent.split(/\r?\n/).filter(line => line.trim())
        if (lines.length === 0) {
            return res.status(400).json({ error: 'CSV file is empty' })
        }

        const delimiter = detectDelimiter(lines[0])
        const firstLineFields = parseCsvLine(lines[0], delimiter)

        const lowerFirst = firstLineFields.map(f => f.toLowerCase())
        const hasHeader = lowerFirst.includes('email')

        const emailIdx = lowerFirst.indexOf('email')
        const firstNameIdx = lowerFirst.indexOf('firstname') !== -1
            ? lowerFirst.indexOf('firstname')
            : lowerFirst.indexOf('first_name') !== -1
                ? lowerFirst.indexOf('first_name')
                : lowerFirst.indexOf('first name')
        const lastNameIdx = lowerFirst.indexOf('lastname') !== -1
            ? lowerFirst.indexOf('lastname')
            : lowerFirst.indexOf('last_name') !== -1
                ? lowerFirst.indexOf('last_name')
                : lowerFirst.indexOf('last name')
        const companyIdx = lowerFirst.indexOf('company')

        const startLine = hasHeader ? 1 : 0
        let imported = 0
        let skipped = 0
        const errors: string[] = []

        const batchValues: Array<{
            userId: string
            email: string
            firstName: string | null
            lastName: string | null
            company: string | null
        }> = []

        for (let i = startLine; i < lines.length; i++) {
            const fields = parseCsvLine(lines[i], delimiter)

            const email = hasHeader
                ? (emailIdx >= 0 ? fields[emailIdx] : fields[0])
                : fields[0]

            if (!email || !isValidEmail(email)) {
                if (email) errors.push(`Line ${i + 1}: Invalid email "${email}"`)
                skipped++
                continue
            }

            const firstName = hasHeader && firstNameIdx >= 0 ? (fields[firstNameIdx] || null) : (fields[1] || null)
            const lastName = hasHeader && lastNameIdx >= 0 ? (fields[lastNameIdx] || null) : (fields[2] || null)
            const company = hasHeader && companyIdx >= 0 ? (fields[companyIdx] || null) : (fields[3] || null)

            batchValues.push({
                userId,
                email: email.toLowerCase(),
                firstName: firstName || null,
                lastName: lastName || null,
                company: company || null,
            })
        }

        if (batchValues.length > 0) {
            const inserted = await db.insert(contacts)
                .values(batchValues)
                .onConflictDoNothing()
                .returning({ id: contacts.id })

            imported = inserted.length
            skipped += batchValues.length - imported
        }

        res.json({
            imported,
            skipped,
            errors: errors.slice(0, 50),
            total: batchValues.length,
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }
        console.error('Error importing CSV:', error)
        res.status(500).json({ error: 'Failed to import CSV' })
    }
})

// Export contacts as CSV
router.get('/export', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        if (!userId) return res.status(401).json({ error: 'Unauthorized' })

        const items = await db.select()
            .from(contacts)
            .where(eq(contacts.userId, userId))
            .orderBy(contacts.email)

        const header = 'email,firstName,lastName,company'
        const rows = items.map(c => {
            const escape = (val: string | null) => {
                if (!val) return ''
                if (val.includes(',') || val.includes('"') || val.includes('\n')) {
                    return `"${val.replace(/"/g, '""')}"`
                }
                return val
            }
            return `${escape(c.email)},${escape(c.firstName)},${escape(c.lastName)},${escape(c.company)}`
        })

        const csv = [header, ...rows].join('\n')

        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', 'attachment; filename="contacts.csv"')
        res.send(csv)
    } catch (error) {
        console.error('Error exporting contacts:', error)
        res.status(500).json({ error: 'Failed to export contacts' })
    }
})

export default router
