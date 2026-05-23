import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClients, useDeleteClient } from '@/api/clients'
import ClientForm from './ClientForm'
import ConfirmDialog from '@/components/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import LoadingSpinner from '@/components/LoadingSpinner'
import type { Client } from '@/types'

export default function ClientsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editClient, setEditClient] = useState<Client | undefined>()
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data, isLoading, error } = useClients(page)
  const deleteClient = useDeleteClient()

  const clients = data?.data ?? []
  const meta = data?.meta
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 1

  const filtered = search.trim()
    ? clients.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.contact.toLowerCase().includes(search.toLowerCase())
      )
    : clients

  function openCreate() {
    setEditClient(undefined)
    setFormOpen(true)
  }

  function openEdit(client: Client) {
    setEditClient(client)
    setFormOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clients</h1>
        <Button onClick={openCreate}>New Client</Button>
      </div>

      <Input
        placeholder="Filter this page by name or contact…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {isLoading && <LoadingSpinner />}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>Failed to load clients.</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && (
        <div className="rounded-md border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Date of Birth</th>
                <th className="px-4 py-2 text-left">Contact</th>
                <th className="px-4 py-2 text-left">Address</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                    No clients found.
                  </td>
                </tr>
              )}
              {filtered.map((client) => (
                <tr
                  key={client.id}
                  className="border-t hover:bg-muted/50 cursor-pointer"
                  onClick={() => navigate(`/clients/${client.id}`)}
                >
                  <td className="px-4 py-2 font-medium">{client.name}</td>
                  <td className="px-4 py-2">{client.date_of_birth}</td>
                  <td className="px-4 py-2">{client.contact}</td>
                  <td className="px-4 py-2">{client.address}</td>
                  <td className="px-4 py-2 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="outline" onClick={() => openEdit(client)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => setDeleteId(client.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}

      <ClientForm
        open={formOpen}
        onOpenChange={setFormOpen}
        client={editClient}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
        title="Delete client?"
        description="This will permanently delete the client and all their policies and claims."
        onConfirm={() => {
          if (deleteId !== null) {
            deleteClient.mutate(deleteId, { onSuccess: () => setDeleteId(null) })
          }
        }}
        isPending={deleteClient.isPending}
      />
    </div>
  )
}
