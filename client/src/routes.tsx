import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { lazy, Suspense, useEffect, useState } from 'react'
import { refresh } from '@/api/auth'
import { useAuthStore } from '@/lib/store'
import Layout from '@/components/Layout'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorBoundary from '@/components/ErrorBoundary'
import LoginPage from '@/features/auth/LoginPage'
const ClientsPage = lazy(() => import('@/features/clients/ClientsPage'))
const ClientDetailPage = lazy(() => import('@/features/clients/ClientDetailPage'))

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.accessToken)
  const setToken = useAuthStore((s) => s.setToken)
  const [checking, setChecking] = useState(!token)

  useEffect(() => {
    if (token) return
    refresh()
      .then((t) => { setToken(t); setChecking(false) })
      .catch(() => setChecking(false))
  }, [token, setToken])

  if (checking) return <LoadingSpinner />
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/clients" replace /> },
      {
        path: '/clients',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}><ClientsPage /></Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: '/clients/:id',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}><ClientDetailPage /></Suspense>
          </ErrorBoundary>
        ),
      },
    ],
  },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
