import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { GoogleOAuthProvider } from '@react-oauth/google';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "14134068622-04hih98ag1pud518ld7nqtj6nbigamn9.apps.googleusercontent.com"}>
          <AuthProvider>
            <App />
            <ToastContainer position="top-right" autoClose={3000} />
          </AuthProvider>
        </GoogleOAuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
