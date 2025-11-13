import React, { useState } from 'react';
import './Chatbot.css';
import ChatbotAvatar from './ChatbotAvatar';
import ChatbotModal from './ChatbotModal';
import ChatInterface from './ChatInterface';
import VoiceInterface from './VoiceInterface';
import { useAppDispatch } from '../../store';
import { clearChatData } from '../../store/slices/chatSlice';

interface ChatbotProps {
  onStateChange?: (isOpen: boolean) => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ onStateChange }) => {
  const dispatch = useAppDispatch();
  const [showModal, setShowModal] = useState(false);
  const [showChatInterface, setShowChatInterface] = useState(false);
  const [showVoiceInterface, setShowVoiceInterface] = useState(false);

  const handleAvatarClick = () => {
    setShowModal(true);
    // Notify parent component
    if (onStateChange) onStateChange(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Notify parent component
    if (onStateChange) onStateChange(false);
    // Ensure chat data is cleared in Redux store
    dispatch(clearChatData());
  };

  const handleOpenChat = () => {
    setShowModal(false);
    setShowChatInterface(true);
    // Notify parent component - still open, just different interface
    if (onStateChange) onStateChange(true);
  };

  const handleCloseChat = () => {
    setShowChatInterface(false);
    // Notify parent component
    if (onStateChange) onStateChange(false);
  };

  const handleOpenVoice = () => {
    setShowModal(false);
    setShowVoiceInterface(true);
    // Notify parent component - still open, just different interface
    if (onStateChange) onStateChange(true);
  };

  const handleCloseVoice = () => {
    setShowVoiceInterface(false);
    // Notify parent component
    if (onStateChange) onStateChange(false);
  };

  return (
    <div className="chatbot-wrapper no-blur">
      <ChatbotAvatar 
        showInitialMessage={true} 
        messageDelay={2000}
        onClick={handleAvatarClick}
      />
      
      {showModal && (
        <ChatbotModal 
          isOpen={true} 
          onClose={handleCloseModal}
          onChatClick={handleOpenChat}
          onVoiceClick={handleOpenVoice}
          onMapClick={() => window.open('https://map.viewprogis.com/demo/ai-demo?widget=0fbad9e5-18ef-4901-93a4-1103882f9c66', '_blank')}
        />
      )}
      
      <ChatInterface 
        isOpen={showChatInterface} 
        onClose={handleCloseChat} 
      />
      
      <VoiceInterface 
        isOpen={showVoiceInterface} 
        onClose={handleCloseVoice} 
      />
    </div>
  );
};

export default Chatbot;
