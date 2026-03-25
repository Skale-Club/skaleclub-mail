import { useAuth } from '../hooks/useAuth'
import { AppLogo } from '../components/AppLogo'
import { Card, CardContent } from '../components/ui/card'
import { useBranding } from '../lib/branding'

export default function Dashboard() {
  const { user } = useAuth()
  const { branding } = useBranding()

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">
        <span className="inline-flex items-center gap-3">
          <AppLogo className="h-10 w-10" />
          Welcome to {branding.applicationName}
        </span>
      </h1>

      <p className="text-muted-foreground mb-8">
        Hello, {user?.email}! Manage your email, domains, and messages from this dashboard.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold">Organizations</h3>
            <p className="text-3xl font-bold mt-2">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold">Servers</h3>
            <p className="text-3xl font-bold mt-2">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold">Messages</h3>
            <p className="text-3xl font-bold mt-2">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold">Domains</h3>
            <p className="text-3xl font-bold mt-2">0</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <a href="/admin/organizations" className="bg-primary text-primary-foreground px-4 py-2 rounded hover:opacity-90">
                Organizations
              </a>
              <a href="/admin/admins" className="bg-primary text-primary-foreground px-4 py-2 rounded hover:opacity-90">
                Admins
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
