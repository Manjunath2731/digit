import React, { useState } from 'react';
import { addSecondaryUser } from '../../services/userManagement';
import Button from '../auth/Button';
import '../../styles/users/AddUserModal.css';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onUserAdded }) => {
  const [currentStep, setCurrentStep] = useState(1); // 1 = User Details, 2 = Address Details
  
  const [formData, setFormData] = useState({
    userName: '',
    saviour: '',
    deviceId: '',
    email: '',
    contactNo: '',
    noOfSecUsers: '',
    deviceSimNo: '',
    houseType: '',
    sensorType: ''
  });

  const [addressData, setAddressData] = useState({
    street: '',
    city: '',
    state: '',
    pinCode: '',
    country: 'India',
    landmark: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddressData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate User Name
    if (!formData.userName.trim()) {
      newErrors.userName = 'User Name is required';
    }
    
    // Validate Device ID
    if (!formData.deviceId.trim()) {
      newErrors.deviceId = 'Device ID is required';
    }
    
    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email ID is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email ID is invalid';
    }
    
    // Validate contact number
    if (!formData.contactNo) {
      newErrors.contactNo = 'Contact No. is required';
    } else if (!/^\d{10}$/.test(formData.contactNo)) {
      newErrors.contactNo = 'Contact No. must be 10 digits';
    }
    
    // Validate number of secondary users
    if (!formData.noOfSecUsers) {
      newErrors.noOfSecUsers = 'No. of Sec. Users is required';
    } else if (!/^\d+$/.test(formData.noOfSecUsers) || parseInt(formData.noOfSecUsers) < 1) {
      newErrors.noOfSecUsers = 'No. of Sec. Users must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    // Address validation - only validate if any address field is filled
    const hasAnyAddressData = addressData.street || addressData.city || addressData.state || addressData.pinCode;
    
    if (hasAnyAddressData) {
      // If user started filling address, validate required fields
      if (!addressData.street.trim()) {
        newErrors.street = 'Street address is required';
      }
      
      if (!addressData.city.trim()) {
        newErrors.city = 'City is required';
      }
      
      if (!addressData.state.trim()) {
        newErrors.state = 'State is required';
      }
      
      if (!addressData.pinCode.trim()) {
        newErrors.pinCode = 'Pin code is required';
      } else if (!/^\d{6}$/.test(addressData.pinCode)) {
        newErrors.pinCode = 'Pin code must be 6 digits';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
    setErrors({});
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      userName: '',
      saviour: '',
      deviceId: '',
      email: '',
      contactNo: '',
      noOfSecUsers: '',
      deviceSimNo: '',
      houseType: '',
      sensorType: ''
    });
    setAddressData({
      street: '',
      city: '',
      state: '',
      pinCode: '',
      country: 'India',
      landmark: ''
    });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate based on current step
    const isValid = currentStep === 1 ? validateStep1() : validateStep2();
    if (!isValid) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create address string only if address data exists
      const addressString = addressData.street || addressData.city || addressData.state || addressData.pinCode
        ? `${addressData.street}, ${addressData.city}, ${addressData.state} - ${addressData.pinCode}`.replace(/^,\s*|,\s*$|,\s*,/g, ',').replace(/^,|,$/, '')
        : '';
      
      // Map the new form data to the expected format
      await addSecondaryUser({
        name: formData.userName,
        email: formData.email,
        phone: formData.contactNo,
        access_level: 'limited' as 'full' | 'limited' | 'view_only',
        device: formData.deviceId,
        status: 'active',
        // Additional fields from the form
        saviour: formData.saviour,
        noOfSecUsers: formData.noOfSecUsers,
        deviceSimNo: formData.deviceSimNo,
        houseType: formData.houseType,
        sensorType: formData.sensorType,
        // Address information (optional)
        address: addressString,
        addressDetails: addressData
      } as any);
      
      onUserAdded();
      resetForm();
      onClose();
    } catch (error) {
      setErrors({ general: 'Failed to add user. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClick = () => {
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSubmit(fakeEvent);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add User - Step {currentStep} of 2</h2>
          <button className="close-button" onClick={() => { resetForm(); onClose(); }}>&times;</button>
        </div>
        
        <form onSubmit={(e) => e.preventDefault()} className="modal-form">
          {errors.general && <div className="error-message">{errors.general}</div>}
          
          {currentStep === 1 ? (
            // Step 1: User Details
            <>
              <div className="form-group">
                <label htmlFor="userName">User Name *</label>
                <input
                  type="text"
                  id="userName"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  placeholder="Enter user name"
                  className={errors.userName ? 'error' : ''}
                />
                {errors.userName && <div className="field-error">{errors.userName}</div>}
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
                <label htmlFor="email">Email ID *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email ID"
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <div className="field-error">{errors.email}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="contactNo">Contact No. *</label>
                <input
                  type="tel"
                  id="contactNo"
                  name="contactNo"
                  value={formData.contactNo}
                  onChange={handleChange}
                  placeholder="Enter contact number"
                  className={errors.contactNo ? 'error' : ''}
                />
                {errors.contactNo && <div className="field-error">{errors.contactNo}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="noOfSecUsers">No. of Sec. Users *</label>
                <input
                  type="number"
                  id="noOfSecUsers"
                  name="noOfSecUsers"
                  value={formData.noOfSecUsers}
                  onChange={handleChange}
                  placeholder="Enter number of secondary users"
                  className={errors.noOfSecUsers ? 'error' : ''}
                  min="1"
                />
                {errors.noOfSecUsers && <div className="field-error">{errors.noOfSecUsers}</div>}
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
              
              <div className="required-note">
                * Required fields
              </div>
            </>
          ) : (
            // Step 2: Address Details (Optional)
            <>
              <div className="form-group">
                <label htmlFor="street">Street Address</label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={addressData.street}
                  onChange={handleAddressChange}
                  placeholder="Enter street address (optional)"
                  className={errors.street ? 'error' : ''}
                />
                {errors.street && <div className="field-error">{errors.street}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={addressData.city}
                  onChange={handleAddressChange}
                  placeholder="Enter city (optional)"
                  className={errors.city ? 'error' : ''}
                />
                {errors.city && <div className="field-error">{errors.city}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={addressData.state}
                  onChange={handleAddressChange}
                  placeholder="Enter state (optional)"
                  className={errors.state ? 'error' : ''}
                />
                {errors.state && <div className="field-error">{errors.state}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="pinCode">Pin Code</label>
                <input
                  type="text"
                  id="pinCode"
                  name="pinCode"
                  value={addressData.pinCode}
                  onChange={handleAddressChange}
                  placeholder="Enter 6-digit pin code (optional)"
                  className={errors.pinCode ? 'error' : ''}
                  maxLength={6}
                />
                {errors.pinCode && <div className="field-error">{errors.pinCode}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <select
                  id="country"
                  name="country"
                  value={addressData.country}
                  onChange={handleAddressChange}
                >
                  <option value="India">India</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                  <option value="Canada">Canada</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="landmark">Landmark</label>
                <input
                  type="text"
                  id="landmark"
                  name="landmark"
                  value={addressData.landmark}
                  onChange={handleAddressChange}
                  placeholder="Enter nearby landmark (optional)"
                />
              </div>
              
              <div className="required-note">
                Address details are optional. You can create the user without filling these fields.
              </div>
            </>
          )}
          
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
              type="button" 
              variant="secondary" 
              onClick={currentStep === 1 ? handleNext : handleBack}
              fullWidth={false}
            >
              {currentStep === 1 ? 'Next' : 'Back'}
            </Button>
            
            <Button 
              type="button" 
              variant="primary" 
              disabled={isLoading}
              onClick={handleCreateClick}
              fullWidth={false}
            >
              {isLoading ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
