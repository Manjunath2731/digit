import React, { useState } from 'react';
import { addCity } from '../../services/cityManagement';
import Button from '../auth/Button';
import '../../styles/cities/CityManagement.css';

interface AddCityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCityAdded: () => void;
}

const AddCityModal: React.FC<AddCityModalProps> = ({ isOpen, onClose, onCityAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    state: '',
    status: 'active' as 'active' | 'inactive'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'City name is required';
    }
    
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
      await addCity(formData);
      onCityAdded();
      onClose();
    } catch (error) {
      setErrors({ general: 'Failed to add city. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New City</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          {errors.general && <div className="error-message">{errors.general}</div>}
          
          <div className="form-group">
            <label htmlFor="name">City Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter city name"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <div className="field-error">{errors.name}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="state">State/Province</label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="Enter state or province"
              className={errors.state ? 'error' : ''}
            />
            {errors.state && <div className="field-error">{errors.state}</div>}
          </div>
          
          
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div className="modal-actions">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onClose}
              fullWidth={false}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={isLoading}
              fullWidth={false}
            >
              {isLoading ? 'Adding...' : 'Add City'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCityModal;
