import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, AppBar, Toolbar, IconButton, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
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
import modernTheme from './theme/modernTheme';

function AppContent() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F9FAFB' }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="*" element={
          <PrivateRoute>
            <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
              {isMobile && (
                <AppBar
                  position="fixed"
                  sx={{
                    bgcolor: 'white',
                    color: '#111827',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    borderBottom: '1px solid #F3F4F6',
                    width: '100%'
                  }}
                >
                  <Toolbar>
                    <IconButton
                      color="inherit"
                      edge="start"
                      onClick={handleDrawerToggle}
                      sx={{ mr: 2 }}
                    >
                      <MenuIcon />
                    </IconButton>
                  </Toolbar>
                </AppBar>
              )}

              <Sidebar mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />
              
              <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  p: { xs: 2, md: 2 },
                  width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
                  mt: { xs: 7, md: 0 },
                  overflow: 'auto',
                  minHeight: '100vh',
                  bgcolor: '#FFFFFF'
                }}
              >
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/rfps" element={<Dashboard />} />
                  <Route path="/vendors" element={<Vendors />} />
                  <Route path="/comparisons" element={<Comparisons />} />
                  <Route path="/rfp/create" element={<CreateRFP />} />
                  <Route path="/rfp/:id" element={<RFPDetails />} />
                  <Route path="/rfp/:id/compare" element={<ProposalComparison />} />
                </Routes>
              </Box>
            </Box>
          </PrivateRoute>
        } />
      </Routes>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={modernTheme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
