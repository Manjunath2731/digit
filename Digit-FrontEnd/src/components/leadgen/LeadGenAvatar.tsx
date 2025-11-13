import React, { useState, useEffect } from 'react';
import './LeadGenAvatar.css';
import leadgenIcon from '../../assets/icons/leadgen.svg';

interface LeadGenAvatarProps {
  showInitialMessage?: boolean;
  messageDelay?: number;
  onClick?: () => void;
}

const LeadGenAvatar: React.FC<LeadGenAvatarProps> = ({ 
  showInitialMessage = true, 
  messageDelay = 800,
  onClick
}) => {
  const [showMessage, setShowMessage] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  useEffect(() => {
    if (showInitialMessage) {
      // Show message after a short delay
      const messageTimer = setTimeout(() => {
        setShowMessage(true);
      }, messageDelay);
      
      return () => {
        clearTimeout(messageTimer);
      };
    }
  }, [showInitialMessage, messageDelay]);

  const handleAvatarClick = () => {
    // Hide the message bubble when modal is opened
    setShowMessage(false);
    
    // Call the onClick prop if provided
    if (onClick) {
      onClick();
    }
  };

  // Modal is now handled by parent component

  return (
    <div className="leadgen-container">
    
      <div className="leadgen-avatar" onClick={handleAvatarClick}>
        <img src={leadgenIcon} alt="LeadGen AI Chatbot" className="leadgen-icon" />
      </div>
      {showMessage && !isMobile && (
        <div className="leadgen-message" style={{ transition: 'all 0.6s ease-out' }}>
          <p>If you like what you see...</p>
          <p>Let's setup a meeting and take it forward</p>
        </div>
      )}
    </div>
  );
};

export default LeadGenAvatar;
