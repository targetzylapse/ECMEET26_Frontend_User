import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { authAPI } from './api';

import LandingPage  from './LandingPage';
import RevealPage   from './RevealPage';
import Dashboard    from './Dashboard';
import EventsPage   from './EventsPage';
import PrelimPage   from './PrelimPage';
import Sidebar      from './Sidebar';
import Topbar       from './Topbar';
import BottomNavbar from './BottomNavbar';
import Particles    from './Particles';
import Toast        from './Toast';
import ProfileEditModal from './ProfileEditModal';
import { DataProvider } from './DataContext';
import { identifyUser } from './socket';

export const AuthContext  = React.createContext(null);
export const ToastContext = React.createContext(null);

export default function App() {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    if (user?.id) {
      identifyUser(user.id);
    }
  }, [user]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const token = localStorage.getItem('ecmeet_token');
    const saved = localStorage.getItem('ecmeet_user');
    if (token && saved) {
      setUser(JSON.parse(saved));
      authAPI.verify()
        .then(r => { setUser(r.data.user); localStorage.setItem('ecmeet_user', JSON.stringify(r.data.user)); })
        .catch(() => { localStorage.clear(); setUser(null); })
        .finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('ecmeet_token', token);
    localStorage.setItem('ecmeet_user', JSON.stringify(userData));
    setUser(userData);
  };
  const logout = async () => {
    await authAPI.logout().catch(() => {});
    localStorage.removeItem('ecmeet_token');
    localStorage.removeItem('ecmeet_user');
    setUser(null);
  };
  const updateUser = (u) => {
    const updated = { ...user, ...u };
    setUser(updated);
    localStorage.setItem('ecmeet_user', JSON.stringify(updated));
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#06080a', gap:'0.75rem' }}>
      <span style={{ fontFamily:'Cinzel,serif', color:'#c9a84c', fontSize:'1rem', letterSpacing:'0.4em', animation:'spin 2s linear infinite', display:'inline-block' }}>✦</span>
      <span style={{ fontFamily:'Cinzel,serif', color:'rgba(201,168,76,0.5)', fontSize:'0.75rem', letterSpacing:'0.3em' }}>LOADING</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const homeRoute = !user ? '/' : !user.houseRevealed ? '/reveal' : '/dashboard';

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, openProfileModal: () => setShowProfileModal(true) }}>
      <DataProvider user={user}>
        <ToastContext.Provider value={{ showToast }}>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            {toast && <Toast message={toast.message} type={toast.type} />}
            <InnerApp user={user} homeRoute={homeRoute} showProfileModal={showProfileModal} setShowProfileModal={setShowProfileModal} />
          </BrowserRouter>
        </ToastContext.Provider>
      </DataProvider>
    </AuthContext.Provider>
  );
}

function InnerApp({ user, homeRoute, showProfileModal, setShowProfileModal }) {
  const { pathname } = useLocation();
  const isLanding = pathname === '/';

  return (
    <>
      <div className="hp-bg" />
      <Particles />
      {showProfileModal && <ProfileEditModal onClose={() => setShowProfileModal(false)} />}

      {isLanding ? (
        <Routes>
          <Route path="/" element={user ? <Navigate to={homeRoute} replace /> : <LandingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : (
        <div className="app-shell">
          {user && <Sidebar />}
          <div className="main-area">
            {user && <Topbar />}
            <main style={{ position:'relative', zIndex:1 }}>
              <Routes>
                <Route path="/reveal"    element={user ? <RevealPage /> : <Navigate to="/" replace />} />
                <Route path="/dashboard" element={user ? (user.houseRevealed ? <Dashboard /> : <Navigate to="/reveal" replace />) : <Navigate to="/" replace />} />
                <Route path="/events"    element={user ? <EventsPage /> : <Navigate to="/" replace />} />
                <Route path="/prelim"    element={user ? <PrelimPage /> : <Navigate to="/" replace />} />
                <Route path="*"          element={<Navigate to={homeRoute} replace />} />
              </Routes>
            </main>
          </div>
          {user && <BottomNavbar />}
        </div>
      )}
    </>
  );
}
