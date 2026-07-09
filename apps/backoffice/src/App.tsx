import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate, useOutlet, useLocation } from 'react-router';
import { AnimatePresence, LayoutGroup } from 'framer-motion';
import { Toaster } from 'sonner';
import { LoginRoute } from './routes/login';
import { RegisterRoute } from './routes/register';
import { ChatRoute } from './routes/chat';
import { RequireAuth, RedirectIfAuth } from './routes/guard';

function AuthLayout() {
  const location = useLocation();
  const element = useOutlet();
  return (
    <RedirectIfAuth>
      <LayoutGroup>
        <AnimatePresence mode="sync" initial={false}>
          {element && React.cloneElement(element, { key: location.pathname })}
        </AnimatePresence>
      </LayoutGroup>
    </RedirectIfAuth>
  );
}

const router = createBrowserRouter(
  [
    { path: '/', element: <Navigate to="/chat" replace /> },
    {
      element: <AuthLayout />,
      children: [
        { path: '/login', element: <LoginRoute /> },
        { path: '/register', element: <RegisterRoute /> },
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
