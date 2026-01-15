import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Avatar,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { vendorAPI } from '../services/api';

function Vendors() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState(null);
  const [newVendor, setNewVendor] = useState({
    name: '',
    email: '',
    contactPerson: '',
    phone: ''
  });

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      const result = await vendorAPI.getAll();
      if (result.success) {
        setVendors(result.data);
      }
    } catch (error) {
      console.error('Error loading vendors:', error);
      setError('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVendor = async () => {
    if (!newVendor.name || !newVendor.email) {
      setError('Name and Email are required');
      return;
    }

    try {
      const result = await vendorAPI.create(newVendor);
      if (result.success) {
        setVendors([...vendors, result.data]);
        setOpenDialog(false);
        setNewVendor({ name: '', email: '', contactPerson: '', phone: '' });
        setError(null);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add vendor');
    }
  };

  const getVendorStats = (vendor) => {
    const proposalCount = vendor.proposals?.length || 0;
    const acceptedCount = vendor.proposals?.filter(p => p.status === 'accepted').length || 0;
    return { proposalCount, acceptedCount };
  };

  return (
    <Box>
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 0.5, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
            Vendors
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280' }}>
            Manage your vendor relationships and contacts
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          fullWidth={{ xs: true, sm: false }}
          sx={{
            bgcolor: '#6366F1',
            borderRadius: 2,
            px: 3,
            py: 1.25,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            '&:hover': {
              bgcolor: '#4F46E5',
              boxShadow: '0 6px 16px rgba(99, 102, 241, 0.4)',
            }
          }}
        >
          Add Vendor
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

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
                  <BusinessIcon sx={{ fontSize: 24, color: '#6366F1' }} />
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5, fontWeight: 500 }}>
                Total Vendors
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>
                {vendors.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: '1px solid #F3F4F6', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: alpha('#10B981', 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCircleIcon sx={{ fontSize: 24, color: '#10B981' }} />
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5, fontWeight: 500 }}>
                Active Vendors
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>
                {vendors.filter(v => v.proposals && v.proposals.length > 0).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : vendors.length === 0 ? (
        <Card sx={{ p: 8, textAlign: 'center', borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <Typography variant="h6" color="text.secondary">
            No vendors yet. Add your first vendor to get started!
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {vendors.map((vendor) => {
            const stats = getVendorStats(vendor);
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={vendor.id}>
                <Card elevation={0} sx={{
                  border: '1px solid #E5E7EB',
                  borderRadius: 1.5,
                  height: '100%',
                  '&:hover': {
                    borderColor: '#6366F1',
                    bgcolor: '#F9FAFB'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Avatar sx={{ bgcolor: '#6366F1', width: 48, height: 48 }}>
                        {vendor.name?.charAt(0)}
                      </Avatar>
                      <IconButton size="small" sx={{ color: '#9CA3AF' }}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 1 }}>
                      {vendor.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                      {vendor.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon sx={{ fontSize: 16, color: '#9CA3AF' }} />
                          <Typography variant="body2" sx={{ color: '#6B7280' }}>
                            {vendor.email}
                          </Typography>
                        </Box>
                      )}
                      {vendor.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon sx={{ fontSize: 16, color: '#9CA3AF' }} />
                          <Typography variant="body2" sx={{ color: '#6B7280' }}>
                            {vendor.phone}
                          </Typography>
                        </Box>
                      )}
                      {vendor.contactPerson && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                            Contact Person
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#111827', fontWeight: 500 }}>
                            {vendor.contactPerson}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, pt: 2, borderTop: '1px solid #F3F4F6' }}>
                      <Chip
                        label={`${stats.proposalCount} proposals`}
                        size="small"
                        sx={{
                          bgcolor: alpha('#6366F1', 0.1),
                          color: '#6366F1',
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }}
                      />
                      {stats.acceptedCount > 0 && (
                        <Chip
                          label={`${stats.acceptedCount} accepted`}
                          size="small"
                          sx={{
                            bgcolor: alpha('#10B981', 0.1),
                            color: '#065F46',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Add New Vendor</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Company Name"
              fullWidth
              required
              value={newVendor.name}
              onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={newVendor.email}
              onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
            />
            <TextField
              label="Contact Person"
              fullWidth
              value={newVendor.contactPerson}
              onChange={(e) => setNewVendor({ ...newVendor, contactPerson: e.target.value })}
            />
            <TextField
              label="Phone"
              fullWidth
              value={newVendor.phone}
              onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddVendor}
            sx={{
              bgcolor: '#6366F1',
              textTransform: 'none',
              '&:hover': { bgcolor: '#4F46E5' }
            }}
          >
            Add Vendor
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Vendors;
