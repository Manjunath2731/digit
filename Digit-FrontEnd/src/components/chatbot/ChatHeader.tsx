import React, { useState, useEffect } from "react";
import arrowBackIcon from "../../assets/icons/arrow_back.svg";
import instructCloseIcon from "../../assets/icons/instuct_close.svg";

interface ChatHeaderProps {
  onBackClick?: () => void;
  onResetChat: () => void;
  isMaximized?: boolean;
  title?: string;
  onToggleInstructionalPanel?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  onBackClick,
  onResetChat,
  isMaximized,
  title = "Welcome to the interactive chat!",
}) => {
  const [showInternalTooltip, setShowInternalTooltip] = useState(true); 
  useEffect(() => {
    setShowInternalTooltip(true);
  }, []);

  console.log(
    "ChatHeader rendered, showInternalTooltip:",
    showInternalTooltip,
    "isMaximized:",
    isMaximized
  );

  const handleBackClick = () => {
    onResetChat();
    if (onBackClick) onBackClick();
  };

  const handleInstructionToggle = () => {
    const event = new CustomEvent("toggleInstructionalPanel");
    document.dispatchEvent(event);
  };

  return (
    <>
      <div className={`chat-header ${isMaximized ? "maximized" : ""}`}>
        <div className="header-left">
          <button className="back-button" onClick={handleBackClick}>
            <img src={arrowBackIcon} alt="Back" className="back-arrow" /> Back
          </button>
        </div>

          <div 
          className={`${isMaximized ? "header-center" : "header-center-normal"}`}>
            <span
              className={`${isMaximized ? "chat-title" : "chat-title-normal"}`}
            >
              {title}
            </span>
          </div>

        <div className="header-right">
          {!isMaximized && (
            <button
              className="instruction-toggle-mobile"
              onClick={handleInstructionToggle}
            >
              <img src={instructCloseIcon} alt="Instructions" />
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatHeader;
