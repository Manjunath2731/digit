import React, { useState, useEffect } from 'react';
import Button from '../auth/Button';
import { getUserDevices, Device, addSecondaryUser } from '../../services/userManagement';
import '../../styles/users/AddSecondaryUserModal.css';

interface AddSecondaryUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

const AddSecondaryUserModal: React.FC<AddSecondaryUserModalProps> = ({
  isOpen,
  onClose,
  onUserAdded
}) => {
  const [formData, setFormData] = useState({
    device: '',
    email: '',
    name: '',
    contactNumber: '',
    pincode: '',
    address: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user's devices when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUserDevices();
    }
  }, [isOpen]);

  const fetchUserDevices = async () => {
    setIsLoadingDevices(true);
    setDeviceError(null);
    
    try {
      // Get current user ID from localStorage
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.device) {
      newErrors.device = 'Please select a device';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    if (!formData.contactNumber) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^\d{10}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Contact number must be 10 digits';
    }

    if (!formData.pincode) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    if (!formData.address) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Call API to add secondary user with role 'secondary-user'
      await addSecondaryUser({
        name: formData.name,
        email: formData.email,
        phone: formData.contactNumber,
        device: formData.device,
        address: formData.address,
        pincode: formData.pincode,
        role: 'secondary-user',
        status: 'active'
      });
      
      // Reset form
      setFormData({
        device: '',
        email: '',
        name: '',
        contactNumber: '',
        pincode: '',
        address: ''
      });
      
      onUserAdded();
      onClose();
    } catch (error: any) {
      console.error('Error adding secondary user:', error);
      setErrors({ general: error.message || 'Failed to add secondary user. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      device: '',
      email: '',
      name: '',
      contactNumber: '',
      pincode: '',
      address: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="secondary-user-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Secondary User</h2>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="secondary-user-form">
          <div className="form-group">
            <label htmlFor="device">SELECT DEVICE</label>
            <select
              id="device"
              name="device"
              value={formData.device}
              onChange={handleChange}
              className={errors.device ? 'error' : ''}
              disabled={isLoadingDevices || devices.length === 0}
            >
              <option value="">
                {isLoadingDevices ? 'Loading devices...' : devices.length === 0 ? 'No devices available' : 'Select Device'}
              </option>
              {devices.map((device) => (
                <option key={device.device_id} value={device.device_id}>
                  {device.device_id}
                </option>
              ))}
            </select>
            {deviceError && <span className="error-message">{deviceError}</span>}
            {errors.device && <span className="error-message">{errors.device}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="contactNumber">Contact Number</label>
            <input
              type="tel"
              id="contactNumber"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="Contact Number"
              maxLength={10}
              className={errors.contactNumber ? 'error' : ''}
            />
            {errors.contactNumber && <span className="error-message">{errors.contactNumber}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="pincode">Pincode</label>
            <input
              type="text"
              id="pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="Pincode"
              maxLength={6}
              className={errors.pincode ? 'error' : ''}
            />
            {errors.pincode && <span className="error-message">{errors.pincode}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Address"
              rows={3}
              className={errors.address ? 'error' : ''}
            />
            {errors.address && <span className="error-message">{errors.address}</span>}
          </div>

          {errors.general && (
            <div className="error-banner">
              {errors.general}
            </div>
          )}

          <div className="form-actions">
            <Button type="button" variant="secondary" fullWidth={false} onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" fullWidth={false} disabled={isLoading}>
              {isLoading ? 'Adding...' : '+ Add User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSecondaryUserModal;
