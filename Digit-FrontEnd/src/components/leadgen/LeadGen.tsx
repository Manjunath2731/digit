import React, { useState } from 'react';
import './LeadGen.css';
import LeadGenModal from './LeadGenModal';
import LeadGenAvatar from './LeadGenAvatar';

const LeadGen: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [showChatInterface, setShowChatInterface] = useState(false);
  const [showVoiceInterface, setShowVoiceInterface] = useState(false);

  const handleAvatarClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleOpenChat = () => {
    setShowModal(false);
    setShowChatInterface(true);
  };

  const handleCloseChat = () => {
    setShowChatInterface(false);
  };

  const handleOpenVoice = () => {
    setShowModal(false);
    setShowVoiceInterface(true);
  };

  const handleCloseVoice = () => {
    setShowVoiceInterface(false);
  };

  return (
    <div className="leadgen-wrapper no-blur">

<LeadGenAvatar 
        showInitialMessage={true} 
        messageDelay={2000}
        onClick={handleAvatarClick}
      />
      
      {showModal && (
        <LeadGenModal 
          isOpen={true} 
          onClose={handleCloseModal}
          onChatClick={handleOpenChat}
          onVoiceClick={handleOpenVoice}
          onMapClick={() => window.open('https://map.viewprogis.com/demo/ai-demo?widget=0fbad9e5-18ef-4901-93a4-1103882f9c66', '_blank')}
        />
      )}
      
      
      
    </div>
  );
};

export default LeadGen;
