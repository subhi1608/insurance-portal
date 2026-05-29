import { useState } from 'react'
import ClaimList from '@/features/claims/ClaimList'
import { usePolicies, useDeletePolicy } from '@/api/policies'
import PolicyForm from './PolicyForm'
import ConfirmDialog from '@/components/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import LoadingSpinner from '@/components/LoadingSpinner'
import type { Policy } from '@/types'

interface Props {
  clientId: number
}

export default function PolicyList({ clientId }: Props) {
  const { data: policies, isLoading, error } = usePolicies(clientId)
  const deletePolicy = useDeletePolicy()

  const [formOpen, setFormOpen] = useState(false)
  const [editPolicy, setEditPolicy] = useState<Policy | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Policy | null>(null)

  function openCreate() {
    setEditPolicy(undefined)
    setFormOpen(true)
  }

  function openEdit(policy: Policy) {
    setEditPolicy(policy)
    setFormOpen(true)
  }

  if (isLoading) return <LoadingSpinner />

  if (error) return (
    <Alert variant="destructive">
      <AlertDescription>Failed to load policies.</AlertDescription>
    </Alert>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Policies</h2>
        <Button size="sm" onClick={openCreate}>Add Policy</Button>
      </div>

      {policies && policies.length === 0 && (
        <p className="text-muted-foreground text-sm">No policies yet.</p>
      )}

      {policies?.map((policy) => (
        <Card key={policy.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{policy.type}</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(policy)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(policy)}>Delete</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">Coverage</span>
              <span>${policy.coverage_amount.toLocaleString()}</span>
              <span className="text-muted-foreground">Premium</span>
              <span>${policy.premium.toLocaleString()}</span>
              <span className="text-muted-foreground">Start</span>
              <span>{policy.start_date}</span>
              <span className="text-muted-foreground">End</span>
              <span>{policy.end_date}</span>
            </div>
            <ClaimList policyId={policy.id} />
          </CardContent>
        </Card>
      ))}

      <PolicyForm
        open={formOpen}
        onOpenChange={setFormOpen}
        clientId={clientId}
        policy={editPolicy}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Delete policy?"
        description="This will permanently delete the policy and all its claims."
        onConfirm={() => {
          if (deleteTarget) {
            deletePolicy.mutate(
              { id: deleteTarget.id, clientId },
              { onSuccess: () => setDeleteTarget(null) }
            )
          }
        }}
        isPending={deletePolicy.isPending}
      />
    </div>
  )
}
