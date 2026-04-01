import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './button'

interface PaginationControlsProps {
    page: number
    totalPages: number
    onPageChange: (page: number) => void
    total?: number
    itemName?: string
}

export function PaginationControls({ page, totalPages, onPageChange, total, itemName = 'items' }: PaginationControlsProps) {
    if (totalPages <= 1) return null

    return (
        <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
                {total !== undefined
                    ? `Showing ${((page - 1) * 25) + 1}-${Math.min(page * 25, total)} of ${total} ${itemName}`
                    : `Page ${page} of ${totalPages}`
                }
            </p>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                    Page {page} of {totalPages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}
                >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>
        </div>
    )
}
