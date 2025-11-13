import React, { useState } from 'react';
import starsIcon from '../../assets/icons/stars.svg';
import { baseOptions, initialOptions, zoningOptions } from '../../utils/helpers';
import './FloatingOptionsDropdown.css';

interface FloatingOptionsDropdownProps {
  showFollowUpOptions: boolean;
  showZoningOptions: boolean;
  propertyData: any;
  selectedOptions: Set<string>;
  messages: any[];
  onOptionClick: (optionText: string) => void;
}

const FloatingOptionsDropdown: React.FC<FloatingOptionsDropdownProps> = ({
  showFollowUpOptions,
  showZoningOptions,
  propertyData,
  selectedOptions,
  messages,
  onOptionClick
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Handle dropdown option selection
  const handleDropdownOptionClick = (optionText: string) => {
    onOptionClick(optionText);
    setDropdownOpen(false);
  };

  // Determine which options to show
  const getOptionsToShow = () => {
    // Check for follow-up options
    if (showFollowUpOptions) {
      let allOptions = [...baseOptions];
      if (propertyData) {
        allOptions.push({ text: 'Change address', option: 'CA' });
      }
      return allOptions;
    }

    // Check for initial greeting options
    const hasInitialGreeting = messages.some(message => 
      message.text.includes("Hello") && 
      message.text.includes("It is my pleasure") && 
      message.showFollowUpButtons
    );
    if (hasInitialGreeting) {
      return initialOptions.filter(opt =>
        !selectedOptions.has(opt.text) && !selectedOptions.has(opt.option)
      );
    }

    // Check for zoning options
    if (showZoningOptions) {
      return zoningOptions;
    }

    return [];
  };

  const optionsToShow = getOptionsToShow();

  // Don't render if no options to show
  if (optionsToShow.length === 0) {
    return null;
  }

  return (
    <div className="floating-options-dropdown">
      <div className="chat-options-dropdown-container">
        <button 
          className="chat-options-dropdown-trigger"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          Please choose from the options below or type in your question to continue.
          <span className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`}>▼</span>
        </button>
        {dropdownOpen && (
          <div className="chat-options-dropdown-menu">
            {optionsToShow.map((opt, i) => (
              <button
                key={`floating-option-${i}`}
                className="chat-option-dropdown-item"
                onClick={() => handleDropdownOptionClick(opt.text)}
                style={opt.text === 'Change address' ? { color: 'red' } : {}}
              >
                {opt.text !== 'Change address' && (
                  <img src={starsIcon} alt="stars" style={{ marginRight: '5px', width: '16px', height: '16px' }} />
                )}
                {opt.text}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingOptionsDropdown;