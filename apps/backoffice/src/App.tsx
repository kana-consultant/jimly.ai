import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate, useLocation } from 'react-router';
import { Toaster } from 'sonner';
import { ChatRoute } from './routes/chat';
import { RequireAuth, RedirectIfAuth } from './routes/guard';
import { AuthPage } from './routes/auth/auth-page';

function AuthLayout() {
  const location = useLocation();
  const mode = location.pathname.startsWith('/register') ? 'register' : 'login';
  return (
    <RedirectIfAuth>
      <AuthPage mode={mode} />
    </RedirectIfAuth>
  );
}

const router = createBrowserRouter(
  [
    { path: '/', element: <Navigate to="/chat" replace /> },
    {
      element: <AuthLayout />,
      children: [
        { path: '/login', element: <></> },
        { path: '/register', element: <></> },
      ],
    },
    {
      path: '/chat',
      element: (
        <RequireAuth>
          <ChatRoute />
        </RequireAuth>
      ),
    },
  ],
  { basename: '/app' },
);

export function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </>
  );
}
