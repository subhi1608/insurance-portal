import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet'
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCreateClaim, useUpdateClaim } from '@/api/claims'
import type { Claim } from '@/types'

const CLAIM_STATUSES = ['Pending', 'Approved', 'Rejected', 'Under Review'] as const

const schema = z.object({
  description: z.string().min(1, 'Description is required'),
  claim_status: z.string().min(1, 'Status is required'),
  claim_date: z.string().min(1, 'Claim date is required'),
})
type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  policyId: number
  claim?: Claim
}

export default function ClaimForm({ open, onOpenChange, policyId, claim }: Props) {
  const create = useCreateClaim()
  const update = useUpdateClaim()
  const isEdit = !!claim
  const error = isEdit ? update.error : create.error
  const isPending = isEdit ? update.isPending : create.isPending

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { description: '', claim_status: 'Pending', claim_date: '' },
  })
  const { reset } = form

  useEffect(() => {
    reset(
      claim
        ? { description: claim.description, claim_status: claim.claim_status, claim_date: claim.claim_date }
        : { description: '', claim_status: 'Pending', claim_date: '' }
    )
  }, [open, claim, reset])

  function onSubmit(values: FormValues) {
    if (isEdit) {
      update.mutate(
        { id: claim.id, policyId, ...values },
        { onSuccess: () => onOpenChange(false) }
      )
    } else {
      create.mutate(
        { policyId, ...values },
        { onSuccess: () => onOpenChange(false) }
      )
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Edit Claim' : 'New Claim'}</SheetTitle>
        </SheetHeader>
        {error && (
          <Alert variant="destructive" className="mx-4">
            <AlertDescription>
              {axios.isAxiosError(error)
                ? (error.response?.data as { error?: { message?: string } })?.error?.message ?? 'Something went wrong'
                : 'Something went wrong'}
            </AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-4">
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Describe the claim…" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="claim_status" render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {CLAIM_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="claim_date" render={({ field }) => (
              <FormItem>
                <FormLabel>Claim Date</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <SheetFooter>
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? 'Saving…' : 'Save'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
