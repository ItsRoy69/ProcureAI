import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import FilterListIcon from '@mui/icons-material/FilterList';
import { rfpAPI } from '../services/api';

function Dashboard() {
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
        setRfps(result.data);
      }
    } catch (error) {
      console.error('Error loading RFPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: rfps.length,
    draft: rfps.filter(r => r.status === 'draft').length,
    sent: rfps.filter(r => r.status === 'sent').length,
    closed: rfps.filter(r => r.status === 'closed').length,
  };

  const getStatusChip = (status) => {
    const config = {
      draft: { bg: '#FFF7ED', color: '#C2410C', label: 'Draft' }, // Orange-50/700
      sent: { bg: '#EFF6FF', color: '#1D4ED8', label: 'Sent' },   // Blue-50/700
      closed: { bg: '#F0FDFA', color: '#0F766E', label: 'Closed' } // Teal-50/700
    }[status] || { bg: '#F3F4F6', color: '#374151', label: status };

    return (
      <Chip 
        label={config.label} 
        size="small" 
        sx={{ 
          bgcolor: config.bg, 
          color: config.color, 
          fontWeight: 600, 
          borderRadius: '4px', // Square-ish look typical of enterprise apps
          height: '24px',
          fontSize: '0.75rem',
          border: '1px solid',
          borderColor: 'transparent'
        }} 
      />
    );
  };

  const StatCard = ({ title, value, icon, trend }) => (
    <Card elevation={0} sx={{
      border: '1px solid #E5E7EB',
      borderRadius: 1.5,
      height: '100%'
    }}>
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="caption" color="textSecondary" sx={{ mb: 0.5, fontWeight: 500, display: 'block' }}>
              {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>
              {value}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 600, bgcolor: '#ECFDF5', px: 0.5, py: 0.25, borderRadius: 0.5 }}>
                {trend}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                vs last month
              </Typography>
            </Box>
          </Box>
          <Box sx={{ 
            p: 0.75, 
            borderRadius: 1, 
            bgcolor: '#F9FAFB', 
            color: '#6B7280',
            border: '1px solid #F3F4F6'
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ maxWidth: '100%' }}>
      {/* Header - Compact */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827' }}>
          Overview
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
           <Button
            variant="outlined"
            size="small"
            startIcon={<FilterListIcon />}
            sx={{ 
              borderRadius: 1, 
              textTransform: 'none', 
              borderColor: '#D1D5DB', 
              color: '#374151',
              fontWeight: 500
            }}
          >
            Filter
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => navigate('/rfp/create')}
            sx={{
              bgcolor: '#4F46E5',
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: 500,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#4338CA', boxShadow: 'none' }
            }}
          >
            Create RFP
          </Button>
        </Box>
      </Box>

      {/* Stats - Dense Grid */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total RFPs"
            value={stats.total}
            trend="+12%"
            icon={<DescriptionIcon fontSize="small" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Drafts"
            value={stats.draft}
            trend="+2%"
            icon={<TrendingUpIcon fontSize="small" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Sent"
            value={stats.sent}
            trend="+5%"
            icon={<SendIcon fontSize="small" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed"
            value={stats.closed}
            trend="+8%"
            icon={<CheckCircleIcon fontSize="small" />}
          />
        </Grid>
      </Grid>

      {/* Main Content - Compact Two Column Layout */}
      <Grid container spacing={2} sx={{ mt: 2, minHeight: 'calc(100vh - 280px)' }}>
        {/* Recent Transactions / Table */}
        <Grid item xs={12} md={7} lg={8}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 1.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ 
              p: 1.5, 
              borderBottom: '1px solid #E5E7EB', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#111827' }}>
                Recent Activity
              </Typography>
              <Button size="small" sx={{ textTransform: 'none', color: '#4F46E5', fontWeight: 500 }}>
                View All
              </Button>
            </Box>
            <TableContainer sx={{ overflowX: 'auto', flex: 1 }}>
              <Table size="small" sx={{ minWidth: 650 }}>
                <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, py: 1.5, width: '40%' }}>PROJECT NAME</TableCell>
                    <TableCell sx={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, py: 1.5, width: '15%' }}>STATUS</TableCell>
                    <TableCell sx={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, py: 1.5, width: '20%' }}>BUDGET</TableCell>
                    <TableCell sx={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, py: 1.5, width: '20%' }}>DATE</TableCell>
                    <TableCell sx={{ width: '5%' }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rfps.slice(0, 6).map((rfp) => (
                    <TableRow 
                      key={rfp.id} 
                      hover
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>
                          {rfp.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6B7280' }}>
                          ID: #{rfp.id.toString().padStart(4, '0')}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>{getStatusChip(rfp.status)}</TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2" sx={{ color: '#374151' }}>
                          ${rfp.budget?.toLocaleString() || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2" sx={{ color: '#374151' }}>
                          {new Date(rfp.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <IconButton size="small" onClick={() => navigate(`/rfp/${rfp.id}`)}>
                          <MoreHorizIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {rfps.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#6B7280' }}>
                        No data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        {/* Side Panel - Quick Actions */}
        <Grid item xs={12} md={5} lg={4}>
          <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 1.5, height: '100%' }}>
            <CardContent sx={{ p: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', mb: 2 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={() => navigate('/vendors')}
                  sx={{ 
                    justifyContent: 'flex-start', 
                    borderColor: '#E5E7EB', 
                    color: '#374151',
                    textTransform: 'none',
                    '&:hover': { borderColor: '#D1D5DB', bgcolor: '#F9FAFB' }
                  }}
                  startIcon={<AddIcon fontSize="small" />}
                >
                  New Vendor
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  sx={{ 
                    justifyContent: 'flex-start', 
                    borderColor: '#E5E7EB', 
                    color: '#374151',
                    textTransform: 'none',
                    '&:hover': { borderColor: '#D1D5DB', bgcolor: '#F9FAFB' }
                  }}
                  startIcon={<DescriptionIcon fontSize="small" />}
                >
                  Export Report
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
