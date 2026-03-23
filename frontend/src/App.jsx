import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { supabase } from './config/supabase';
import { useAuthStore } from './store/authStore';
import ErrorBoundary from './components/ErrorBoundary';
import RequireAuth from './components/RequireAuth';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewAssessment from './pages/NewAssessment';
import BorrowerDetail from './pages/BorrowerDetail';
import Borrowers from './pages/Borrowers';
import Monitoring from './pages/Monitoring';
import Billing from './pages/Billing';
import Consent from './pages/Consent';
import NotFound from './pages/NotFound';

import PublicLayout from './components/public/PublicLayout';
import Home from './pages/public/Home';
import Product from './pages/public/Product';
import About from './pages/public/About';
import Contact from './pages/public/Contact';

function AppLayout() {
  return (
    <div className="min-h-screen bg-bg relative selection:bg-primary/30 text-white">
      {/* Optional faint background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-5 pointer-events-none"></div>
      
      <Sidebar />
      <main className="md:ml-[280px] p-6 md:p-8 lg:p-10 min-h-screen relative z-10 transition-all duration-300 overflow-x-hidden">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default function App() {
  const fetchUser = useAuthStore(s => s.fetchUser);
  const handleSSOCallback = useAuthStore(s => s.handleSSOCallback);

  useEffect(() => {
    fetchUser();

    // Listens for Supabase Auth state changes only if client exists
    let subscription = null;
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await handleSSOCallback(session);
        }
      });
      subscription = data.subscription;
    }

    return () => subscription?.unsubscribe();
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          duration: 4000,
          style: { fontFamily: 'Instrument Sans', borderRadius: '12px', padding: '14px 18px', fontSize: '14px', maxWidth: '400px' },
          success: { iconTheme: { primary: '#2D6A4F', secondary: '#fff' }, style: { borderLeft: '4px solid #2D6A4F' } },
          error: { iconTheme: { primary: '#C62828', secondary: '#fff' }, style: { borderLeft: '4px solid #C62828' } },
        }} />
        <Routes>
          {/* Public Landing Pages */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/product" element={<Product />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          {/* Public App Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/consent/:token" element={<Consent />} />

          {/* Protected Portal Routes */}
          <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/borrowers" element={<Borrowers />} />
            <Route path="/borrowers/:id" element={<BorrowerDetail />} />
            <Route path="/assessment/new" element={<NewAssessment />} />
            <Route path="/monitoring" element={<Monitoring />} />
          </Route>

          {/* Redirects */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
