import { ReactNode } from 'react'
import { useOutreach } from '../hooks/useOutreach'
import { Loader2 } from 'lucide-react'

interface OutreachCheckProps {
    children: ReactNode
}

export function OutreachCheck({ children }: OutreachCheckProps) {
    const { isEnabled, isLoading } = useOutreach()

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!isEnabled) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
                <div className="text-lg font-semibold text-foreground mb-2">
                    Outreach System Disabled
                </div>
                <p className="text-muted-foreground max-w-md">
                    The outreach system is currently disabled by the administrator. 
                    Contact your admin to enable cold email outreach.
                </p>
            </div>
        )
    }

    return <>{children}</>
}
