import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type ClassName = string | ClassValue | undefined

export function cn(...inputs: ClassName[]) {
    return twMerge(clsx(inputs))
}
