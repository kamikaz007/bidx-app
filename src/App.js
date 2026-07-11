import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import BackgroundVideo from './components/BackgroundVideo';
import Home from './pages/Home';
import Login from './pages/Login';
import CreateAuction from './pages/CreateAuction';
import AuctionDetail from './pages/AuctionDetail';
import Profile from './pages/Profile';
import MyAuctions from './pages/MyAuctions';
import NFTMarket from './pages/NFTMarket';
import Wallet from './pages/Wallet';
import Debug from './pages/Debug';
import Dashboard from './pages/Dashboard';
import FractionalMarket from './pages/FractionalMarket';
import CreateFractional from './pages/CreateFractional';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div style={{ textAlign: 'center', padding: '80px' }}>⏳</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const AppContent = () => {
  const { isDark } = useTheme();

  return (
    <>
      <Toaster position="top-center" toastOptions={{
        duration: 3000,
        style: { 
          background: isDark ? '#1e1e36' : '#1f2937',
          color: '#fff',
          fontFamily: 'Tajawal, sans-serif',
          borderRadius: '12px',
          padding: '12px 20px',
          fontWeight: '500',
          border: `1px solid ${isDark ? '#2d2d4a' : '#374151'}`
        }
      }} />
      
      {/* فيديو الخلفية */}
      <BackgroundVideo />
      
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/*" element={
          <ProtectedRoute>
            <>
              <Header />
              <div style={{ display: 'flex' }}>
                <Sidebar />
                <main style={{
                  flex: 1,
                  padding: '24px',
                  paddingTop: '92px',
                  maxWidth: '1200px',
                  margin: '0 auto',
                  width: '100%',
                  minHeight: '100vh',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/create" element={<CreateAuction />} />
                    <Route path="/auction/:id" element={<AuctionDetail />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/wallet" element={<Wallet />} />
                    <Route path="/my-auctions" element={<MyAuctions />} />
                    <Route path="/nft-market" element={<NFTMarket />} />
                    <Route path="/fractional" element={<FractionalMarket />} />
                    <Route path="/create-fractional" element={<CreateFractional />} />
                    <Route path="/debug" element={<Debug />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                  </Routes>
                </main>
              </div>
            </>
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="app">
            <AppContent />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
