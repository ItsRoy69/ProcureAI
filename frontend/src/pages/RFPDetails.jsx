import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { rfpAPI } from '../services/api';
import VendorSelector from '../components/VendorSelector';

function RFPDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rfp, setRfp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVendorSelector, setShowVendorSelector] = useState(false);
  const [selectedVendors, setSelectedVendors] = useState([]);

  useEffect(() => {
    loadRFP();
  }, [id]);

  const loadRFP = async () => {
    try {
      const result = await rfpAPI.getById(id);
      if (result.success) {
        setRfp(result.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRFP = async () => {
    try {
      const result = await rfpAPI.send(id, selectedVendors);
      if (result.success) {
        setShowVendorSelector(false);
        loadRFP();
        alert('RFP sent successfully!');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!rfp) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">RFP not found</Alert>
      </Container>
    );
  }

  if (showVendorSelector) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button onClick={() => setShowVendorSelector(false)} sx={{ mb: 2 }}>
          ← Back to RFP Details
        </Button>
        <VendorSelector
          selectedVendors={selectedVendors}
          onSelectionChange={setSelectedVendors}
          onSendRFP={handleSendRFP}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button onClick={() => navigate('/')} sx={{ mb: 2 }}>
        ← Back to Dashboard
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
          <Typography variant="h4" component="h1">
            {rfp.title}
          </Typography>
          <Chip label={rfp.status} color={rfp.status === 'sent' ? 'primary' : 'default'} />
        </Box>

        <Typography variant="body1" paragraph>
          {rfp.description}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Budget
            </Typography>
            <Typography variant="body1">{rfp.budget || 'Not specified'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Deadline
            </Typography>
            <Typography variant="body1">
              {rfp.deadline ? new Date(rfp.deadline).toLocaleDateString() : 'Not specified'}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Requirements
        </Typography>
        {rfp.requirements && rfp.requirements.length > 0 ? (
          <Box component="ul" sx={{ pl: 2 }}>
            {rfp.requirements.map((req, index) => (
              <Typography component="li" variant="body2" key={index} sx={{ mb: 1 }}>
                <strong>{req.item}</strong> - {req.specification} (Quantity: {req.quantity})
              </Typography>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No requirements specified
          </Typography>
        )}

        {rfp.evaluationCriteria && rfp.evaluationCriteria.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Evaluation Criteria
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              {rfp.evaluationCriteria.map((criteria, index) => (
                <Typography component="li" variant="body2" key={index}>
                  {criteria}
                </Typography>
              ))}
            </Box>
          </>
        )}

        {rfp.specialRequirements && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Special Requirements
            </Typography>
            <Typography variant="body2">{rfp.specialRequirements}</Typography>
          </>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Proposals Received
        </Typography>
        {rfp.proposals && rfp.proposals.length > 0 ? (
          <>
            <Typography variant="body2" paragraph>
              {rfp.proposals.length} proposal(s) received
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate(`/rfp/${id}/compare`)}
            >
              Compare Proposals
            </Button>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No proposals received yet
          </Typography>
        )}

        {rfp.status === 'draft' && (
          <>
            <Divider sx={{ my: 3 }} />
            <Button
              variant="contained"
              size="large"
              onClick={() => setShowVendorSelector(true)}
            >
              Send to Vendors
            </Button>
          </>
        )}
      </Paper>
    </Container>
  );
}

export default RFPDetails;
