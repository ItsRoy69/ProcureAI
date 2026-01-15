import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { rfpAPI, proposalAPI } from '../services/api';

function ProposalComparison() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rfp, setRfp] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState(null);
  
  // Email preview dialog state
  const [emailPreviewOpen, setEmailPreviewOpen] = useState(false);
  const [emailPreview, setEmailPreview] = useState({ subject: '', body: '' });
  const [editableEmailBody, setEditableEmailBody] = useState('');
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState({ proposalId: null, status: null });
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const rfpResult = await rfpAPI.getById(id);
      if (rfpResult.success) {
        setRfp(rfpResult.data);
        setProposals(rfpResult.data.proposals || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    if (proposals.length === 0) {
      setError('No proposals to compare');
      return;
    }

    setComparing(true);
    setError(null);

    try {
      const proposalIds = proposals.map(p => p.id);
      const result = await proposalAPI.compare(id, proposalIds);
      
      if (result.success) {
        setComparison(result.data);
        if (result.data.cached) {
          alert('✓ Loaded cached comparison results (AI quota preserved)');
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      const isQuotaError = err.response?.status === 429 || err.response?.data?.quotaExceeded;
      
      if (isQuotaError) {
        setError('⚠️ AI Quota Exceeded\n\nYou have reached the daily limit for AI comparisons (20 requests/day).\n\nThe comparison results have been saved, so you can view them without using more quota. Refresh the page to see cached results, or wait 24 hours for quota reset.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setComparing(false);
    }
  };

  const handleStatusUpdate = async (proposalId, newStatus) => {
    try {
      // Generate email preview first
      setSendingEmail(true);
      const response = await fetch(`http://localhost:5000/api/proposals/${proposalId}/preview-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      const result = await response.json();
      setSendingEmail(false);
      
      if (result.success) {
        // Show preview dialog
        setEmailPreview({ subject: result.data.subject, body: result.data.body });
        setEditableEmailBody(result.data.body);
        setPendingStatusUpdate({ proposalId, status: newStatus });
        setEmailPreviewOpen(true);
      } else {
        // Check if quota exceeded
        if (result.quotaExceeded || response.status === 429) {
          alert('⚠️ AI Quota Exceeded\n\nYou have reached the daily limit for AI-generated emails (20 requests/day).\n\nOptions:\n1. Wait 24 hours for quota reset\n2. Manually compose and send email to vendor\n3. Update status without sending email\n\nThe proposal status has NOT been changed yet.');
        } else {
          setError(result.error || 'Failed to generate email preview');
        }
      }
    } catch (err) {
      setSendingEmail(false);
      setError(err.message);
    }
  };

  const handleConfirmSend = async () => {
    try {
      setSendingEmail(true);
      const result = await proposalAPI.updateStatus(
        pendingStatusUpdate.proposalId, 
        pendingStatusUpdate.status,
        editableEmailBody
      );
      
      setSendingEmail(false);
      setEmailPreviewOpen(false);
      loadData();
      
      if (result.success && result.message) {
        alert(result.message);
      }
    } catch (err) {
      setSendingEmail(false);
      setError(err.message);
    }
  };

  const handleCancelSend = () => {
    setEmailPreviewOpen(false);
    setPendingStatusUpdate({ proposalId: null, status: null });
    setEditableEmailBody('');
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button onClick={() => navigate('/')} sx={{ mb: 2 }}>
          ← Back to Dashboard
        </Button>
        <Typography variant="h4" gutterBottom>
          Proposal Comparison
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {rfp.title}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {proposals.length === 0 ? (
        <Alert severity="info">
          No proposals received yet. Proposals will appear here once vendors respond to the RFP.
        </Alert>
      ) : (
        <>
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              onClick={handleCompare}
              disabled={comparing}
              size="large"
            >
              {comparing ? 'Analyzing Proposals...' : 'Compare with AI'}
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {proposals.length} proposal(s) received
            </Typography>
          </Box>

          {/* Proposals Table */}
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Vendor</TableCell>
                  <TableCell>Total Cost</TableCell>
                  <TableCell>Delivery Timeline</TableCell>
                  <TableCell>Payment Terms</TableCell>
                  <TableCell>AI Score</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {proposals.map((proposal) => (
                  <TableRow key={proposal.id}>
                    <TableCell>{proposal.vendor?.name || 'Unknown'}</TableCell>
                    <TableCell>
                      {proposal.totalCost ? `$${proposal.totalCost.toLocaleString()}` : 'N/A'}
                    </TableCell>
                    <TableCell>{proposal.deliveryTimeline || 'N/A'}</TableCell>
                    <TableCell>{proposal.paymentTerms || 'N/A'}</TableCell>
                    <TableCell>
                      {proposal.aiScore ? (
                        <Chip
                          label={`${proposal.aiScore.toFixed(0)}/100`}
                          color={getScoreColor(proposal.aiScore)}
                          size="small"
                        />
                      ) : (
                        'Not scored'
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={proposal.status} 
                        size="small"
                        color={
                          proposal.status === 'accepted' ? 'success' :
                          proposal.status === 'rejected' ? 'error' :
                          proposal.status === 'reviewed' ? 'primary' :
                          'default'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleStatusUpdate(proposal.id, 'accepted')}
                          disabled={proposal.status === 'accepted' || sendingEmail}
                          startIcon={sendingEmail ? <CircularProgress size={16} color="inherit" /> : null}
                        >
                          {sendingEmail ? 'Loading...' : 'Accept'}
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleStatusUpdate(proposal.id, 'rejected')}
                          disabled={proposal.status === 'rejected' || sendingEmail}
                          startIcon={sendingEmail ? <CircularProgress size={16} color="inherit" /> : null}
                        >
                          {sendingEmail ? 'Loading...' : 'Reject'}
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* AI Comparison Results */}
          {comparison && (
            <>
              <Typography variant="h5" gutterBottom>
                AI Analysis
              </Typography>

              {/* Recommendation */}
              {comparison.recommendation && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Recommendation:</strong>
                  </Typography>
                  <Typography variant="body2">
                    {comparison.recommendation.reasoning}
                  </Typography>
                </Alert>
              )}

              {/* Summary */}
              {comparison.summary && (
                <Paper sx={{ p: 2, mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Summary
                  </Typography>
                  <Typography variant="body2">{comparison.summary}</Typography>
                </Paper>
              )}

              {/* Detailed Comparison */}
              <Grid container spacing={3}>
                {comparison.comparison?.map((item) => {
                  const vendor = proposals.find(p => p.vendorId === item.vendorId)?.vendor;
                  return (
                    <Grid item xs={12} md={6} key={item.vendorId}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {vendor?.name || item.vendorName}
                          </Typography>

                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Overall Score
                            </Typography>
                            <Chip
                              label={`${item.overallScore}/100`}
                              color={getScoreColor(item.overallScore)}
                              sx={{ mt: 0.5 }}
                            />
                          </Box>

                          <Grid container spacing={1} sx={{ mb: 2 }}>
                            <Grid item xs={4}>
                              <Typography variant="caption" color="text.secondary">
                                Compliance
                              </Typography>
                              <Typography variant="body2">
                                {item.complianceScore}/100
                              </Typography>
                            </Grid>
                            <Grid item xs={4}>
                              <Typography variant="caption" color="text.secondary">
                                Price
                              </Typography>
                              <Typography variant="body2">
                                {item.priceScore}/100
                              </Typography>
                            </Grid>
                            <Grid item xs={4}>
                              <Typography variant="caption" color="text.secondary">
                                Delivery
                              </Typography>
                              <Typography variant="body2">
                                {item.deliveryScore}/100
                              </Typography>
                            </Grid>
                          </Grid>

                          <Divider sx={{ my: 2 }} />

                          <Typography variant="subtitle2" color="success.main" gutterBottom>
                            Pros
                          </Typography>
                          <Box component="ul" sx={{ mt: 0, pl: 2 }}>
                            {item.pros?.map((pro, index) => (
                              <Typography component="li" variant="body2" key={index}>
                                {pro}
                              </Typography>
                            ))}
                          </Box>

                          <Typography variant="subtitle2" color="error.main" gutterBottom sx={{ mt: 2 }}>
                            Cons
                          </Typography>
                          <Box component="ul" sx={{ mt: 0, pl: 2 }}>
                            {item.cons?.map((con, index) => (
                              <Typography component="li" variant="body2" key={index}>
                                {con}
                              </Typography>
                            ))}
                          </Box>

                          {item.deviations && item.deviations.length > 0 && (
                            <>
                              <Typography variant="subtitle2" color="warning.main" gutterBottom sx={{ mt: 2 }}>
                                Deviations
                              </Typography>
                              <Box component="ul" sx={{ mt: 0, pl: 2 }}>
                                {item.deviations.map((dev, index) => (
                                  <Typography component="li" variant="body2" key={index}>
                                    {dev}
                                  </Typography>
                                ))}
                              </Box>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </>
          )}
        </>
      )}

      {/* Email Preview Dialog */}
      <Dialog open={emailPreviewOpen} onClose={handleCancelSend} maxWidth="md" fullWidth>
        <DialogTitle>
          {pendingStatusUpdate.status === 'accepted' ? '✓ Acceptance' : '✗ Rejection'} Email Preview
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" gutterBottom>
            Subject:
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            {emailPreview.subject}
          </Typography>

          <Typography variant="subtitle2" gutterBottom>
            Email Body: (You can edit before sending)
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={12}
            value={editableEmailBody}
            onChange={(e) => setEditableEmailBody(e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />

          <Alert severity="info">
            This email will be sent to the vendor. You can edit the content above before confirming.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelSend} disabled={sendingEmail}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmSend} 
            variant="contained" 
            color={pendingStatusUpdate.status === 'accepted' ? 'success' : 'error'}
            disabled={sendingEmail}
          >
            {sendingEmail ? 'Sending...' : 'Confirm & Send Email'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ProposalComparison;
