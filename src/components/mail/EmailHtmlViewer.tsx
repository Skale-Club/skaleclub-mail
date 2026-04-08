import { useRef, useEffect, useState } from 'react'
import { Maximize2 } from 'lucide-react'
import { Dialog, DialogContent } from '../ui/Dialog'

interface EmailHtmlViewerProps {
    html?: string | null
    plainText?: string | null
    emailDarkMode?: boolean
    expandable?: boolean
    isLoading?: boolean
}

/**
 * Renders email HTML content in a sandboxed iframe.
 * Falls back to plain text if no HTML is available.
 * The iframe auto-resizes to fit its content.
 */
export function EmailHtmlViewer({ html, plainText, emailDarkMode, expandable = true, isLoading = false }: EmailHtmlViewerProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [height, setHeight] = useState(200)
    const [isExpanded, setIsExpanded] = useState(false)

    useEffect(() => {
        const iframe = iframeRef.current
        if (!iframe || !html) return

        const doc = iframe.contentDocument || iframe.contentWindow?.document
        if (!doc) return

        // Wrap HTML with styles that adapt to dark/light mode
        const wrappedHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
    * { box-sizing: border-box; }
    body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.6;
        word-wrap: break-word;
        overflow-wrap: break-word;
        color: inherit;
        background: transparent;
    }
    img { max-width: 100%; height: auto; }
    a { color: #3b82f6; }
    pre, code { white-space: pre-wrap; word-wrap: break-word; }
    table { max-width: 100%; border-collapse: collapse; }
    blockquote {
        margin: 8px 0;
        padding: 4px 12px;
        border-left: 3px solid #d1d5db;
        color: #6b7280;
    }
</style>
</head>
<body>${html}</body>
</html>`

        doc.open()
        doc.write(wrappedHtml)
        doc.close()

        // Auto-resize iframe to fit content
        const resize = () => {
            if (doc.body) {
                const newHeight = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight, 100)
                setHeight(newHeight + 20)
            }
        }

        // Resize after images load
        const images = doc.querySelectorAll('img')
        let loadedCount = 0
        const totalImages = images.length

        if (totalImages === 0) {
            setTimeout(resize, 50)
        } else {
            images.forEach(img => {
                img.addEventListener('load', () => {
                    loadedCount++
                    if (loadedCount >= totalImages) resize()
                })
                img.addEventListener('error', () => {
                    loadedCount++
                    if (loadedCount >= totalImages) resize()
                })
            })
            // Fallback resize
            setTimeout(resize, 500)
        }

        // Initial resize
        setTimeout(resize, 100)

        // Open links in new tab
        doc.addEventListener('click', (e: MouseEvent) => {
            const target = e.target as HTMLElement
            const anchor = target.closest('a')
            if (anchor) {
                e.preventDefault()
                const href = anchor.getAttribute('href')
                if (href && !href.startsWith('javascript:')) {
                    window.open(href, '_blank', 'noopener,noreferrer')
                }
            }
        })
    }, [html])

    if (isLoading) {
        return (
            <div className="rounded-2xl border border-border/70 bg-muted/20 px-5 py-6">
                <div className="mb-5 flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="h-4 w-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                    <span>Loading message content...</span>
                </div>
                <div className="space-y-3 animate-pulse">
                    <div className="h-3.5 w-11/12 rounded-full bg-muted" />
                    <div className="h-3.5 w-10/12 rounded-full bg-muted" />
                    <div className="h-3.5 w-9/12 rounded-full bg-muted" />
                    <div className="h-3.5 w-7/12 rounded-full bg-muted" />
                    <div className="h-20 w-full rounded-2xl bg-muted/80" />
                </div>
            </div>
        )
    }

    // Plain text fallback
    if (!html) {
        return (
            <div className="text-foreground whitespace-pre-wrap text-sm leading-relaxed">
                {plainText || '(No content)'}
            </div>
        )
    }

    return (
        <>
            <div className="relative group">
                {expandable && (
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 inline-flex h-7 w-7 items-center justify-center rounded-md bg-background/80 backdrop-blur-sm border border-border text-muted-foreground transition-all hover:text-foreground hover:bg-accent"
                        title="Expand email"
                        aria-label="Expand email"
                    >
                        <Maximize2 className="h-3.5 w-3.5" />
                    </button>
                )}
                <iframe
                    ref={iframeRef}
                    sandbox="allow-same-origin"
                    title="Email content"
                    style={{
                        width: '100%',
                        height: `${height}px`,
                        border: 'none',
                        overflow: 'hidden',
                        display: 'block',
                        filter: emailDarkMode ? 'invert(1) hue-rotate(180deg)' : undefined,
                        transition: 'filter 0.2s ease',
                    }}
                />
            </div>

            {expandable && (
                <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
                    <DialogContent className="max-w-[95vw] w-[95vw] h-[92vh] flex flex-col p-0 gap-0 overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-6">
                            <EmailHtmlViewer
                                html={html}
                                plainText={plainText}
                                emailDarkMode={emailDarkMode}
                                expandable={false}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    )
}
