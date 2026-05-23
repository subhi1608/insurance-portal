import { useNavigate, useParams } from 'react-router-dom'
import { useClient, useUpdateClient, useDeleteClient } from '@/api/clients'
import PolicyList from '@/features/policies/PolicyList'
import ClientForm from './ClientForm'
import ConfirmDialog from '@/components/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useState } from 'react'

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const clientId = parseInt(id ?? '', 10)
  const navigate = useNavigate()

  const { data: client, isLoading, error } = useClient(clientId)
  const deleteClient = useDeleteClient()

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (Number.isNaN(clientId)) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Invalid client ID.</AlertDescription>
      </Alert>
    )
  }

  if (isLoading) return <LoadingSpinner />

  if (error || !client) return (
    <Alert variant="destructive">
      <AlertDescription>Client not found.</AlertDescription>
    </Alert>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/clients')}>
          ← Back
        </Button>
        <h1 className="text-2xl font-semibold flex-1">{client.name}</h1>
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>Edit</Button>
        <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>Delete</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-muted-foreground">Date of Birth</span>
          <span>{client.date_of_birth}</span>
          <span className="text-muted-foreground">Contact</span>
          <span>{client.contact}</span>
          <span className="text-muted-foreground">Address</span>
          <span>{client.address}</span>
        </CardContent>
      </Card>

      <PolicyList clientId={clientId} />

      <ClientForm
        open={editOpen}
        onOpenChange={setEditOpen}
        client={client}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete client?"
        description="This will permanently delete the client and all their policies and claims."
        onConfirm={() => {
          deleteClient.mutate(clientId, {
            onSuccess: () => navigate('/clients', { replace: true }),
          })
        }}
        isPending={deleteClient.isPending}
      />
    </div>
  )
}
