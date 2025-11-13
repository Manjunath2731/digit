import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import viewpro from "../../assets/images/Logo-ViewPro.png";
import bigCross from "../../assets/images/big-cross.png";
import info from "../../assets/icons/disclaimer.svg";
import "./ChatbotModal.css";
import "./AnimationOverrides.css";
import "../../App.css";
import "./ChatFooter.css";

interface ChatModalFooterProps {
  textSize: number;
  textSizeLevels: number[];
  onTextSizeIncrease: () => void;
  onTextSizeDecrease: () => void;
  isMaximized?: boolean;
}

const ChatModalFooter: React.FC<ChatModalFooterProps> = ({
  textSize,
  textSizeLevels,
  onTextSizeIncrease,
  onTextSizeDecrease,
  isMaximized = false,
}) => {
  const [showDisclaimerInfo, setShowDisclaimerInfo] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isInfoIconActive, setIsInfoIconActive] = useState(false);

  const toggleDisclaimerInfo = () => {
    setShowDisclaimerInfo(!showDisclaimerInfo);
  };
  const toggleTooltip = () => {
    setShowTooltip(!showTooltip);
    setIsInfoIconActive(!isInfoIconActive);
  };
  const closeTooltip = () => {
    setShowTooltip(false);
    setIsInfoIconActive(false);
  };
  const currentIndex = textSizeLevels.indexOf(textSize);
  const isMinSize = currentIndex <= 0;
  const isMaxSize = currentIndex >= textSizeLevels.length - 1;

  return (
    <div
      className={`chatbot-bottom-footer ${
        isMaximized ? "maximized" : "normal"
      }`}
    >
      {/* Disclaimer Section */}
      <div className="footer-left">
        <div className="disclaimer-button-wrapper">
          <div
            className={`chatbot-disclaimer-popup tooltip-top ${
              showTooltip ? "show-tooltip" : ""
            }`}
          >   <button
              className="control-button"
              onClick={closeTooltip}
              title="Close disclaimer"
            >
              <div className="icon-base">
                <img src={bigCross} alt="Close"/>
              </div>
            </button>
            <p>
              This AI tool is intended to provide helpful and accurate
              information based on available data. However, it may not reflect
              the most current regulations or site-specific considerations. We
              strongly recommend consulting with city staff or relevant
              authorities before making any decisions regarding your property.
            </p>
         
          </div>
          <button
            className={`disclaimer-button ${
              isInfoIconActive ? "active-background" : ""
            }`}
            onClick={toggleTooltip}
          >
            <div className={`icon-base ${isInfoIconActive ? "active" : ""}`}>
              <img src={info} alt="disclaimer icon" />
            </div>
            AI Use Disclaimer
          </button>
        </div>
      </div>
      <div className="footer-center">
        <span className="footer-text">Powered by</span>
        <img src={viewpro} alt="viewpro" className="viewpro-image" />
      </div>
      <div className="footer-right">
        <div className="language-selector" style={{ cursor: "pointer" }}>
          <span className="flag-icon">🇺🇸</span>
          <span className="language-text">EN</span>
          <ChevronDown
            size={16}
            style={{ color: "#6138f5", cursor: "pointer" }}
          />
        </div>
        <div className="text-size-controls">
          <div
            className={`icon-base ${
              textSize === textSizeLevels[0] ? "disabled" : ""
            }`}
          >
            <button
              className="text-size-button text-size-decrease-btn"
              onClick={onTextSizeDecrease}
              disabled={textSize === textSizeLevels[0]}
              title="Decrease Text Size (Ctrl + -)"
            />
          </div>
          <div className="icon-base">
            <button
              className="text-size-button text-size-increase-btn"
              onClick={onTextSizeIncrease}
              disabled={textSize === textSizeLevels[textSizeLevels.length - 1]}
              title="Increase Text Size (Ctrl + +)"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModalFooter;
