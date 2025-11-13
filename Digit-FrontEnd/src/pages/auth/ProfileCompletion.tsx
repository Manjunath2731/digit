import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import InputField from '../../components/auth/InputField';
import Button from '../../components/auth/Button';
import '../../styles/auth/ProfileCompletion.css';

interface ProfileData {
  address: string;
  pin_code: string;
  city: string;
  house_type: string;
  noofsecuser: string;
}

const ProfileCompletion: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState<ProfileData>({
    address: '',
    pin_code: '',
    city: '',
    house_type: '0',
    noofsecuser: '0'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get email from session storage
    const userData = sessionStorage.getItem('registrationData');
    if (!userData) {
      // Redirect to login if no data is found
      navigate('/login');
      return;
    }

    const { email_id } = JSON.parse(userData);
    setEmail(email_id);
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate address
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    // Validate pin code
    if (!formData.pin_code) {
      newErrors.pin_code = 'PIN code is required';
    } else if (!/^\d{6}$/.test(formData.pin_code)) {
      newErrors.pin_code = 'PIN code must be 6 digits';
    }
    
    // Validate city
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
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
      // In a real app, this would be an API call to update the user profile
      // const response = await fetch(`${API_URL}/update-profile`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     email_id: email,
      //     ...formData,
      //     pin_code: parseInt(formData.pin_code),
      //     house_type: parseInt(formData.house_type),
      //     noofsecuser: parseInt(formData.noofsecuser)
      //   })
      // });
      // const data = await response.json();
      
      // Mock successful response
      setTimeout(() => {
        // Clear session storage
        sessionStorage.removeItem('registrationData');
        
        // Navigate to login page
        navigate('/login', { state: { profileCompleted: true } });
      }, 1000);
    } catch (error) {
      setErrors({ general: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Clear session storage
    sessionStorage.removeItem('registrationData');
    
    // Navigate to login page
    navigate('/login', { state: { profileCompleted: true } });
  };

  return (
    <AuthLayout
      title="Complete Your Profile"
      subtitle="Please provide additional information to complete your profile"
      showBackButton={false}
    >
      <form onSubmit={handleSubmit} className="profile-form">
        {errors.general && <div className="general-error">{errors.general}</div>}
        
        <InputField
          label="Address"
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Enter your address"
          error={errors.address}
          required
        />
        
        <div className="form-row">
          <InputField
            label="PIN Code"
            type="text"
            name="pin_code"
            value={formData.pin_code}
            onChange={handleChange}
            placeholder="6-digit PIN code"
            error={errors.pin_code}
            required
          />
          
          <InputField
            label="City"
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Enter your city"
            error={errors.city}
            required
          />
        </div>
        
        <div className="form-row">
          <div className="select-field">
            <label htmlFor="house_type">House Type</label>
            <select
              id="house_type"
              name="house_type"
              value={formData.house_type}
              onChange={handleChange}
            >
              <option value="0">Apartment</option>
              <option value="1">Independent House</option>
              <option value="2">Villa</option>
              <option value="3">Other</option>
            </select>
          </div>
          
          <div className="select-field">
            <label htmlFor="noofsecuser">Number of Secondary Users</label>
            <select
              id="noofsecuser"
              name="noofsecuser"
              value={formData.noofsecuser}
              onChange={handleChange}
            >
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5+</option>
            </select>
          </div>
        </div>
        
        <div className="button-group">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Complete Profile'}
          </Button>
          
          <button type="button" className="skip-button" onClick={handleSkip}>
            Skip for Now
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ProfileCompletion;
