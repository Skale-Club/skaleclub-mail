import { format } from 'date-fns'

const BUILD_TIMESTAMP = import.meta.env.VITE_BUILD_TIMESTAMP as string | undefined

export function DeployFooter() {
    if (!BUILD_TIMESTAMP) return null

    const date = format(new Date(BUILD_TIMESTAMP), "MMM d, yyyy 'at' h:mm a")

    return (
        <footer className="px-4 py-1.5 text-center text-[10px] text-muted-foreground/40">
            Last deploy: {date}
        </footer>
    )
}
