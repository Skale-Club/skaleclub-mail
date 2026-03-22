import React from 'react'
import { MailLayout } from '../../components/mail/MailLayout'
import { toast } from '../../components/ui/toaster'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Switch } from '../../components/ui/switch'
import {
    User,
    Bell,
    Shield,
    Palette,
    Key,
    Globe,
    Smartphone,
    Clock
} from 'lucide-react'

type TabId = 'profile' | 'notifications' | 'security' | 'appearance' | 'integrations'

interface Tab {
    id: TabId
    label: string
    icon: React.ReactNode
}

const tabs: Tab[] = [
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-5 h-5" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-5 h-5" /> },
    { id: 'integrations', label: 'Integrations', icon: <Globe className="w-5 h-5" /> },
]

export default function MailSettingsPage() {
    const [activeTab, setActiveTab] = React.useState<TabId>('profile')
    const [isSaving, setIsSaving] = React.useState(false)

    const [profile, setProfile] = React.useState({
        firstName: 'John',
        lastName: 'Doe',
        email: 'user@skaleclub.com',
        displayName: 'John Doe',
        bio: 'Product developer and email enthusiast',
        timezone: 'America/New_York',
    })

    const [notifications, setNotifications] = React.useState({
        emailNotifications: true,
        pushNotifications: false,
        dailyDigest: true,
        weeklyReport: true,
        marketingEmails: false,
        soundEnabled: true,
        desktopNotifications: true,
    })

    const [security, setSecurity] = React.useState({
        twoFactorEnabled: false,
        sessionTimeout: '30',
        loginAlerts: true,
    })

    const [appearance, setAppearance] = React.useState({
        theme: 'system',
        compactMode: false,
        showLineNumbers: false,
        conversationView: true,
    })

    const handleSave = async () => {
        setIsSaving(true)
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsSaving(false)
        toast({ title: 'Settings saved successfully', variant: 'success' })
    }

    return (
        <MailLayout>
            <div className="h-full overflow-y-auto">
                <div className="max-w-5xl mx-auto p-6">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Manage your email account settings
                        </p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="lg:w-64 flex-shrink-0">
                            <nav className="space-y-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`
                                            w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                                            ${activeTab === tab.id
                                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                                            }
                                        `}
                                    >
                                        {tab.icon}
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="flex-1">
                            {activeTab === 'profile' && (
                                <div className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <User className="w-5 h-5" />
                                                Profile Information
                                            </CardTitle>
                                            <CardDescription>
                                                Update your personal information
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="firstName">First name</Label>
                                                    <Input
                                                        id="firstName"
                                                        value={profile.firstName}
                                                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="lastName">Last name</Label>
                                                    <Input
                                                        id="lastName"
                                                        value={profile.lastName}
                                                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <Label htmlFor="email">Email address</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={profile.email}
                                                    disabled
                                                    className="opacity-60"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Contact support to change your email address
                                                </p>
                                            </div>
                                            <div>
                                                <Label htmlFor="displayName">Display name</Label>
                                                <Input
                                                    id="displayName"
                                                    value={profile.displayName}
                                                    onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="bio">Bio</Label>
                                                <textarea
                                                    id="bio"
                                                    value={profile.bio}
                                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                                                    rows={3}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="timezone">Timezone</Label>
                                                <select
                                                    id="timezone"
                                                    value={profile.timezone}
                                                    onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                                                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="America/New_York">Eastern Time (US & Canada)</option>
                                                    <option value="America/Chicago">Central Time (US & Canada)</option>
                                                    <option value="America/Denver">Mountain Time (US & Canada)</option>
                                                    <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                                                    <option value="Europe/London">London</option>
                                                    <option value="Europe/Paris">Paris</option>
                                                    <option value="Asia/Tokyo">Tokyo</option>
                                                </select>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Bell className="w-5 h-5" />
                                                Notification Preferences
                                            </CardTitle>
                                            <CardDescription>
                                                Choose how you want to be notified
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Label>Email notifications</Label>
                                                    <p className="text-sm text-gray-500">Receive email notifications for new messages</p>
                                                </div>
                                                <Switch
                                                    checked={notifications.emailNotifications}
                                                    onCheckedChange={(checked: boolean) => setNotifications({ ...notifications, emailNotifications: checked })}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Label>Push notifications</Label>
                                                    <p className="text-sm text-gray-500">Receive push notifications on your devices</p>
                                                </div>
                                                <Switch
                                                    checked={notifications.pushNotifications}
                                                    onCheckedChange={(checked: boolean) => setNotifications({ ...notifications, pushNotifications: checked })}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Label>Desktop notifications</Label>
                                                    <p className="text-sm text-gray-500">Show desktop notifications when app is open</p>
                                                </div>
                                                <Switch
                                                    checked={notifications.desktopNotifications}
                                                    onCheckedChange={(checked: boolean) => setNotifications({ ...notifications, desktopNotifications: checked })}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Label>Sound</Label>
                                                    <p className="text-sm text-gray-500">Play sound for new notifications</p>
                                                </div>
                                                <Switch
                                                    checked={notifications.soundEnabled}
                                                    onCheckedChange={(checked: boolean) => setNotifications({ ...notifications, soundEnabled: checked })}
                                                />
                                            </div>
                                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                                <h3 className="font-medium mb-4">Reports</h3>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <Label>Daily digest</Label>
                                                        <p className="text-sm text-gray-500">Receive a daily summary of your activity</p>
                                                    </div>
                                                    <Switch
                                                        checked={notifications.dailyDigest}
                                                        onCheckedChange={(checked: boolean) => setNotifications({ ...notifications, dailyDigest: checked })}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between mt-4">
                                                    <div>
                                                        <Label>Weekly report</Label>
                                                        <p className="text-sm text-gray-500">Receive weekly email analytics</p>
                                                    </div>
                                                    <Switch
                                                        checked={notifications.weeklyReport}
                                                        onCheckedChange={(checked: boolean) => setNotifications({ ...notifications, weeklyReport: checked })}
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Shield className="w-5 h-5" />
                                                Security Settings
                                            </CardTitle>
                                            <CardDescription>
                                                Manage your account security
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Label>Two-factor authentication</Label>
                                                    <p className="text-sm text-gray-500">Add an extra layer of security</p>
                                                </div>
                                                <Button variant="outline">
                                                    {security.twoFactorEnabled ? 'Enabled' : 'Enable'}
                                                </Button>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Label>Login alerts</Label>
                                                    <p className="text-sm text-gray-500">Get notified of new sign-ins</p>
                                                </div>
                                                <Switch
                                                    checked={security.loginAlerts}
                                                    onCheckedChange={(checked: boolean) => setSecurity({ ...security, loginAlerts: checked })}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Label>Session timeout</Label>
                                                    <p className="text-sm text-gray-500">Automatically log out after inactivity</p>
                                                </div>
                                                <select
                                                    value={security.sessionTimeout}
                                                    onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
                                                    className="px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700"
                                                >
                                                    <option value="15">15 minutes</option>
                                                    <option value="30">30 minutes</option>
                                                    <option value="60">1 hour</option>
                                                    <option value="never">Never</option>
                                                </select>
                                            </div>
                                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                                <Button variant="outline" className="flex items-center gap-2">
                                                    <Key className="w-4 h-4" />
                                                    Change password
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {activeTab === 'appearance' && (
                                <div className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Palette className="w-5 h-5" />
                                                Appearance Settings
                                            </CardTitle>
                                            <CardDescription>
                                                Customize how SkaleMail looks
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div>
                                                <Label>Theme</Label>
                                                <div className="grid grid-cols-3 gap-3 mt-2">
                                                    {['light', 'dark', 'system'].map((theme) => (
                                                        <button
                                                            key={theme}
                                                            onClick={() => setAppearance({ ...appearance, theme })}
                                                            className={`
                                                                px-4 py-3 border rounded-xl text-sm font-medium capitalize transition-all
                                                                ${appearance.theme === theme
                                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                                }
                                                            `}
                                                        >
                                                            {theme}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Label>Compact mode</Label>
                                                    <p className="text-sm text-gray-500">Show more emails in your inbox</p>
                                                </div>
                                                <Switch
                                                    checked={appearance.compactMode}
                                                    onCheckedChange={(checked: boolean) => setAppearance({ ...appearance, compactMode: checked })}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Label>Conversation view</Label>
                                                    <p className="text-sm text-gray-500">Group related messages together</p>
                                                </div>
                                                <Switch
                                                    checked={appearance.conversationView}
                                                    onCheckedChange={(checked: boolean) => setAppearance({ ...appearance, conversationView: checked })}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {activeTab === 'integrations' && (
                                <div className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Globe className="w-5 h-5" />
                                                Connected Apps & Integrations
                                            </CardTitle>
                                            <CardDescription>
                                                Manage third-party integrations
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                        <Smartphone className="w-6 h-6 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium">Mobile App</h3>
                                                        <p className="text-sm text-gray-500">Connected</p>
                                                    </div>
                                                </div>
                                                <Button variant="outline" size="sm">Manage</Button>
                                            </div>
                                            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                                        <Globe className="w-6 h-6 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium">Calendar</h3>
                                                        <p className="text-sm text-gray-500">Not connected</p>
                                                    </div>
                                                </div>
                                                <Button variant="outline" size="sm">Connect</Button>
                                            </div>
                                            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                                        <Clock className="w-6 h-6 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium">Slack</h3>
                                                        <p className="text-sm text-gray-500">Not connected</p>
                                                    </div>
                                                </div>
                                                <Button variant="outline" size="sm">Connect</Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            <div className="mt-6 flex items-center justify-end gap-3">
                                <Button variant="outline">Cancel</Button>
                                <Button onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? 'Saving...' : 'Save changes'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MailLayout>
    )
}
