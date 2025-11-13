import React, { useState } from "react";
import "./InstructionalPanel.css";
import vector_black from "../../assets/images/Vector_black.png";
import copy from "../../assets/images/copy.png";

interface InstructionalPanelProps {
  isOpen: boolean;
  onClose?: () => void;
  isInternal?: boolean;
  isMaximized?: boolean; 
}

const InstructionalPanel: React.FC<InstructionalPanelProps> = ({
  isOpen,
  onClose,
  isInternal = false,
  isMaximized = false,
}) => {
  const [copiedText, setCopiedText] = useState<string>("");

  if (!isOpen) return null;

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(""), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedText(text);
      setTimeout(() => setCopiedText(""), 2000);
    }
  };

  const panelClass = `instructional-panel ${
    isInternal ? "internal-mode" : ""
  } ${isOpen ? "show" : ""} ${isMaximized ? "maximized-mode" : ""}`;

  const addresses = [
    "125 Old Home Pl",
    "565 Lake Montonia Rd",
    "110 King St"
  ];

  const developmentTypes = [
    "Bread & Breakfast",
    "Convention Center",
    "Medical Office",
    "Multifamily Dwelling"
  ];

  return (
    <div className={panelClass}>
      <div className="instructional-panel-content">
        <div className="instructional-header">
          <img src={vector_black} alt="help" />
          <span
            style={{ color: "black", fontSize: "20px", marginLeft: "10px" }}
          >
            Help
          </span>
          <button className="instructional-close-button" onClick={onClose}>
            x
          </button>
        </div>
        <div className="instructional-body">
          <p className="instructional-text">
            Try any of the following address when required:
          </p>

          <div className="address-examples">
            {addresses.map((address, index) => (
              <div key={index} className="address-copied">
                <p>{address}</p>
                <img
                  src={copy}
                  alt="copy"
                  style={{ 
                    cursor: "pointer", 
                    width: "20px", 
                    height: "20px",
                    opacity: copiedText === address ? 0.5 : 1
                  }}
                  onClick={() => handleCopy(address)}
                  title={copiedText === address ? "Copied!" : "Copy to clipboard"}
                />
              </div>
            ))}
          </div>
          <p className="instructional-text">
            Here are the development types that you could consider as an input:
          </p>

          <div className="question-examples">
            {developmentTypes.map((type, index) => (
              <div key={index} className="address-copied">
                <p>{type}</p>
                <img
                  src={copy}
                  alt="copy"
                  style={{ 
                    cursor: "pointer", 
                    width: "20px", 
                    height: "20px",
                    opacity: copiedText === type ? 0.5 : 1
                  }}
                  onClick={() => handleCopy(type)}
                  title={copiedText === type ? "Copied!" : "Copy to clipboard"}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionalPanel;