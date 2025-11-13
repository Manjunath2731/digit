import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSecondaryUsers, SecondaryUser, updateSecondaryUserStatus, deleteSecondaryUser } from '../services/userManagement';
import { logout } from '../services/auth/authService';
import Button from '../components/auth/Button';
import Sidebar from '../components/layout/Sidebar';
import AddUserModal from '../components/users/AddUserModal';
import AddDeviceModal from '../components/users/AddDeviceModal';
import '../styles/users/UserManagement.css';
import '../styles/users/DigitUIOverrides.css';
import '../styles/Dashboard.css';

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<SecondaryUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  
  useEffect(() => {
    // Get user data from local storage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getSecondaryUsers('admin');
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users. Please try again.');
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddUser = () => {
    setIsModalOpen(true);
  };

  const handleUserAdded = () => {
    fetchUsers();
  };

  const handleAddDevice = (userId: number) => {
    setSelectedUserId(userId);
    setIsDeviceModalOpen(true);
  };

  const handleDeviceAdded = () => {
    fetchUsers();
  };


  const handleViewUser = (userId: number) => {
    navigate(`/users/${userId}`);
  };

  const handleStatusChange = async (userId: number, newStatus: 'active' | 'inactive') => {
    try {
      await updateSecondaryUserStatus(userId, newStatus);
      fetchUsers();
    } catch (err) {
      setError('Failed to update user status. Please try again.');
      console.error('Error updating user status:', err);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteSecondaryUser(userId);
        fetchUsers();
      } catch (err) {
        setError('Failed to delete user. Please try again.');
        console.error('Error deleting user:', err);
      }
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
  
  const getDeviceLabel = (device?: string) => {
    switch (device) {
      case 't11': return 't11';
      case 't12': return 't12';
      case 'r4': return 'r4';
      case 'f95': return 'f95';
      default: return 'Not Specified';
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
          <div className="page-header">
            <h1>User Management</h1>
            <Button 
              onClick={handleAddUser}
              variant="primary"
              fullWidth={false}
            >
             + NEW USER
            </Button>
          </div>

          <div className="filters-container">
            <div className="entries-selector">
              <label htmlFor="entries-select">Show</label>
              <select 
                id="entries-select" 
                value={pageSize} 
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span>entries</span>
            </div>
            
            <div className="search-container">
              <input
                type="text"
                placeholder="Search records"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {isLoading ? (
            <div className="loading-message">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="no-users-message">
              {searchTerm || filterStatus !== 'all' 
                ? 'No users match your search criteria.' 
                : 'No secondary users found. Add your first user to get started.'}
            </div>
          ) : (
            <div className="users-table-container">
              <div className="digit-card">
                <div className="digit-card-header">
                  <div className="card-header-left">
                    <div className="purple-icon-button">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <h2>User List</h2>
                  </div>
                  {/* <div className="digit-card-actions">
                    <span className="digit-export-button" onClick={() => alert('Export functionality will be implemented soon')}>Export CSV</span>
                  </div> */}
                </div>
                
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Sno.</th>
                      <th>Name</th>
                      <th>Email id</th>
                      <th>Contact Number</th>
                      <th>Registration Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((user, index) => (
                      <tr 
                        key={user.id} 
                        className={user.status === 'inactive' ? 'inactive-row' : ''}
                      >
                        <td>{startIndex + index + 1}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>{formatDate(user.created_at)}</td>
                        <td>
                          <div className="action-icons">
                            <span 
                              className="action-icon view-icon"
                              onClick={() => handleViewUser(user.id)}
                              title="View User Details"
                            >
                              V
                            </span>
                            <span 
                              className="action-icon delete-icon"
                              onClick={() => handleDeleteUser(user.id)}
                              title="Delete User"
                            >
                              D
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Pagination */}
                <div className="pagination-container">
                  <div className="pagination-controls">
                    <button 
                      onClick={() => setCurrentPage(1)} 
                      disabled={currentPage === 1}
                      className="pagination-button"
                    >
                      First
                    </button>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                      disabled={currentPage === 1}
                      className="pagination-button"
                    >
                      Previous
                    </button>
                    <span className="pagination-info">
                      Page {currentPage} of {totalPages || 1}
                    </span>
                    <button 
                      onClick={() => setCurrentPage(prev => prev + 1)} 
                      disabled={currentPage >= totalPages}
                      className="pagination-button"
                    >
                      Next
                    </button>
                    <button 
                      onClick={() => setCurrentPage(totalPages)} 
                      disabled={currentPage >= totalPages}
                      className="pagination-button"
                    >
                      Last
                    </button>
                  </div>
                  <div className="page-size-selector">
                    <label htmlFor="page-size">Items per page:</label>
                    <select 
                      id="page-size" 
                      value={pageSize} 
                      onChange={(e) => setPageSize(Number(e.target.value))}
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          <AddUserModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onUserAdded={handleUserAdded} 
          />
          
          {selectedUserId && (
            <AddDeviceModal 
              isOpen={isDeviceModalOpen} 
              onClose={() => {
                setIsDeviceModalOpen(false);
                setSelectedUserId(null);
              }} 
              onDeviceAdded={handleDeviceAdded}
              userId={selectedUserId}
            />
          )}
          
        </div>
      </div>

      <footer className="auth-footer">
        <p><img src="https://s3.ap-south-1.amazonaws.com/egov-playground-assets/digit-footer.png" alt="DIGIT" className="footer-logo" /></p>
      </footer>
    </div>
  );
};

export default UserManagement;