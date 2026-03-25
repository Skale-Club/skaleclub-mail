import React from 'react'

const MOBILE_BREAKPOINT = 1024

export function useIsMobile() {
    const [isMobile, setIsMobile] = React.useState<boolean>(() => {
        if (typeof window === 'undefined') return false
        return window.innerWidth < MOBILE_BREAKPOINT
    })

    React.useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return isMobile
}

export function useMediaQuery(query: string) {
    const [matches, setMatches] = React.useState<boolean>(() => {
        if (typeof window === 'undefined') return false
        return window.matchMedia(query).matches
    })

    React.useEffect(() => {
        const mediaQuery = window.matchMedia(query)
        const handler = (event: MediaQueryListEvent) => setMatches(event.matches)

        mediaQuery.addEventListener('change', handler)
        return () => mediaQuery.removeEventListener('change', handler)
    }, [query])

    return matches
}
