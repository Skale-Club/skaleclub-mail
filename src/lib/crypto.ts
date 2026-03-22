import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

const ALGORITHM = 'aes-256-gcm'

function getKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY
    if (!key) {
        throw new Error('ENCRYPTION_KEY environment variable is required')
    }
    return scryptSync(key, 'skaleclub-salt', 32)
}

export function encrypt(plaintext: string): string {
    const iv = randomBytes(16)
    const key = getKey()
    const cipher = createCipheriv(ALGORITHM, key, iv)
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()
    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

export function decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':')
    
    if (parts.length !== 3) {
        throw new Error('Invalid encrypted text format')
    }
    
    const [ivHex, authTagHex, encrypted] = parts
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    const key = getKey()
    
    const decipher = createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
}
