import React from 'react'
import { format, isToday, isYesterday } from 'date-fns'
import {
    Star,
    Paperclip,
    MoreVertical,
    Trash2,
    Mail,
    Reply,
    ReplyAll,
    Forward,
    Archive,
    RefreshCw
} from 'lucide-react'

export interface EmailItem {
    id: string
    subject: string
    snippet: string
    from: {
        name: string
        email: string
    }
    to: {
        name: string
        email: string
    }[]
    date: Date
    read: boolean
    starred: boolean
    hasAttachments: boolean
    labels?: string[]
}

interface EmailListProps {
    emails: EmailItem[]
    selectedId?: string
    onSelect: (id: string) => void
    onStar?: (id: string) => void
    onDelete?: (id: string) => void
    onArchive?: (id: string) => void
    emptyMessage?: string
}

function formatEmailDate(date: Date): string {
    if (isToday(date)) {
        return format(date, 'h:mm a')
    }
    if (isYesterday(date)) {
        return 'Yesterday'
    }
    if (date.getFullYear() === new Date().getFullYear()) {
        return format(date, 'MMM d')
    }
    return format(date, 'MM/dd/yy')
}

export function EmailList({
    emails,
    selectedId,
    onSelect,
    onStar,
    onDelete,
    onArchive,
    emptyMessage = 'No emails'
}: EmailListProps) {
    const [menuOpenId, setMenuOpenId] = React.useState<string | null>(null)

    if (emails.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 py-20">
                <Mail className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">{emptyMessage}</p>
                <p className="text-sm mt-1">Your inbox is empty</p>
            </div>
        )
    }

    return (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {emails.map((email) => (
                <div
                    key={email.id}
                    className={`
                        group relative flex items-start gap-4 px-5 py-4 cursor-pointer transition-all duration-150
                        hover:bg-gray-50 dark:hover:bg-slate-800/50
                        ${selectedId === email.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                        ${!email.read ? 'bg-gray-50/80 dark:bg-slate-800/30 font-semibold' : ''}
                    `}
                    onClick={() => onSelect(email.id)}
                >
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onStar?.(email.id)
                        }}
                        className={`
                            flex-shrink-0 p-1 rounded-full transition-colors mt-1
                            ${email.starred
                                ? 'text-yellow-500 hover:text-yellow-600'
                                : 'text-gray-300 hover:text-gray-400 opacity-0 group-hover:opacity-100'
                            }
                        `}
                    >
                        <Star className={`w-5 h-5 ${email.starred ? 'fill-current' : ''}`} />
                    </button>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4 mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                                {!email.read && (
                                    <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                                )}
                                <span className={`truncate ${!email.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {email.from.name || email.from.email}
                                </span>
                            </div>
                            <span className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
                                {formatEmailDate(email.date)}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="truncate text-sm text-gray-900 dark:text-white">
                                {email.subject}
                            </span>
                            {email.hasAttachments && (
                                <Paperclip className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            )}
                        </div>

                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            {email.snippet}
                        </p>

                        {email.labels && email.labels.length > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                                {email.labels.map((label) => (
                                    <span
                                        key={label}
                                        className="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                    >
                                        {label}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                setMenuOpenId(menuOpenId === email.id ? null : email.id)
                            }}
                            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>

                        {menuOpenId === email.id && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setMenuOpenId(null)
                                    }}
                                />
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setMenuOpenId(null)
                                        }}
                                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                                    >
                                        <Reply className="w-4 h-4" />
                                        Reply
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setMenuOpenId(null)
                                        }}
                                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                                    >
                                        <ReplyAll className="w-4 h-4" />
                                        Reply All
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setMenuOpenId(null)
                                        }}
                                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                                    >
                                        <Forward className="w-4 h-4" />
                                        Forward
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onArchive?.(email.id)
                                            setMenuOpenId(null)
                                        }}
                                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                                    >
                                        <Archive className="w-4 h-4" />
                                        Archive
                                    </button>
                                    <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onDelete?.(email.id)
                                            setMenuOpenId(null)
                                        }}
                                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

interface EmailToolbarProps {
    selectedCount: number
    onMarkRead: () => void
    onMarkUnread: () => void
    onDelete: () => void
    onArchive: () => void
    onRefresh: () => void
    isRefreshing?: boolean
}

export function EmailToolbar({
    selectedCount,
    onMarkRead,
    onMarkUnread,
    onDelete,
    onArchive,
    onRefresh,
    isRefreshing
}: EmailToolbarProps) {
    return (
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedCount > 0 ? `${selectedCount} selected` : 'Select all'}
                </span>
            </div>
            <div className="flex items-center gap-1">
                <button
                    onClick={onRefresh}
                    className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Refresh"
                >
                    <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
                {selectedCount > 0 && (
                    <>
                        <button
                            onClick={onMarkRead}
                            className="px-3 py-1.5 text-sm rounded-lg text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            Mark as read
                        </button>
                        <button
                            onClick={onMarkUnread}
                            className="px-3 py-1.5 text-sm rounded-lg text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            Mark as unread
                        </button>
                        <button
                            onClick={onArchive}
                            className="px-3 py-1.5 text-sm rounded-lg text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <Archive className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onDelete}
                            className="px-3 py-1.5 text-sm rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
