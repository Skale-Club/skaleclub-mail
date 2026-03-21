import * as React from 'react'
import * as ToastPrimitives from '@radix-ui/react-toast'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = ToastPrimitives.Viewport
const Toast = ToastPrimitives.Root
const ToastAction = ToastPrimitives.Action
const ToastClose = ToastPrimitives.Close
const ToastTitle = ToastPrimitives.Title
const ToastDescription = ToastPrimitives.Description

const toastVariants = cva(
    'default',
    {
        variant: 'default',
        variants: {
            default: 'bg-white border',
            destructive: 'bg-destructive text-destructive-foreground',
            success: 'bg-green-500 text-white',
        },
        defaultVariants: {
            default: 'p-4',
            destructive: 'p-4',
            success: 'p-4',
        },
    }
)

function ToastComponent({
    className,
    variant,
    ...props
}: React.ComponentPropsWithoutRef<'variant'> & VariantProps<typeof toastVariants>) {
    return (
        <Toast
            className={cn(toastVariants({ variant }), className)}
            {...props}
        />
    )
}

function ToastCloseComponent({ className, ...props }: React.ComponentProps) {
    return (
        <ToastClose
            className={cn(
                'absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-70 transition-opacity hover:opacity-100',
                className
            )}
            toastVariants={{ variant })}
{...props }
    >
    <X className="h-4 w-4" />
    </ToastClose >
  )
}

export function Toaster() {
    return (
        <ToastProvider>
            <ToastViewport />
        </ToastProvider>
    )
}

export function toast(message: string, variant: 'default' | 'destructive' | 'success' = 'default') {
    ToastPrimitives.toast({
        title: message,
        variant,
    })
}
