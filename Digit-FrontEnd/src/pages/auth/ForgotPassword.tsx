import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import InputField from '../../components/auth/InputField';
import Button from '../../components/auth/Button';
import { forgotPassword } from '../../services/auth/authService';
import '../../styles/auth/ForgotPassword.css';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    if (!email) {
      setError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await forgotPassword({ email_id: email });
      
      if (response.success) {
        // Store email in session storage for reset password page
        sessionStorage.setItem('resetEmail', email);
        
        // Show success message
        setIsSubmitted(true);
        
        // Navigate to reset password page after 3 seconds
        setTimeout(() => {
          navigate('/reset-password');
        }, 3000);
      } else {
        setError(response.message || 'Failed to process request');
      }
    } catch (error) {
      setError('Failed to process request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Forgot Password" 
      subtitle="Enter your email address to receive password reset instructions"
    >
      {isSubmitted ? (
        <div className="success-container">
          <div className="success-message">
            Password reset instructions have been sent to your email address.
          </div>
          <p className="redirect-message">
            You will be redirected to the reset password page shortly...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="forgot-password-form">
          {error && <div className="error-message">{error}</div>}
          
          <InputField
            label="Email Address"
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            placeholder="Enter your email"
            error=""
            required
          />
          
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Reset Instructions'}
          </Button>
          
          <div className="login-link">
            Remember your password? <a href="/login">Login</a>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
