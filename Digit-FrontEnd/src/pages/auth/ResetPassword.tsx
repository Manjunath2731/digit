import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import InputField from '../../components/auth/InputField';
import OtpInput from '../../components/auth/OtpInput';
import Button from '../../components/auth/Button';
import { resetPassword } from '../../services/auth/authService';
import '../../styles/auth/ResetPassword.css';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Get email from session storage
    const storedEmail = sessionStorage.getItem('resetEmail');
    if (!storedEmail) {
      // Redirect to forgot password if no email is found
      navigate('/forgot-password');
      return;
    }

    setEmail(storedEmail);
  }, [navigate]);

  const handleOtpChange = (otpValue: string) => {
    setOtp(otpValue);
    if (error) {
      setError('');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    if (error) {
      setError('');
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return false;
    }

    if (!newPassword) {
      setError('New password is required');
      return false;
    } else if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
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
      const response = await resetPassword({
        email_id: email,
        confirmation_code: parseInt(otp),
        new_password: newPassword
      });
      
      if (response.success) {
        // Clear session storage
        sessionStorage.removeItem('resetEmail');
        
        // Show success message
        setIsSuccess(true);
        
        // Navigate to login page after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.message || 'Failed to reset password');
      }
    } catch (error) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Reset Password" 
      subtitle={`Enter the OTP sent to ${email} and your new password`}
    >
      {isSuccess ? (
        <div className="success-container">
          <div className="success-message">
            Your password has been reset successfully!
          </div>
          <p className="redirect-message">
            You will be redirected to the login page shortly...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="reset-password-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="otp-section">
            <label className="otp-label">Enter OTP</label>
            <OtpInput length={6} onChange={handleOtpChange} />
          </div>
          
          <InputField
            label="New Password"
            type="password"
            name="newPassword"
            value={newPassword}
            onChange={handlePasswordChange}
            placeholder="Enter new password"
            error=""
            required
          />
          
          <InputField
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            placeholder="Confirm new password"
            error=""
            required
          />
          
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
};

export default ResetPassword;
