import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import PeopleIcon from '@mui/icons-material/People';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 240;

const menuItems = [
  { text: 'Overview', icon: DashboardIcon, path: '/' },
  { text: 'RFPs', icon: DescriptionIcon, path: '/rfps' },
  { text: 'Vendors', icon: PeopleIcon, path: '/vendors' },
  { text: 'Comparisons', icon: CompareArrowsIcon, path: '/comparisons' },
];

function Sidebar({ mobileOpen, onDrawerToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1.5,
        borderBottom: '1px solid #E5E7EB',
        minHeight: 64
      }}>
        <Box sx={{
          width: 32,
          height: 32,
          borderRadius: 1.5,
          background: '#4F46E5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 700,
          fontSize: '1rem'
        }}>
          P
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#111827', letterSpacing: '-0.01em' }}>
          ProcureAI
        </Typography>
      </Box>

      {/* Navigation */}
      <List sx={{ px: 1.5, pt: 2, flex: 1 }}>
        <Typography variant="caption" sx={{ px: 1.5, mb: 1, display: 'block', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem' }}>
          Menu
        </Typography>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.25 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) onDrawerToggle();
                }}
                sx={{
                  borderRadius: 1,
                  py: 0.75,
                  px: 1.5,
                  minHeight: 36,
                  bgcolor: isActive ? '#EEF2FF' : 'transparent',
                  color: isActive ? '#4F46E5' : '#4B5563',
                  '&:hover': {
                    bgcolor: isActive ? '#EEF2FF' : '#F9FAFB',
                    color: isActive ? '#4F46E5' : '#111827',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
                  <Icon sx={{ fontSize: 18 }} />
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      
      {/* User Actions */}
      <Box sx={{ p: 2, borderTop: '1px solid #E5E7EB' }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: 1,
            borderRadius: 1,
            '&:hover': { bgcolor: '#F9FAFB', cursor: 'pointer' }
          }}
          onClick={handleMenuOpen}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#4F46E5', fontSize: '0.875rem' }}>
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </Avatar>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>
                {user?.email?.split('@')[0]}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>
                {user?.email}
              </Typography>
            </Box>
          </Box>
          <MoreVertIcon sx={{ color: '#9CA3AF', fontSize: 20 }} />
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleLogout} sx={{ color: '#EF4444' }}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" sx={{ color: '#EF4444' }} />
            </ListItemIcon>
            <ListItemText>Sign out</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              border: 'none',
              bgcolor: 'white',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: '1px solid #E5E7EB',
              bgcolor: 'white',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      )}
    </Box>
  );
}

export default Sidebar;
export { DRAWER_WIDTH };
