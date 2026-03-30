import React, { useRef, useEffect, useState } from 'react'

interface EmailHtmlViewerProps {
    html?: string | null
    plainText?: string | null
    emailDarkMode?: boolean
}

/**
 * Renders email HTML content in a sandboxed iframe.
 * Falls back to plain text if no HTML is available.
 * The iframe auto-resizes to fit its content.
 */
export function EmailHtmlViewer({ html, plainText, emailDarkMode }: EmailHtmlViewerProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [height, setHeight] = useState(200)

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

    // Plain text fallback
    if (!html) {
        return (
            <div className="text-foreground whitespace-pre-wrap text-sm leading-relaxed">
                {plainText || '(No content)'}
            </div>
        )
    }

    return (
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
    )
}
