import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import InputField from '../../components/auth/InputField';
import Button from '../../components/auth/Button';
import { register } from '../../services/auth/authService';
import '../../styles/auth/Register.css';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    user_name: '',
    email_id: '',
    phone_no: '',
    country_code: '91',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate username
    if (!formData.user_name.trim()) {
      newErrors.user_name = 'Username is required';
    }
    
    // Validate email
    if (!formData.email_id) {
      newErrors.email_id = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email_id)) {
      newErrors.email_id = 'Email is invalid';
    }
    
    // Validate phone
    if (!formData.phone_no) {
      newErrors.phone_no = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone_no)) {
      newErrors.phone_no = 'Phone number must be 10 digits';
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const response = await register({
        user_name: formData.user_name,
        email_id: formData.email_id,
        phone_no: parseInt(formData.phone_no),
        password: formData.password,
        country_code: parseInt(formData.country_code)
      });
      
      if (response.success) {
        // Store user data in session storage for OTP verification
        sessionStorage.setItem('registrationData', JSON.stringify({
          phone_no: formData.phone_no,
          email_id: formData.email_id
        }));
        
        // Navigate to OTP verification page
        navigate('/verify-otp');
      } else {
        setErrors({ general: response.message });
      }
    } catch (error) {
      setErrors({ general: 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Please fill in the details below to register"
    >
      <form onSubmit={handleSubmit} className="register-form">
        {errors.general && <div className="general-error">{errors.general}</div>}
        
        <InputField
          label="Full Name"
          type="text"
          name="user_name"
          value={formData.user_name}
          onChange={handleChange}
          placeholder="Enter your full name"
          error={errors.user_name}
          required
        />
        
        <InputField
          label="Email Address"
          type="email"
          name="email_id"
          value={formData.email_id}
          onChange={handleChange}
          placeholder="Enter your email"
          error={errors.email_id}
          required
        />
        
        <InputField
          label="Mobile Number"
          type="tel"
          name="phone_no"
          value={formData.phone_no}
          onChange={handleChange}
          placeholder="Enter 10 digit mobile number"
          error={errors.phone_no}
          required
          prefix={`+${formData.country_code}`}
        />
        
        <InputField
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Create a password"
          error={errors.password}
          required
        />
        
        <InputField
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm your password"
          error={errors.confirmPassword}
          required
        />
        
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Register'}
        </Button>
        
        <div className="login-link">
          Already have an account? <a href="/login">Login</a>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;
