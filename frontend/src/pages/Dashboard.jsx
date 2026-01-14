import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { rfpAPI } from '../services/api';

function Dashboard() {
  const navigate = useNavigate();
  const [rfps, setRfps] = useState([]);
  const [filteredRfps, setFilteredRfps] = useState([]);
  const [currentTab, setCurrentTab] = useState('all');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRFPs();
  }, []);

  useEffect(() => {
    filterRFPs();
  }, [currentTab, rfps]);

  const loadRFPs = async () => {
    try {
      const result = await rfpAPI.getAll();
      if (result.success) {
        setRfps(result.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterRFPs = () => {
    if (currentTab === 'all') {
      setFilteredRfps(rfps);
    } else {
      setFilteredRfps(rfps.filter(rfp => rfp.status === currentTab));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'default';
      case 'sent': return 'primary';
      case 'closed': return 'success';
      default: return 'default';
    }
  };

  const stats = {
    total: rfps.length,
    draft: rfps.filter(r => r.status === 'draft').length,
    sent: rfps.filter(r => r.status === 'sent').length,
    closed: rfps.filter(r => r.status === 'closed').length
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          RFP Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/rfp/create')}
          size="large"
        >
          Create New RFP
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Total RFPs</Typography>
              <Typography variant="h4">{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Drafts</Typography>
              <Typography variant="h4">{stats.draft}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Sent</Typography>
              <Typography variant="h4">{stats.sent}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Closed</Typography>
              <Typography variant="h4">{stats.closed}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
          <Tab label="All" value="all" />
          <Tab label="Drafts" value="draft" />
          <Tab label="Sent" value="sent" />
          <Tab label="Closed" value="closed" />
        </Tabs>
      </Box>

      {/* RFP Cards */}
      {loading ? (
        <Typography>Loading...</Typography>
      ) : filteredRfps.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No RFPs found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Create your first RFP to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/rfp/create')}
          >
            Create RFP
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredRfps.map((rfp) => (
            <Grid item xs={12} md={6} lg={4} key={rfp.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                      {rfp.title}
                    </Typography>
                    <Chip
                      label={rfp.status}
                      color={getStatusColor(rfp.status)}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {rfp.description?.substring(0, 100)}...
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    {rfp.budget && <Chip label={`Budget: ${rfp.budget}`} size="small" variant="outlined" />}
                    {rfp.deadline && <Chip label={`Due: ${new Date(rfp.deadline).toLocaleDateString()}`} size="small" variant="outlined" />}
                  </Box>
                  {rfp.proposals && rfp.proposals.length > 0 && (
                    <Typography variant="caption" color="primary">
                      {rfp.proposals.length} proposal(s) received
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => navigate(`/rfp/${rfp.id}`)}>
                    View Details
                  </Button>
                  {rfp.proposals && rfp.proposals.length > 0 && (
                    <Button size="small" color="primary" onClick={() => navigate(`/rfp/${rfp.id}/compare`)}>
                      Compare Proposals
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default Dashboard;
