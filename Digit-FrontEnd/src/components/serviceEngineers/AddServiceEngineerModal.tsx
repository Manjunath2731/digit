import React, { useState } from 'react';
import { createServiceEngineer } from '../../services/serviceEngineerService';
import '../../styles/serviceEngineers/AddServiceEngineerModal.css';

interface AddServiceEngineerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEngineerAdded: () => void;
}

const AddServiceEngineerModal: React.FC<AddServiceEngineerModalProps> = ({
  isOpen,
  onClose,
  onEngineerAdded
}) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    contactNumber: '',
    pincode: '',
    address: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setIsSubmitting(true);

    try {
      await createServiceEngineer({
        email: formData.email,
        name: formData.name,
        contact_number: formData.contactNumber,
        pincode: formData.pincode,
        address: formData.address
      });

      // Reset form
      setFormData({
        email: '',
        name: '',
        contactNumber: '',
        pincode: '',
        address: ''
      });

      onEngineerAdded();
    } catch (error: any) {
      console.error('Error creating service engineer:', error);
      setErrors({ submit: error.message || 'Failed to create service engineer' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
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
      <div className="add-service-engineer-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={handleClose}>×</button>
        
        <h2 className="modal-title">Add Service Engineeer</h2>

        {errors.submit && <div className="error-banner">{errors.submit}</div>}

        <form onSubmit={handleSubmit} className="engineer-form">
          <div className="form-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className={`form-input ${errors.email ? 'error' : ''}`}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              className={`form-input ${errors.name ? 'error' : ''}`}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <input
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="Contact Number"
              maxLength={10}
              className={`form-input ${errors.contactNumber ? 'error' : ''}`}
            />
            {errors.contactNumber && <span className="error-message">{errors.contactNumber}</span>}
          </div>

          <div className="form-group">
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="Pincode"
              maxLength={6}
              className={`form-input ${errors.pincode ? 'error' : ''}`}
            />
            {errors.pincode && <span className="error-message">{errors.pincode}</span>}
          </div>

          <div className="form-group">
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Address"
              className={`form-input ${errors.address ? 'error' : ''}`}
            />
            {errors.address && <span className="error-message">{errors.address}</span>}
          </div>

          <button 
            type="submit" 
            className="register-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'REGISTERING...' : 'REGISTER'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddServiceEngineerModal;
