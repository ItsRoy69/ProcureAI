import React, { useState, useEffect } from 'react';
import {
  Box,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Paper,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import { vendorAPI } from '../services/api';

function VendorSelector({ selectedVendors, onSelectionChange, onSendRFP, sending = false }) {
  const [vendors, setVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newVendor, setNewVendor] = useState({ name: '', email: '', contactPerson: '', phone: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      const result = await vendorAPI.getAll();
      if (result.success) {
        setVendors(result.data);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggle = (vendorId) => {
    const currentIndex = selectedVendors.indexOf(vendorId);
    const newSelected = [...selectedVendors];

    if (currentIndex === -1) {
      newSelected.push(vendorId);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    onSelectionChange(newSelected);
  };

  const handleAddVendor = async () => {
    try {
      const result = await vendorAPI.create(newVendor);
      if (result.success) {
        setVendors([...vendors, result.data]);
        setOpenAddDialog(false);
        setNewVendor({ name: '', email: '', contactPerson: '', phone: '' });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" color="primary" gutterBottom>
        Select Vendors
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search vendors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddDialog(true)}
        >
          Add Vendor
        </Button>
      </Box>

      {selectedVendors.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            Selected: {selectedVendors.length} vendor(s)
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {selectedVendors.map(id => {
              const vendor = vendors.find(v => v.id === id);
              return vendor ? (
                <Chip
                  key={id}
                  label={vendor.name}
                  onDelete={() => handleToggle(id)}
                  color="primary"
                />
              ) : null;
            })}
          </Box>
        </Box>
      )}

      <List sx={{ maxHeight: 400, overflow: 'auto' }}>
        {filteredVendors.map((vendor) => (
          <ListItem key={vendor.id} disablePadding>
            <ListItemButton onClick={() => handleToggle(vendor.id)} dense>
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={selectedVendors.indexOf(vendor.id) !== -1}
                  tabIndex={-1}
                  disableRipple
                />
              </ListItemIcon>
              <ListItemText
                primary={vendor.name}
                secondary={`${vendor.email}${vendor.contactPerson ? ` • ${vendor.contactPerson}` : ''}`}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {filteredVendors.length === 0 && (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
          No vendors found. Add a vendor to get started.
        </Typography>
      )}

      <Box sx={{ mt: 3 }}>
        <Button
          variant="contained"
          fullWidth
          size="large"
          disabled={selectedVendors.length === 0 || sending}
          onClick={onSendRFP}
          startIcon={sending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
        >
          {sending ? 'Sending RFP...' : `Send RFP to ${selectedVendors.length} Vendor(s)`}
        </Button>
      </Box>

      {/* Add Vendor Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Vendor</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Company Name"
            value={newVendor.name}
            onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={newVendor.email}
            onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Contact Person"
            value={newVendor.contactPerson}
            onChange={(e) => setNewVendor({ ...newVendor, contactPerson: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Phone"
            value={newVendor.phone}
            onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddVendor}
            variant="contained"
            disabled={!newVendor.name || !newVendor.email}
          >
            Add Vendor
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default VendorSelector;
