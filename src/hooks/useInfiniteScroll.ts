import React from 'react'

interface UseInfiniteScrollOptions {
    hasMore: boolean
    isLoading: boolean
    onLoadMore: () => void
    threshold?: number
}

export function useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore,
    threshold = 200
}: UseInfiniteScrollOptions) {
    const observerRef = React.useRef<IntersectionObserver | null>(null)
    const loadMoreRef = React.useRef<HTMLDivElement | null>(null)

    React.useEffect(() => {
        const options = {
            rootMargin: `${threshold}px`,
            threshold: 0
        }

        observerRef.current = new IntersectionObserver((entries) => {
            const [entry] = entries
            if (entry.isIntersecting && hasMore && !isLoading) {
                onLoadMore()
            }
        }, options)

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current)
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect()
            }
        }
    }, [hasMore, isLoading, onLoadMore, threshold])

    return { loadMoreRef }
}

export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
    const [storedValue, setStoredValue] = React.useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key)
            return item ? JSON.parse(item) : initialValue
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error)
            return initialValue
        }
    })

    const setValue = React.useCallback((value: T | ((prev: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value
            setStoredValue(valueToStore)
            window.localStorage.setItem(key, JSON.stringify(valueToStore))
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error)
        }
    }, [key, storedValue])

    return [storedValue, setValue]
}
