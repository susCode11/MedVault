import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ToastContainer } from './components/ui/Toast';
import { useAuthStore } from './store/authStore';
import { nfidAuthAdapter } from './lib/nfid';
import { validateEnv } from './lib/env';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Validate environment variables at startup
validateEnv();

// Inject real biometric auth adapter (Internet Identity / WebAuthn)
useAuthStore.getState().setAdapter(nfidAuthAdapter);

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ToastContainer />
    </QueryClientProvider>
  </React.StrictMode>,
);
