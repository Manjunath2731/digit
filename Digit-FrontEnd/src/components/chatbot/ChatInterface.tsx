import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';
import chatbotIcon from '../../assets/icons/chatbot.svg';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi there! I\'m Koby, Mayorville\'s AI companion. How can I help you with planning, zoning, or land use questions today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    setIsTyping(true);
    setTimeout(() => {
      const botResponse = generateBotResponse(inputText);
      setMessages(prevMessages => [...prevMessages, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const generateBotResponse = (userInput: string): Message => {
    const responses = [
      "I can help you with that! The zoning regulations in Mayorville require residential buildings to be set back at least 15 feet from the street.",
      "According to our city planning guidelines, commercial developments in downtown require special permits. Would you like more information about the application process?",
      "The land use policy for that area is designated as mixed-use development. This allows for both residential and commercial properties.",
      "For your question about building permits, you'll need to submit an application through our online portal or visit the Development Services Department at City Hall.",
      "Mayorville's comprehensive plan prioritizes sustainable development and green spaces. Any new development needs to include at least 15% green space."
    ];
    
    return {
      id: Date.now().toString(),
      text: responses[Math.floor(Math.random() * responses.length)],
      sender: 'bot',
      timestamp: new Date()
    };
  };

  if (!isOpen) return null;

  return (
    <div className="chat-interface-overlay">
      <div className="chat-interface">
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-avatar-small">
              <img src={chatbotIcon} alt="Koby AI Chatbot" />
            </div>
            <div className="chat-header-text">
              <h3>Koby</h3>
              <p>Mayorville's AI Companion</p>
            </div>
          </div>
          <button className="close-chat-button" onClick={onClose}>×</button>
        </div>
        
        <div className="chat-messages">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
            >
              {message.sender === 'bot' && (
                <div className="bot-avatar">
                  <img src={chatbotIcon} alt="Koby" />
                </div>
              )}
              <div className="message-content">
                <div className="message-text">{message.text}</div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message bot-message">
              <div className="bot-avatar">
                <img src={chatbotIcon} alt="Koby" />
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="chat-input">
          <input
            type="text"
            placeholder="Type your question here..."
            value={inputText}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
          <button 
            className={`send-button ${inputText.trim() ? 'active' : ''}`}
            onClick={handleSendMessage}
            disabled={inputText.trim() === ''}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
