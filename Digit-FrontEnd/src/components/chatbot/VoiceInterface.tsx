import React, { useState, useEffect } from 'react';
import './VoiceInterface.css';
import chatbotIcon from '../../assets/icons/chatbot.svg';

interface VoiceInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ isOpen, onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [botResponse, setBotResponse] = useState('');
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const [animationLevel, setAnimationLevel] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isListening) {
      // Simulate voice animation
      interval = setInterval(() => {
        setAnimationLevel(Math.floor(Math.random() * 5) + 1);
      }, 150);
    } else if (isBotSpeaking) {
      // Simulate bot speaking animation
      interval = setInterval(() => {
        setAnimationLevel(Math.floor(Math.random() * 5) + 1);
      }, 150);
    } else {
      setAnimationLevel(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isListening, isBotSpeaking]);

  const handleStartListening = () => {
    setIsListening(true);
    setTranscript('');
    setBotResponse('');
    
    // Simulate speech recognition
    setTimeout(() => {
      setTranscript('What are the zoning regulations for residential areas?');
      setIsListening(false);
      
      // Simulate bot processing
      setTimeout(() => {
        setIsBotSpeaking(true);
        
        // Simulate bot response after a delay
        setTimeout(() => {
          setBotResponse('In Mayorville, residential areas are primarily zoned as R1, R2, or R3. R1 zones are for single-family homes with a minimum lot size of 5,000 square feet. R2 zones allow for duplexes and townhomes. R3 zones permit multi-family dwellings like apartments. All residential buildings must adhere to setback requirements of at least 15 feet from the street and 5 feet from side property lines. Height restrictions typically limit buildings to 35 feet or 2.5 stories. Would you like more specific information about a particular residential zone?');
          
          // Simulate bot finishing speaking
          setTimeout(() => {
            setIsBotSpeaking(false);
          }, 8000);
        }, 1500);
      }, 1000);
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="voice-interface-overlay">
      <div className="voice-interface">
        <div className="voice-header">
          <h3>Speak with Koby</h3>
          <button className="close-voice-button" onClick={onClose}>×</button>
        </div>
        
        <div className="voice-content">
          <div className="chatbot-avatar-large">
            <img src={chatbotIcon} alt="Koby AI Chatbot" />
            <div className="voice-animation-container">
              {[1, 2, 3, 4, 5].map((level) => (
                <div 
                  key={level}
                  className={`voice-animation-bar ${level <= animationLevel ? 'active' : ''}`}
                  style={{ height: `${level * 4 + 10}px` }}
                />
              ))}
            </div>
          </div>
          
          <div className="voice-status">
            {isListening ? (
              <p className="listening-text">Listening...</p>
            ) : isBotSpeaking ? (
              <p className="speaking-text">Speaking...</p>
            ) : transcript ? (
              <div className="voice-transcript">
                <p className="user-query">
                  <strong>You said:</strong> {transcript}
                </p>
                {botResponse && (
                  <p className="bot-response">
                    <strong>Koby:</strong> {botResponse}
                  </p>
                )}
              </div>
            ) : (
              <p className="instruction-text">
                Press the microphone button and ask a question about planning, zoning, or land use.
              </p>
            )}
          </div>
          
          <button 
            className={`microphone-button ${isListening ? 'listening' : ''}`}
            onClick={handleStartListening}
            disabled={isListening || isBotSpeaking}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceInterface;
