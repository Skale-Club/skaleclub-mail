import { simpleParser, ParsedMail } from 'mailparser'
import { decrypt } from '../../lib/crypto'
import type { Mailbox, MailMessage } from '../../db/schema'

interface ImapConfig {
    host: string
    port: number
    secure: boolean
    username: string
    password: string
}

interface SmtpConfig {
    host: string
    port: number
    secure: boolean
    username: string
    password: string
}

export function getImapConfig(mailbox: Mailbox): ImapConfig {
    return {
        host: mailbox.imapHost,
        port: mailbox.imapPort,
        secure: mailbox.imapSecure,
        username: mailbox.imapUsername,
        password: decrypt(mailbox.imapPasswordEncrypted),
    }
}

export function getSmtpConfig(mailbox: Mailbox): SmtpConfig {
    return {
        host: mailbox.smtpHost,
        port: mailbox.smtpPort,
        secure: mailbox.smtpSecure,
        username: mailbox.smtpUsername,
        password: decrypt(mailbox.smtpPasswordEncrypted),
    }
}

export interface ParsedEmail {
    messageId: string | null
    inReplyTo: string | null
    references: string | null
    subject: string | null
    from: { name: string | null; address: string | null }
    to: Array<{ name: string | null; address: string | null }>
    cc: Array<{ name: string | null; address: string | null }>
    bcc: Array<{ name: string | null; address: string | null }>
    plainBody: string | null
    htmlBody: string | null
    headers: Record<string, string>
    attachments: Array<{
        filename: string
        contentType: string
        size: number
        content: Buffer
    }>
    hasAttachments: boolean
    date: Date | null
}

export async function parseRawEmail(rawContent: Buffer | string): Promise<ParsedEmail> {
    const parsed: ParsedMail = await simpleParser(rawContent)

    return {
        messageId: parsed.messageId || null,
        inReplyTo: parsed.inReplyTo || null,
        references: parsed.references?.join(' ') || null,
        subject: parsed.subject || null,
        from: {
            name: parsed.from?.value[0]?.name || null,
            address: parsed.from?.value[0]?.address || null,
        },
        to: parsed.to?.value.map(v => ({ name: v.name || null, address: v.address || null })) || [],
        cc: parsed.cc?.value.map(v => ({ name: v.name || null, address: v.address || null })) || [],
        bcc: parsed.bcc?.value.map(v => ({ name: v.name || null, address: v.address || null })) || [],
        plainBody: parsed.text || null,
        htmlBody: parsed.html as string || null,
        headers: parsed.headers ? Object.fromEntries(parsed.headers) : {},
        attachments: parsed.attachments.map(att => ({
            filename: att.filename,
            contentType: att.contentType,
            size: att.size,
            content: att.content,
        })),
        hasAttachments: parsed.attachments.length > 0,
        date: parsed.date || null,
    }
}

export interface EmailListItem {
    id: string
    messageId: string | null
    subject: string | null
    from: { name: string | null; address: string | null }
    to: Array<{ name: string | null; address: string | null }>
    date: Date | null
    isRead: boolean
    isStarred: boolean
    hasAttachments: boolean
    snippet: string
    snippetPlain: string
}

export function createSnippet(parsed: ParsedEmail, maxLength = 150): { snippet: string; snippetPlain: string } {
    const body = parsed.plainBody || parsed.htmlBody || ''
    
    const plainSnippet = body
        .replace(/\s+/g, ' ')
        .replace(/<[^>]*>/g, '')
        .trim()
        .slice(0, maxLength)

    const htmlSnippet = parsed.htmlBody
        ? parsed.htmlBody
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, maxLength)
        : plainSnippet

    return {
        snippet: htmlSnippet,
        snippetPlain: plainSnippet,
    }
}

export function mailMessageToListItem(msg: MailMessage): EmailListItem {
    const toAddresses = (msg.toAddresses as Array<{ name?: string; address?: string }>) || []
    const { snippet, snippetPlain } = {
        snippet: msg.plainBody?.slice(0, 150) || msg.htmlBody?.slice(0, 150) || '',
        snippetPlain: msg.plainBody?.slice(0, 150) || '',
    }

    return {
        id: msg.id,
        messageId: msg.messageId,
        subject: msg.subject,
        from: { name: msg.fromName, address: msg.fromAddress },
        to: toAddresses.map(a => ({ name: a.name || null, address: a.address || null })),
        date: msg.receivedAt || msg.remoteDate || null,
        isRead: msg.isRead,
        isStarred: msg.isStarred,
        hasAttachments: msg.hasAttachments,
        snippet: snippet.replace(/<[^>]*>/g, '').slice(0, 150),
        snippetPlain,
    }
}
