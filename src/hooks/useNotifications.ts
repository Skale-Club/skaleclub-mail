import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mailApi } from '../lib/mail-api'

export interface UserNotification {
    id: string
    userId: string
    type: string
    title: string
    message: string
    metadata: Record<string, unknown>
    read: boolean
    createdAt: string
}

export function useNotifications(page = 1, limit = 20) {
    return useQuery({
        queryKey: ['notifications', page, limit],
        queryFn: () => mailApi.getNotifications({ page, limit }),
        staleTime: 30000,
    })
}

export function useUnreadCount() {
    return useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: () => mailApi.getUnreadCount(),
        staleTime: 60000,
        refetchInterval: 120000,
    })
}

export function useMarkAsRead() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => mailApi.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
        },
    })
}

export function useMarkAllAsRead() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => mailApi.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
        },
    })
}

export function useDeleteNotification() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => mailApi.deleteNotification(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
        },
    })
}