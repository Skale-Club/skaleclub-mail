import * as React from 'react'
import { cn } from '../../lib/utils'

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
    default: 'border-transparent bg-primary text-primary-foreground',
    secondary: 'border-transparent bg-secondary text-secondary-foreground',
    destructive: 'border-transparent bg-destructive text-destructive-foreground',
    outline: 'border border-input text-foreground',
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
    return (
        <div
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                variantClasses[variant],
                className
            )}
            {...props}
        />
    )
}
