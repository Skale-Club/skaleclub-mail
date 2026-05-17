import React from 'react'

interface LeadsTabProps {
    campaignId: string
    organizationId: string
}

export default function LeadsTab({ campaignId, organizationId }: LeadsTabProps) {
    return (
        <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
            Leads tab — coming in plan 15-02 (campaignId: {campaignId.slice(0, 8)}…, org: {organizationId.slice(0, 8)}…)
        </div>
    )
}
