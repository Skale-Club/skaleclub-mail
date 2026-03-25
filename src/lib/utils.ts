import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns'
import { APP_CONSTANTS } from './constants'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string, formatStr?: string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return format(d, formatStr || APP_CONSTANTS.DATE_FORMATS.DISPLAY)
}

export function formatEmailDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    
    if (isToday(d)) {
        return format(d, 'h:mm a')
    }
    if (isYesterday(d)) {
        return 'Yesterday'
    }
    if (d.getFullYear() === new Date().getFullYear()) {
        return format(d, 'MMM d')
    }
    return format(d, 'MM/dd/yy')
}

export function formatRelativeDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return formatDistanceToNow(d, { addSuffix: true })
}

export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getAvatarColor(email: string): string {
    const colors = APP_CONSTANTS.AVATAR.COLORS
    
    let hash = 0
    for (let i = 0; i < email.length; i++) {
        hash = email.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    return colors[Math.abs(hash) % colors.length]
}

export function getInitials(name: string): string {
    const parts = name.split(/[.\s_@]+/).filter(Boolean)
    
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    
    return name.slice(0, 2).toUpperCase()
}

export function truncate(str: string, length: number): string {
    if (str.length <= length) return str
    return str.slice(0, length) + '...'
}

export function parseEmailAddress(str: string): { name?: string; email: string } {
    const match = str.match(/(?:"?([^"]*)"?\s)?(?:<)?([^>]+@[^>]+)(?:>)?/)
    
    if (match) {
        return {
            name: match[1]?.trim(),
            email: match[2].trim()
        }
    }
    
    return { email: str.trim() }
}

export function formatEmailAddress(name: string | undefined, email: string): string {
    if (name) {
        return `${name} <${email}>`
    }
    return email
}

export function debounce<T extends (...args: unknown[]) => unknown>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>
    
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => fn(...args), delay)
    }
}

export function groupBy<T, K extends string | number>(
    array: T[],
    keyFn: (item: T) => K
): Record<K, T[]> {
    return array.reduce((acc, item) => {
        const key = keyFn(item)
        if (!acc[key]) {
            acc[key] = []
        }
        acc[key].push(item)
        return acc
    }, {} as Record<K, T[]>)
}

export function uniqueBy<T, K>(array: T[], keyFn: (item: T) => K): T[] {
    const seen = new Set<K>()
    return array.filter(item => {
        const key = keyFn(item)
        if (seen.has(key)) {
            return false
        }
        seen.add(key)
        return true
    })
}
