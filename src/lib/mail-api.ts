import { apiFetch } from '../lib/api'

interface RecipientInput {
    address: string
    name?: string
}

interface AttachmentInput {
    filename: string
    content: string
    contentType?: string
}

async function fileToBase64(file: File): Promise<string> {
    const buffer = await file.arrayBuffer()
    let binary = ''
    const bytes = new Uint8Array(buffer)

    for (let index = 0; index < bytes.length; index += 1) {
        binary += String.fromCharCode(bytes[index])
    }

    return btoa(binary)
}

function mapRecipients(recipients?: { name?: string; email: string }[]): RecipientInput[] | undefined {
    if (!recipients?.length) {
        return undefined
    }

    return recipients.map(recipient => ({
        address: recipient.email,
        ...(recipient.name ? { name: recipient.name } : {}),
    }))
}

async function mapAttachments(files?: File[]): Promise<AttachmentInput[] | undefined> {
    if (!files?.length) {
        return undefined
    }

    const attachments = await Promise.all(files.map(async file => ({
        filename: file.name,
        content: await fileToBase64(file),
        ...(file.type ? { contentType: file.type } : {}),
    })))

    return attachments
}

export interface Mailbox {
    id: string
    email: string
    displayName: string | null
    isDefault: boolean
    isActive: boolean
    lastSyncAt: string | null
    syncError: string | null
    provider?: 'gmail' | 'outlook' | 'yahoo' | 'icloud' | 'custom'
}

export interface Message {
    id: string
    mailboxId: string
    folder: string
    messageId: string
    inReplyTo?: string
    references?: string
    from: { name: string; email: string }
    to: { name: string; email: string }[]
    cc?: { name: string; email: string }[]
    bcc?: { name: string; email: string }[]
    subject: string
    bodyText?: string
    bodyHtml?: string
    plainBody?: string
    htmlBody?: string
    snippet?: string
    headers?: Record<string, string>
    date: string
    read: boolean
    starred: boolean
    attachments?: {
        id: string
        filename: string
        mimeType: string
        size: number
    }[]
    hasAttachments: boolean
    labels?: string[]
    createdAt: string
}

export interface MessageListResponse {
    messages: Message[]
    total: number
    hasMore: boolean
}

export interface SendEmailPayload {
    to: { name?: string; email: string }[]
    cc?: { name?: string; email: string }[]
    bcc?: { name?: string; email: string }[]
    subject: string
    bodyText?: string
    bodyHtml?: string
    replyTo?: string
    inReplyTo?: string
    references?: string
    attachments?: File[]
}

export interface SaveDraftPayload {
    to?: { name?: string; email: string }[]
    cc?: { name?: string; email: string }[]
    bcc?: { name?: string; email: string }[]
    subject?: string
    bodyText?: string
    bodyHtml?: string
    draftId?: string
}

export interface SendEmailResponse {
    success: boolean
    messageId: string
    message: string
}

export interface SaveDraftResponse {
    success: boolean
    messageId: string
    draftId: string
    message: string
}

export interface Signature {
    id: string
    mailboxId: string
    name: string
    content: string
    isDefault: boolean
    createdAt: string
    updatedAt: string
}

export interface ContactItem {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    company: string | null
    emailedCount: number
    lastEmailedAt: string | null
    createdAt: string
    updatedAt: string
}

export const mailApi = {
    getMailboxes(): Promise<{ mailboxes: Mailbox[] }> {
        return apiFetch('/api/mail/mailboxes')
    },

    getMailbox(id: string): Promise<{ mailbox: Mailbox }> {
        return apiFetch(`/api/mail/mailboxes/${id}`)
    },

    getFolders(mailboxId: string): Promise<{ folders: { id: string; name: string; remoteId?: string; type?: string; count: number; unread: number }[] }> {
        return apiFetch(`/api/mail/mailboxes/${mailboxId}/folders`)
    },

    getMessages(
        mailboxId: string,
        folderId: string,
        params?: { page?: number; limit?: number; search?: string }
    ): Promise<MessageListResponse> {
        const searchParams = new URLSearchParams()
        searchParams.set('folderId', folderId)
        if (params?.page !== undefined) searchParams.set('page', String(params.page))
        if (params?.limit !== undefined) searchParams.set('limit', String(params.limit))
        if (params?.search) searchParams.set('search', params.search)

        return apiFetch(`/api/mail/mailboxes/${mailboxId}/messages?${searchParams}`)
    },

    getMessage(mailboxId: string, messageId: string): Promise<{ message: Message }> {
        return apiFetch(`/api/mail/mailboxes/${mailboxId}/messages/${messageId}`)
    },

    updateMessage(
        mailboxId: string,
        messageId: string,
        data: { read?: boolean; starred?: boolean; labels?: string[] }
    ): Promise<{ message: Message }> {
        return apiFetch(`/api/mail/mailboxes/${mailboxId}/messages/${messageId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    },

    deleteMessage(mailboxId: string, messageId: string): Promise<void> {
        return apiFetch(`/api/mail/mailboxes/${mailboxId}/messages/${messageId}`, {
            method: 'DELETE',
        })
    },

    archiveMessage(mailboxId: string, messageId: string): Promise<void> {
        return apiFetch(`/api/mail/mailboxes/${mailboxId}/messages/${messageId}/archive`, {
            method: 'POST',
        })
    },

    spamMessage(mailboxId: string, messageId: string, isSpam: boolean): Promise<void> {
        return apiFetch(`/api/mail/mailboxes/${mailboxId}/messages/${messageId}/spam`, {
            method: 'POST',
            body: JSON.stringify({ isSpam }),
        })
    },

    moveMessage(mailboxId: string, messageId: string, folderId: string): Promise<void> {
        return apiFetch(`/api/mail/mailboxes/${mailboxId}/messages/${messageId}/move`, {
            method: 'POST',
            body: JSON.stringify({ folderId }),
        })
    },

    batchUpdate(
        mailboxId: string,
        messageIds: string[],
        action: 'read' | 'unread' | 'star' | 'unstar' | 'delete' | 'archive' | 'move' | 'spam' | 'unspam',
        folderId?: string
    ): Promise<void> {
        return apiFetch(`/api/mail/mailboxes/${mailboxId}/messages/batch`, {
            method: 'POST',
            body: JSON.stringify({ messageIds, action, folderId }),
        })
    },

    async sendEmail(mailboxId: string, payload: SendEmailPayload): Promise<SendEmailResponse> {
        return apiFetch(`/api/mail/mailboxes/${mailboxId}/send`, {
            method: 'POST',
            body: JSON.stringify({
                to: mapRecipients(payload.to),
                cc: mapRecipients(payload.cc),
                bcc: mapRecipients(payload.bcc),
                subject: payload.subject,
                plainBody: payload.bodyText,
                htmlBody: payload.bodyHtml,
                inReplyTo: payload.inReplyTo,
                references: payload.references,
                attachments: await mapAttachments(payload.attachments),
                saveToSent: true,
            }),
        })
    },

    saveDraft(mailboxId: string, payload: SaveDraftPayload): Promise<SaveDraftResponse> {
        return apiFetch(`/api/mail/mailboxes/${mailboxId}/save-draft`, {
            method: 'POST',
            body: JSON.stringify({
                to: mapRecipients(payload.to),
                cc: mapRecipients(payload.cc),
                bcc: mapRecipients(payload.bcc),
                subject: payload.subject,
                plainBody: payload.bodyText,
                htmlBody: payload.bodyHtml,
            }),
        })
    },

    syncMailbox(mailboxId: string): Promise<void> {
        return apiFetch(`/api/mail/mailboxes/${mailboxId}/sync`, {
            method: 'POST',
        })
    },

    searchMessages(
        mailboxId: string,
        query: string,
        params?: { folderId?: string; page?: number; limit?: number }
    ): Promise<MessageListResponse> {
        const searchParams = new URLSearchParams()
        searchParams.set('q', query)
        if (params?.folderId) searchParams.set('folderId', params.folderId)
        if (params?.page !== undefined) searchParams.set('page', String(params.page))
        if (params?.limit !== undefined) searchParams.set('limit', String(params.limit))

        return apiFetch(`/api/mail/mailboxes/${mailboxId}/search?${searchParams}`)
    },

    getSignatures(mailboxId: string): Promise<{ signatures: Signature[] }> {
        return apiFetch(`/api/mail/mailboxes/${mailboxId}/signatures`)
    },

    getDefaultSignature(mailboxId: string): Promise<{ signature: Signature | null }> {
        return apiFetch(`/api/mail/mailboxes/${mailboxId}/signatures/default`)
    },

    createSignature(
        mailboxId: string,
        data: { name: string; content: string; isDefault?: boolean }
    ): Promise<{ signature: Signature }> {
        return apiFetch(`/api/mail/mailboxes/${mailboxId}/signatures`, {
            method: 'POST',
            body: JSON.stringify(data),
        })
    },

    updateSignature(
        mailboxId: string,
        signatureId: string,
        data: { name?: string; content?: string; isDefault?: boolean }
    ): Promise<{ signature: Signature }> {
        return apiFetch(`/api/mail/mailboxes/${mailboxId}/signatures/${signatureId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    },

    deleteSignature(mailboxId: string, signatureId: string): Promise<void> {
        return apiFetch(`/api/mail/mailboxes/${mailboxId}/signatures/${signatureId}`, {
            method: 'DELETE',
        })
    },

    // Contacts API (user-scoped, not mailbox-scoped)
    getContacts(params?: { page?: number; limit?: number; search?: string }): Promise<{
        contacts: ContactItem[]
        total: number
        page: number
        limit: number
        hasMore: boolean
    }> {
        const searchParams = new URLSearchParams()
        if (params?.page !== undefined) searchParams.set('page', String(params.page))
        if (params?.limit !== undefined) searchParams.set('limit', String(params.limit))
        if (params?.search) searchParams.set('search', params.search)
        const qs = searchParams.toString()
        return apiFetch(`/api/mail/contacts${qs ? `?${qs}` : ''}`)
    },

    searchContacts(query: string): Promise<{ contacts: ContactItem[] }> {
        return apiFetch(`/api/mail/contacts/search?q=${encodeURIComponent(query)}`)
    },

    createContact(data: { email: string; firstName?: string; lastName?: string; company?: string }): Promise<{ contact: ContactItem }> {
        return apiFetch('/api/mail/contacts', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    },

    updateContact(id: string, data: { email?: string; firstName?: string; lastName?: string; company?: string }): Promise<{ contact: ContactItem }> {
        return apiFetch(`/api/mail/contacts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    },

    deleteContact(id: string): Promise<void> {
        return apiFetch(`/api/mail/contacts/${id}`, {
            method: 'DELETE',
        })
    },

    importContactsCsv(csvContent: string): Promise<{ imported: number; skipped: number; errors: string[]; total: number }> {
        return apiFetch('/api/mail/contacts/import-csv', {
            method: 'POST',
            body: JSON.stringify({ csvContent }),
        })
    },
}
