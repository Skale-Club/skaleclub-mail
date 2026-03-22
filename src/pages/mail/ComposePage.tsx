import React from 'react'
import { Link, useLocation } from 'wouter'
import { MailLayout } from '../../components/mail/MailLayout'
import { toast } from '../../components/ui/toaster'
import {
    ArrowLeft,
    Send,
    X,
    Paperclip,
    Image,
    Clock,
    Save,
    Trash2,
    Bold,
    Italic,
    Underline,
    List,
    Link as LinkIcon,
    Quote
} from 'lucide-react'

interface ComposeEmail {
    to: string
    cc: string
    bcc: string
    subject: string
    body: string
}

export default function ComposePage() {
    const [, setLocation] = useLocation()
    const [email, setEmail] = React.useState<ComposeEmail>({
        to: '',
        cc: '',
        bcc: '',
        subject: '',
        body: ''
    })
    const [showCc, setShowCc] = React.useState(false)
    const [showBcc, setShowBcc] = React.useState(false)
    const [isSending, setIsSending] = React.useState(false)
    const [isSaved, setIsSaved] = React.useState(false)
    const [attachments, setAttachments] = React.useState<File[]>([])
    const [discardConfirm, setDiscardConfirm] = React.useState(false)

    const handleSend = async () => {
        if (!email.to.trim()) {
            toast({ title: 'Please enter a recipient', variant: 'destructive' })
            return
        }
        if (!email.subject.trim()) {
            toast({ title: 'Please enter a subject', variant: 'destructive' })
            return
        }

        setIsSending(true)
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsSending(false)
        
        toast({ title: 'Email sent successfully!', variant: 'success' })
        setLocation('/mail/sent')
    }

    const handleSaveDraft = async () => {
        setIsSaved(true)
        toast({ title: 'Draft saved', variant: 'success' })
        setTimeout(() => setIsSaved(false), 2000)
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

    return (
        <MailLayout>
            <div className="h-full flex flex-col bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
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
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSaveDraft}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400 transition-colors"
                            title="Save draft"
                        >
                            <Save className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleDiscard}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                            title="Discard"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleSend}
                            disabled={isSending}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
                        >
                            {isSending ? (
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
                    <div className="max-w-4xl mx-auto p-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <label className="w-16 text-sm font-medium text-gray-600 dark:text-gray-400">
                                    To
                                </label>
                                <input
                                    type="email"
                                    value={email.to}
                                    onChange={(e) => setEmail({ ...email, to: e.target.value })}
                                    placeholder=" recipient@example.com"
                                    className="flex-1 px-3 py-2 bg-transparent border-0 border-b border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400"
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
                                    <label className="w-16 text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Cc
                                    </label>
                                    <input
                                        type="email"
                                        value={email.cc}
                                        onChange={(e) => setEmail({ ...email, cc: e.target.value })}
                                        placeholder=" cc@example.com"
                                        className="flex-1 px-3 py-2 bg-transparent border-0 border-b border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400"
                                    />
                                </div>
                            )}

                            {showBcc && (
                                <div className="flex items-center gap-4">
                                    <label className="w-16 text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Bcc
                                    </label>
                                    <input
                                        type="email"
                                        value={email.bcc}
                                        onChange={(e) => setEmail({ ...email, bcc: e.target.value })}
                                        placeholder=" bcc@example.com"
                                        className="flex-1 px-3 py-2 bg-transparent border-0 border-b border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400"
                                    />
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <label className="w-16 text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    value={email.subject}
                                    onChange={(e) => setEmail({ ...email, subject: e.target.value })}
                                    placeholder=" Enter subject"
                                    className="flex-1 px-3 py-2 bg-transparent border-0 border-b border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 text-lg"
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-1 border-b border-gray-200 dark:border-gray-700 pb-2">
                            <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500">
                                <Bold className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500">
                                <Italic className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500">
                                <Underline className="w-4 h-4" />
                            </button>
                            <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
                            <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500">
                                <List className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500">
                                <LinkIcon className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500">
                                <Quote className="w-4 h-4" />
                            </button>
                            <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
                            <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500">
                                <Paperclip className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500">
                                <Image className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500">
                                <Clock className="w-4 h-4" />
                            </button>
                        </div>

                        {attachments.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {attachments.map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-slate-800 rounded-lg"
                                    >
                                        <Paperclip className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            {file.name}
                                        </span>
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

                        <textarea
                            value={email.body}
                            onChange={(e) => setEmail({ ...email, body: e.target.value })}
                            placeholder=" Write your message..."
                            className="w-full h-96 mt-4 px-3 py-2 bg-transparent border-0 focus:ring-0 resize-none text-gray-900 dark:text-white placeholder-gray-400"
                        />
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

            <input
                type="file"
                id="attachments"
                multiple
                onChange={handleAttachment}
                className="hidden"
            />
        </MailLayout>
    )
}
