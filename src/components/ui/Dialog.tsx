import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

interface DialogProps {
    open: boolean
    title?: string
    description?: string
    children?: React.ReactNode
}

export function Dialog({ open, title, description, children }: DialogProps) {
    return (
        <DialogPrimitive.Root open={open}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-black/50" />
                <DialogPrimitive.Content className="fixed left-[50%] top-[50%] translate-y-[-50%] overflow-y-auto rounded-sm bg-white p-6 w-full max-w-lg">
                    <DialogPrimitive.Title className="text-lg font-semibold">
                        {title}
                    </DialogPrimitive.Title>
                    {description && (
                        <DialogPrimitive.Description className="text-sm text-muted-foreground">
                            {description}
                        </DialogPrimitive.Close>
              </DialogPrimitive.Content>
            </DialogPrimitive.Overlay>
        </DialogPrimitive.Portal>
        </DialogPrimitive.Root >
      )
    </DialogContent >
  )
}
