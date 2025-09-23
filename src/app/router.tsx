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
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const Profile = lazy(() => import('@/pages/Profile'));
const Contact = lazy(() => import('@/pages/Contact'));
const Home = lazy(() => import('@/pages/Home'));
const PropertiesList = lazy(() => import('@/pages/PropertiesList'));
const PropertyDetail = lazy(() => import('@/pages/PropertyDetail'));
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
            index: true,
            element: <Home />,
          },
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
          {
            path: '/contact',
            element: <Contact />,
          },
          {
            path: '/properties',
            element: <PropertiesList />,
          },
          {
            path: '/properties/:id',
            element: <PropertyDetail />,
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
                element: <Navigate to="/properties" replace />,
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
