import React from 'react'

interface SequenceTabProps {
    campaignId: string
    organizationId: string
}

export default function SequenceTab({ campaignId, organizationId }: SequenceTabProps) {
    return (
        <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
            Sequence tab — coming in plan 15-03 (campaignId: {campaignId.slice(0, 8)}…, org: {organizationId.slice(0, 8)}…)
        </div>
    )
}
