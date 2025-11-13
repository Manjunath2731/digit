import React, { useState, useEffect } from 'react';
import './ChatbotAvatar.css';
import chatbotIcon from '../../assets/icons/chatbot.svg';

interface ChatbotAvatarProps {
  showInitialMessage?: boolean;
  messageDelay?: number;
  onClick?: () => void;
}

const ChatbotAvatar: React.FC<ChatbotAvatarProps> = ({ 
  showInitialMessage = true, 
  messageDelay = 800,
  onClick
}) => {
  const [showMessage, setShowMessage] = useState(false);

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
    <div className="chatbot-container">
      {showMessage && (
        <div className="chatbot-message" style={{ transition: 'all 0.6s ease-out' }}>
          <p>Hi, I am <b style={{ fontWeight: 'bold' }}>Koby</b> - city's new  <b style={{ fontWeight: 'bold' }}>AI companion</b>.</p>
          <p>I am trained to answer questions around Planning, Zoning and Land Use.</p>
        </div>
      )}
      <div className="chatbot-avatar" onClick={handleAvatarClick}>
        <img src={chatbotIcon} alt="Koby AI Chatbot" className="chatbot-icon" />
      </div>
    </div>
  );
};

export default ChatbotAvatar;
