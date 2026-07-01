import { createBrowserRouter, RouterProvider, Navigate } from 'react-router';
import { Toaster } from 'sonner';
import { LoginRoute } from './routes/login';
import { RegisterRoute } from './routes/register';
import { ChatRoute } from './routes/chat';
import { RequireAuth, RedirectIfAuth } from './routes/guard';

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/chat" replace /> },
  { path: '/login', element: <RedirectIfAuth><LoginRoute /></RedirectIfAuth> },
  { path: '/register', element: <RedirectIfAuth><RegisterRoute /></RedirectIfAuth> },
  {
    path: '/chat',
    element: (
      <RequireAuth>
        <ChatRoute />
      </RequireAuth>
    ),
  },
]);

export function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </>
  );
}
