import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  DashboardIcon, 
  DescriptionIcon, 
  PeopleIcon, 
  CompareArrowsIcon, 
  LogoutIcon, 
  MoreVertIcon 
} from './Icons';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

export const DRAWER_WIDTH = 240;

const menuItems = [
  { text: 'Overview', icon: DashboardIcon, path: '/' },
  { text: 'RFPs', icon: DescriptionIcon, path: '/rfps' },
  { text: 'Vendors', icon: PeopleIcon, path: '/vendors' },
  { text: 'Comparisons', icon: CompareArrowsIcon, path: '/comparisons' },
];

function Sidebar({ mobileOpen, onDrawerToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawerContent = (
    <div className="sidebar-content">
      <div className="sidebar-header">
        <div className="sidebar-logo">P</div>
        <h2 className="sidebar-title">ProcureAI</h2>
      </div>

      <nav className="sidebar-nav">
        <p className="sidebar-nav-label">MENU</p>
        <ul>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.text}>
                <button
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    navigate(item.path);
                    if (mobileOpen) onDrawerToggle();
                  }}
                >
                  <Icon width={18} height={18} />
                  <span>{item.text}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={() => setMenuOpen(!menuOpen)}>
          <div className="flex items-center gap-3">
            <div className="avatar avatar-sm">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">
                {user?.email?.split('@')[0]}
              </p>
              <p className="sidebar-user-email">
                {user?.email}
              </p>
            </div>
          </div>
          <MoreVertIcon width={20} height={20} className="text-gray-400" />
        </div>
        {menuOpen && (
          <div className="sidebar-menu">
            <button onClick={handleLogout} className="sidebar-menu-item">
              <LogoutIcon width={16} height={16} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <aside className="sidebar-wrapper">
      {mobileOpen && (
        <>
          <div className="sidebar-backdrop" onClick={onDrawerToggle}></div>
          <div className="sidebar sidebar-mobile">
            {drawerContent}
          </div>
        </>
      )}
      
      <div className="sidebar sidebar-desktop">
        {drawerContent}
      </div>
    </aside>
  );
}

export default Sidebar;
