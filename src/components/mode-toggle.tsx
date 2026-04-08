import { Moon, Sun } from 'lucide-react'

import { Button } from './ui/button'
import { useTheme } from './theme-provider'

export function ModeToggle() {
    const { setTheme } = useTheme()

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => {
                const isDark = document.documentElement.classList.contains('dark')
                setTheme(isDark ? 'light' : 'dark')
            }}
            className="rounded-full shadow-sm-soft border border-border/40 hover:bg-accent"
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
