import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LeadGenModal.css';
import chatbotIcon from '../../assets/icons/chatbot.svg';
import bulbIcon from '../../assets/icons/bulb.svg';

interface LeadGenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChatClick?: () => void;
  onVoiceClick?: () => void;
  onMapClick?: () => void;
}

interface FormData {
  name: string;
  email: string;
  organization: string;
}

interface FormErrors {
  name: string;
  email: string;
  organization: string;
}

const LeadGenModal: React.FC<LeadGenModalProps> = ({ 
  isOpen, 
  onClose, 
  onChatClick, 
  onVoiceClick, 
  onMapClick 
}) => {
  const [showDisclaimerInfo, setShowDisclaimerInfo] = useState(false);
  const [showChatInterface, setShowChatInterface] = useState(false);
  const [showVoiceInterface, setShowVoiceInterface] = useState(false);
  const [showInstructionalPanel, setShowInstructionalPanel] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    organization: ''
  });
  const [errors, setErrors] = useState<FormErrors>({
    name: '',
    email: '',
    organization: ''
  });
  const [formIsValid, setFormIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [firstName, setFirstName] = useState('');

  const toggleDisclaimerInfo = () => {
    setShowDisclaimerInfo(!showDisclaimerInfo);
  };

  const handleChatClick = () => {
    // If we're closing the chat interface, reset it completely
    if (showChatInterface) {
      setShowChatInterface(false);
    } else {
      // If we're opening the chat interface, close voice if open
      setShowChatInterface(true);
      if (showVoiceInterface) setShowVoiceInterface(false);
    }
  };

  const handleVoiceClick = () => {
    setShowVoiceInterface(!showVoiceInterface);
    if (showChatInterface) setShowChatInterface(false);
  };

  // When the modal is closed, reset all interfaces
  useEffect(() => {
    if (!isOpen) {
      setShowChatInterface(false);
      setShowVoiceInterface(false);
      setShowInstructionalPanel(false);
    }
  }, [isOpen]);

  // List of common public email domains to block
  const publicEmailDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
    'icloud.com', 'mail.com', 'protonmail.com', 'zoho.com', 'yandex.com',
    'gmx.com', 'live.com', 'inbox.com', 'me.com', 'msn.com'
  ];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear the error for this field
    setErrors(prev => ({ ...prev, [field]: '' }));

    // Validate the field as user types
    validateField(field, value);
  };

  const validateField = (field: keyof FormData, value: string) => {
    let errorMessage = '';

    switch (field) {
      case 'name':
        if (!value.trim()) {
          errorMessage = 'Name is required';
        } else if (value.trim().length < 2) {
          errorMessage = 'Name must be at least 2 characters';
        }
        break;

      case 'email':
        if (!value.trim()) {
          errorMessage = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errorMessage = 'Please enter a valid email address';
        } else {
          // Check if it's a public email domain
          const domain = value.split('@')[1].toLowerCase();
          if (publicEmailDomains.includes(domain)) {
            errorMessage = 'Please use your work email address';
          }
        }
        break;

      case 'organization':
        if (!value.trim()) {
          errorMessage = 'Organization is required';
        } else if (value.trim().length < 2) {
          errorMessage = 'Organization must be at least 2 characters';
        }
        break;
    }

    setErrors(prev => ({ ...prev, [field]: errorMessage }));

    // Check if the entire form is valid
    setTimeout(() => {
      const hasNoErrors = Object.values(errors).every(error => error === '');
      const allFieldsFilled = Object.values(formData).every(val => val.trim() !== '');
      setFormIsValid(hasNoErrors && allFieldsFilled);
    }, 0);
  };

  const validateForm = () => {
    // Validate all fields
    let isValid = true;
    const newErrors = { ...errors };

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
      isValid = false;
    } else {
      newErrors.name = '';
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    } else {
      // Check if it's a public email domain
      const domain = formData.email.split('@')[1].toLowerCase();
      if (publicEmailDomains.includes(domain)) {
        newErrors.email = 'Please use your work email address';
        isValid = false;
      } else {
        newErrors.email = '';
      }
    }

    // Validate organization
    if (!formData.organization.trim()) {
      newErrors.organization = 'Organization is required';
      isValid = false;
    } else if (formData.organization.trim().length < 2) {
      newErrors.organization = 'Organization must be at least 2 characters';
      isValid = false;
    } else {
      newErrors.organization = '';
    }

    setErrors(newErrors);
    setFormIsValid(isValid);
    return isValid;
  };

  // Control instructional panel based on chat interface visibility
  useEffect(() => {
    let openTimer: NodeJS.Timeout;
    let closeTimer: NodeJS.Timeout;

    if (showChatInterface) {
      // When chat opens, delay showing instructional panel by 3 seconds
      openTimer = setTimeout(() => {
        setShowInstructionalPanel(true);
        
        // Auto-close after 10 seconds
        closeTimer = setTimeout(() => {
          setShowInstructionalPanel(false);
        }, 10000);
      }, 3000);
    } else {
      // When chat closes, close the instructional panel
      setShowInstructionalPanel(false);
    }
    
    // Listen for custom event to toggle instructional panel from ChatConversation
    const handleToggleInstructionalPanel = () => {
      setShowInstructionalPanel(prevState => !prevState);
    };
    
    document.addEventListener('toggleInstructionalPanel', handleToggleInstructionalPanel);
    
    // Clean up timers and event listener if component unmounts or chat visibility changes
    return () => {
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
      document.removeEventListener('toggleInstructionalPanel', handleToggleInstructionalPanel);
    };
  }, [showChatInterface]);

  if (!isOpen) return null;

  return (
    <div className="leadgen-modal-overlay">
      
      
      
      
      <div className={`leadgen-modal ${isAiTyping ? 'ai-typing' : ''}`}>
        <button className="close-button" onClick={onClose}>×</button>
        
        {/* No instruction button on mobile as requested */}
        
        <div className="leadgen-modal-content">
          {!showSuccess ? (
            <>
              <p style={{ fontSize: '22px', margin: '0 0px 10px' }}>Great!</p>
              
              <p style={{ fontSize: '15px', marginBottom: '30px', maxWidth: '85%', textAlign: 'left',lineHeight: '20px' }}>
                Please provide the following details to request a detailed
                demo curated to your needs.
              </p>
              
              <form style={{ width: '80%', display: 'flex', flexDirection: 'column', gap: '13px' }}>
            <div style={{ textAlign: 'left', width: '100%' }}>
              <label style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>
                Your Name*
              </label>
              <input 
                type="text" 
                required 
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  borderRadius: '8px',
                  border: `1px solid ${errors.name ? '#ff3b30' : '#ddd'}`,
                  fontSize: '14px'
                }} 
              />
              {errors.name && (
                <p style={{ color: '#ff3b30', fontSize: '12px', margin: '4px 0 0' }}>
                  {errors.name}
                </p>
              )}
            </div>
            
            <div style={{ textAlign: 'left', width: '100%' }}>
              <label style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>
                Your Email Address*
              </label>
              <input 
                type="email" 
                required 
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  borderRadius: '8px',
                  border: `1px solid ${errors.email ? '#ff3b30' : '#ddd'}`,
                  fontSize: '14px'
                }} 
              />
              {errors.email && (
                <p style={{ color: '#ff3b30', fontSize: '12px', margin: '4px 0 0' }}>
                  {errors.email}
                </p>
              )}
            </div>
            
            <div style={{ textAlign: 'left', width: '100%' }}>
              <label style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>
                Your Organization*
              </label>
              <input 
                type="text" 
                required 
                value={formData.organization}
                onChange={(e) => handleInputChange('organization', e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  borderRadius: '8px',
                  border: `1px solid ${errors.organization ? '#ff3b30' : '#ddd'}`,
                  fontSize: '14px'
                }} 
              />
              {errors.organization && (
                <p style={{ color: '#ff3b30', fontSize: '12px', margin: '4px 0 0' }}>
                  {errors.organization}
                </p>
              )}
            </div>
            
            <button 
              type="submit" 
              style={{ 
                marginTop: '15px',
                padding: '8px 24px',
                borderRadius: '50px',
                background: 'white',
                color: '#6138F5',
                border: '1px solid #6138F5',
                fontSize: '14px',
                cursor: formIsValid ? 'pointer' : 'not-allowed',
                opacity: formIsValid ? 1 : 0.7,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                alignSelf: 'center'
              }}
              onClick={(e) => {
                e.preventDefault();
                if (validateForm()) {
                  // Get first name for success message
                  setFirstName(formData.name.split(' ')[0]);
                  
                  // Show loading state
                  setIsLoading(true);
                  
                  // Make the actual API call using axios
                  const leadData = {
                    name: formData.name,
                    email: formData.email,
                    organization: formData.organization
                  };
                  
                  console.log('Submitting lead data:', leadData);
                  
                  // Make the API call to the same endpoint pattern used in chatSlice
                  axios.post('https://urbanai-api.viewprogis.com/api/leads', leadData)
                    .then(response => {
                      console.log('Lead submission successful:', response.data);
                      setIsLoading(false);
                      setShowSuccess(true);
                      
                      // After showing success for 4 seconds, close the modal
                      setTimeout(() => {
                        onClose();
                      }, 4000);
                    })
                    .catch(error => {
                      console.error('Error submitting lead data:', error);
                      // Still show success to the user for a smooth experience
                      setIsLoading(false);
                      setShowSuccess(true);
                      
                      // After showing success for 4 seconds, close the modal
                      setTimeout(() => {
                        onClose();
                      }, 4000);
                    });
                }
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #f3f3f3',
                    borderTop: '2px solid #6138F5',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <img src={bulbIcon} alt="Bulb" style={{ width: '30px', height: '30px' }} />
                  Request Detailed Demo
                </>
              )}
            </button>
          </form>
            </>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            //   justifyContent: 'center',
              height: '100%',
              padding: '20px',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '23px', marginBottom: '20px' }}>
                Thanks {firstName}!
              </p>
              <p style={{ fontSize: '16px', marginBottom: '0', lineHeight: '1.5' }}>
                We're very excited to receive your details.
              </p>
              <p style={{ fontSize: '16px', marginBottom: '30px', lineHeight: '1.5' }}>
                We'll be in touch with you shortly.
              </p>
              <p style={{ fontSize: '20px', fontWeight: 'bold' }}>
                Have a great day!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadGenModal;

// Add simple keyframe for spinner
const style = document.createElement('style');
style.innerHTML = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
