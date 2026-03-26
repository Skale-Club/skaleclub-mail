import { apiFetch, fetchWithAuth, ApiError } from '../lib/api'

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
    from: { name: string; email: string }
    to: { name: string; email: string }[]
    cc?: { name: string; email: string }[]
    bcc?: { name: string; email: string }[]
    subject: string
    bodyText?: string
    bodyHtml?: string
    snippet?: string
    date: string
    read: boolean
    starred: boolean
    attachments?: {
        id: string
        filename: string
        mimeType: string
        size: number
    }[]
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

export interface Signature {
    id: string
    mailboxId: string
    name: string
    content: string
    isDefault: boolean
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

    getFolders(mailboxId: string): Promise<{ folders: { name: string; count: number; unread: number }[] }> {
        return apiFetch(`/api/mail/${mailboxId}/folders`)
    },

    getMessages(
        mailboxId: string,
        folder: string,
        params?: { page?: number; limit?: number; search?: string }
    ): Promise<MessageListResponse> {
        const searchParams = new URLSearchParams()
        searchParams.set('folder', folder)
        if (params?.page) searchParams.set('page', String(params.page))
        if (params?.limit) searchParams.set('limit', String(params.limit))
        if (params?.search) searchParams.set('search', params.search)

        return apiFetch(`/api/mail/${mailboxId}/messages?${searchParams}`)
    },

    getMessage(mailboxId: string, messageId: string): Promise<{ message: Message }> {
        return apiFetch(`/api/mail/${mailboxId}/messages/${messageId}`)
    },

    updateMessage(
        mailboxId: string,
        messageId: string,
        data: { read?: boolean; starred?: boolean; labels?: string[] }
    ): Promise<{ message: Message }> {
        return apiFetch(`/api/mail/${mailboxId}/messages/${messageId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    },

    deleteMessage(mailboxId: string, messageId: string): Promise<void> {
        return apiFetch(`/api/mail/${mailboxId}/messages/${messageId}`, {
            method: 'DELETE',
        })
    },

    archiveMessage(mailboxId: string, messageId: string): Promise<void> {
        return apiFetch(`/api/mail/${mailboxId}/messages/${messageId}/archive`, {
            method: 'POST',
        })
    },

    moveMessage(mailboxId: string, messageId: string, folder: string): Promise<void> {
        return apiFetch(`/api/mail/${mailboxId}/messages/${messageId}/move`, {
            method: 'POST',
            body: JSON.stringify({ folder }),
        })
    },

    batchUpdate(
        mailboxId: string,
        messageIds: string[],
        action: 'read' | 'unread' | 'star' | 'unstar' | 'delete' | 'archive' | 'move',
        folder?: string
    ): Promise<void> {
        return apiFetch(`/api/mail/${mailboxId}/messages/batch`, {
            method: 'POST',
            body: JSON.stringify({ messageIds, action, folder }),
        })
    },

    async sendEmail(mailboxId: string, payload: SendEmailPayload): Promise<{ message: Message }> {
        const formData = new FormData()
        formData.append('to', JSON.stringify(payload.to))
        if (payload.cc) formData.append('cc', JSON.stringify(payload.cc))
        if (payload.bcc) formData.append('bcc', JSON.stringify(payload.bcc))
        formData.append('subject', payload.subject)
        if (payload.bodyText) formData.append('bodyText', payload.bodyText)
        if (payload.bodyHtml) formData.append('bodyHtml', payload.bodyHtml)
        if (payload.replyTo) formData.append('replyTo', payload.replyTo)
        if (payload.inReplyTo) formData.append('inReplyTo', payload.inReplyTo)
        if (payload.attachments) {
            payload.attachments.forEach(file => {
                formData.append('attachments', file)
            })
        }

        const response = await fetchWithAuth(`/api/mail/${mailboxId}/send`, {
            method: 'POST',
            body: formData,
        })
        if (!response.ok) {
            const error = await response.json()
            throw new ApiError(error.error || 'Failed to send email', response.status)
        }
        return response.json()
    },

    saveDraft(mailboxId: string, payload: SaveDraftPayload): Promise<{ draft: Message }> {
        return apiFetch(`/api/mail/${mailboxId}/save-draft`, {
            method: 'POST',
            body: JSON.stringify(payload),
        })
    },

    syncMailbox(mailboxId: string): Promise<void> {
        return apiFetch(`/api/mail/${mailboxId}/sync`, {
            method: 'POST',
        })
    },

    searchMessages(
        mailboxId: string,
        query: string,
        params?: { folder?: string; page?: number; limit?: number }
    ): Promise<MessageListResponse> {
        const searchParams = new URLSearchParams()
        searchParams.set('q', query)
        if (params?.folder) searchParams.set('folder', params.folder)
        if (params?.page) searchParams.set('page', String(params.page))
        if (params?.limit) searchParams.set('limit', String(params.limit))

        return apiFetch(`/api/mail/${mailboxId}/search?${searchParams}`)
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
}
