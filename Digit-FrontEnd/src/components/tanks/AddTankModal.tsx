import React, { useState, useEffect } from 'react';
import { getUserDevices, Device } from '../../services/userManagement';
import { createTank } from '../../services/tankService';
import '../../styles/tanks/AddTankModal.css';

interface AddTankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTankAdded: () => void;
}

const AddTankModal: React.FC<AddTankModalProps> = ({
  isOpen,
  onClose,
  onTankAdded
}) => {
  const [formData, setFormData] = useState({
    device_id: '',
    saviour_name: '',
    saviour_capacity: '',
    upper_threshold: '',
    lower_threshold: '',
    saviour_height: ''
  });

  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUserDevices();
    }
  }, [isOpen]);

  const fetchUserDevices = async () => {
    setIsLoadingDevices(true);
    setDeviceError(null);
    
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('User not found');
      }
      
      const user = JSON.parse(userData);
      const userDevices = await getUserDevices(user.id);
      setDevices(userDevices);
    } catch (error: any) {
      console.error('Error fetching devices:', error);
      setDeviceError(error.message || 'Failed to load devices');
    } finally {
      setIsLoadingDevices(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.device_id) {
      newErrors.device_id = 'Please select a device';
    }

    if (!formData.saviour_name) {
      newErrors.saviour_name = 'Saviour name is required';
    }

    if (!formData.saviour_capacity) {
      newErrors.saviour_capacity = 'Saviour capacity is required';
    } else if (isNaN(Number(formData.saviour_capacity)) || Number(formData.saviour_capacity) <= 0) {
      newErrors.saviour_capacity = 'Please enter a valid capacity';
    }

    if (!formData.upper_threshold) {
      newErrors.upper_threshold = 'Upper threshold is required';
    } else if (isNaN(Number(formData.upper_threshold)) || Number(formData.upper_threshold) <= 0) {
      newErrors.upper_threshold = 'Please enter a valid threshold';
    }

    if (!formData.lower_threshold) {
      newErrors.lower_threshold = 'Lower threshold is required';
    } else if (isNaN(Number(formData.lower_threshold)) || Number(formData.lower_threshold) <= 0) {
      newErrors.lower_threshold = 'Please enter a valid threshold';
    }

    if (!formData.saviour_height) {
      newErrors.saviour_height = 'Saviour height is required';
    } else if (isNaN(Number(formData.saviour_height)) || Number(formData.saviour_height) <= 0) {
      newErrors.saviour_height = 'Please enter a valid height';
    }

    // Validate that upper threshold is greater than lower threshold
    if (formData.upper_threshold && formData.lower_threshold) {
      if (Number(formData.upper_threshold) <= Number(formData.lower_threshold)) {
        newErrors.upper_threshold = 'Upper threshold must be greater than lower threshold';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createTank({
        device_id: formData.device_id,
        saviour_name: formData.saviour_name,
        saviour_capacity: Number(formData.saviour_capacity),
        upper_threshold: Number(formData.upper_threshold),
        lower_threshold: Number(formData.lower_threshold),
        saviour_height: Number(formData.saviour_height)
      });

      // Reset form
      setFormData({
        device_id: '',
        saviour_name: '',
        saviour_capacity: '',
        upper_threshold: '',
        lower_threshold: '',
        saviour_height: ''
      });

      onTankAdded();
    } catch (error: any) {
      console.error('Error creating tank:', error);
      setErrors({ submit: error.message || 'Failed to create tank' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      device_id: '',
      saviour_name: '',
      saviour_capacity: '',
      upper_threshold: '',
      lower_threshold: '',
      saviour_height: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="add-tank-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={handleClose}>×</button>
        
        <h2 className="modal-title">Add Tank Details</h2>

        {errors.submit && <div className="error-banner">{errors.submit}</div>}

        <form onSubmit={handleSubmit} className="tank-form">
          <div className="form-group">
            <select
              name="device_id"
              value={formData.device_id}
              onChange={handleChange}
              className={`form-input ${errors.device_id ? 'error' : ''}`}
              disabled={isLoadingDevices || devices.length === 0}
            >
              <option value="">
                {isLoadingDevices ? 'Loading devices...' : devices.length === 0 ? 'No devices available' : 'SELECT DEVICE'}
              </option>
              {devices.map((device) => (
                <option key={device.device_id} value={device.device_id}>
                  {device.device_id}
                </option>
              ))}
            </select>
            {deviceError && <span className="error-message">{deviceError}</span>}
            {errors.device_id && <span className="error-message">{errors.device_id}</span>}
          </div>

          <div className="form-group">
            <input
              type="text"
              name="saviour_name"
              value={formData.saviour_name}
              onChange={handleChange}
              placeholder="Saviour Name"
              className={`form-input ${errors.saviour_name ? 'error' : ''}`}
            />
            {errors.saviour_name && <span className="error-message">{errors.saviour_name}</span>}
          </div>

          <div className="form-group">
            <input
              type="number"
              name="saviour_capacity"
              value={formData.saviour_capacity}
              onChange={handleChange}
              placeholder="Saviour Capacity (in Liters)"
              className={`form-input ${errors.saviour_capacity ? 'error' : ''}`}
            />
            {errors.saviour_capacity && <span className="error-message">{errors.saviour_capacity}</span>}
          </div>

          <div className="form-group">
            <input
              type="number"
              name="upper_threshold"
              value={formData.upper_threshold}
              onChange={handleChange}
              placeholder="Upper Threshold (in Liters)"
              className={`form-input ${errors.upper_threshold ? 'error' : ''}`}
            />
            {errors.upper_threshold && <span className="error-message">{errors.upper_threshold}</span>}
          </div>

          <div className="form-group">
            <input
              type="number"
              name="lower_threshold"
              value={formData.lower_threshold}
              onChange={handleChange}
              placeholder="Lower Threshold (in Liters)"
              className={`form-input ${errors.lower_threshold ? 'error' : ''}`}
            />
            {errors.lower_threshold && <span className="error-message">{errors.lower_threshold}</span>}
          </div>

          <div className="form-group">
            <input
              type="number"
              name="saviour_height"
              value={formData.saviour_height}
              onChange={handleChange}
              placeholder="Saviour Height"
              className={`form-input ${errors.saviour_height ? 'error' : ''}`}
            />
            {errors.saviour_height && <span className="error-message">{errors.saviour_height}</span>}
          </div>

          <button 
            type="submit" 
            className="add-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'ADDING...' : 'ADD'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTankModal;
