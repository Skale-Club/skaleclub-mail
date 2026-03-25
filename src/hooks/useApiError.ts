import { useState, useCallback } from 'react'
import { toast } from '../components/ui/toaster'

interface ApiError {
    message: string
    code?: string
    status?: number
    details?: unknown
}

export function useApiError() {
    const [error, setError] = useState<ApiError | null>(null)
    const [isError, setIsError] = useState(false)

    const handleError = useCallback((err: unknown, fallbackMessage = 'An error occurred') => {
        const apiError: ApiError = {
            message: fallbackMessage,
            details: err
        }

        if (err instanceof Error) {
            apiError.message = err.message
        } else if (typeof err === 'object' && err !== null) {
            const anyErr = err as Record<string, unknown>
            if (anyErr.message) {
                apiError.message = String(anyErr.message)
            }
            if (anyErr.code) {
                apiError.code = String(anyErr.code)
            }
            if (anyErr.status) {
                apiError.status = Number(anyErr.status)
            }
        }

        setError(apiError)
        setIsError(true)

        toast({
            title: 'Error',
            description: apiError.message,
            variant: 'destructive'
        })

        return apiError
    }, [])

    const clearError = useCallback(() => {
        setError(null)
        setIsError(false)
    }, [])

    const withErrorHandling = useCallback(<T,>(
        asyncFn: () => Promise<T>,
        fallbackMessage?: string
    ): Promise<T | null> => {
        return asyncFn().catch((err) => {
            handleError(err, fallbackMessage)
            return null
        })
    }, [handleError])

    return {
        error,
        isError,
        handleError,
        clearError,
        withErrorHandling
    }
}

export function parseApiError(error: unknown): ApiError {
    if (error instanceof Error) {
        return { message: error.message, details: error }
    }

    if (typeof error === 'object' && error !== null) {
        const anyErr = error as Record<string, unknown>
        return {
            message: String(anyErr.message || 'Unknown error'),
            code: anyErr.code ? String(anyErr.code) : undefined,
            status: anyErr.status ? Number(anyErr.status) : undefined,
            details: error
        }
    }

    return { message: 'An unexpected error occurred', details: error }
}

export function getErrorMessage(error: unknown): string {
    return parseApiError(error).message
}

export function isNetworkError(error: unknown): boolean {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return true
    }
    
    const apiError = parseApiError(error)
    return apiError.code === 'NETWORK_ERROR' || apiError.status === 0
}

export function isAuthError(error: unknown): boolean {
    const apiError = parseApiError(error)
    return apiError.status === 401 || apiError.status === 403
}

export function isNotFoundError(error: unknown): boolean {
    const apiError = parseApiError(error)
    return apiError.status === 404
}
