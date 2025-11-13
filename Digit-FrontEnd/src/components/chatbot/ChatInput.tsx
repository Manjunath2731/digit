import React, { useState, useEffect, useRef } from "react";
import { baseOptions } from "../../utils/helpers";
import starsIcon from "../../assets/icons/stars.svg";
import upperArrowIcon from "../../assets/images/up.png";

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onSendMessage: () => void;
  showFeedback: boolean;
  isVisible: boolean;
  isMaximized?: boolean;
  onOptionClick?: (optionText: string) => void;
  hasAIResponded?: boolean;
  textSize?: number;
  propertyData?: any;
  isInstructionalPanelOpen?: boolean; 
}
const ChatInput: React.FC<ChatInputProps> = ({
  inputValue,
  setInputValue,
  onSendMessage,
  showFeedback,
  isVisible,
  isMaximized = false,
  onOptionClick,
  hasAIResponded = false,
  textSize = 100,
  propertyData,
  isInstructionalPanelOpen = false, 
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [hasTyped, setHasTyped] = useState(false);
  const [hasSentMessage, setHasSentMessage] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionsContainerRef = useRef<HTMLDivElement>(null);
  const [shouldShowEllipsis, setShouldShowEllipsis] = useState(false);
  const checkOptionTruncation = () => {
    if (optionsContainerRef.current && isInstructionalPanelOpen) {
      const buttons = optionsContainerRef.current.querySelectorAll('.chat-option');
      if (buttons.length >= 3) {
        const thirdButton = buttons[2] as HTMLElement;
        const isOverflowing = thirdButton.scrollWidth > thirdButton.clientWidth;
        setShouldShowEllipsis(isOverflowing);
      }
    } else {
      setShouldShowEllipsis(false);
    }
  };

  useEffect(() => {
    checkOptionTruncation();
    const handleResize = () => checkOptionTruncation();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showOptions, textSize, isInstructionalPanelOpen]);
  const toggleMoreOptions = () => {
    setShowMoreOptions(!showMoreOptions);
  };

  const handleSendMessage = () => {
    setHasSentMessage(true);
    onSendMessage();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleOptionClick = (optionText: string) => {
    if (onOptionClick) {
      onOptionClick(optionText);
    } else {
      setInputValue(optionText);
      setTimeout(() => handleSendMessage(), 100);
    }
    setShowMoreOptions(false);
  };

  // Effect to handle auto-showing options after 20 seconds of inactivity
  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;

    if (isVisible && isMaximized && !hasTyped) {
      inactivityTimer = setTimeout(() => {
        setShowOptions(true);
      }, 20000);
    }

    return () => {
      clearTimeout(inactivityTimer);
    };
  }, [isVisible, isMaximized, hasTyped]);

  // Effect to show options after AI has responded to user's first message
  useEffect(() => {
    if (hasSentMessage && hasAIResponded && isMaximized) {
      setShowOptions(true);
    }
  }, [hasSentMessage, hasAIResponded, isMaximized]);

  // Effect to focus input when visible
  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible]);

  // Get all available options including Change address if propertyData exists
  const getAllOptions = () => {
    const options = [...baseOptions];
    if (propertyData) {
      options.push({ text: "Change address", option: "change_address" });
    }
    return options;
  };

  const allOptions = getAllOptions();
  const firstThreeOptions = allOptions.slice(0, 3);
  const remainingOptions = allOptions.slice(3);

  // Function to truncate text and add ellipsis - only when instructional panel is open
  const getTruncatedText = (text: string, isThirdOption: boolean) => {
    if (isThirdOption && shouldShowEllipsis && isInstructionalPanelOpen) {
      // You can adjust the length based on your needs
      const maxLength = 2; // Adjust this value based on your design
      return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    }
    return text;
  };

  return (
    <div className={`chat-footer ${isMaximized ? "maximized" : ""}`}>
      {isMaximized && (
        <>
          <div
            style={{
              backgroundColor: "#E0D8FD",
              width: "100%",
              margin: "2px 0", 
            }}
          ></div>
          <div
            className={`chat-options text-size-${textSize}`}
            style={{
              padding: "5px 10px 5px",
              fontSize: "12px",
            }}
          >
            {/* Main row - First 3 options */}
            <div
              ref={optionsContainerRef}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "5px",
                flexDirection: "row",
                alignItems: "center",
                width: "100%",
              }}
            >
              {firstThreeOptions.map((option, index) => (
                <div className="chat-outer" key={`outer-${index}`}>
                  <button
                    key={`main-option-${index}`}
                    className={`chat-option text-size-${textSize}`}
                    onClick={() => handleOptionClick(option.text)}
                    style={{
                      ...(option.text === "Change address"
                        ? { color: "red", borderColor: "red" }
                        : {}),
                      fontSize: "12px",
                      overflow: isInstructionalPanelOpen ? "hidden" : "visible",
                      textOverflow: isInstructionalPanelOpen ? "ellipsis" : "clip",
                      whiteSpace: isInstructionalPanelOpen ? "nowrap" : "normal",
                      maxWidth: (index === 2 && isInstructionalPanelOpen) ? "60px" : "270px", // Limit width for third option only when panel is open
                    }}
                    title={option.text} 
                  >
                    {option.text !== "Change address" && (
                      <img
                        src={starsIcon}
                        alt="stars"
                        style={{
                          marginRight: "5px",
                          width: "16px",
                          height: "16px",
                          flexShrink: 0, 
                        }}
                      />
                    )}
                    <span style={{ 
                      overflow: isInstructionalPanelOpen ? "hidden" : "visible", 
                      textOverflow: isInstructionalPanelOpen ? "ellipsis" : "clip" 
                    }}>
                      {getTruncatedText(option.text, index === 2)}
                    </span>
                  </button>
                </div>
              ))}
              {remainingOptions.length > 0 && (
                <div style={{ position: "relative" }} className="chat-outer">
                  <button
                    onClick={toggleMoreOptions}
                    style={{
                      background: "none",
                      border: "none",
                      borderRadius: "20px",
                      padding: "8px 8px",
                      cursor: "pointer",
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                      backgroundColor: "#f9fafb",
                    }}
                  >
                    <span style={{ color: "#6138F5", fontSize: "14px" }}>
                      + {remainingOptions.length}
                    </span>
                    <img
                      src={upperArrowIcon}
                      alt="More options"
                      style={{
                        width: "12px",
                        height: "8px",
                        transform: showMoreOptions
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.3s ease",
                      }}
                    />
                  </button>
                  {showMoreOptions && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "45px",
                        right: "0%",
                        transform: "translateX(-0%)",
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "12px",
                        padding: "15px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        zIndex: 1000,
                        minWidth: "400px",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          bottom: "-6px",
                          right: "4%",
                          transform: "translateX(0%)",
                          width: "0",
                          height: "0",
                          borderLeft: "6px solid transparent",
                          borderRight: "6px solid transparent",
                          borderTop: "6px solid #ffffff",
                        }}
                      ></div>
                      {remainingOptions.map((option, index) => (
                        <button
                          key={`tooltip-option-${index}`}
                          className={`chat-option text-size-${textSize}`}
                          onClick={() => handleOptionClick(option.text)}
                          style={{
                            ...(option.text === "Change address"
                              ? { color: "red", borderColor: "red" }
                              : {}),
                            fontSize: `${textSize}%`,
                            width: "100%",
                            textAlign: "left",
                            justifyContent: "flex-start",
                          }}
                        >
                          {option.text !== "Change address" && (
                            <img
                              src={starsIcon}
                              alt="stars"
                              style={{
                                marginRight: "5px",
                                width: "16px",
                                height: "16px",
                              }}
                            />
                          )}
                          {option.text}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <div
        className={`chat-input-container ${
          isMaximized ? "maximized-input" : ""
        }`}
        style={{ display: showFeedback ? "none" : "flex" }}
      >
        <input
          type="text"
          placeholder="Type your question here"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (!hasTyped && e.target.value.trim() !== "") {
              setHasTyped(true);
            }
          }}
          onKeyPress={handleKeyPress}
          ref={inputRef}
          className={`${
            isMaximized ? "maximized-input-field" : ""
          } text-size-${textSize}`}
          style={{ fontSize: `${textSize}%` }}
        />
        <button
          className={`send-button ${
            isMaximized ? "maximized-send-button" : ""
          }`}
          onClick={handleSendMessage}
          disabled={!inputValue.trim()}
        >
          <span
            className={`send-icon ${isMaximized ? "maximized-send-icon" : ""}`}
            style={{
              backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236138F5"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>')`,
              width: "24px",
              height: "24px",
            }}
          ></span>
        </button>
      </div>
    </div>
  );
};

export default ChatInput;