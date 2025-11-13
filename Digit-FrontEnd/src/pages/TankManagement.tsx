import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import AddTankModal from '../components/tanks/AddTankModal';
import { getTanks, Tank } from '../services/tankService';
import '../styles/TankManagement.css';

const TankManagement: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }
    fetchTanks();
  }, []);

  const fetchTanks = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const tankData = await getTanks();
      setTanks(tankData);
    } catch (error: any) {
      console.error('Error fetching tanks:', error);
      setError(error.message || 'Failed to load tanks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTank = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleTankAdded = () => {
    fetchTanks();
    handleCloseModal();
  };

  // Filter tanks based on search term
  const filteredTanks = tanks.filter(tank => 
    tank.device_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tank.saviour_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTanks = filteredTanks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTanks.length / itemsPerPage);

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
    <div className="tank-management-page">
      <Sidebar user={user} />
      <div className="tank-content">
        <div className="tank-header">
          <div className="header-left">
            <div className="tank-logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
            <h1>Tank List</h1>
          </div>
          <div className="header-actions">
            <button className="add-tank-button" onClick={handleAddTank}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              ADD TANK
            </button>
            <button className="settings-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3"/>
              </svg>
            </button>
          </div>
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
          <div className="loading-state">Loading tanks...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <>
            <div className="tank-table-container">
              <table className="tank-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Device Id</th>
                    <th>Saviour Name</th>
                    <th>Saviour ID</th>
                    <th>Saviour Capacity</th>
                    <th>Upper Threshold</th>
                    <th>Lower Threshold</th>
                    <th>Saviour Height</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTanks.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="no-data">No tanks found</td>
                    </tr>
                  ) : (
                    currentTanks.map((tank, index) => (
                      <tr key={tank.id}>
                        <td>{indexOfFirstItem + index + 1}</td>
                        <td>{tank.device_id}</td>
                        <td>{tank.saviour_name}</td>
                        <td>{tank.saviour_id}</td>
                        <td>{tank.saviour_capacity}</td>
                        <td>{tank.upper_threshold}</td>
                        <td>{tank.lower_threshold}</td>
                        <td>{tank.saviour_height}</td>
                        <td>
                          <button 
                            className="action-edit-button"
                            title="Edit Tank"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
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
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredTanks.length)} of {filteredTanks.length} entries
              </div>
              <div className="pagination">
                {renderPagination()}
              </div>
            </div>
          </>
        )}
      </div>

      <AddTankModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onTankAdded={handleTankAdded}
      />
    </div>
  );
};

export default TankManagement;
