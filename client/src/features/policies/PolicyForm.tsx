import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCreatePolicy, useUpdatePolicy } from '@/api/policies'
import type { Policy } from '@/types'

const schema = z.object({
  type: z.string().min(1, 'Policy type is required'),
  coverage_amount: z.string().min(1, 'Coverage amount is required').refine((v) => Number(v) > 0, 'Coverage amount must be positive'),
  premium: z.string().min(1, 'Premium is required').refine((v) => Number(v) > 0, 'Premium must be positive'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
})
type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: number
  policy?: Policy
}

export default function PolicyForm({ open, onOpenChange, clientId, policy }: Props) {
  const create = useCreatePolicy()
  const update = useUpdatePolicy()
  const isEdit = !!policy
  const error = isEdit ? update.error : create.error
  const isPending = isEdit ? update.isPending : create.isPending

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: '', coverage_amount: '', premium: '', start_date: '', end_date: '' },
  })

  useEffect(() => {
    form.reset(
      policy
        ? { type: policy.type, coverage_amount: String(policy.coverage_amount), premium: String(policy.premium), start_date: policy.start_date, end_date: policy.end_date }
        : { type: '', coverage_amount: '', premium: '', start_date: '', end_date: '' }
    )
  }, [open, policy, form.reset])

  function onSubmit(values: FormValues) {
    const parsed = {
      type: values.type,
      coverage_amount: Number(values.coverage_amount),
      premium: Number(values.premium),
      start_date: values.start_date,
      end_date: values.end_date,
    }
    if (isEdit) {
      update.mutate(
        { id: policy.id, clientId, ...parsed },
        { onSuccess: () => onOpenChange(false) }
      )
    } else {
      create.mutate(
        { clientId, ...parsed },
        { onSuccess: () => onOpenChange(false) }
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Policy' : 'New Policy'}</DialogTitle>
        </DialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              {axios.isAxiosError(error)
                ? (error.response?.data as { error?: { message?: string } })?.error?.message ?? 'Something went wrong'
                : 'Something went wrong'}
            </AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="type" render={({ field }) => (
              <FormItem>
                <FormLabel>Policy Type</FormLabel>
                <FormControl><Input placeholder="e.g. Life, Health, Auto" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="coverage_amount" render={({ field }) => (
                <FormItem>
                  <FormLabel>Coverage Amount</FormLabel>
                  <FormControl><Input type="number" min="0" step="0.01" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="premium" render={({ field }) => (
                <FormItem>
                  <FormLabel>Premium</FormLabel>
                  <FormControl><Input type="number" min="0" step="0.01" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="start_date" render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="end_date" render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving…' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
