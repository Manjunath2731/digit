import React, { useState } from 'react';
import Button from '../auth/Button';
import '../../styles/users/AddUserModal.css';

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeviceAdded: () => void;
  userId: number;
}

const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ isOpen, onClose, onDeviceAdded, userId }) => {
  const [formData, setFormData] = useState({
    deviceId: '',
    saviour: '',
    deviceSimNo: '',
    houseType: '',
    sensorType: '',
    address: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate Device ID
    if (!formData.deviceId.trim()) {
      newErrors.deviceId = 'Device ID is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      deviceId: '',
      saviour: '',
      deviceSimNo: '',
      houseType: '',
      sensorType: '',
      address: ''
    });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://34.14.142.242:5005/api/users/${userId}/devices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          device: formData.deviceId,
          saviour: formData.saviour || null,
          deviceSimNo: formData.deviceSimNo || null,
          houseType: formData.houseType || null,
          sensorType: formData.sensorType || null,
          address: formData.address || null,
          isPrimary: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add device');
      }

      const result = await response.json();
      
      if (result.success) {
        onDeviceAdded();
        resetForm();
        onClose();
      } else {
        throw new Error(result.message || 'Failed to add device');
      }
    } catch (error: any) {
      setErrors({ general: error.message || 'Failed to add device. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add Device</h2>
          <button className="close-button" onClick={() => { resetForm(); onClose(); }}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          {errors.general && <div className="error-message">{errors.general}</div>}
          
          <div className="form-group">
            <label htmlFor="deviceId">Device ID *</label>
            <input
              type="text"
              id="deviceId"
              name="deviceId"
              value={formData.deviceId}
              onChange={handleChange}
              placeholder="Enter device ID"
              className={errors.deviceId ? 'error' : ''}
            />
            {errors.deviceId && <div className="field-error">{errors.deviceId}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="saviour">Products</label>
            <select
              id="saviour"
              name="saviour"
              value={formData.saviour}
              onChange={handleChange}
            >
              <option value="">Select Product</option>
              <option value="saviour">Saviour</option>
              <option value="ni-sensu">Ni-Sensu</option>
              <option value="nivarak">Nivarak</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="deviceSimNo">Device SIM No.</label>
            <input
              type="text"
              id="deviceSimNo"
              name="deviceSimNo"
              value={formData.deviceSimNo}
              onChange={handleChange}
              placeholder="Enter device SIM number"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="houseType">CHOOSE HOUSE TYPE</label>
            <select
              id="houseType"
              name="houseType"
              value={formData.houseType}
              onChange={handleChange}
            >
              <option value="">Select house type</option>
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="bungalow">Bungalow</option>
              <option value="townhouse">Townhouse</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="sensorType">CHOOSE SENSOR TYPE</label>
            <select
              id="sensorType"
              name="sensorType"
              value={formData.sensorType}
              onChange={handleChange}
            >
              <option value="">Select sensor type</option>
              <option value="0">Sensor type 0</option>
              <option value="1">Sensor type 1</option>
              <option value="2">Sensor type 2</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter device address (optional)"
            />
          </div>
          
          <div className="required-note">
            * Required fields
          </div>
          
          <div className="modal-actions">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => { resetForm(); onClose(); }}
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
              {isLoading ? 'Adding...' : 'Add Device'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDeviceModal;
