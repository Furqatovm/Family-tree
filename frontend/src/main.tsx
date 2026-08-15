import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#3F6B4F',
          colorPrimaryHover: '#345A42',
          colorPrimaryActive: '#2A4B36',
          controlOutline: 'rgba(63, 107, 79, 0.2)',
          borderRadius: 12,
          colorBorder: '#E7E5E4',
        },
        components: {
          Input: {
            hoverBorderColor: '#3F6B4F',
            activeBorderColor: '#3F6B4F',
            activeShadow: '0 0 0 2px rgba(63, 107, 79, 0.2)',
          },
          Select: {
            hoverBorderColor: '#3F6B4F',
            activeBorderColor: '#3F6B4F',
            optionSelectedBg: '#EAF2EC',
            optionSelectedColor: '#3F6B4F',
          },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ConfigProvider>
  </React.StrictMode>
);
