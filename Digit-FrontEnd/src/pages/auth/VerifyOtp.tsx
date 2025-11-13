import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import OtpInput from '../../components/auth/OtpInput';
import Button from '../../components/auth/Button';
import { verifyOtp, resendOtp } from '../../services/auth/authService';
import '../../styles/auth/VerifyOtp.css';

const VerifyOtp: React.FC = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // Get phone number from session storage
    const registrationData = sessionStorage.getItem('registrationData');
    if (!registrationData) {
      // Redirect to registration if no data is found
      navigate('/register');
      return;
    }

    const { phone_no } = JSON.parse(registrationData);
    setPhoneNumber(phone_no);

    // Start resend timer
    startResendTimer();
  }, [navigate]);

  const startResendTimer = () => {
    setCanResend(false);
    setResendTimer(30);
    
    const timer = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  };

  const handleOtpChange = (otpValue: string) => {
    setOtp(otpValue);
    if (error) {
      setError('');
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);

    try {
      const response = await verifyOtp({
        phone_no: parseInt(phoneNumber),
        confirmation_code: parseInt(otp)
      });

      if (response.success) {
        // Keep registration data for profile completion
        // Don't remove sessionStorage.getItem('registrationData') yet
        
        // Navigate to profile completion page
        navigate('/profile-completion');
      } else {
        setError(response.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    
    try {
      const response = await resendOtp(parseInt(phoneNumber));
      
      if (response.success) {
        startResendTimer();
      } else {
        setError(response.message || 'Failed to resend OTP');
      }
    } catch (error) {
      setError('Failed to resend OTP. Please try again.');
    }
  };

  return (
    <AuthLayout
      title="OTP Verification"
      subtitle={`Enter the OTP sent to ${phoneNumber}`}
    >
      <div className="verify-otp-container">
        {error && <div className="otp-error">{error}</div>}
        
        <OtpInput length={6} onChange={handleOtpChange} />
        
        <div className="resend-container">
          <button 
            className={`resend-button ${!canResend ? 'disabled' : ''}`}
            onClick={handleResendOtp}
            disabled={!canResend}
          >
            {canResend 
              ? 'Resend another OTP' 
              : `Resend another OTP ${resendTimer} secs`}
          </button>
        </div>
        
        <Button 
          onClick={handleVerify} 
          disabled={isLoading || otp.length !== 6}
        >
          {isLoading ? 'Verifying...' : 'Next'}
        </Button>
      </div>
    </AuthLayout>
  );
};

export default VerifyOtp;
