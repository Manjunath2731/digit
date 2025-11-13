import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCities, City, updateCityStatus, deleteCity } from '../services/cityManagement';
import { logout } from '../services/auth/authService';
import Button from '../components/auth/Button';
import Sidebar from '../components/layout/Sidebar';
import AddCityModal from '../components/cities/AddCityModal';
import '../styles/cities/CityManagement.css';
import '../styles/Dashboard.css';

const Cities: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  
  useEffect(() => {
    // Get user data from local storage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const fetchCities = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getCities();
      setCities(data);
    } catch (err) {
      setError('Failed to fetch cities. Please try again.');
      console.error('Error fetching cities:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddCity = () => {
    setIsModalOpen(true);
  };

  const handleCityAdded = () => {
    fetchCities();
  };

  const handleStatusChange = async (cityId: number, newStatus: 'active' | 'inactive') => {
    try {
      await updateCityStatus(cityId, newStatus);
      fetchCities();
    } catch (err) {
      setError('Failed to update city status. Please try again.');
      console.error('Error updating city status:', err);
    }
  };

  const handleDeleteCity = async (cityId: number) => {
    if (window.confirm('Are you sure you want to delete this city?')) {
      try {
        await deleteCity(cityId);
        fetchCities();
      } catch (err) {
        setError('Failed to delete city. Please try again.');
        console.error('Error deleting city:', err);
      }
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

  // Filter cities based on search term and status
  const filteredCities = cities.filter(city => {
    const matchesSearch = 
      city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.state.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' || 
      city.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content-wrapper">
        <Sidebar user={user} />
        
        <div className="user-management-container">
          <div className="page-header">
            <h1>Indian City Management</h1>
            <Button 
              onClick={handleAddCity}
              variant="primary"
              fullWidth={false}
            >
              Add New City
            </Button>
          </div>

          <div className="filters-container">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search by city or state"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="status-filter">
              <label htmlFor="status-filter">Status:</label>
              <select
                id="status-filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {isLoading ? (
            <div className="loading-message">Loading cities...</div>
          ) : filteredCities.length === 0 ? (
            <div className="no-users-message">
              {searchTerm || filterStatus !== 'all' 
                ? 'No cities match your search criteria.' 
                : 'No cities found. Add your first city to get started.'}
            </div>
          ) : (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>City Name</th>
                    <th>State/Province</th>
                    <th>Status</th>
                    <th>Added On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCities.map(city => (
                    <tr key={city.id} className={city.status === 'inactive' ? 'inactive-row' : ''}>
                      <td>{city.name}</td>
                      <td>{city.state}</td>
                      <td>
                        <span className={`status-badge ${city.status}`}>
                          {city.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{formatDate(city.created_at)}</td>
                      <td>
                        <div className="action-buttons">
                          {city.status === 'active' ? (
                            <button 
                              className="deactivate-button"
                              onClick={() => handleStatusChange(city.id, 'inactive')}
                              title="Deactivate City"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button 
                              className="activate-button"
                              onClick={() => handleStatusChange(city.id, 'active')}
                              title="Activate City"
                            >
                              Activate
                            </button>
                          )}
                          <button 
                            className="delete-button"
                            onClick={() => handleDeleteCity(city.id)}
                            title="Delete City"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <AddCityModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onCityAdded={handleCityAdded} 
          />
        </div>
      </div>

      <footer className="auth-footer">
        <p><img src="https://s3.ap-south-1.amazonaws.com/egov-playground-assets/digit-footer.png" alt="DIGIT" className="footer-logo" /></p>
      </footer>
    </div>
  );
};

export default Cities;
