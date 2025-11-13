import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import { getComplaints, Complaint } from '../services/complaintService';
import '../styles/ComplaintForm.css';

const ComplaintForm: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const complaintData = await getComplaints();
      setComplaints(complaintData);
    } catch (error: any) {
      console.error('Error fetching complaints:', error);
      setError(error.message || 'Failed to load complaints');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter complaints based on search term
  const filteredComplaints = complaints.filter(complaint => 
    complaint.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentComplaints = filteredComplaints.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'in_progress':
        return 'status-in-progress';
      case 'resolved':
        return 'status-resolved';
      case 'closed':
        return 'status-closed';
      default:
        return '';
    }
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
    <div className="complaint-page">
      <Sidebar user={user} />
      <div className="complaint-content">
        <div className="complaint-header">
          <div className="header-left">
            <div className="complaint-logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h1>Complaint Lists</h1>
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
          <div className="loading-state">Loading complaints...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <>
            <div className="complaint-table-container">
              <table className="complaint-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>User</th>
                    <th>Comment</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentComplaints.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="no-data">No data available in table</td>
                    </tr>
                  ) : (
                    currentComplaints.map((complaint, index) => (
                      <tr key={complaint.id}>
                        <td>{indexOfFirstItem + index + 1}</td>
                        <td>{complaint.user_name || 'User'}</td>
                        <td>{complaint.comment}</td>
                        <td>{formatDate(complaint.created_at)}</td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(complaint.status)}`}>
                            {complaint.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="action-view-button"
                            title="View Complaint"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
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
                Showing {currentComplaints.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredComplaints.length)} of {filteredComplaints.length} entries
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
    </div>
  );
};

export default ComplaintForm;
