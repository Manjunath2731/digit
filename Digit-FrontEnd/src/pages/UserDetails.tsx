import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSecondaryUsers, SecondaryUser } from '../services/userManagement';
import { logout } from '../services/auth/authService';
import Button from '../components/auth/Button';
import Sidebar from '../components/layout/Sidebar';
import '../styles/users/UserDetails.css';
import '../styles/Dashboard.css';

const UserDetails: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<SecondaryUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get user data from local storage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) {
        setError('User ID not provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const users = await getSecondaryUsers();
        const foundUser = users.find(u => u.id === parseInt(userId));
        
        if (foundUser) {
          setSelectedUser(foundUser);
        } else {
          setError('User not found');
        }
      } catch (err) {
        setError('Failed to fetch user details');
        console.error('Error fetching user details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBackToUsers = () => {
    navigate('/users');
  };

  const getAccessLevelLabel = (level: string) => {
    switch (level) {
      case 'full': return 'Full Access';
      case 'limited': return 'Limited Access';
      case 'view_only': return 'View Only';
      default: return level;
    }
  };

  const getDeviceLabel = (device?: string) => {
    if (!device) return 'Not Specified';
    switch (device.toLowerCase()) {
      case 'mobile': return 'Mobile';
      case 'tablet': return 'Tablet';
      case 'desktop': return 'Desktop';
      case 'all': return 'All Devices';
      default: return device;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <header className="auth-header">
          <div className="logo-container">
            <img src="https://nimblevision.io/public/assets/images/nv-logo.png" alt="DIGIT" className="header-logo" />
            <span className="logo-text">Nimble Vision</span>
          </div>
          <div className="language-selector">
            <select className="language-dropdown">
              <option value="ENGLISH">ENGLISH</option>
              <option value="ಕನ್ನಡ">ಕನ್ನಡ</option>
            </select>
          </div>
        </header>
        
        <div className="dashboard-content-wrapper">
          <Sidebar user={user} />
          <div className="main-content">
            <div className="loading-container">
              <div className="loading-spinner">Loading user details...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !selectedUser) {
    return (
      <div className="dashboard-container">
        <header className="auth-header">
          <div className="logo-container">
            <img src="https://nimblevision.io/public/assets/images/nv-logo.png" alt="DIGIT" className="header-logo" />
            <span className="logo-text">Nimble Vision</span>
          </div>
          <div className="language-selector">
            <select className="language-dropdown">
              <option value="ENGLISH">ENGLISH</option>
              <option value="ಕನ್ನಡ">ಕನ್ನಡ</option>
            </select>
          </div>
        </header>
        
        <div className="dashboard-content-wrapper">
          <Sidebar user={user} />
          <div className="main-content">
            <div className="error-container">
              <h2>Error</h2>
              <p>{error || 'User not found'}</p>
              <Button onClick={handleBackToUsers}>Back to Users</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="auth-header">
        <div className="logo-container">
          <img src="https://nimblevision.io/public/assets/images/nv-logo.png" alt="DIGIT" className="header-logo" />
          <span className="logo-text">Nimble Vision</span>
        </div>
        <div className="language-selector">
          <select className="language-dropdown">
            <option value="ENGLISH">ENGLISH</option>
            <option value="ಕನ್ನಡ">ಕನ್ನಡ</option>
          </select>
        </div>
      </header>
      
      <div className="dashboard-content-wrapper">
        <Sidebar user={user} />
        <div className="main-content">
        <div className="user-details-container">
          <div className="page-header">
            <div className="header-left">
              <h1>User Details</h1>

            </div>
            <div className="header-actions">
              <Button 
                variant="secondary" 
                onClick={handleBackToUsers}
              >
                ← Back to Users
              </Button>
            </div>
          </div>

          <div className="user-details-content">
            <div className="details-card">
              <div className="card-header">
                <h2>Personal Information</h2>
                <span className={`status-badge ${selectedUser.status}`}>
                  {selectedUser.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="details-grid">
                <div className="detail-item">
                  <label>Name</label>
                  <span>{selectedUser.name}</span>
                </div>
                
                <div className="detail-item">
                  <label>Email</label>
                  <span>{selectedUser.email}</span>
                </div>
                
                <div className="detail-item">
                  <label>Phone</label>
                  <span>{selectedUser.phone}</span>
                </div>
                
                <div className="detail-item">
                  <label>User ID</label>
                  <span>#{selectedUser.id}</span>
                </div>
              </div>
            </div>

            {/* Device Details - Show all devices */}
            {selectedUser.devices && selectedUser.devices.length > 0 ? (
              selectedUser.devices.map((device: any, index: number) => (
                <div className="details-card" key={index}>
                  <div className="card-header">
                    <h2>Device Details {(selectedUser.devices && selectedUser.devices.length > 1) ? `#${index + 1}` : ''}</h2>
                    {device.is_primary && <span className="primary-badge">Primary Device</span>}
                  </div>
                  
                  <div className="details-grid">
                    <div className="detail-item">
                      <label>Device ID</label>
                      <span>{device.device_id || 'Not specified'}</span>
                    </div>
                    
                    <div className="detail-item">
                      <label>Product</label>
                      <span className="device-badge">
                        {device.saviour || 'Not specified'}
                      </span>
                    </div>
                    
                    <div className="detail-item">
                      <label>Device SIM No</label>
                      <span>{device.device_sim_no || 'Not specified'}</span>
                    </div>
                    
                    <div className="detail-item">
                      <label>House Type</label>
                      <span>{device.house_type || 'Not specified'}</span>
                    </div>
                    
                    <div className="detail-item">
                      <label>Sensor Type</label>
                      <span>{device.sensor_type !== null ? `Sensor Type ${device.sensor_type}` : 'Not specified'}</span>
                    </div>
                    
                    <div className="detail-item">
                      <label>Device Status</label>
                      <span className={`status-badge ${device.device_status}`}>
                        {device.device_status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="detail-item">
                      <label>Last Login Device</label>
                      <span>{device.last_login_device || 'Not available'}</span>
                    </div>
                    
                    <div className="detail-item">
                      <label>Operating System</label>
                      <span>{device.os || 'Not specified'}</span>
                    </div>
                    
                    <div className="detail-item">
                      <label>Browser</label>
                      <span>{device.browser || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="details-card">
                <div className="card-header">
                  <h2>Device Details</h2>
                </div>
                <div className="details-grid">
                  <div className="detail-item">
                    <span>No device information available</span>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Information Card */}
            <div className="details-card">
              <div className="card-header">
                <h2>Additional Information</h2>
              </div>
              
              <div className="details-grid">
                <div className="detail-item full-width">
                  <label>Description</label>
                  <span>
                    {selectedUser.access_level === 'full' 
                      ? 'This user has full access to all system features and can perform administrative tasks.'
                      : selectedUser.access_level === 'limited'
                      ? 'This user has limited access to specific features based on their role.'
                      : 'This user has view-only access and cannot modify system data.'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="details-actions">
              <Button 
                variant="secondary" 
                onClick={handleBackToUsers}
              >
                Back to Users
              </Button>
              <Button 
                variant="primary" 
                onClick={() => {
                  // Future: Add edit functionality
                  console.log('Edit user:', selectedUser.id);
                }}
              >
                Edit User
              </Button>
            </div>
          </div>
        </div>
      </div>

    
      </div>
      <footer className="auth-footer">
        <p><img src="https://s3.ap-south-1.amazonaws.com/egov-playground-assets/digit-footer.png" alt="DIGIT" className="footer-logo" /></p>
      </footer>
    </div>
  );
};

export default UserDetails;
