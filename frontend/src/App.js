import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import Dashboard from './pages/Dashboard';
import CreateRFP from './pages/CreateRFP';
import RFPDetails from './pages/RFPDetails';
import ProposalComparison from './pages/ProposalComparison';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                ProcureAI - RFP Management System
              </Typography>
            </Toolbar>
          </AppBar>

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/rfp/create" element={<CreateRFP />} />
            <Route path="/rfp/:id" element={<RFPDetails />} />
            <Route path="/rfp/:id/compare" element={<ProposalComparison />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;

