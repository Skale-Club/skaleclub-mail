import { htmlToText } from 'html-to-text'

export function htmlToPlainText(html: string): string {
    return htmlToText(html, {
        wordwrap: 130,
        selectors: [
            { selector: 'a', options: { hideLinkHrefIfSameAsText: true } },
            { selector: 'img', format: 'skip' },
        ],
    })
}

export function createMultipartEmail(plainBody: string | undefined, htmlBody: string | undefined): {
    headers: string[]
    body: string
} {
    const boundary = `----=_Part_${Math.random().toString(36).substring(2)}_${Date.now()}`
    
    if (htmlBody && plainBody) {
        return {
            headers: [
                'MIME-Version: 1.0',
                `Content-Type: multipart/alternative; boundary="${boundary}"`,
            ],
            body: [
                '',
                `--${boundary}`,
                'Content-Type: text/plain; charset=UTF-8',
                '',
                plainBody,
                '',
                `--${boundary}`,
                'Content-Type: text/html; charset=UTF-8',
                '',
                htmlBody,
                '',
                `--${boundary}--`,
            ].join('\r\n'),
        }
    }
    
    if (htmlBody && !plainBody) {
        const generatedPlain = htmlToPlainText(htmlBody)
        return {
            headers: [
                'MIME-Version: 1.0',
                `Content-Type: multipart/alternative; boundary="${boundary}"`,
            ],
            body: [
                '',
                `--${boundary}`,
                'Content-Type: text/plain; charset=UTF-8',
                '',
                generatedPlain,
                '',
                `--${boundary}`,
                'Content-Type: text/html; charset=UTF-8',
                '',
                htmlBody,
                '',
                `--${boundary}--`,
            ].join('\r\n'),
        }
    }
    
    return {
        headers: [
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
        ],
        body: `\r\n${plainBody || ''}`,
    }
}
