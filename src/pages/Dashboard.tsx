import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { Card, CardContent, from '../components/ui/card'

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">
        Welcome to SkaleClub Mail
      </h1>

      <p className="text-muted-foreground mb-8">
        Hello, {user?.email}! Manage your email servers, domains, and messages from this dashboard.
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
              <a href="/organizations/new" className="bg-primary text-primary-foreground px-4 py-2 rounded hover:opacity-90">
                New Organization
              </a>
              <a href="/servers/new" className="bg-primary text-primary-foreground px-4 py-2 rounded hover:opacity-90">
                New Server
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
