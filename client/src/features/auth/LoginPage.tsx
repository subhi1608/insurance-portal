import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useLogin, useSignIn } from '@/api/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from '@/components/ui/form'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

const signInSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type FormValues = { email: string; password: string }

export default function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const login = useLogin()
  const signIn = useSignIn()

  const mutation = mode === 'login' ? login : signIn
  const isSignup = mode === 'signup'

  const form = useForm<FormValues>({
    resolver: zodResolver(isSignup ? signInSchema : loginSchema),
    defaultValues: { email: '', password: '' },
  })

  useEffect(() => {
    form.reset({ email: '', password: '' })
    login.reset()
    signIn.reset()
  }, [mode])

  function onSubmit(values: FormValues) {
    mutation.mutate(values, {
      onSuccess: () => navigate('/clients', { replace: true }),
    })
  }

  function toggleMode() {
    setMode((m) => (m === 'login' ? 'signup' : 'login'))
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{isSignup ? 'Create account' : 'Sign in'}</CardTitle>
        </CardHeader>
        <CardContent>
          {mutation.error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                {axios.isAxiosError(mutation.error)
                  ? (mutation.error.response?.data as { error?: { message?: string } })?.error?.message ?? 'Something went wrong'
                  : 'Something went wrong'}
              </AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending
                  ? isSignup ? 'Creating account…' : 'Signing in…'
                  : isSignup ? 'Create account' : 'Sign in'}
              </Button>
            </form>
          </Form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={toggleMode}
              className="text-primary underline-offset-4 hover:underline"
            >
              {isSignup ? 'Sign in' : 'Create one'}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
