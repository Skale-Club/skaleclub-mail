import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { RefreshCw, Save, Server, Type } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { apiFetch, getAccessToken } from './helpers'
import { defaultBranding, type BrandingSettings } from '../../lib/branding'

export default function BrandingPage() {
    const queryClient = useQueryClient()
    const [form, setForm] = useState<BrandingSettings>(defaultBranding)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploadingLogo, setIsUploadingLogo] = useState(false)
    const [isUploadingFavicon, setIsUploadingFavicon] = useState(false)
    const [dragActiveLogo, setDragActiveLogo] = useState(false)
    const [dragActiveFavicon, setDragActiveFavicon] = useState(false)

    useEffect(() => {
        void loadBranding()
    }, [])

    async function loadBranding() {
        setIsLoading(true)

        try {
            const data = await apiFetch<BrandingSettings>('/api/system/branding')
            setForm({
                companyName: data.companyName || defaultBranding.companyName,
                applicationName: data.applicationName || defaultBranding.applicationName,
                logoUrl: data.logoUrl || defaultBranding.logoUrl,
                faviconUrl: data.faviconUrl || defaultBranding.faviconUrl,
                mailHost: data.mailHost || defaultBranding.mailHost,
            })
        } catch (error) {
            console.error('Error fetching branding settings:', error)
            window.alert(error instanceof Error ? error.message : 'Failed to load branding settings')
        } finally {
            setIsLoading(false)
        }
    }

    async function handleUpload(field: 'logo' | 'favicon', file: File) {
        if (field === 'logo') {
            setIsUploadingLogo(true)
        } else {
            setIsUploadingFavicon(true)
        }

        try {
            const formData = new FormData()
            formData.append(field, file)

            const data = await apiFetch<{ logoUrl: string; faviconUrl: string }>('/api/system/branding/upload', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${await getAccessToken()}`,
                },
                body: formData,
            })

            setForm((current) => ({
                ...current,
                logoUrl: data.logoUrl,
                faviconUrl: data.faviconUrl,
            }))

            await queryClient.invalidateQueries({ queryKey: ['system-branding'] })
            window.alert(`${field === 'logo' ? 'Logo' : 'Favicon'} uploaded successfully!`)
        } catch (error) {
            window.alert(error instanceof Error ? error.message : `Failed to upload ${field}`)
        } finally {
            if (field === 'logo') {
                setIsUploadingLogo(false)
            } else {
                setIsUploadingFavicon(false)
            }
        }
    }

    function handleFileDrop(field: 'logo' | 'favicon', e: React.DragEvent) {
        e.preventDefault()
        if (field === 'logo') {
            setDragActiveLogo(false)
        } else {
            setDragActiveFavicon(false)
        }

        const file = e.dataTransfer.files[0]
        if (file && file.type.startsWith('image/')) {
            void handleUpload(field, file)
        }
    }

    function handleFileChange(field: 'logo' | 'favicon', e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (file) {
            void handleUpload(field, file)
        }
    }

    async function handleSave() {
        setIsSaving(true)

        try {
            const data = await apiFetch<BrandingSettings>('/api/system/branding', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyName: form.companyName,
                    applicationName: form.applicationName,
                    mailHost: form.mailHost,
                }),
            })

            setForm(data)
            await queryClient.invalidateQueries({ queryKey: ['system-branding'] })
            window.alert('Branding updated successfully.')
        } catch (error) {
            window.alert(error instanceof Error ? error.message : 'Failed to update branding settings')
        } finally {
            setIsSaving(false)
        }
    }

    function updateField(key: 'companyName' | 'applicationName' | 'mailHost', value: string) {
        setForm((current) => ({
            ...current,
            [key]: value,
        }))
    }

    function resetToDefaults() {
        setForm(defaultBranding)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Branding</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage the company name, application name, logo, and favicon shown across the platform.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={resetToDefaults} disabled={isLoading || isSaving || isUploadingLogo || isUploadingFavicon}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reset defaults
                    </Button>
                    <Button type="button" onClick={handleSave} disabled={isLoading || isSaving || isUploadingLogo || isUploadingFavicon}>
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? 'Saving...' : 'Save changes'}
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <Card>
                    <CardHeader>
                        <CardTitle>Brand settings</CardTitle>
                        <CardDescription>Update your company and application details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="companyName">Company name</Label>
                            <div className="relative">
                                <Type className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="companyName"
                                    value={form.companyName}
                                    onChange={(event) => updateField('companyName', event.target.value)}
                                    className="pl-10"
                                    disabled={isLoading || isSaving}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="applicationName">Application name</Label>
                            <Input
                                id="applicationName"
                                value={form.applicationName}
                                onChange={(event) => updateField('applicationName', event.target.value)}
                                disabled={isLoading || isSaving}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Preview</CardTitle>
                        <CardDescription>Quick preview of the current branding values.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-4">
                            <img src={form.logoUrl} alt={`${form.applicationName} logo`} className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                            <div className="min-w-0">
                                <p className="truncate text-base font-semibold text-foreground">{form.applicationName}</p>
                                <p className="truncate text-sm text-muted-foreground">{form.companyName}</p>
                            </div>
                        </div>

                        <div className="rounded-xl border bg-card p-4">
                            <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Browser tab</p>
                            <div className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2">
                                <img src={form.faviconUrl} alt={`${form.applicationName} favicon`} className="h-5 w-5 shrink-0 rounded-sm object-cover" />
                                <span className="truncate text-sm text-foreground">{form.applicationName}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Mail server</CardTitle>
                    <CardDescription>
                        Hostname users should point their MX and Return-Path records to. Used during domain verification.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label htmlFor="mailHost">MX / Return-Path hostname</Label>
                        <div className="relative">
                            <Server className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="mailHost"
                                value={form.mailHost}
                                onChange={(event) => updateField('mailHost', event.target.value)}
                                className="pl-10"
                                placeholder="mx.yourplatform.com"
                                disabled={isLoading || isSaving}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            This value is used in MX record validation (<code>mx.yourplatform.com</code>), Return-Path CNAME target, and SPF include.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Logo</CardTitle>
                        <CardDescription>Upload your logo. SVG, PNG, or WebP. Max 5MB.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div
                            className={`relative flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
                                dragActiveLogo
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                            }`}
                            onDragOver={(e) => { e.preventDefault(); setDragActiveLogo(true) }}
                            onDragLeave={() => setDragActiveLogo(false)}
                            onDrop={(e) => handleFileDrop('logo', e)}
                            onClick={() => document.getElementById('logo-input')?.click()}
                        >
                            <input
                                type="file"
                                id="logo-input"
                                className="hidden"
                                accept="image/svg+xml,image/png,image/webp"
                                onChange={(e) => handleFileChange('logo', e)}
                                disabled={isUploadingLogo}
                            />

                            {isUploadingLogo ? (
                                <div className="flex flex-col items-center gap-3">
                                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                                    <p className="text-sm text-muted-foreground">Uploading...</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4">
                                    <img
                                        src={form.logoUrl}
                                        alt="Logo"
                                        className="h-24 w-24 rounded-xl object-contain"
                                    />
                                    <p className="text-xs text-muted-foreground">Click or drop to replace</p>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <img src={form.logoUrl} alt="Current logo" className="h-8 w-8 rounded object-contain" />
                            <span className="flex-1 truncate text-sm text-muted-foreground">{form.logoUrl}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Favicon</CardTitle>
                        <CardDescription>Upload your favicon. SVG, PNG, ICO, or WebP. Max 5MB.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div
                            className={`relative flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
                                dragActiveFavicon
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                            }`}
                            onDragOver={(e) => { e.preventDefault(); setDragActiveFavicon(true) }}
                            onDragLeave={() => setDragActiveFavicon(false)}
                            onDrop={(e) => handleFileDrop('favicon', e)}
                            onClick={() => document.getElementById('favicon-input')?.click()}
                        >
                            <input
                                type="file"
                                id="favicon-input"
                                className="hidden"
                                accept="image/svg+xml,image/png,image/x-icon,image/webp"
                                onChange={(e) => handleFileChange('favicon', e)}
                                disabled={isUploadingFavicon}
                            />

                            {isUploadingFavicon ? (
                                <div className="flex flex-col items-center gap-3">
                                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                                    <p className="text-sm text-muted-foreground">Uploading...</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4">
                                    <img
                                        src={form.faviconUrl}
                                        alt="Favicon"
                                        className="h-16 w-16 rounded object-contain"
                                    />
                                    <p className="text-xs text-muted-foreground">Click or drop to replace</p>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <img src={form.faviconUrl} alt="Current favicon" className="h-8 w-8 rounded object-contain" />
                            <span className="flex-1 truncate text-sm text-muted-foreground">{form.faviconUrl}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
