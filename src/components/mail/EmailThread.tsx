import React from 'react'
import { Link } from 'wouter'
import { ThreadMessage, EmailThread, getThreadParticipants } from '../../lib/email-threading'
import {
    ChevronDown,
    ChevronRight,
    Star,
    Reply,
    ReplyAll,
    Forward,
    Paperclip,
    Download
} from 'lucide-react'

interface EmailThreadProps {
    thread: EmailThread
    onReply?: (messageId: string) => void
    onReplyAll?: (messageId: string) => void
    onForward?: (messageId: string) => void
    onStar?: (messageId: string) => void
}

export function EmailThreadView({ thread, onReply, onReplyAll, onForward, onStar }: EmailThreadProps) {
    const [expandedMessages, setExpandedMessages] = React.useState<Set<string>>(() => {
        const expanded = new Set<string>()
        const lastMessage = thread.messages[thread.messages.length - 1]
        if (lastMessage) {
            expanded.add(lastMessage.id)
        }
        for (const msg of thread.messages) {
            if (!msg.read) {
                expanded.add(msg.id)
            }
        }
        return expanded
    })

    const toggleMessage = (id: string) => {
        setExpandedMessages(prev => {
            const newSet = new Set(prev)
            if (newSet.has(id)) {
                newSet.delete(id)
            } else {
                newSet.add(id)
            }
            return newSet
        })
    }

    const expandAll = () => {
        setExpandedMessages(new Set(thread.messages.map(m => m.id)))
    }

    const collapseAll = () => {
        setExpandedMessages(new Set([thread.messages[thread.messages.length - 1]?.id]))
    }

    const participants = getThreadParticipants(thread.messages)

    return (
        <div className="flex flex-col h-full">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-3">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        {thread.subject}
                    </h1>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={expandAll}
                            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            Expand all
                        </button>
                        <span className="text-gray-300 dark:text-gray-700">|</span>
                        <button
                            onClick={collapseAll}
                            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            Collapse all
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {thread.messages.length} {thread.messages.length === 1 ? 'message' : 'messages'}
                    </span>
                    <span className="text-gray-300 dark:text-gray-700">•</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {participants.length} {participants.length === 1 ? 'participant' : 'participants'}
                    </span>
                    {thread.unreadCount > 0 && (
                        <>
                            <span className="text-gray-300 dark:text-gray-700">•</span>
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                {thread.unreadCount} unread
                            </span>
                        </>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto py-4 sm:py-6 px-4 sm:px-6">
                    <div className="space-y-2">
                        {thread.messages.map((message) => (
                            <ThreadMessageCard
                                key={message.id}
                                message={message}
                                isExpanded={expandedMessages.has(message.id)}
                                onToggle={() => toggleMessage(message.id)}
                                onReply={onReply}
                                onReplyAll={onReplyAll}
                                onForward={onForward}
                                onStar={onStar}
                            />
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <Link
                            href={`/mail/compose?reply=${thread.messages[thread.messages.length - 1].id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            <Reply className="w-4 h-4" />
                            Reply to thread
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface ThreadMessageCardProps {
    message: ThreadMessage
    isExpanded: boolean
    onToggle: () => void
    onReply?: (messageId: string) => void
    onReplyAll?: (messageId: string) => void
    onForward?: (messageId: string) => void
    onStar?: (messageId: string) => void
}

function ThreadMessageCard({
    message,
    isExpanded,
    onToggle,
    onReply,
    onReplyAll,
    onForward,
    onStar
}: ThreadMessageCardProps) {
    const avatarColor = getAvatarColor(message.from.email)
    const initials = getInitials(message.from.name || message.from.email)

    return (
        <div
            className={`
                rounded-xl border transition-all duration-200
                ${isExpanded
                    ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 shadow-sm'
                    : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800'
                }
                ${!message.read ? 'border-l-4 border-l-blue-500' : ''}
            `}
        >
            <button
                onClick={onToggle}
                className="w-full px-4 py-3 text-left"
            >
                <div className="flex items-start gap-3">
                    <div
                        className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}
                    >
                        {initials}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className={`truncate ${!message.read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {message.from.name || message.from.email}
                                </span>
                                {isExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                )}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                                {message.date.toLocaleDateString()} {message.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>

                        {!isExpanded && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                {message.snippet.slice(0, 100)}...
                            </p>
                        )}

                        {isExpanded && message.to.length > 0 && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                To: {message.to.map(t => t.name || t.email).join(', ')}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        {message.starred && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                        {message.attachments && message.attachments.length > 0 && (
                            <Paperclip className="w-4 h-4 text-gray-400" />
                        )}
                    </div>
                </div>
            </button>

            {isExpanded && (
                <div className="px-4 pb-4">
                    <div className="prose prose-sm dark:prose-invert max-w-none mt-4 pl-13">
                        <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {message.body}
                        </div>
                    </div>

                    {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-4 pl-13">
                            <div className="flex flex-wrap gap-2">
                                {message.attachments.map((attachment, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg text-sm"
                                    >
                                        <Paperclip className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-700 dark:text-gray-300">{attachment.name}</span>
                                        <span className="text-gray-500 text-xs">({attachment.size})</span>
                                        <Download className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-4 pl-13 flex items-center gap-2">
                        <button
                            onClick={() => onReply?.(message.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <Reply className="w-4 h-4" />
                            Reply
                        </button>
                        <button
                            onClick={() => onReplyAll?.(message.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <ReplyAll className="w-4 h-4" />
                            Reply All
                        </button>
                        <button
                            onClick={() => onForward?.(message.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <Forward className="w-4 h-4" />
                            Forward
                        </button>
                        <button
                            onClick={() => onStar?.(message.id)}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                message.starred
                                    ? 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                            }`}
                        >
                            <Star className={`w-4 h-4 ${message.starred ? 'fill-current' : ''}`} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

function getAvatarColor(email: string): string {
    const colors = [
        'bg-red-500',
        'bg-orange-500',
        'bg-amber-500',
        'bg-yellow-500',
        'bg-lime-500',
        'bg-green-500',
        'bg-emerald-500',
        'bg-teal-500',
        'bg-cyan-500',
        'bg-sky-500',
        'bg-blue-500',
        'bg-indigo-500',
        'bg-violet-500',
        'bg-purple-500',
        'bg-fuchsia-500',
        'bg-pink-500',
        'bg-rose-500'
    ]
    
    let hash = 0
    for (let i = 0; i < email.length; i++) {
        hash = email.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    return colors[Math.abs(hash) % colors.length]
}

function getInitials(name: string): string {
    const parts = name.split(/[.\s_@]+/).filter(Boolean)
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
}
