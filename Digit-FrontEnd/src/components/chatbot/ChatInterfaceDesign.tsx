import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Info, X, Send, Star, FileText, ChevronDown, LucideIcon } from 'lucide-react';
import './ChatInterfaceDesign.css'; // Import the CSS file

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  isOption?: boolean;
  showPdfOption?: boolean;
  showFollowUpButtons?: boolean;
}

interface ChatOption {
  text: string;
  icon: LucideIcon;
}

const ChatInterfaceDesign: React.FC = () => {
  const [showDisclaimerInfo, setShowDisclaimerInfo] = useState<boolean>(false);
  const [showChatOptions, setShowChatOptions] = useState<boolean>(true);
  const [showInstructions, setShowInstructions] = useState<boolean>(true); // Show on load
  const [inputValue, setInputValue] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Does my site fall within the city limit?",
      isUser: true,
      isOption: true
    },
    {
      id: 2,
      text: "Sure, could you help me with an address.",
      isUser: false
    },
    {
      id: 3,
      text: "701 Se 36th St",
      isUser: true
    },
    {
      id: 4,
      text: "Here is what I found about this property:\n\nZone: CB - Central Business\nOwner Name: DIAMOND GROUP INVESTMENTS LLC\nWithin the City Limits: Yes",
      isUser: false,
      showPdfOption: true
    },
    {
      id: 5,
      text: "Please choose from the options below or type in your question to continue.",
      isUser: false,
      showFollowUpButtons: true
    }
  ]);

  const chatOptions: ChatOption[] = [
    { text: "Does my site fall within the city limit?", icon: Star },
    { text: "What zone does my site fall under?", icon: Star },
    { text: "Check what's possible to build on my site", icon: Star },
    { text: "Can I build a specific building on my site?", icon: Star }
  ];

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const instructionsTimerRef = useRef<NodeJS.Timeout | null>(null);

  const toggleDisclaimerInfo = (): void => {
    setShowDisclaimerInfo(!showDisclaimerInfo);
  };

  const toggleInstructions = (): void => {
    setShowInstructions(!showInstructions);
    
    // Clear existing timer
    if (instructionsTimerRef.current) {
      clearTimeout(instructionsTimerRef.current);
    }
    
    // Set new timer if showing instructions
    if (!showInstructions) {
      instructionsTimerRef.current = setTimeout(() => {
        setShowInstructions(false);
      }, 30000); // 30 seconds
    }
  };

  // Auto-hide instructions after 30 seconds on initial load
  useEffect(() => {
    instructionsTimerRef.current = setTimeout(() => {
      setShowInstructions(false);
    }, 30000); // 30 seconds

    // Cleanup timer on unmount
    return () => {
      if (instructionsTimerRef.current) {
        clearTimeout(instructionsTimerRef.current);
      }
    };
  }, []);

  const handleSendMessage = (): void => {
    if (inputValue.trim()) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: inputValue,
        isUser: true
      }]);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleOptionClick = (optionText: string): void => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: optionText,
      isUser: true,
      isOption: true
    }]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setInputValue(e.target.value);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-container">
      {/* Header - Full Width */}
      <div className="header">
        <div className="header-left">
          <button className="back-button" type="button">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="header-title">Welcome to Mayorville's AI Companion</h1>
          <div className="info-button-container">
            <button 
              onClick={toggleInstructions}
              className="info-button"
              type="button"
            >
              <Info />
            </button>
            {/* Tooltip */}
            <div className="tooltip">
              Click here to read instructions
            </div>
          </div>
        </div>
        
        <div className="header-right">
          <button className="text-size-button" type="button">A-</button>
          <button className="text-size-button bold" type="button">A+</button>
          <button className="edit-button" type="button">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button className="close-button" type="button">
            <X />
          </button>
        </div>
      </div>

      {/* Middle Section with Chat and Instructions */}
      <div className="middle-section">
        {/* Chat Messages Area */}
        <div className="chat-area">
          <div className="messages-container">
            {messages.map((message: Message) => (
              <div key={message.id} className={`message-wrapper ${message.isUser ? 'user' : 'assistant'}`}>
                <div className={`message ${message.isUser ? 'user' : 'assistant'} ${message.isOption ? 'option' : ''}`}>
                  <p className="message-text" 
                     dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, '<br/>') }} />
                  
                  {/* PDF Download Option */}
                  {message.showPdfOption && (
                    <div className="pdf-option">
                      <button className="pdf-button" type="button">
                        <FileText />
                        <span>Parcel Summary Report</span>
                        <ChevronDown />
                      </button>
                      <p className="pdf-disclaimer">
                        <strong>DISCLAIMER:</strong> Please reach out to city staff to confirm the results provided here before making any major development decisions.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Instructions Panel - Only covers message area */}
        {showInstructions && (
          <div className="instructions-panel">
            <div className="instructions-content">
              <div className="instructions-header">
                <h2 className="instructions-title">Instructions</h2>
                <button 
                  onClick={() => setShowInstructions(false)}
                  className="instructions-close"
                  type="button"
                >
                  <X />
                </button>
              </div>
              
              <div className="instructions-body">
                <p>To fully experience all features, here is a list of address that you could consider using:</p>
                
                <div className="address-list">
                  <div className="address-item">&lt;Address 1&gt;</div>
                  <div className="address-item">&lt;Address 2&gt;</div>
                  <div className="address-item">&lt;Address 3&gt;</div>
                </div>
                
                <p>Here are the building types that you could consider as an input:</p>
                
                <div className="building-list">
                  <div className="building-item">Bread & Breakfast</div>
                  <div className="building-item">Convention Center</div>
                  <div className="building-item">Medical Office</div>
                  <div className="building-item">Multifamily Dwelling</div>
                </div>
                
                <p>We truly hope you have a wonderful experience with our AI service. Your support is greatly appreciated.</p>
              </div>
              
              <div className="instructions-footer">
                <div className="powered-by">
                  Powered by <span className="brand">VIEWPRO</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Options Section - Full Width */}
      <div className="chat-options-section">
        {/* Dropdown toggle button */}
        <div className="options-toggle-container">
          {/* Horizontal line above the button */}
          <div className="options-divider"></div>
          {/* Toggle button */}
          <button 
            onClick={() => setShowChatOptions(!showChatOptions)}
            className={`options-toggle ${showChatOptions ? 'open' : ''}`}
            title={showChatOptions ? 'Hide Options' : 'Show Options'}
            type="button"
          >
            <ChevronDown />
          </button>
        </div>
        
        {/* Chat Options Grid */}
        <div className={`options-container ${showChatOptions ? 'expanded' : 'collapsed'}`}>
          <div className="options-grid">
            {chatOptions.map((option: ChatOption, index: number) => (
              <button
                key={index}
                onClick={() => handleOptionClick(option.text)}
                className="option-button"
                type="button"
              >
                <div className="option-content">
                  <Star className="option-icon" />
                  <span className="option-text">{option.text}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Section - Full Width */}
      <div className="input-section">
        {/* Input Field with Disclaimer Button */}
        <div className="input-container">
          <div className="input-wrapper">
            <input
              ref={inputRef}
              type="text"
              placeholder="Please type your question here"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="message-input"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="send-button"
            type="button"
          >
            <Send />
          </button>
          <button
            onClick={toggleDisclaimerInfo}
            className="disclaimer-button"
            type="button"
          >
            <span>AI Use Disclaimer</span>
          </button>
        </div>

        {/* Disclaimer Content - Modal Style */}
        {showDisclaimerInfo && (
          <div className="disclaimer-modal">
            <div className="disclaimer-header">
              <h3 className="disclaimer-title">AI Use Disclaimer</h3>
              <button 
                onClick={toggleDisclaimerInfo}
                className="disclaimer-close"
                type="button"
              >
                <X />
              </button>
            </div>
            <p className="disclaimer-text">
              This AI tool is intended to provide helpful and accurate information based on available data. 
              However, it may not reflect the most current regulations or site-specific considerations. We 
              strongly recommend consulting with city staff or relevant authorities before making any 
              decisions regarding your property.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterfaceDesign;