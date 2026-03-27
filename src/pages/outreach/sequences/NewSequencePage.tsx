import React from 'react'
import { Link, useLocation } from 'wouter'
import { ArrowLeft, Save, Plus, Clock, Mail, Trash2 } from 'lucide-react'
import { OutreachLayout } from '../../../components/outreach/OutreachLayout'
import { toast } from '../../../components/ui/toaster'

interface Step {
    id: string
    type: 'email' | 'delay'
    order: number
    delayDays: number
    subject: string
    bodyHtml: string
}

export function NewSequencePage() {
    const [, navigate] = useLocation()
    const [name, setName] = React.useState('')
    const [steps, setSteps] = React.useState<Step[]>([
        {
            id: '1',
            type: 'email',
            order: 1,
            delayDays: 0,
            subject: '',
            bodyHtml: ''
        }
    ])
    const [isSaving, setIsSaving] = React.useState(false)

    const addStep = (type: 'email' | 'delay') => {
        setSteps(prev => [
            ...prev,
            {
                id: Math.random().toString(36).substring(7),
                type,
                order: prev.length + 1,
                delayDays: type === 'delay' ? 3 : 0,
                subject: '',
                bodyHtml: ''
            }
        ])
    }

    const removeStep = (id: string) => {
        setSteps(prev => prev.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i + 1 })))
    }

    const updateStep = (id: string, updates: Partial<Step>) => {
        setSteps(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
    }

    const handleSave = async () => {
        if (!name.trim()) {
            toast({ title: 'Please enter a sequence name', variant: 'destructive' })
            return
        }

        setIsSaving(true)
        try {
            // NOTE: Replace with actual API call
            console.log('Saving sequence:', { name, steps })
            toast({ title: 'Sequence saved successfully', variant: 'success' })
            navigate('/outreach/sequences')
        } catch (error) {
            toast({ title: 'Failed to save sequence', variant: 'destructive' })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <OutreachLayout>
            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-6">
                    <div className="flex items-center gap-4">
                        <Link href="/outreach/sequences" className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="My New Sequence"
                                className="bg-transparent text-2xl font-bold text-foreground outline-none placeholder:text-muted-foreground"
                            />
                            <p className="text-sm text-muted-foreground">Draft • {steps.length} steps</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                        <Save className="h-5 w-5" />
                        {isSaving ? 'Saving...' : 'Save Sequence'}
                    </button>
                </div>

                <div className="space-y-6 py-4">
                    {steps.map((step, index) => (
                        <div key={step.id} className="relative rounded-xl border border-border bg-card shadow-sm">
                            {/* Step Connector Line */}
                            {index > 0 && (
                                <div className="absolute -top-6 left-8 h-6 w-0.5 bg-border" />
                            )}

                            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent font-semibold text-foreground">
                                        {step.order}
                                    </div>
                                    <h3 className="font-medium text-foreground">
                                        {step.type === 'email' ? 'Send Email' : 'Wait'}
                                    </h3>
                                </div>
                                {steps.length > 1 && (
                                    <button
                                        onClick={() => removeStep(step.id)}
                                        className="rounded-lg p-2 text-gray-500 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            <div className="p-4">
                                {step.type === 'delay' ? (
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-sm text-foreground">Wait for</span>
                                        <input
                                            type="number"
                                            value={step.delayDays}
                                            onChange={(e) => updateStep(step.id, { delayDays: parseInt(e.target.value) || 0 })}
                                            className="w-20 rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                                        />
                                        <span className="text-sm text-foreground">days</span>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-foreground">Subject</label>
                                            <input
                                                type="text"
                                                value={step.subject}
                                                onChange={(e) => updateStep(step.id, { subject: e.target.value })}
                                                placeholder="e.g., Quick question about {{companyName}}"
                                                className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:border-primary focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-foreground">Message Body</label>
                                            <textarea
                                                value={step.bodyHtml}
                                                onChange={(e) => updateStep(step.id, { bodyHtml: e.target.value })}
                                                rows={5}
                                                placeholder="Hi {{firstName}}, ..."
                                                className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:border-primary focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Add Action Buttons */}
                    <div className="flex justify-center gap-4 pt-4">
                        <button
                            onClick={() => addStep('email')}
                            className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-accent"
                        >
                            <Mail className="h-4 w-4" />
                            Add Email
                        </button>
                        <button
                            onClick={() => addStep('delay')}
                            className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-accent"
                        >
                            <Clock className="h-4 w-4" />
                            Add Delay
                        </button>
                    </div>
                </div>
            </div>
        </OutreachLayout>
    )
}

export default NewSequencePage
