import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSecondaryUsers, SecondaryUser, updateSecondaryUserStatus, deleteSecondaryUser, getUserDevices, Device } from '../services/userManagement';
import { logout } from '../services/auth/authService';
import Button from '../components/auth/Button';
import Sidebar from '../components/layout/Sidebar';
import AddSecondaryUserModal from '../components/users/AddSecondaryUserModal';
import '../styles/users/UserManagement.css';
import '../styles/users/SecondaryUsers.css';
import '../styles/users/DigitUIOverrides.css';
import '../styles/Dashboard.css';

const SecondaryUserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<SecondaryUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [userDevices, setUserDevices] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  console.log('User:', user);
  
  useEffect(() => {
    // Get user data from local storage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Check if user has 'user' role, otherwise redirect
      if (parsedUser.role !== 'user') {
        navigate('/dashboard');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getSecondaryUsers('user');
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch secondary users. Please try again.');
      console.error('Error fetching secondary users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddUser = () => {
    // Check if user has reached their secondary user limit
    if (user && users.length >= user.noofsecuser) {
      alert(`You have reached your limit of ${user.noofsecuser} secondary users. Please upgrade your plan to add more users.`);
      return;
    }
    setIsModalOpen(true);
  };

  const handleUserAdded = () => {
    fetchUsers();
  };

  const handleEditUser = (userId: number) => {
    // TODO: Open edit modal with user data
    console.log('Edit user:', userId);
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this secondary user?')) {
      try {
        await deleteSecondaryUser(userId);
        fetchUsers();
      } catch (err) {
        setError('Failed to delete user. Please try again.');
        console.error('Error deleting user:', err);
      }
    }
  };

  const handleDeviceInfo = async (userId: number) => {
    try {
      setSelectedUserId(userId);
      
      // Fetch all available devices
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('User not found');
      }
      const currentUser = JSON.parse(userData);
      const devices = await getUserDevices(currentUser.id);
      setAllDevices(devices);
      
      // Find the selected user in the existing users state (no need for duplicate API call)
      const selectedUser = users.find((user: any) => user.id === userId);
      console.log('Found user:', selectedUser);
      
      if (selectedUser && selectedUser.devices) {
        // Extract device IDs from the user's assigned devices
        const assignedDeviceIds = selectedUser.devices.map((device: any) => device.device_id);
        console.log('Assigned device IDs:', assignedDeviceIds);
        setUserDevices(assignedDeviceIds);
      } else {
        // No devices assigned to this user
        console.log('No devices found for user');
        setUserDevices([]);
      }
      
      setIsDeviceModalOpen(true);
    } catch (err) {
      setError('Failed to load device information. Please try again.');
      console.error('Error loading devices:', err);
    }
  };

  const handleDeviceToggle = (deviceId: string) => {
    setUserDevices(prev => {
      if (prev.includes(deviceId)) {
        return prev.filter(id => id !== deviceId);
      } else {
        return [...prev, deviceId];
      }
    });
  };

  const handleSaveDeviceAssignments = async () => {
    try {
      // TODO: Implement API call to save device assignments
      console.log('Saving device assignments for user:', selectedUserId, 'devices:', userDevices);
      
      // Close modal
      setIsDeviceModalOpen(false);
      setSelectedUserId(null);
      setUserDevices([]);
    } catch (err) {
      setError('Failed to save device assignments. Please try again.');
      console.error('Error saving device assignments:', err);
    }
  };

  const getAccessLevelLabel = (level: string) => {
    switch (level) {
      case 'full': return 'Full Access';
      case 'limited': return 'Limited Access';
      case 'view_only': return 'View Only';
      default: return level;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter users based on search term and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    
    const matchesStatus = 
      filterStatus === 'all' || 
      user.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content-wrapper">
        <Sidebar user={user} />
        
        <div className="user-management-container">
          <div className="secondary-users-header">
            <div className="header-left">
              <div className="pink-icon-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h1>Secondary Users List</h1>
            </div>
            <button className="add-secondary-user-btn" onClick={handleAddUser}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              ADD SECONDARY USERS
            </button>
          </div>

          <div className="secondary-users-controls">
            <div className="show-entries">
              <span>Show</span>
              <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span>entries</span>
            </div>
            
            <div className="search-box">
              <span>Search:</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input-field"
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {isLoading ? (
            <div className="loading-message">Loading secondary users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="secondary-users-table-wrapper">
              <table className="secondary-users-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email ID</th>
                    <th>Contact Number</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={6} className="no-data-cell">No data available in table</td>
                  </tr>
                </tbody>
              </table>
              <div className="secondary-users-pagination">
                <div className="pagination-info-text">
                  Showing 0 to 0 of 0 entries
                </div>
                <div className="pagination-buttons">
                  <button className="pagination-btn" disabled>PREVIOUS</button>
                  <button className="pagination-btn" disabled>NEXT</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="secondary-users-table-wrapper">
              <table className="secondary-users-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email ID</th>
                    <th>Contact Number</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((secondaryUser, index) => (
                    <tr key={secondaryUser.id}>
                      <td>{startIndex + index + 1}</td>
                      <td>{secondaryUser.name}</td>
                      <td>{secondaryUser.email}</td>
                      <td>{secondaryUser.phone}</td>
                      <td>
                        <span className={`secondary-status-badge ${secondaryUser.status}`}>
                          {secondaryUser.status === 'active' ? 'Active' : 'Non-Active'}
                        </span>
                      </td>
                      <td>
                        <div className="secondary-action-icons">
                          <button className="action-icon-btn edit-btn" onClick={() => handleEditUser(secondaryUser.id)} title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button className="action-icon-btn user-btn" title="User Details">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                              <circle cx="12" cy="7" r="4"/>
                            </svg>
                          </button>
                          <button className="action-icon-btn device-btn" onClick={() => handleDeviceInfo(secondaryUser.id)} title="Device Info">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                              <line x1="12" y1="18" x2="12.01" y2="18"/>
                            </svg>
                          </button>
                          <button className="action-icon-btn delete-btn" onClick={() => handleDeleteUser(secondaryUser.id)} title="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="secondary-users-pagination">
                <div className="pagination-info-text">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} entries
                </div>
                <div className="pagination-buttons">
                  <button 
                    className="pagination-btn" 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                    disabled={currentPage === 1}
                  >
                    PREVIOUS
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button 
                    className="pagination-btn" 
                    onClick={() => setCurrentPage(prev => prev + 1)} 
                    disabled={currentPage >= totalPages}
                  >
                    NEXT
                  </button>
                </div>
              </div>
            </div>
          )}

          <AddSecondaryUserModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onUserAdded={handleUserAdded} 
          />

          {/* Device Assignment Modal */}
          {isDeviceModalOpen && (
            <div className="modal-overlay">
              <div className="device-modal-new">
                <div className="modal-header-new">
                  <h2 className="modal-title-green">Manage Devices</h2>
                  <button 
                    className="modal-close-btn-new" 
                    onClick={() => setIsDeviceModalOpen(false)}
                  >
                    ×
                  </button>
                </div>
                
                <div className="modal-body-new">
                  <div className="device-cards-container">
                    {allDevices.map((device) => {
                      const isChecked = userDevices.includes(device.device_id);
                      console.log(`Device ${device.device_id}: checked=${isChecked}, userDevices=`, userDevices);
                      return (
                        <div key={device.device_id} className="device-card">
                          <div className="device-card-content">
                            <div className="device-name-large">
                              {device.device_id}
                            </div>
                          </div>
                          <div className="device-checkbox-container">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleDeviceToggle(device.device_id)}
                              className="device-checkbox-large"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="modal-footer-new">
                  <button 
                    className="update-btn" 
                    onClick={handleSaveDeviceAssignments}
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          )}
          
        </div>
      </div>

      <footer className="auth-footer">
        <p><img src="https://s3.ap-south-1.amazonaws.com/egov-playground-assets/digit-footer.png" alt="DIGIT" className="footer-logo" /></p>
      </footer>
    </div>
  );
};

export default SecondaryUserManagement;
