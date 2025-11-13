import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { logout } from '../../services/auth/authService';
import { useNavigate } from 'react-router-dom';
import { getUserRole, getRoleDisplayName, type UserRole } from '../../utils/roleUtils';
import '../../styles/layout/Sidebar.css';

interface SidebarProps {
  user: any | null;
}

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [borewellExpanded, setBorewellExpanded] = useState(false);
  const [dashboardExpanded, setDashboardExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // If user is not loaded yet, show loading state
  if (!user) {
    return (
      <div className="sidebar">
        <div className="sidebar-profile">
          <div className="profile-image">
            <div className="default-avatar"></div>
          </div>
          <div className="profile-info">
            <h2>Loading...</h2>
            <p className="phone-number">-</p>
            <p className="email">-</p>
          </div>
        </div>
        <div className="sidebar-menu">
          {/* Show minimal menu while loading */}
        </div>
        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Admin has access to all features
  const adminMenuItems = [
    { 
      path: '/dashboard', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>, 
      label: 'Home' 
    },
    { 
      path: '/users', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, 
      label: 'User Management' 
    },
    { 
      path: '/cities', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, 
      label: 'City Management' 
    },
    { 
      path: '/orders', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>, 
      label: 'Order Management' 
    },
    { 
      path: '/plan-settings', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m9-9h-6m-6 0H3"/></svg>, 
      label: 'Plan Settings' 
    },
  ];

  // Dashboard submenu items
  const dashboardSubMenuItems = [
    { 
      path: '/dashboard-user', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/><circle cx="12" cy="12" r="3"/></svg>, 
      label: 'Ni-The Water Saviour' 
    },
    { 
      path: '/manage-ni-sensu', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>, 
      label: 'Ni-Sensu' 
    },
    { 
      path: '/manage-flow-meter', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, 
      label: 'Ni-The Flow Meter' 
    },
    { 
      path: 'borewell', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/><path d="M8 12h8"/><path d="M12 2v2"/><path d="M12 20v2"/></svg>, 
      label: 'Borewell',
      hasSubmenu: true
    },
  ];

  // Borewell submenu items
  const borewellSubMenuItems = [
    { 
      path: '/electrical-parameters', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>, 
      label: 'Electrical Parameters' 
    },
    { 
      path: '/water-level', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>, 
      label: 'Water Level' 
    },
    { 
      path: '/water-outflow', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/></svg>, 
      label: 'Water Outflow' 
    },
    { 
      path: '/water-yield', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>, 
      label: 'Water Yield' 
    },
    { 
      path: '/device-map', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"/></svg>, 
      label: 'Device Map' 
    },
    { 
      path: '/statistics', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, 
      label: 'Statistics' 
    },
  ];

  // User has access to most features except user management and system settings
  const userMenuItems = [
    { 
      path: '/secondary-user', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, 
      label: 'Secondary Users' 
    },
    { 
      path: '/tanks', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>, 
      label: 'Manage Tank' 
    },

   
    { 
      path: '/compare', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>, 
      label: 'Compare' 
    },
    { 
      path: '/membership', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, 
      label: 'Membership' 
    },
    { 
      path: '/edit-profile', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>, 
      label: 'Edit Profile' 
    },
    { 
      path: '/complaint-form', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, 
      label: 'Complaint Form' 
    },
    { 
      path: '/service-engineers', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, 
      label: 'Service Engineers' 
    },
  ];

  // Secondary user has limited access to basic features only
  const secondaryUserMenuItems = [
    { 
      path: '/dashboard', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>, 
      label: 'Home' 
    },
    { 
      path: '/orders', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>, 
      label: 'My Orders' 
    },
    { 
      path: '/bills', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>, 
      label: 'My Bills' 
    },
    { 
      path: '/birth-certificate', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, 
      label: 'Birth Certificate' 
    },
    { 
      path: '/death-certificate', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, 
      label: 'Death Certificate' 
    },
    { 
      path: '/property', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, 
      label: 'Property' 
    },
    { 
      path: '/grievance', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, 
      label: 'Submit Grievance' 
    },
  ];

  // Function to get menu items based on user role
  const getMenuItems = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return adminMenuItems;
      case 'user':
        return userMenuItems;
      case 'secondary_user':
        return secondaryUserMenuItems;
      default:
        return secondaryUserMenuItems; // Default to most restrictive access
    }
  };

  // Get the current user's role (with fallback)
  const userRole: UserRole = getUserRole(user);
  const menuItems = getMenuItems(userRole);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src="https://nimblevision.io/public/assets/images/nv-logo.png" alt="Nimble Vision" className="logo-icon" />
          <span className="logo-text">NIMBLE VISION</span>
        </div>
      </div>

      <div className="sidebar-profile">
        <div className="profile-image">
          {/* Default profile image */}
          <div className="default-avatar"></div>
        </div>
        <div className="profile-info">
          <h2>{user?.user_name || 'User'}</h2>
          <span className="dropdown-icon">▼</span>
        </div>
      </div>

      <div className="sidebar-menu">
        {/* Dashboard Menu with Submenu - Only for user role, at the top */}
        {userRole === 'user' && (
          <>
            <div
              className={`menu-item menu-parent ${dashboardExpanded ? 'expanded' : ''}`}
              onClick={() => setDashboardExpanded(!dashboardExpanded)}
            >
              <span className="menu-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
              </span>
              <span className="menu-label">Dashboard</span>
              <span className={`submenu-arrow ${dashboardExpanded ? 'expanded' : ''}`}>▼</span>
            </div>
            
            {dashboardExpanded && (
              <div className="submenu">
                {dashboardSubMenuItems.map((subItem) => (
                  <React.Fragment key={subItem.path}>
                    {subItem.hasSubmenu ? (
                      <>
                        <div
                          className={`menu-item submenu-item menu-parent ${borewellExpanded ? 'expanded' : ''}`}
                          onClick={() => setBorewellExpanded(!borewellExpanded)}
                        >
                          <span className="menu-icon">{subItem.icon}</span>
                          <span className="menu-label">{subItem.label}</span>
                          <span className={`submenu-arrow ${borewellExpanded ? 'expanded' : ''}`}>▼</span>
                        </div>
                        {borewellExpanded && (
                          <div className="submenu nested-submenu">
                            {borewellSubMenuItems.map((borewellItem) => (
                              <Link
                                key={borewellItem.path}
                                to={borewellItem.path}
                                className={`menu-item submenu-item nested-submenu-item ${location.pathname === borewellItem.path ? 'active' : ''}`}
                              >
                                <span className="menu-icon">{borewellItem.icon}</span>
                                <span className="menu-label">{borewellItem.label}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        to={subItem.path}
                        className={`menu-item submenu-item ${location.pathname === subItem.path ? 'active' : ''}`}
                      >
                        <span className="menu-icon">{subItem.icon}</span>
                        <span className="menu-label">{subItem.label}</span>
                      </Link>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </>
        )}
        
        {menuItems.map((item, index) => (
          <Link
            key={item.path}
            to={item.path}
            className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-label">{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="sidebar-footer">
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
