import React, { useEffect } from 'react'
import { useLocation } from 'wouter'
import { toast } from '../ui/toaster'
import { useMailbox } from '../../hooks/useMailbox'
import { useSendEmail, useSaveDraft, useMessage } from '../../hooks/useMail'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { RichTextEditor, htmlToPlainText } from './RichTextEditor'
import { ContactAutocomplete } from './ContactAutocomplete'
import { apiFetch } from '../../lib/api-client'
import { useCompose } from '../../hooks/useCompose'
import {
    ArrowLeft,
    Send,
    X,
    Paperclip,
    Image as ImageIcon,
    Save,
    Trash2,
    AlertCircle,
    PenTool,
    Minus,
    Maximize2
} from 'lucide-react'

interface Signature {
    id: string
    name: string
    content: string
    isDefault: boolean
}

interface ComposeEmail {
    to: string
    cc: string
    bcc: string
    subject: string
    body: string
}

export function ComposeDialog() {
    const [, setLocation] = useLocation()
    const { isOpen, options, closeCompose } = useCompose()
    const { replyToId, replyAll, forwardId, draftId } = options

    const { selectedMailbox, mailboxes } = useMailbox()
    const sendEmail = useSendEmail()
    const saveDraft = useSaveDraft()
    const { data: originalMessage } = useMessage(replyToId || forwardId || draftId)

    const [email, setEmail] = React.useState<ComposeEmail>({
        to: '',
        cc: '',
        bcc: '',
        subject: '',
        body: ''
    })
    const [showCc, setShowCc] = React.useState(false)
    const [showBcc, setShowBcc] = React.useState(false)
    const [isSaved, setIsSaved] = React.useState(false)
    const [attachments, setAttachments] = React.useState<File[]>([])
    const [signatures, setSignatures] = React.useState<Signature[]>([])
    const [showSignatureMenu, setShowSignatureMenu] = React.useState(false)
    const [prefilled, setPrefilled] = React.useState(false)
    const [isMinimized, setIsMinimized] = React.useState(false)
    const [isMaximized, setIsMaximized] = React.useState(false)

    // Reset state when opening a new compose window
    useEffect(() => {
        if (isOpen) {
            setEmail({ to: '', cc: '', bcc: '', subject: '', body: '' })
            setShowCc(false)
            setShowBcc(false)
            setAttachments([])
            setPrefilled(false)
            setIsMinimized(false)
            setIsMaximized(false)
        }
    }, [isOpen, replyToId, forwardId, draftId])

    useEffect(() => {
        if (isOpen && selectedMailbox) {
            apiFetch<{ signatures: Signature[] }>(`/api/mail/mailboxes/${selectedMailbox.id}/signatures`)
                .then(data => {
                    setSignatures(data.signatures || [])
                    const def = (data.signatures || []).find((s: Signature) => s.isDefault)
                    if (def && !email.body) {
                        setEmail(prev => ({ ...prev, body: `<br/><br/>${def.content}` }))
                    }
                })
                .catch(console.error)
        }
    }, [isOpen, selectedMailbox])

    useEffect(() => {
        if (!isOpen || prefilled || !originalMessage?.message) return
        const msg = originalMessage.message
        const updates: Partial<ComposeEmail> = {}

        if (replyToId) {
            updates.to = msg.from?.email || ''
            updates.subject = msg.subject?.startsWith('Re:') ? msg.subject : `Re: ${msg.subject || ''}`
            const bodyText = msg.bodyHtml || msg.plainBody || ''
            updates.body = `<br/><br/><blockquote style="border-left:2px solid #ccc;padding-left:12px;color:#666;">${bodyText}</blockquote>`
            if (replyAll && msg.to) {
                const allRecipients = [...msg.to]
                if (msg.cc) allRecipients.push(...msg.cc)
                updates.cc = allRecipients.map((r: { email: string }) => r.email).filter((e: string) => e !== selectedMailbox?.email).join(', ')
            }
            if (msg.cc?.length) setShowCc(true)
        } else if (forwardId) {
            updates.subject = msg.subject?.startsWith('Fwd:') ? msg.subject : `Fwd: ${msg.subject || ''}`
            const bodyText = msg.bodyHtml || msg.plainBody || ''
            updates.body = `<br/><br/><p>---------- Forwarded message ----------<br>From: ${msg.from?.name || ''} &lt;${msg.from?.email}&gt;<br>Date: ${msg.date || ''}<br>Subject: ${msg.subject || ''}</p><blockquote style="border-left:2px solid #ccc;padding-left:12px;color:#666;">${bodyText}</blockquote>`
        } else if (draftId) {
            updates.to = msg.to?.map((r: { email: string }) => r.email).join(', ') || ''
            updates.cc = msg.cc?.map((r: { email: string }) => r.email).join(', ') || ''
            updates.subject = msg.subject || ''
            updates.body = msg.bodyHtml || msg.plainBody || ''
            if (msg.cc?.length) setShowCc(true)
        }

        if (Object.keys(updates).length > 0) {
            setEmail(prev => ({ ...prev, ...updates }))
            setPrefilled(true)
        }
    }, [isOpen, originalMessage, replyToId, replyAll, forwardId, draftId, prefilled, selectedMailbox])

    const insertSignature = (signature: Signature) => {
        setEmail(prev => ({
            ...prev,
            body: prev.body.replace(/<br\s*\/?>\s*<br\s*\/?>.*$/i, '') + `<br/><br/>${signature.content}`
        }))
        setShowSignatureMenu(false)
    }

    const parseEmailList = (str: string): { name?: string; email: string }[] => {
        return str
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0)
            .map(s => {
                const match = s.match(/(?:"?([^"]*)"?\s)?(?:<)?([^>]+@[^>]+)(?:>)?/)
                if (match) {
                    return { name: match[1]?.trim(), email: match[2].trim() }
                }
                return { email: s }
            })
    }

    const handleSend = async () => {
        if (!email.to.trim()) {
            toast({ title: 'Please enter a recipient', variant: 'destructive' })
            return
        }
        if (!email.subject.trim()) {
            toast({ title: 'Please enter a subject', variant: 'destructive' })
            return
        }

        if (!selectedMailbox) {
            toast({ title: 'No email account selected', description: 'Please select an email account first', variant: 'destructive' })
            return
        }

        try {
            await sendEmail.mutateAsync({
                to: parseEmailList(email.to),
                cc: email.cc ? parseEmailList(email.cc) : undefined,
                bcc: email.bcc ? parseEmailList(email.bcc) : undefined,
                subject: email.subject,
                bodyText: htmlToPlainText(email.body),
                bodyHtml: email.body,
                attachments,
                inReplyTo: originalMessage?.message?.messageId,
                references: originalMessage?.message?.references,
            })
            toast({ title: 'Email sent successfully!', variant: 'success' })
            closeCompose()
        } catch (error) {
            toast({
                title: 'Failed to send email',
                description: error instanceof Error ? error.message : 'Unknown error',
                variant: 'destructive'
            })
        }
    }

    const handleSaveDraft = async () => {
        if (!selectedMailbox) return

        try {
            await saveDraft.mutateAsync({
                to: email.to ? parseEmailList(email.to) : undefined,
                cc: email.cc ? parseEmailList(email.cc) : undefined,
                bcc: email.bcc ? parseEmailList(email.bcc) : undefined,
                subject: email.subject,
                bodyText: htmlToPlainText(email.body),
                bodyHtml: email.body,
                draftId: draftId || undefined,
            })
            setIsSaved(true)
            toast({ title: 'Draft saved', variant: 'success' })
            setTimeout(() => setIsSaved(false), 2000)
        } catch {
            toast({ title: 'Failed to save draft', variant: 'destructive' })
        }
    }

    const handleClose = async () => {
        // Auto-save draft if there is content and it hasn't been saved yet
        if (email.to || email.subject || email.body.trim().replace(/<br\/?>/g, '') !== '') {
            await handleSaveDraft();
        }
        closeCompose();
    }

    const handleDiscard = () => {
        // Just close and do nothing, or we could delete the draft if it exists.
        closeCompose()
    }

    const handleAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        setAttachments(prev => [...prev, ...files])
    }

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index))
    }

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    useKeyboardShortcuts({
        enabled: isOpen,
        onSend: handleSend,
        onSaveDraft: handleSaveDraft,
        onEscape: handleClose
    })

    if (!isOpen) return null

    if (mailboxes.length === 0) {
        return (
            <div className="fixed bottom-0 right-[10%] w-[500px] z-50 bg-background border border-border shadow-2xl rounded-t-xl overflow-hidden flex flex-col h-[400px]">
                <div className="bg-muted px-4 py-3 flex items-center justify-between">
                    <span className="font-medium text-sm">New Message</span>
                    <button onClick={closeCompose} className="text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex items-center justify-center flex-1">
                    <div className="text-center px-6">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                        <h2 className="text-lg font-bold text-foreground mb-2">
                            No Email Accounts
                        </h2>
                        <p className="text-sm text-muted-foreground mb-4">
                            Add an email account to compose emails.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    if (isMinimized) {
        return (
            <div className="fixed bottom-0 right-4 sm:right-[10%] w-[300px] z-50 bg-background border border-border shadow-2xl rounded-t-xl cursor-pointer hover:bg-muted transition-colors" onClick={() => setIsMinimized(false)}>
                <div className="px-4 py-3 flex items-center justify-between">
                    <span className="font-medium text-sm truncate">{email.subject || 'New Message'}</span>
                    <div className="flex items-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }} className="text-muted-foreground hover:text-foreground">
                            <Maximize2 className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleClose(); }} className="text-muted-foreground hover:text-foreground">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`fixed bottom-0 right-0 sm:right-[5%] z-50 bg-background border border-border shadow-2xl sm:rounded-t-xl overflow-hidden flex flex-col transition-all duration-200 ${isMaximized ? 'w-full h-full sm:w-[80vw] sm:h-[90vh] sm:bottom-[5vh] sm:right-[10vw] sm:rounded-xl' : 'w-full h-full sm:w-[600px] sm:h-[600px]'}`}>
            {/* Header */}
            <div className="bg-muted/50 px-4 py-2 flex items-center justify-between border-b border-border">
                <span className="font-medium text-sm">
                    {replyToId ? 'Reply' : forwardId ? 'Forward' : draftId ? 'Edit Draft' : 'New Message'}
                </span>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsMinimized(true)} className="p-1.5 hover:bg-muted-foreground/20 rounded-md text-muted-foreground hover:text-foreground transition-colors">
                        <Minus className="w-4 h-4" />
                    </button>
                    <button onClick={() => setIsMaximized(!isMaximized)} className="hidden sm:block p-1.5 hover:bg-muted-foreground/20 rounded-md text-muted-foreground hover:text-foreground transition-colors">
                        <Maximize2 className="w-4 h-4" />
                    </button>
                    <button onClick={handleClose} className="p-1.5 hover:bg-muted-foreground/20 rounded-md text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto flex flex-col">
                <div className="px-4 py-2 border-b border-border flex items-center">
                    <span className="w-12 text-sm text-muted-foreground">To</span>
                    <div className="flex-1">
                        <ContactAutocomplete
                            value={email.to}
                            onChange={(value) => setEmail({ ...email, to: value })}
                            placeholder=""
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <button onClick={() => setShowCc(!showCc)} className="text-muted-foreground hover:text-foreground">Cc</button>
                        <button onClick={() => setShowBcc(!showBcc)} className="text-muted-foreground hover:text-foreground">Bcc</button>
                    </div>
                </div>

                {showCc && (
                    <div className="px-4 py-2 border-b border-border flex items-center">
                        <span className="w-12 text-sm text-muted-foreground">Cc</span>
                        <div className="flex-1">
                            <ContactAutocomplete
                                value={email.cc}
                                onChange={(value) => setEmail({ ...email, cc: value })}
                                placeholder=""
                            />
                        </div>
                    </div>
                )}

                {showBcc && (
                    <div className="px-4 py-2 border-b border-border flex items-center">
                        <span className="w-12 text-sm text-muted-foreground">Bcc</span>
                        <div className="flex-1">
                            <ContactAutocomplete
                                value={email.bcc}
                                onChange={(value) => setEmail({ ...email, bcc: value })}
                                placeholder=""
                            />
                        </div>
                    </div>
                )}

                <div className="px-4 py-2 border-b border-border flex items-center">
                    <input
                        type="text"
                        value={email.subject}
                        onChange={(e) => setEmail({ ...email, subject: e.target.value })}
                        placeholder="Subject"
                        className="flex-1 bg-transparent border-0 focus:ring-0 text-sm font-medium placeholder-muted-foreground/70"
                    />
                </div>

                <div className="flex-1 flex flex-col min-h-0 bg-card">
                    <RichTextEditor
                        value={email.body}
                        onChange={(value) => setEmail({ ...email, body: value })}
                        placeholder=""
                        minHeight={isMaximized ? 400 : 250}
                        className="flex-1 border-0"
                    />
                </div>

                {attachments.length > 0 && (
                    <div className="p-3 border-t border-border bg-muted/30 flex flex-wrap gap-2">
                        {attachments.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 px-2.5 py-1.5 bg-background border border-border rounded-md">
                                <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-xs max-w-[150px] truncate">{file.name}</span>
                                <span className="text-[10px] text-muted-foreground">({formatBytes(file.size)})</span>
                                <button onClick={() => removeAttachment(index)} className="p-0.5 hover:bg-muted rounded">
                                    <X className="w-3 h-3 text-muted-foreground" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-muted/30 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSend}
                        disabled={sendEmail.isPending}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        {sendEmail.isPending ? 'Sending...' : 'Send'}
                    </button>
                    
                    <label className="p-2 hover:bg-muted rounded-lg text-muted-foreground cursor-pointer transition-colors" title="Attach files">
                        <Paperclip className="w-4 h-4" />
                        <input type="file" multiple onChange={handleAttachment} className="hidden" />
                    </label>
                    <label className="p-2 hover:bg-muted rounded-lg text-muted-foreground cursor-pointer transition-colors" title="Insert image">
                        <ImageIcon className="w-4 h-4" />
                        <input type="file" accept="image/*" className="hidden" />
                    </label>
                    
                    {signatures.length > 0 && (
                        <div className="relative">
                            <button
                                onClick={() => setShowSignatureMenu(!showSignatureMenu)}
                                className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
                                title="Insert signature"
                            >
                                <PenTool className="w-4 h-4" />
                            </button>
                            {showSignatureMenu && (
                                <div className="absolute bottom-full left-0 mb-1 w-48 bg-popover border border-border rounded-lg shadow-lg z-10 py-1">
                                    {signatures.map(sig => (
                                        <button
                                            key={sig.id}
                                            onClick={() => insertSignature(sig)}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-muted text-foreground"
                                        >
                                            {sig.name} {sig.isDefault && '(Default)'}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    {isSaved && <span className="text-xs text-green-600 mr-2">Saved</span>}
                    <button
                        onClick={handleDiscard}
                        className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-muted-foreground transition-colors"
                        title="Discard draft"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
