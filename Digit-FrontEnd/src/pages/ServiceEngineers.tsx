import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import AddServiceEngineerModal from '../components/serviceEngineers/AddServiceEngineerModal';
import { getServiceEngineers, ServiceEngineer } from '../services/serviceEngineerService';
import '../styles/ServiceEngineers.css';

const ServiceEngineers: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [engineers, setEngineers] = useState<ServiceEngineer[]>([]);
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
    fetchEngineers();
  }, []);

  const fetchEngineers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const engineerData = await getServiceEngineers();
      setEngineers(engineerData);
    } catch (error: any) {
      console.error('Error fetching service engineers:', error);
      setError(error.message || 'Failed to load service engineers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEngineer = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleEngineerAdded = () => {
    fetchEngineers();
    handleCloseModal();
  };

  // Filter engineers based on search term
  const filteredEngineers = engineers.filter(engineer => 
    engineer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    engineer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    engineer.contact_number.includes(searchTerm)
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEngineers = filteredEngineers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEngineers.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const getStatusBadgeClass = (status: string) => {
    return status === 'active' ? 'status-active' : 'status-inactive';
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    
    pages.push(
      <button 
        key="prev" 
        onClick={() => handlePageChange(currentPage - 1)} 
        className="pagination-button"
        disabled={currentPage === 1}
      >
        PREVIOUS
      </button>
    );

    pages.push(
      <button 
        key="next" 
        onClick={() => handlePageChange(currentPage + 1)} 
        className="pagination-button"
        disabled={currentPage === totalPages}
      >
        NEXT
      </button>
    );

    return pages;
  };

  return (
    <div className="service-engineers-page">
      <Sidebar user={user} />
      <div className="service-engineers-content">
        <div className="service-engineers-header">
          <div className="header-left">
            <div className="service-engineers-logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h1>Service Engineers List</h1>
          </div>
          <button className="add-engineer-button" onClick={handleAddEngineer}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" y1="8" x2="19" y2="14"/>
              <line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
            ADD SERVICE ENGINEERS
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
          <div className="loading-state">Loading service engineers...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <>
            <div className="service-engineers-table-container">
              <table className="service-engineers-table">
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
                  {currentEngineers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="no-data">No data available in table</td>
                    </tr>
                  ) : (
                    currentEngineers.map((engineer, index) => (
                      <tr key={engineer.id}>
                        <td>{indexOfFirstItem + index + 1}</td>
                        <td>{engineer.name}</td>
                        <td>{engineer.email}</td>
                        <td>{engineer.contact_number}</td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(engineer.status)}`}>
                            {engineer.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="action-edit-button"
                            title="Edit Engineer"
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
                Showing {currentEngineers.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredEngineers.length)} of {filteredEngineers.length} entries
              </div>
              <div className="pagination">
                {renderPagination()}
              </div>
            </div>
          </>
        )}

        <div className="ads-section">
          <p>Ads</p>
        </div>
      </div>

      <AddServiceEngineerModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onEngineerAdded={handleEngineerAdded}
      />
    </div>
  );
};

export default ServiceEngineers;
