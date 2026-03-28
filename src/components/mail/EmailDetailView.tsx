import React from 'react'
import { Link } from 'wouter'
import { EmailItem } from './EmailList'
import {
    Star,
    Mail,
    MailOpen,
    Reply,
    ReplyAll,
    Forward,
    Paperclip,
    Archive,
    Trash2
} from 'lucide-react'
import { getAvatarColor, getInitials } from '../../lib/utils'

interface EmailDetailViewProps {
    email: EmailItem
    onStar?: (id: string) => void
    onDelete?: (id: string) => void
    onArchive?: (id: string) => void
    onToggleRead?: (id: string) => void
}

export function EmailDetailView({ email, onStar, onDelete, onArchive, onToggleRead }: EmailDetailViewProps) {
    const avatarColor = getAvatarColor(email.from.email)
    const initials = getInitials(email.from.name || email.from.email)

    const handleStar = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        onStar?.(email.id)
    }

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        onDelete?.(email.id)
    }

    const handleArchive = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        onArchive?.(email.id)
    }

    const handleToggleRead = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        onToggleRead?.(email.id)
    }

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="p-4">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-base font-bold text-foreground mb-3">
                        {email.subject}
                    </h2>

                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white font-medium text-xs flex-shrink-0`}>
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <p className="font-semibold text-foreground text-sm truncate">
                                        {email.from.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate hidden sm:block">
                                        {email.from.email}
                                    </p>
                                </div>
                                <p className="text-xs text-muted-foreground flex-shrink-0">
                                    {email.date.toLocaleString()}
                                </p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                To: {email.to.map(t => t.name || t.email).join(', ')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                        <button
                            onClick={handleStar}
                            className={`p-2 rounded-full transition-colors ${
                                email.starred
                                    ? 'text-yellow-500 hover:text-yellow-600'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                            }`}
                            title={email.starred ? 'Remove from starred' : 'Add to starred'}
                        >
                            <Star className={`w-4 h-4 ${email.starred ? 'fill-current' : ''}`} />
                        </button>
                        {onToggleRead && (
                            <button
                                onClick={handleToggleRead}
                                className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                title={email.read ? 'Mark as unread' : 'Mark as read'}
                            >
                                {email.read ? <Mail className="w-4 h-4" /> : <MailOpen className="w-4 h-4" />}
                            </button>
                        )}
                        <button
                            onClick={handleArchive}
                            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                            title="Archive"
                        >
                            <Archive className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleDelete}
                            className="p-2 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    {email.labels && email.labels.length > 0 && (
                        <div className="flex items-center gap-2 mt-4 mb-6">
                            {email.labels.map(label => (
                                <span
                                    key={label}
                                    className="px-2.5 py-0.5 text-xs rounded-full bg-secondary text-secondary-foreground font-medium"
                                >
                                    {label}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="prose dark:prose-invert max-w-none mt-8 text-sm sm:text-base">
                        <div className="text-foreground whitespace-pre-wrap">
                            {email.snippet}
                        </div>
                    </div>

                    {email.hasAttachments && (
                        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                            <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                <Paperclip className="w-4 h-4" />
                                Attachments
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                <div className="flex items-center gap-2 px-3 py-2 bg-background rounded-lg border border-border">
                                    <Paperclip className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm text-foreground">Attachment</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-border">
                        <div className="flex items-center gap-3">
                            <Link
                                href={`/mail/compose?reply=${email.id}`}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors"
                            >
                                <Reply className="w-4 h-4" />
                                Reply
                            </Link>
                            <Link
                                href={`/mail/compose?reply=${email.id}&replyAll=true`}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg text-sm font-medium transition-colors"
                            >
                                <ReplyAll className="w-4 h-4" />
                                Reply All
                            </Link>
                            <Link
                                href={`/mail/compose?forward=${email.id}`}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg text-sm font-medium transition-colors"
                            >
                                <Forward className="w-4 h-4" />
                                Forward
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface EmailDetailEmptyProps {
    icon?: React.ReactNode
    title?: string
    description?: string
}

export function EmailDetailEmpty({ 
    icon, 
    title = 'Select an email to read', 
    description = "Click on an email from the list to view its contents" 
}: EmailDetailEmptyProps) {
    return (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
                {icon ? (
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent flex items-center justify-center">
                        {icon}
                    </div>
                ) : (
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent flex items-center justify-center">
                        <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
                <p className="text-base font-medium text-foreground">{title}</p>
                <p className="text-sm mt-1">{description}</p>
            </div>
        </div>
    )
}
