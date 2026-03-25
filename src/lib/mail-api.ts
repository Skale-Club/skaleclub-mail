import { supabase } from '../lib/supabase'

async function mailFetch(url: string, init: RequestInit = {}): Promise<Response> {
    const { data: { session } } = await supabase.auth.getSession()
    return fetch(url, {
        cache: 'no-store',
        ...init,
        headers: {
            Authorization: `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
            ...(init.headers || {}),
        },
    })
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
    async getMailboxes(): Promise<{ mailboxes: Mailbox[] }> {
        const response = await mailFetch('/api/mail/mailboxes')
        if (!response.ok) throw new Error('Failed to fetch mailboxes')
        return response.json()
    },

    async getMailbox(id: string): Promise<{ mailbox: Mailbox }> {
        const response = await mailFetch(`/api/mail/mailboxes/${id}`)
        if (!response.ok) throw new Error('Failed to fetch mailbox')
        return response.json()
    },

    async getFolders(mailboxId: string): Promise<{ folders: { name: string; count: number; unread: number }[] }> {
        const response = await mailFetch(`/api/mail/${mailboxId}/folders`)
        if (!response.ok) throw new Error('Failed to fetch folders')
        return response.json()
    },

    async getMessages(
        mailboxId: string,
        folder: string,
        params?: { page?: number; limit?: number; search?: string }
    ): Promise<MessageListResponse> {
        const searchParams = new URLSearchParams()
        searchParams.set('folder', folder)
        if (params?.page) searchParams.set('page', String(params.page))
        if (params?.limit) searchParams.set('limit', String(params.limit))
        if (params?.search) searchParams.set('search', params.search)

        const response = await mailFetch(`/api/mail/${mailboxId}/messages?${searchParams}`)
        if (!response.ok) throw new Error('Failed to fetch messages')
        return response.json()
    },

    async getMessage(mailboxId: string, messageId: string): Promise<{ message: Message }> {
        const response = await mailFetch(`/api/mail/${mailboxId}/messages/${messageId}`)
        if (!response.ok) throw new Error('Failed to fetch message')
        return response.json()
    },

    async updateMessage(
        mailboxId: string,
        messageId: string,
        data: { read?: boolean; starred?: boolean; labels?: string[] }
    ): Promise<{ message: Message }> {
        const response = await mailFetch(`/api/mail/${mailboxId}/messages/${messageId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
        if (!response.ok) throw new Error('Failed to update message')
        return response.json()
    },

    async deleteMessage(mailboxId: string, messageId: string): Promise<void> {
        const response = await mailFetch(`/api/mail/${mailboxId}/messages/${messageId}`, {
            method: 'DELETE',
        })
        if (!response.ok) throw new Error('Failed to delete message')
    },

    async archiveMessage(mailboxId: string, messageId: string): Promise<void> {
        const response = await mailFetch(`/api/mail/${mailboxId}/messages/${messageId}/archive`, {
            method: 'POST',
        })
        if (!response.ok) throw new Error('Failed to archive message')
    },

    async moveMessage(mailboxId: string, messageId: string, folder: string): Promise<void> {
        const response = await mailFetch(`/api/mail/${mailboxId}/messages/${messageId}/move`, {
            method: 'POST',
            body: JSON.stringify({ folder }),
        })
        if (!response.ok) throw new Error('Failed to move message')
    },

    async batchUpdate(
        mailboxId: string,
        messageIds: string[],
        action: 'read' | 'unread' | 'star' | 'unstar' | 'delete' | 'archive' | 'move',
        folder?: string
    ): Promise<void> {
        const response = await mailFetch(`/api/mail/${mailboxId}/messages/batch`, {
            method: 'POST',
            body: JSON.stringify({ messageIds, action, folder }),
        })
        if (!response.ok) throw new Error('Failed to batch update messages')
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

        const response = await mailFetch(`/api/mail/${mailboxId}/send`, {
            method: 'POST',
            body: formData,
            headers: {},
        })
        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to send email')
        }
        return response.json()
    },

    async saveDraft(mailboxId: string, payload: SaveDraftPayload): Promise<{ draft: Message }> {
        const response = await mailFetch(`/api/mail/${mailboxId}/save-draft`, {
            method: 'POST',
            body: JSON.stringify(payload),
        })
        if (!response.ok) throw new Error('Failed to save draft')
        return response.json()
    },

    async syncMailbox(mailboxId: string): Promise<void> {
        const response = await mailFetch(`/api/mail/${mailboxId}/sync`, {
            method: 'POST',
        })
        if (!response.ok) throw new Error('Failed to sync mailbox')
    },

    async searchMessages(
        mailboxId: string,
        query: string,
        params?: { folder?: string; page?: number; limit?: number }
    ): Promise<MessageListResponse> {
        const searchParams = new URLSearchParams()
        searchParams.set('q', query)
        if (params?.folder) searchParams.set('folder', params.folder)
        if (params?.page) searchParams.set('page', String(params.page))
        if (params?.limit) searchParams.set('limit', String(params.limit))

        const response = await mailFetch(`/api/mail/${mailboxId}/search?${searchParams}`)
        if (!response.ok) throw new Error('Failed to search messages')
        return response.json()
    },

    async getSignatures(mailboxId: string): Promise<{ signatures: Signature[] }> {
        const response = await mailFetch(`/api/mail/mailboxes/${mailboxId}/signatures`)
        if (!response.ok) throw new Error('Failed to fetch signatures')
        return response.json()
    },

    async getDefaultSignature(mailboxId: string): Promise<{ signature: Signature | null }> {
        const response = await mailFetch(`/api/mail/mailboxes/${mailboxId}/signatures/default`)
        if (!response.ok) throw new Error('Failed to fetch default signature')
        return response.json()
    },

    async createSignature(
        mailboxId: string,
        data: { name: string; content: string; isDefault?: boolean }
    ): Promise<{ signature: Signature }> {
        const response = await mailFetch(`/api/mail/mailboxes/${mailboxId}/signatures`, {
            method: 'POST',
            body: JSON.stringify(data),
        })
        if (!response.ok) throw new Error('Failed to create signature')
        return response.json()
    },

    async updateSignature(
        mailboxId: string,
        signatureId: string,
        data: { name?: string; content?: string; isDefault?: boolean }
    ): Promise<{ signature: Signature }> {
        const response = await mailFetch(`/api/mail/mailboxes/${mailboxId}/signatures/${signatureId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
        if (!response.ok) throw new Error('Failed to update signature')
        return response.json()
    },

    async deleteSignature(mailboxId: string, signatureId: string): Promise<void> {
        const response = await mailFetch(`/api/mail/mailboxes/${mailboxId}/signatures/${signatureId}`, {
            method: 'DELETE',
        })
        if (!response.ok) throw new Error('Failed to delete signature')
    },
}
