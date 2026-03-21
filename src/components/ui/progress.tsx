import { cn } from '../../lib/utils'

interface ProgressProps {
    value: number // 0-100
    className?: string
    indicatorClassName?: string
}

function Progress({ value, className, indicatorClassName }: ProgressProps) {
    const clamped = Math.min(100, Math.max(0, value))
    return (
        <div className={cn('h-2 w-full overflow-hidden rounded-full bg-secondary', className)}>
            <div
                className={cn('h-full rounded-full bg-primary transition-all', indicatorClassName)}
                style={{ width: `${clamped}%` }}
            />
        </div>
    )
}

export { Progress }
