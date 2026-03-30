import React, { useState } from 'react'
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useMultiSession } from '../../hooks/useMultiSession'
import { toast } from '../../components/ui/toaster'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '../../components/ui/Dialog'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'

interface AddAccountDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AddAccountDialog({ open, onOpenChange }: AddAccountDialogProps) {
    const { addAccount, isAddingAccount, addAccountError, clearAddAccountError } = useMultiSession()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [localError, setLocalError] = useState<string | null>(null)

    const error = localError || addAccountError

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLocalError(null)
        clearAddAccountError()

        if (!email || !password) {
            setLocalError('Please enter both email and password.')
            return
        }

        try {
            await addAccount(email, password)
            setEmail('')
            setPassword('')
            setShowPassword(false)
            onOpenChange(false)
            toast({ title: 'Account added successfully', variant: 'success' })
        } catch {
            const err = addAccountError
            if (err && !err.includes('already added')) {
                setLocalError(err)
            }
        }
    }

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            setEmail('')
            setPassword('')
            setShowPassword(false)
            setLocalError(null)
            clearAddAccountError()
        }
        onOpenChange(nextOpen)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Another Account</DialogTitle>
                    <DialogDescription>
                        Sign in with a different email to add it to your panel.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div className="space-y-2">
                        <Label htmlFor="add-account-email" className="text-sm font-medium">
                            Email address
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="add-account-email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-11 pl-10 bg-background"
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="add-account-password" className="text-sm font-medium">
                            Password
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="add-account-password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-11 pl-10 pr-10 bg-background"
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3">
                            <p className="text-sm font-medium text-destructive">{error}</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleOpenChange(false)}
                            disabled={isAddingAccount}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" disabled={isAddingAccount}>
                            {isAddingAccount ? (
                                <span className="flex items-center gap-2">
                                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Sign In
                                    <ArrowRight className="h-4 w-4" />
                                </span>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
