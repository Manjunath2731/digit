import React, { useState } from "react";
import "./ChatbotModal.css";
import starsIcon from "../../assets/icons/stars.svg";
import disclaimerIcon from "../../assets/icons/disclaimer.svg";
import download from "../../assets/images/download.png";
import {
  baseOptions,
  initialOptions,
  zoningOptions,
} from "../../utils/helpers";

interface ChatMessageProps {
  message: {
    text: string;
    isUser: boolean;
    isAddress?: boolean;
    isOption?: boolean;
    isAddressConfirmation?: boolean;
    showPdfOption?: boolean;
    showFollowUpButtons?: boolean;
    showFeedbackUI?: boolean;
    isFollowUpMessage?: boolean; 
  };
  index: number;
  userName: string | null;
  feedbackRating: number;
  showPdfOption: boolean;
  showFollowUpOptions: boolean;
  showZoningOptions: boolean;
  pdfMessageIndices: number[];
  currentOption: string;
  reportLink: string | null;
  propertyData: any;
  selectedOptions: Set<string>;
  dayNight: string;
  followUpMessageAdded?: boolean; // Add this prop
  onOptionClick: (optionText: string) => void;
  onFeedbackClick: (rating: number) => void;
  onBackClick?: () => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  index,
  userName,
  feedbackRating,
  showPdfOption,
  showFollowUpOptions,
  showZoningOptions,
  pdfMessageIndices,
  currentOption,
  reportLink,
  propertyData,
  selectedOptions,
  dayNight,
  followUpMessageAdded = false, 
  onOptionClick,
  onFeedbackClick,
  onBackClick,
}) => {
  const [localFeedbackRating, setLocalFeedbackRating] =
    useState(feedbackRating);
  const isFollowUpMessage =
    message.isFollowUpMessage ||
    message.text.includes(
      "Below are additional questions that you could answer"
    ) || 
    message.showFollowUpButtons === true;
  const handlePdfDownload = () => {
    const pdfUrl =
      reportLink ||
      "https://parcel-details-file-bucket.s3.us-west-2.amazonaws.com/somatosensory.pdf";
    window.open(pdfUrl, "_blank");
  };
  const handleFeedbackRating = (rating: number) => {
    setLocalFeedbackRating(rating);
    onFeedbackClick(rating); 
  };

  if (message.isUser) {
    const messageClass = message.isOption
      ? "user-message option-clicked"
      : "user-message";
    return (
      <div className={messageClass}>
        <p
          dangerouslySetInnerHTML={{
            __html: message.text.replace(/\n/g, "<br/>"),
          }}
        />
      </div>
    );
  }
  const messageElement = isFollowUpMessage ? (
    <div className="follow-up-message">
      <p
        dangerouslySetInnerHTML={{
          __html: message.text.replace(/\n/g, "<br/>"),
        }}
      />
    </div>
  ) : (
    <div className="ai-outer">
      <div className="ai-message">
        <p
          dangerouslySetInnerHTML={{
            __html: message.text.replace(/\n/g, "<br/>"),
          }}
        />
      </div>
    </div>
  );

  if (message.showFeedbackUI) {
    return (
      <>
        {messageElement}
        <div
          className="feedback-container"
          style={{ padding: "10px 0", marginTop: "10px" }}
        >
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${
                  localFeedbackRating >= star ? "active" : ""
                }`}
                onClick={() => handleFeedbackRating(star)}
                style={{ cursor: "pointer" }}
              >
                {localFeedbackRating >= star ? "★" : "☆"}
              </span>
            ))}
          </div>
        </div>
      </>
    );
  }
  if (showPdfOption && message.text.includes("Here is what I found")) {
    const isMaximizedView =
      document.querySelector(".chat-conversation-container.maximized") !== null;
    return (
      <>
        <div
          style={
            isMaximizedView ? { display: "flex", flexDirection: "column" } : {}
          }
          className="ai-message-container"
        >
          {messageElement}
          <div className="pdf-download-option">
            <div className="pdf-outer pdf-outer-left">
              <button className="pdf-button" onClick={handlePdfDownload}>
                Parcel Summary Report
                <img src={download} alt="download" className="pdf-icon" />
                <div
                  style={{
                    width: "2px",
                    height: "25px",
                    backgroundColor: "#ccc",
                    margin: "0 10px",
                  }}
                ></div>
                <div className="tooltip">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: "5px",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={disclaimerIcon}
                      alt="Disclaimer"
                      className="disclaimer-icon"
                    />
                    <span>Disclaimer</span>
                  </div>
                  <span className="tooltiptext">
                    Please reach out to city staff to confirm the results
                    provided here before making any major development decisions.
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (showPdfOption && message.text.includes("Yes.")) {
    const isMaximizedView =
      document.querySelector(".chat-conversation-container.maximized") !== null;
    return (
      <>
        <div
          style={
            isMaximizedView ? { display: "flex", flexDirection: "column" } : {}
          }
          className="ai-message-container"
        >
          {messageElement}
          <div className="pdf-download-option">
            <div className="pdf-outer">
              <button className="pdf-button" onClick={handlePdfDownload}>
                Parcel Summary Report
                <img src={download} alt="download" className="pdf-icon" />
                <div
                  style={{
                    width: "2px",
                    height: "25px",
                    backgroundColor: "#ccc",
                    margin: "0 10px",
                  }}
                ></div>
                <div className="tooltip">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: "5px",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={disclaimerIcon}
                      alt="Disclaimer"
                      className="disclaimer-icon"
                    />
                    <span>Disclaimer</span>
                  </div>

                  <span className="tooltiptext">
                    Please reach out to city staff to confirm the results
                    provided here before making any major development decisions.
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
  if (showPdfOption && message.text.includes("Here is a detailed report")) {
    const isMaximizedView =
      document.querySelector(".chat-conversation-container.maximized") !== null;
    return (
      <>
        <div
          style={
            isMaximizedView ? { display: "flex", flexDirection: "column" } : {}
          }
          className="ai-message-container"
        >
          {messageElement}
          <div className="pdf-download-option">
            <div className="pdf-outer">
              <button className="pdf-button" onClick={handlePdfDownload}>
                Allowed Land Use Report
                <img src={download} alt="download" className="pdf-icon" />
                <div
                  style={{
                    width: "2px",
                    height: "25px",
                    backgroundColor: "#ccc",
                    margin: "0 10px",
                  }}
                ></div>
                <div className="tooltip">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: "5px",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={disclaimerIcon}
                      alt="Disclaimer"
                      className="disclaimer-icon"
                    />
                    <span>Disclaimer</span>
                  </div>

                  <span className="tooltiptext">
                    Please reach out to city staff to confirm the results
                    provided here before making any major development decisions.
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
  if (isFollowUpMessage && showFollowUpOptions) {
    const isMaximizedView =
      document.querySelector(".chat-conversation-container.maximized") !== null;
    let allOptions = isMaximizedView ? [] : [...baseOptions];
    if (propertyData && !isMaximizedView) {
      allOptions.push({ text: "Change address", option: "CA" });
    }
    const filteredOptions = allOptions;
    return (
      <>
        {messageElement}
        <div className="chat-options" style={{ marginTop: "10px" }}>
          {filteredOptions.map((opt, i) => (
            <button
              key={`follow-up-option-${i}`}
              className="chat-option"
              onClick={() => onOptionClick(opt.text)}
              style={
                opt.text === "Change address"
                  ? { color: "red", borderColor: "red" }
                  : {}
              }
            >
              {opt.text !== "Change address" && (
                <img
                  src={starsIcon}
                  alt="stars"
                  style={{ marginRight: "5px", width: "16px", height: "16px" }}
                />
              )}
              {opt.text}
            </button>
          ))}
        </div>
      </>
    );
  }
  if (
    message.text.includes("Hello") &&
    message.text.includes("It is my pleasure") &&
    message.showFollowUpButtons
  ) {
    const filteredInitialOptions = initialOptions.filter(
      (opt) =>
        !selectedOptions.has(opt.text) && !selectedOptions.has(opt.option)
    );

    return (
      <>
        {messageElement}
        <div className="chat-options" style={{ marginTop: "10px" }}>
          {filteredInitialOptions.map((opt, i) => (
            <button
              key={`initial-option-${i}`}
              className="chat-option"
              onClick={() => onOptionClick(opt.text)}
              style={
                opt.text === "Change address"
                  ? { color: "green", borderColor: "green" }
                  : {}
              }
            >
              {opt.text !== "Change address" && (
                <img
                  src={starsIcon}
                  alt="stars"
                  style={{ marginRight: "5px", width: "16px", height: "16px" }}
                />
              )}
              {opt.text}
            </button>
          ))}
        </div>
      </>
    );
  }
  if (
    message.text.includes(
      "The city of Mayorville has a set of zoning regulations"
    ) &&
    showZoningOptions
  ) {
    const filteredZoningOptions = zoningOptions;
    return (
      <>
        {messageElement}
        <div className="chat-options" style={{ marginTop: "10px" }}>
          {filteredZoningOptions.map((opt, i) => (
            <button
              key={`zoning-option-${i}`}
              className="chat-option"
              onClick={() => onOptionClick(opt.text)}
              style={
                opt.text === "Change address"
                  ? { color: "green", borderColor: "green" }
                  : {}
              }
            >
              {opt.text !== "Change address" && (
                <img
                  src={starsIcon}
                  alt="stars"
                  style={{ marginRight: "5px", width: "16px", height: "16px" }}
                />
              )}
              {opt.text}
            </button>
          ))}
        </div>
      </>
    );
  }
  return messageElement;
};

export default ChatMessage;