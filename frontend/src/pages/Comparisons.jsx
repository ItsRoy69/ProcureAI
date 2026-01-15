import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  alpha
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { rfpAPI } from '../services/api';

function Comparisons() {
  const navigate = useNavigate();
  const [rfps, setRfps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRFPs();
  }, []);

  const loadRFPs = async () => {
    try {
      const result = await rfpAPI.getAll();
      if (result.success) {
        const rfpsWithProposals = result.data.filter(rfp => rfp.proposals && rfp.proposals.length > 0);
        setRfps(rfpsWithProposals);
      }
    } catch (error) {
      console.error('Error loading RFPs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>
          Comparisons
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7280' }}>
          Compare proposals and make informed decisions
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: '1px solid #F3F4F6', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: alpha('#6366F1', 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CompareArrowsIcon sx={{ fontSize: 24, color: '#6366F1' }} />
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5, fontWeight: 500 }}>
                RFPs with Proposals
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>
                {rfps.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : rfps.length === 0 ? (
        <Card sx={{ p: 8, textAlign: 'center', borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <Typography variant="h6" color="text.secondary">
            No proposals to compare yet. Proposals will appear here once vendors respond to your RFPs.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {rfps.map((rfp) => (
            <Grid item xs={12} md={6} lg={4} key={rfp.id}>
              <Card elevation={0} sx={{
                border: '1px solid #E5E7EB',
                borderRadius: 1.5,
                height: '100%',
                '&:hover': {
                  borderColor: '#6366F1'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 2 }}>
                    {rfp.title}
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Chip
                      label={`${rfp.proposals.length} proposals received`}
                      size="small"
                      sx={{
                        bgcolor: alpha('#10B981', 0.1),
                        color: '#065F46',
                        fontWeight: 600,
                        borderRadius: 2
                      }}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {rfp.description?.substring(0, 120)}...
                  </Typography>

                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate(`/rfp/${rfp.id}/compare`)}
                    sx={{
                      bgcolor: '#6366F1',
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: '#4F46E5',
                      }
                    }}
                  >
                    Compare Proposals
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default Comparisons;
