import React, { useState, useRef, useCallback, useEffect } from 'react'

interface ResizablePanelsProps {
    left: React.ReactNode
    right: React.ReactNode
    defaultLeftPercent?: number
    minLeftPercent?: number
    maxLeftPercent?: number
    storageKey?: string
    leftClassName?: string
    rightClassName?: string
}

export function ResizablePanels({
    left,
    right,
    defaultLeftPercent = 40,
    minLeftPercent = 20,
    maxLeftPercent = 70,
    storageKey,
    leftClassName = 'flex flex-col bg-background',
    rightClassName = 'flex flex-col bg-muted/30',
}: ResizablePanelsProps) {
    const [leftPercent, setLeftPercent] = useState(() => {
        if (storageKey) {
            const stored = localStorage.getItem(storageKey)
            if (stored) {
                const val = Number(stored)
                if (!isNaN(val)) return val
            }
        }
        return defaultLeftPercent
    })

    const containerRef = useRef<HTMLDivElement>(null)
    const isDragging = useRef(false)

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging.current || !containerRef.current) return

        const rect = containerRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const pct = Math.min(Math.max((x / rect.width) * 100, minLeftPercent), maxLeftPercent)

        setLeftPercent(pct)
        if (storageKey) localStorage.setItem(storageKey, String(pct))
    }, [minLeftPercent, maxLeftPercent, storageKey])

    const handleMouseUp = useCallback(() => {
        if (!isDragging.current) return
        isDragging.current = false
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
    }, [])

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [handleMouseMove, handleMouseUp])

    const handleDividerMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        isDragging.current = true
        document.body.style.cursor = 'col-resize'
        document.body.style.userSelect = 'none'
    }, [])

    return (
        <div ref={containerRef} className="flex h-full overflow-hidden">
            <div style={{ width: `${leftPercent}%` }} className={`overflow-hidden ${leftClassName}`}>
                {left}
            </div>

            {/* Draggable divider */}
            <div
                onMouseDown={handleDividerMouseDown}
                className="relative z-10 w-px flex-shrink-0 cursor-col-resize bg-border group select-none"
                role="separator"
                aria-orientation="vertical"
            >
                {/* Wider invisible hit area */}
                <div className="absolute inset-y-0 -left-1.5 -right-1.5" />
                {/* Highlight on hover/drag */}
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/40 transition-colors duration-150" />
            </div>

            <div style={{ width: `${100 - leftPercent}%` }} className={`overflow-hidden ${rightClassName}`}>
                {right}
            </div>
        </div>
    )
}
