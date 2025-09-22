import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Layout components
import { Layout } from '@/components/layout/Layout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Lazy loaded pages
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const DebtorsList = lazy(() => import('@/pages/debtors/DebtorsList'));
const DebtorDetail = lazy(() => import('@/pages/debtors/DebtorDetail'));
const PaymentsList = lazy(() => import('@/pages/payments/PaymentsList'));
const PaymentNew = lazy(() => import('@/pages/payments/PaymentNew'));
const PaymentDetail = lazy(() => import('@/pages/payments/PaymentDetail'));
const UnitsList = lazy(() => import('@/pages/units/UnitsList'));
const LeasesList = lazy(() => import('@/pages/leases/LeasesList'));
const Reports = lazy(() => import('@/pages/Reports'));
const Profile = lazy(() => import('@/pages/Profile'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Protected route wrapper
const ProtectedRoute = () => {
  return <Outlet />;
};

// Public route wrapper (redirect if already authenticated)
const PublicRoute = () => {
  return <Outlet />;
};

// Router configuration
export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ThemeProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <Suspense fallback={<LoadingSpinner />}>
              <Outlet />
            </Suspense>
            <Toaster position="top-right" />
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </AuthProvider>
      </ThemeProvider>
    ),
    children: [
      // Public routes
      {
        element: <PublicRoute />,
        children: [
          {
            path: '/login',
            element: (
              <AuthLayout>
                <Login />
              </AuthLayout>
            ),
          },
          {
            path: '/register',
            element: (
              <AuthLayout>
                <Register />
              </AuthLayout>
            ),
          },
        ],
      },
      
      // Protected routes
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/',
            element: <Layout />,
            children: [
              {
                index: true,
                element: <Navigate to="/dashboard" replace />,
              },
              {
                path: 'dashboard',
                element: <Dashboard />,
              },
              {
                path: 'debtors',
                children: [
                  { index: true, element: <DebtorsList /> },
                  { path: ':id', element: <DebtorDetail /> },
                ],
              },
              {
                path: 'payments',
                children: [
                  { index: true, element: <PaymentsList /> },
                  { path: 'new', element: <PaymentNew /> },
                  { path: ':id', element: <PaymentDetail /> },
                ],
              },
              {
                path: 'units',
                element: <UnitsList />,
              },
              {
                path: 'leases',
                element: <LeasesList />,
              },
              {
                path: 'reports',
                element: <Reports />,
              },
              {
                path: 'profile',
                element: <Profile />,
              },
            ],
          },
        ],
      },
      
      // 404 page
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

export default router;
