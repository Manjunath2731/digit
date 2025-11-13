import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import SelectPlanModal from '../components/membership/SelectPlanModal';
import { getUserDevices, Device } from '../services/userManagement';
import '../styles/Membership.css';

const Membership: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchDevices(parsedUser.id);
    } else {
      setError('User not found');
      setIsLoading(false);
    }
  }, []);

  const fetchDevices = async (userId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userDevices = await getUserDevices(userId);
      setDevices(userDevices);
    } catch (error: any) {
      console.error('Error fetching devices:', error);
      setError(error.message || 'Failed to load devices');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCartClick = (device: Device) => {
    setSelectedDevice(device);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDevice(null);
  };

  const handlePurchaseComplete = () => {
    setCartCount(cartCount + 1);
    handleCloseModal();
    // Optionally refresh devices
    if (user) {
      fetchDevices(user.id);
    }
  };

  // Filter devices based on search term
  const filteredDevices = devices.filter(device => 
    device.device_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.saviour?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDevices = filteredDevices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(
        <button key="prev" onClick={() => handlePageChange(currentPage - 1)} className="pagination-button">
          PREVIOUS
        </button>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-button ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      pages.push(
        <span key="ellipsis" className="pagination-ellipsis">...</span>
      );
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="pagination-button"
        >
          {totalPages}
        </button>
      );
    }

    if (currentPage < totalPages) {
      pages.push(
        <button key="next" onClick={() => handlePageChange(currentPage + 1)} className="pagination-button">
          NEXT
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="membership-page">
      <Sidebar user={user} />
      <div className="membership-content">
        <div className="membership-header">
          <div className="header-left">
            <div className="membership-logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h1>Device List</h1>
          </div>
          <button className="cart-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {cartCount > 0 && <span className="cart-badge">({cartCount})</span>}
          </button>
        </div>

        <div className="table-controls">
          <div className="show-entries">
            <label>Show</label>
            <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>
          <div className="search-box">
            <label>Search:</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder=""
            />
          </div>
        </div>

        {isLoading ? (
          <div className="loading-state">Loading devices...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <>
            <div className="device-table-container">
              <table className="device-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Device</th>
                    <th>Profile Type</th>
                    <th>Plan</th>
                    <th>Expiry Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDevices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="no-data">No devices found</td>
                    </tr>
                  ) : (
                    currentDevices.map((device, index) => (
                      <tr key={device.device_id}>
                        <td>{indexOfFirstItem + index + 1}</td>
                        <td>
                          <div className="device-info">
        
                            {device.device_id && (
                              <div className="device-id-badge">Device ID: {device.device_id}</div>
                            )}
                          </div>
                        </td>
                        <td>{device.saviour || 'Saviour'}</td>
                        <td>Basic</td>
                        <td>—</td>
                        <td>
                          <button 
                            className="action-cart-button"
                            onClick={() => handleCartClick(device)}
                            title="Purchase Plan"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="9" cy="21" r="1"/>
                              <circle cx="20" cy="21" r="1"/>
                              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              <div className="showing-info">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredDevices.length)} of {filteredDevices.length} entries
              </div>
              <div className="pagination">
                {renderPagination()}
              </div>
            </div>
          </>
        )}
      </div>

      <SelectPlanModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        device={selectedDevice}
        onPurchaseComplete={handlePurchaseComplete}
      />
    </div>
  );
};

export default Membership;
