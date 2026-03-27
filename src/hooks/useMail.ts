import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import React from 'react'
import { mailApi, Message, SendEmailPayload, SaveDraftPayload, ContactItem } from '../lib/mail-api'
import { useMailbox } from './useMailbox'

export function useFolders() {
    const { selectedMailbox } = useMailbox()

    return useQuery({
        queryKey: ['folders', selectedMailbox?.id],
        queryFn: () => {
            if (!selectedMailbox) throw new Error('No mailbox selected')
            return mailApi.getFolders(selectedMailbox.id)
        },
        enabled: !!selectedMailbox,
    })
}

export function useMessages(folderType: string, page = 1, limit = 50, search?: string) {
    const { selectedMailbox } = useMailbox()
    const { data: foldersData } = useFolders()

    const folderId = React.useMemo(() => {
        if (!foldersData?.folders) return undefined
        const folder = foldersData.folders.find(
            (f: { remoteId?: string; type?: string; id: string }) =>
                f.type === folderType || f.remoteId?.toLowerCase() === folderType.toLowerCase()
        )
        return folder?.id
    }, [foldersData, folderType])

    return useQuery({
        queryKey: ['messages', selectedMailbox?.id, folderType, folderId, page, limit, search],
        queryFn: () => {
            if (!selectedMailbox) throw new Error('No mailbox selected')
            if (!folderId) return { messages: [], total: 0, hasMore: false }
            return mailApi.getMessages(selectedMailbox.id, folderId, { page, limit, search })
        },
        enabled: !!selectedMailbox && !!folderId,
        staleTime: 30000,
    })
}

export function useInfiniteMessages(folderType: string, limit = 30) {
    const { selectedMailbox } = useMailbox()
    const { data: foldersData } = useFolders()

    const folderId = React.useMemo(() => {
        if (!foldersData?.folders) return undefined
        const folder = foldersData.folders.find(
            (f: { remoteId?: string; type?: string; id: string }) =>
                f.type === folderType || f.remoteId?.toLowerCase() === folderType.toLowerCase()
        )
        return folder?.id
    }, [foldersData, folderType])

    return useInfiniteQuery({
        queryKey: ['messages', 'infinite', selectedMailbox?.id, folderType, folderId],
        queryFn: async ({ pageParam = 1 }) => {
            if (!selectedMailbox) throw new Error('No mailbox selected')
            if (!folderId) return { messages: [], total: 0, hasMore: false }
            return mailApi.getMessages(selectedMailbox.id, folderId, { page: pageParam, limit })
        },
        getNextPageParam: (lastPage, allPages) => {
            if (!lastPage.hasMore) return undefined
            return allPages.length + 1
        },
        initialPageParam: 1,
        enabled: !!selectedMailbox && !!folderId,
        staleTime: 30000,
    })
}

export function useMessage(messageId: string | null) {
    const { selectedMailbox } = useMailbox()

    return useQuery({
        queryKey: ['message', selectedMailbox?.id, messageId],
        queryFn: () => {
            if (!selectedMailbox || !messageId) throw new Error('Missing required params')
            return mailApi.getMessage(selectedMailbox.id, messageId)
        },
        enabled: !!selectedMailbox && !!messageId,
    })
}

export function useUpdateMessage() {
    const queryClient = useQueryClient()
    const { selectedMailbox } = useMailbox()

    return useMutation({
        mutationFn: ({
            messageId,
            data
        }: {
            messageId: string
            data: { read?: boolean; starred?: boolean; labels?: string[] }
        }) => {
            if (!selectedMailbox) throw new Error('No mailbox selected')
            return mailApi.updateMessage(selectedMailbox.id, messageId, data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] })
            queryClient.invalidateQueries({ queryKey: ['folders'] })
        },
    })
}

export function useDeleteMessage() {
    const queryClient = useQueryClient()
    const { selectedMailbox } = useMailbox()

    return useMutation({
        mutationFn: (messageId: string) => {
            if (!selectedMailbox) throw new Error('No mailbox selected')
            return mailApi.deleteMessage(selectedMailbox.id, messageId)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] })
            queryClient.invalidateQueries({ queryKey: ['folders'] })
        },
    })
}

export function useArchiveMessage() {
    const queryClient = useQueryClient()
    const { selectedMailbox } = useMailbox()

    return useMutation({
        mutationFn: (messageId: string) => {
            if (!selectedMailbox) throw new Error('No mailbox selected')
            return mailApi.archiveMessage(selectedMailbox.id, messageId)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] })
            queryClient.invalidateQueries({ queryKey: ['folders'] })
        },
    })
}

export function useSpamMessage() {
    const queryClient = useQueryClient()
    const { selectedMailbox } = useMailbox()

    return useMutation({
        mutationFn: ({
            messageId,
            isSpam
        }: {
            messageId: string
            isSpam: boolean
        }) => {
            if (!selectedMailbox) throw new Error('No mailbox selected')
            return mailApi.spamMessage(selectedMailbox.id, messageId, isSpam)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] })
            queryClient.invalidateQueries({ queryKey: ['folders'] })
        },
    })
}

export function useMoveMessage() {
    const queryClient = useQueryClient()
    const { selectedMailbox } = useMailbox()

    return useMutation({
        mutationFn: ({
            messageId,
            folderId
        }: {
            messageId: string
            folderId: string
        }) => {
            if (!selectedMailbox) throw new Error('No mailbox selected')
            return mailApi.moveMessage(selectedMailbox.id, messageId, folderId)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] })
            queryClient.invalidateQueries({ queryKey: ['folders'] })
        },
    })
}

export function useBatchUpdate() {
    const queryClient = useQueryClient()
    const { selectedMailbox } = useMailbox()

    return useMutation({
        mutationFn: ({
            messageIds,
            action,
            folderId
        }: {
            messageIds: string[]
            action: 'read' | 'unread' | 'star' | 'unstar' | 'delete' | 'archive' | 'move' | 'spam' | 'unspam'
            folderId?: string
        }) => {
            if (!selectedMailbox) throw new Error('No mailbox selected')
            return mailApi.batchUpdate(selectedMailbox.id, messageIds, action, folderId)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] })
            queryClient.invalidateQueries({ queryKey: ['folders'] })
        },
    })
}

export function useSendEmail() {
    const queryClient = useQueryClient()
    const { selectedMailbox } = useMailbox()

    return useMutation({
        mutationFn: (payload: SendEmailPayload) => {
            if (!selectedMailbox) throw new Error('No mailbox selected')
            return mailApi.sendEmail(selectedMailbox.id, payload)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] })
            queryClient.invalidateQueries({ queryKey: ['folders'] })
        },
    })
}

export function useSaveDraft() {
    const queryClient = useQueryClient()
    const { selectedMailbox } = useMailbox()

    return useMutation({
        mutationFn: (payload: SaveDraftPayload) => {
            if (!selectedMailbox) throw new Error('No mailbox selected')
            return mailApi.saveDraft(selectedMailbox.id, payload)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] })
        },
    })
}

export function useSyncMailbox() {
    const queryClient = useQueryClient()
    const { selectedMailbox } = useMailbox()

    return useMutation({
        mutationFn: () => {
            if (!selectedMailbox) throw new Error('No mailbox selected')
            return mailApi.syncMailbox(selectedMailbox.id)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] })
            queryClient.invalidateQueries({ queryKey: ['folders'] })
        },
    })
}

export function useSearchMessages(query: string, folderId?: string) {
    const { selectedMailbox } = useMailbox()

    return useQuery({
        queryKey: ['search', selectedMailbox?.id, query, folderId],
        queryFn: () => {
            if (!selectedMailbox) throw new Error('No mailbox selected')
            return mailApi.searchMessages(selectedMailbox.id, query, { folderId })
        },
        enabled: !!selectedMailbox && query.length >= 2,
    })
}

export function mapMessageToEmailItem(message: Message): import('../components/mail/EmailList').EmailItem {
    return {
        id: message.id,
        subject: message.subject || '(No subject)',
        snippet: message.snippet || message.bodyText?.slice(0, 150) || '',
        from: message.from,
        to: message.to,
        date: new Date(message.date),
        read: message.read,
        starred: message.starred,
        hasAttachments: !!(message.attachments && message.attachments.length > 0),
        labels: message.labels,
    }
}

// Contacts hooks
export function useContacts(search?: string, page = 1, limit = 50) {
    return useQuery({
        queryKey: ['contacts', search, page, limit],
        queryFn: () => mailApi.getContacts({ search, page, limit }),
        staleTime: 30000,
    })
}

export function useSearchContacts(query: string) {
    return useQuery({
        queryKey: ['contacts', 'search', query],
        queryFn: () => mailApi.searchContacts(query),
        enabled: query.length >= 1,
        staleTime: 10000,
    })
}

export function useCreateContact() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: { email: string; firstName?: string; lastName?: string; company?: string }) =>
            mailApi.createContact(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] })
        },
    })
}

export function useUpdateContact() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: { email?: string; firstName?: string; lastName?: string; company?: string } }) =>
            mailApi.updateContact(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] })
        },
    })
}

export function useDeleteContact() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => mailApi.deleteContact(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] })
        },
    })
}

export function useImportContactsCsv() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (csvContent: string) => mailApi.importContactsCsv(csvContent),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] })
        },
    })
}
