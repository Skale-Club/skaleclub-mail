import * as React from 'react'
import * as ToastPrimitives from '@radix-ui/react-toast'

const ToastProvider = ToastPrimitives.Provider
const ToastViewport = ToastPrimitives.Viewport
const Toast = ToastPrimitives.Root
const ToastClose = ToastPrimitives.Close
const ToastTitle = ToastPrimitives.Title
const ToastDescription = ToastPrimitives.Description

interface ToastProps {
    id: string
    title?: string
    description?: string
    variant?: 'default' | 'success' | 'destructive'
}

interface ToastContextValue {
    toasts: ToastProps[]
    addToast: (toast: Omit<ToastProps, 'id'>) => void
    removeToast: (id: string) => void
}

export const ToastContext = React.createContext<ToastContextValue>({
    toasts: [],
    addToast: () => { },
    removeToast: () => { },
})

export function Toaster() {
    const [toasts, setToasts] = React.useState<ToastProps[]>([])

    const addToast = (toast: Omit<ToastProps, 'id'>) => {
        const id = crypto.randomUUID()
        setToasts((prev) => [...prev, { ...toast, id }])

        setTimeout(() => {
            removeToast(id)
        }, 5000)
    }

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            <ToastProvider>
                <ToastViewport>
                    {toasts.map((toast) => (
                        <Toast key={toast.id} className="bg-background border rounded-lg p-4 shadow-lg">
                            <div className="flex justify-between items-start gap-2">
                                <div>
                                    {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
                                    {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
                                </div>
                                <ToastClose className="cursor-pointer">✕</ToastClose>
                            </div>
                        </Toast>
                    ))}
                </ToastViewport>
            </ToastProvider>
        </ToastContext.Provider>
    )
}

export const useToast = () => {
    const context = React.useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a Toaster')
    }
    return {
        toast: (props: Omit<ToastProps, 'id'>) => context.addToast(props),
        dismiss: (id: string) => context.removeToast(id),
    }
}
