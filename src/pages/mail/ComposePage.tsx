import React from 'react'
import { Link, useLocation } from 'wouter'
import { MailLayout } from '../../components/mail/MailLayout'
import { toast } from '../../components/ui/toaster'
import { useMailbox } from '../../hooks/useMailbox'
import { useSendEmail, useSaveDraft } from '../../hooks/useMail'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { RichTextEditor, htmlToPlainText } from '../../components/mail/RichTextEditor'
import { apiFetch } from '../../lib/api'
import {
    ArrowLeft,
    Send,
    X,
    Paperclip,
    Image,
    Save,
    Trash2,
    AlertCircle,
    PenTool
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

export default function ComposePage() {
    const [, setLocation] = useLocation()
    const { selectedMailbox, mailboxes } = useMailbox()
    const sendEmail = useSendEmail()
    const saveDraft = useSaveDraft()

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
    const [discardConfirm, setDiscardConfirm] = React.useState(false)
    const [signatures, setSignatures] = React.useState<Signature[]>([])
    const [showSignatureMenu, setShowSignatureMenu] = React.useState(false)

    React.useEffect(() => {
        if (selectedMailbox) {
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
    }, [selectedMailbox])

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
                attachments
            })
            toast({ title: 'Email sent successfully!', variant: 'success' })
            setLocation('/mail/sent')
        } catch (error) {
            toast({
                title: 'Failed to send email',
                description: error instanceof Error ? error.message : 'Unknown error',
                variant: 'destructive'
            })
        }
    }

    const handleSaveDraft = async () => {
        if (!selectedMailbox) {
            toast({ title: 'No email account selected', variant: 'destructive' })
            return
        }

        try {
            await saveDraft.mutateAsync({
                to: email.to ? parseEmailList(email.to) : undefined,
                cc: email.cc ? parseEmailList(email.cc) : undefined,
                bcc: email.bcc ? parseEmailList(email.bcc) : undefined,
                subject: email.subject,
                bodyText: htmlToPlainText(email.body)
            })
            setIsSaved(true)
            toast({ title: 'Draft saved', variant: 'success' })
            setTimeout(() => setIsSaved(false), 2000)
        } catch {
            toast({ title: 'Failed to save draft', variant: 'destructive' })
        }
    }

    const handleDiscard = () => {
        setDiscardConfirm(true)
    }

    const confirmDiscard = () => {
        setLocation('/mail/inbox')
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
        enabled: true,
        onSend: handleSend,
        onSaveDraft: handleSaveDraft,
        onEscape: () => {
            if (email.to || email.subject || email.body) {
                setDiscardConfirm(true)
            } else {
                setLocation('/mail/inbox')
            }
        }
    })

    if (mailboxes.length === 0) {
        return (
            <MailLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="text-center max-w-md px-6">
                        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            No Email Accounts Connected
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            Add an email account to start composing emails.
                        </p>
                        <Link
                            href="/mail/settings"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Add Email Account
                        </Link>
                    </div>
                </div>
            </MailLayout>
        )
    }

    return (
        <MailLayout>
            <div className="h-full flex flex-col bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/mail/inbox"
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </Link>
                        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                            New Message
                        </h1>
                        {selectedMailbox && (
                            <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">
                                from {selectedMailbox.email}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSaveDraft}
                            disabled={saveDraft.isPending}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400 transition-colors"
                            title="Save draft (Ctrl+S)"
                        >
                            <Save className={`w-5 h-5 ${saveDraft.isPending ? 'animate-pulse' : ''}`} />
                        </button>
                        <button
                            onClick={handleDiscard}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                            title="Discard (Esc)"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleSend}
                            disabled={sendEmail.isPending}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
                            title="Send (Ctrl+Enter)"
                        >
                            {sendEmail.isPending ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Send
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {isSaved && (
                    <div className="flex items-center gap-2 px-6 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm">
                        <Save className="w-4 h-4" />
                        Draft saved
                    </div>
                )}

                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto p-4 sm:p-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <label className="w-12 sm:w-16 text-sm font-medium text-gray-600 dark:text-gray-400 flex-shrink-0">
                                    To
                                </label>
                                <input
                                    type="text"
                                    value={email.to}
                                    onChange={(e) => setEmail({ ...email, to: e.target.value })}
                                    placeholder="recipient@example.com"
                                    className="flex-1 px-3 py-2 bg-transparent border-0 border-b border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 text-sm sm:text-base"
                                />
                                <button
                                    onClick={() => setShowCc(!showCc)}
                                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    Cc
                                </button>
                                <button
                                    onClick={() => setShowBcc(!showBcc)}
                                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    Bcc
                                </button>
                            </div>

                            {showCc && (
                                <div className="flex items-center gap-4">
                                    <label className="w-12 sm:w-16 text-sm font-medium text-gray-600 dark:text-gray-400 flex-shrink-0">
                                        Cc
                                    </label>
                                    <input
                                        type="text"
                                        value={email.cc}
                                        onChange={(e) => setEmail({ ...email, cc: e.target.value })}
                                        placeholder="cc@example.com"
                                        className="flex-1 px-3 py-2 bg-transparent border-0 border-b border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 text-sm sm:text-base"
                                    />
                                </div>
                            )}

                            {showBcc && (
                                <div className="flex items-center gap-4">
                                    <label className="w-12 sm:w-16 text-sm font-medium text-gray-600 dark:text-gray-400 flex-shrink-0">
                                        Bcc
                                    </label>
                                    <input
                                        type="text"
                                        value={email.bcc}
                                        onChange={(e) => setEmail({ ...email, bcc: e.target.value })}
                                        placeholder="bcc@example.com"
                                        className="flex-1 px-3 py-2 bg-transparent border-0 border-b border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 text-sm sm:text-base"
                                    />
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <label className="w-12 sm:w-16 text-sm font-medium text-gray-600 dark:text-gray-400 flex-shrink-0">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    value={email.subject}
                                    onChange={(e) => setEmail({ ...email, subject: e.target.value })}
                                    placeholder="Enter subject"
                                    className="flex-1 px-3 py-2 bg-transparent border-0 border-b border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 text-base sm:text-lg"
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-3">
                            <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400 cursor-pointer transition-colors text-sm">
                                <Paperclip className="w-4 h-4" />
                                <span className="hidden sm:inline">Attach file</span>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleAttachment}
                                    className="hidden"
                                />
                            </label>
                            <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400 cursor-pointer transition-colors text-sm">
                                <Image className="w-4 h-4" />
                                <span className="hidden sm:inline">Insert image</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                />
                            </label>
                            {signatures.length > 0 && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowSignatureMenu(!showSignatureMenu)}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400 transition-colors text-sm"
                                    >
                                        <PenTool className="w-4 h-4" />
                                        <span className="hidden sm:inline">Signature</span>
                                    </button>
                                    {showSignatureMenu && (
                                        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                                            {signatures.map(sig => (
                                                <button
                                                    key={sig.id}
                                                    onClick={() => insertSignature(sig)}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300"
                                                >
                                                    {sig.name} {sig.isDefault && '(Default)'}
                                                </button>
                                            ))}
                                            <Link
                                                href="/mail/settings?tab=signatures"
                                                className="block px-4 py-2 text-left text-sm text-blue-600 hover:bg-gray-100 dark:hover:bg-slate-700"
                                            >
                                                Manage Signatures
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {attachments.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {attachments.map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-slate-800 rounded-lg"
                                    >
                                        <Paperclip className="w-4 h-4 text-gray-500" />
                                        <div className="text-sm">
                                            <span className="text-gray-700 dark:text-gray-300">{file.name}</span>
                                            <span className="text-gray-500 ml-2">({formatBytes(file.size)})</span>
                                        </div>
                                        <button
                                            onClick={() => removeAttachment(index)}
                                            className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded"
                                        >
                                            <X className="w-3 h-3 text-gray-500" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <RichTextEditor
                                value={email.body}
                                onChange={(value) => setEmail({ ...email, body: value })}
                                placeholder="Write your message..."
                                minHeight={300}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {discardConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            Discard this message?
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            This will permanently delete this message. This action cannot be undone.
                        </p>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setDiscardConfirm(false)}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
                            >
                                Keep
                            </button>
                            <button
                                onClick={confirmDiscard}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Discard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MailLayout>
    )
}
