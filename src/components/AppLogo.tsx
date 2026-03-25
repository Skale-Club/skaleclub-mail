import { useBranding } from '../lib/branding'

interface AppLogoProps {
    className?: string
    alt?: string
}

export function AppLogo({ className = '', alt }: AppLogoProps) {
    const { branding } = useBranding()

    return <img src={branding.logoUrl} alt={alt || `${branding.applicationName} logo`} className={className} />
}
