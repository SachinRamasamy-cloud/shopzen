import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { store } from './app/store.js';
import { queryClient } from './services/queryClient.js';
import AppRouter from './routes/AppRouter.jsx';
import './index.css';

// Auto-connect socket if user already logged in (page refresh)
import { connectSocket } from './services/socket.js';
const state = store.getState();
if (state.auth.accessToken) connectSocket();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3500,
            style: {
              fontFamily: 'IBM Plex Sans, sans-serif',
              fontSize: '13px',
              borderRadius: '4px',
              border: '1px solid #d9d6cf',
              background: '#ffffff',
              color: '#1a1917',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            },
          }}
        />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);
