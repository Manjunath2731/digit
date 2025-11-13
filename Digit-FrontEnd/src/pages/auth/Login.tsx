import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import InputField from '../../components/auth/InputField';
import Button from '../../components/auth/Button';
import { login } from '../../services/auth/authService';
import '../../styles/auth/Login.css';

interface LocationState {
  verified?: boolean;
  profileCompleted?: boolean;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  const [formData, setFormData] = useState({
    email_id: '',
    password: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Show success message if coming from verification page or profile completion
    if (state?.verified || state?.profileCompleted) {
      setShowSuccess(true);
      
      // Remove the success message after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [state]);

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
    
    // Validate email
    if (!formData.email_id) {
      newErrors.email_id = 'Email is required';
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      const response = await login({
        email_id: formData.email_id,
        password: formData.password
      });
      
      if (response.success && response.user && response.token) {
        // Store user data and token in local storage
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);
        
        // Navigate based on user role
        if (response.user.role === 'admin') {
          navigate('/dashboard');
        } else if (response.user.role === 'user') {
          navigate('/dashboard-user');
        } else {
          navigate('/dashboard');
        }
      } else {
        setErrors({ general: response.message || 'Invalid credentials' });
      }
    } catch (error) {
      setErrors({ general: 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="" 
      subtitle=""
      footerContent={
        <>
          <div className="forgot-password">
            <a href="/forgot-password">Forgot Password</a>
          </div>
          
          <div className="register-link">
            Don't have an account ? Sign-up here .
          </div>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="login-form">
        {showSuccess && (
          <div className="success-message">
            {state?.verified 
              ? 'Account verified successfully! Please login to continue.' 
              : 'Profile updated successfully! Please login to continue.'}
          </div>
        )}
        
        {errors.general && <div className="general-error">{errors.general}</div>}
        
        <div className="login-header-button">
          <Button type="button" disabled={false}>
            Log in
          </Button>
        </div>
        
        <InputField
          label=""
          type="email"
          name="email_id"
          value={formData.email_id}
          onChange={handleChange}
          placeholder="Email..."
          error={errors.email_id}
          required
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="m2 7 10 7 10-7"/>
            </svg>
          }
        />
        
        <InputField
          label=""
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password..."
          error={errors.password}
          required
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          }
        />
        
        <button type="submit" disabled={isLoading} className="lets-go-button">
          {isLoading ? 'Logging in...' : 'LETS GO'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;
