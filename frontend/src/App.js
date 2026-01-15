import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MenuIcon } from './components/Icons';
import Dashboard from './pages/Dashboard';
import Vendors from './pages/Vendors';
import Comparisons from './pages/Comparisons';
import CreateRFP from './pages/CreateRFP';
import RFPDetails from './pages/RFPDetails';
import ProposalComparison from './pages/ProposalComparison';
import Login from './pages/Login';
import Sidebar, { DRAWER_WIDTH } from './components/Sidebar';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function AppContent() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <div className="app-container">
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="*" element={
          <PrivateRoute>
            <div className="app-layout">
              {isMobile && (
                <header className="app-header">
                  <button 
                    className="btn-icon"
                    onClick={handleDrawerToggle}
                  >
                    <MenuIcon />
                  </button>
                </header>
              )}

              <Sidebar mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />
              
              <main className="app-main">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/rfps" element={<Dashboard />} />
                  <Route path="/vendors" element={<Vendors />} />
                  <Route path="/comparisons" element={<Comparisons />} />
                  <Route path="/rfp/create" element={<CreateRFP />} />
                  <Route path="/rfp/:id" element={<RFPDetails />} />
                  <Route path="/rfp/:id/compare" element={<ProposalComparison />} />
                </Routes>
              </main>
            </div>
          </PrivateRoute>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
