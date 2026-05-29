import { useState } from 'react'
import { useClaims, useDeleteClaim } from '@/api/claims'
import ClaimForm from './ClaimForm'
import ConfirmDialog from '@/components/ConfirmDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuthStore } from '@/lib/store'
import type { Claim } from '@/types'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Approved: 'default',
  Pending: 'secondary',
  Rejected: 'destructive',
  'Under Review': 'outline',
}

interface Props {
  policyId: number
}

export default function ClaimList({ policyId }: Props) {
  const { data: claims, isLoading, error } = useClaims(policyId)
  const deleteClaim = useDeleteClaim()

  const [formOpen, setFormOpen] = useState(false)
  const [editClaim, setEditClaim] = useState<Claim | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Claim | null>(null)
  const [summaries, setSummaries] = useState<Record<number, string>>({})
  const [streamingId, setStreamingId] = useState<number | null>(null)

  function openCreate() {
    setEditClaim(undefined)
    setFormOpen(true)
  }

  function openEdit(claim: Claim) {
    setEditClaim(claim)
    setFormOpen(true)
  }

  async function summarize(claimId: number) {
    setStreamingId(claimId)
    setSummaries((prev) => ({ ...prev, [claimId]: '' }))

    const token = useAuthStore.getState().accessToken
    try {
      const res = await fetch(`/api/v1/claims/${claimId}/summarize`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok || !res.body) {
        setSummaries((prev) => ({ ...prev, [claimId]: 'Summary unavailable.' }))
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const content = line.slice(6)
          if (content === '[DONE]') return
          if (content === '[ERROR]') {
            setSummaries((prev) => ({ ...prev, [claimId]: 'Summary unavailable.' }))
            return
          }
          setSummaries((prev) => ({ ...prev, [claimId]: (prev[claimId] ?? '') + content }))
        }
      }
    } catch {
      setSummaries((prev) => ({ ...prev, [claimId]: 'Summary unavailable.' }))
    } finally {
      setStreamingId(null)
    }
  }

  if (error) return (
    <Alert variant="destructive" className="mt-2">
      <AlertDescription>Failed to load claims.</AlertDescription>
    </Alert>
  )

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Claims</span>
        <Button size="sm" variant="outline" onClick={openCreate}>Add Claim</Button>
      </div>

      {isLoading && <p className="text-xs text-muted-foreground">Loading claims…</p>}

      {!isLoading && claims && claims.length === 0 && (
        <p className="text-xs text-muted-foreground">No claims yet.</p>
      )}

      {claims?.map((claim) => (
        <div key={claim.id} className="rounded-md border px-3 py-2 text-sm space-y-1">
          <div className="flex items-start justify-between">
            <div className="space-y-0.5 flex-1 min-w-0">
              <p className="truncate">{claim.description}</p>
              <p className="text-xs text-muted-foreground">{claim.claim_date}</p>
            </div>
            <div className="flex items-center gap-2 ml-2 shrink-0">
              <Badge variant={STATUS_VARIANT[claim.claim_status] ?? 'outline'}>
                {claim.claim_status}
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                disabled={streamingId !== null}
                onClick={() => summarize(claim.id)}
              >
                {streamingId === claim.id ? 'Summarizing…' : 'Summarize'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => openEdit(claim)}>Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(claim)}>Delete</Button>
            </div>
          </div>
          {summaries[claim.id] !== undefined && (
            <p className="text-xs text-muted-foreground italic pt-1 border-t">
              {summaries[claim.id] || '…'}
            </p>
          )}
        </div>
      ))}

      <ClaimForm
        open={formOpen}
        onOpenChange={setFormOpen}
        policyId={policyId}
        claim={editClaim}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Delete claim?"
        description="This action cannot be undone."
        onConfirm={() => {
          if (deleteTarget) {
            deleteClaim.mutate(
              { id: deleteTarget.id, policyId },
              { onSuccess: () => setDeleteTarget(null) }
            )
          }
        }}
        isPending={deleteClaim.isPending}
      />
    </div>
  )
}
