import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12

function getEncryptionKey(): Buffer {
    const secret = process.env.OUTLOOK_TOKEN_ENCRYPTION_KEY || process.env.JWT_SECRET

    if (!secret) {
        throw new Error('Missing OUTLOOK_TOKEN_ENCRYPTION_KEY (or JWT_SECRET fallback)')
    }

    return crypto.createHash('sha256').update(secret).digest()
}

export function encryptSecret(value: string): string {
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv)
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
    const tag = cipher.getAuthTag()

    return [
        iv.toString('base64url'),
        tag.toString('base64url'),
        encrypted.toString('base64url'),
    ].join('.')
}

export function decryptSecret(payload: string): string {
    const [ivPart, tagPart, encryptedPart] = payload.split('.')

    if (!ivPart || !tagPart || !encryptedPart) {
        throw new Error('Invalid encrypted payload')
    }

    const decipher = crypto.createDecipheriv(
        ALGORITHM,
        getEncryptionKey(),
        Buffer.from(ivPart, 'base64url')
    )
    decipher.setAuthTag(Buffer.from(tagPart, 'base64url'))

    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encryptedPart, 'base64url')),
        decipher.final(),
    ])

    return decrypted.toString('utf8')
}
