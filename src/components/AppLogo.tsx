import { useState, useRef, useEffect, memo } from 'react'
import { useBranding } from '../lib/branding'

interface AppLogoProps {
    className?: string
    alt?: string
}

export const AppLogo = memo(function AppLogo({ className = '', alt }: AppLogoProps) {
    const { branding, isSuccess } = useBranding()
    const [loaded, setLoaded] = useState(false)
    const prevSrc = useRef<string | null>(null)

    const src = isSuccess ? branding.logoUrl : '/brand-mark.svg'

    useEffect(() => {
        if (prevSrc.current !== null && prevSrc.current !== src) {
            setLoaded(false)
        }
        prevSrc.current = src
    }, [src])

    return (
        <img
            src={src}
            alt={alt || `${branding.applicationName} logo`}
            className={`${className} transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setLoaded(true)}
        />
    )
})
