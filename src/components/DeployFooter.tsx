import { format } from 'date-fns'

const BUILD_TIMESTAMP = import.meta.env.VITE_BUILD_TIMESTAMP as string | undefined

export function DeployFooter() {
    if (!BUILD_TIMESTAMP) return null

    const date = format(new Date(BUILD_TIMESTAMP), "dd/MM/yyyy 'às' HH:mm:ss")

    return (
        <footer className="px-4 lg:px-6 py-3 text-center text-xs text-muted-foreground/60 border-t border-border/50">
            Último deploy: {date}
        </footer>
    )
}
