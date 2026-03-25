import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { mailApi, Message, SendEmailPayload, SaveDraftPayload } from '../lib/mail-api'
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

export function useMessages(folder: string, page = 1, limit = 50, search?: string) {
    const { selectedMailbox } = useMailbox()

    return useQuery({
        queryKey: ['messages', selectedMailbox?.id, folder, page, limit, search],
        queryFn: () => {
            if (!selectedMailbox) throw new Error('No mailbox selected')
            return mailApi.getMessages(selectedMailbox.id, folder, { page, limit, search })
        },
        enabled: !!selectedMailbox && !!folder,
        staleTime: 30000,
    })
}

export function useInfiniteMessages(folder: string, limit = 30) {
    const { selectedMailbox } = useMailbox()

    return useInfiniteQuery({
        queryKey: ['messages', 'infinite', selectedMailbox?.id, folder],
        queryFn: async ({ pageParam = 1 }) => {
            if (!selectedMailbox) throw new Error('No mailbox selected')
            return mailApi.getMessages(selectedMailbox.id, folder, { page: pageParam, limit })
        },
        getNextPageParam: (lastPage, allPages) => {
            if (!lastPage.hasMore) return undefined
            return allPages.length + 1
        },
        initialPageParam: 1,
        enabled: !!selectedMailbox && !!folder,
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

export function useMoveMessage() {
    const queryClient = useQueryClient()
    const { selectedMailbox } = useMailbox()

    return useMutation({
        mutationFn: ({
            messageId,
            folder
        }: {
            messageId: string
            folder: string
        }) => {
            if (!selectedMailbox) throw new Error('No mailbox selected')
            return mailApi.moveMessage(selectedMailbox.id, messageId, folder)
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
            folder
        }: {
            messageIds: string[]
            action: 'read' | 'unread' | 'star' | 'unstar' | 'delete' | 'archive' | 'move'
            folder?: string
        }) => {
            if (!selectedMailbox) throw new Error('No mailbox selected')
            return mailApi.batchUpdate(selectedMailbox.id, messageIds, action, folder)
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

export function useSearchMessages(query: string, folder?: string) {
    const { selectedMailbox } = useMailbox()

    return useQuery({
        queryKey: ['search', selectedMailbox?.id, query, folder],
        queryFn: () => {
            if (!selectedMailbox) throw new Error('No mailbox selected')
            return mailApi.searchMessages(selectedMailbox.id, query, { folder })
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
