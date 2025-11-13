import React, { useState, useRef } from "react";
import arrowBackIcon from "../../assets/icons/arrow_back.svg";
import "./ChatbotModal.css";
import "./VoiceChat.css";
import phoneIcon from "../../assets/icons/phone.svg";
import phoneCallIcon from "../../assets/images/call.png";
import callAddIcon from "../../assets/images/add_phone.png";
import calendarIcon from "../../assets/icons/calender.svg";
import clockIcon from "../../assets/icons/clock.svg";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getCurrentDate,
  getCurrentTime,
  validateEmail,
  validatePhone,
} from "../../types";
interface VoiceChatProps {
  isVisible: boolean;
  onBackClick?: () => void;
  isMaximized?: boolean;
}

const VoiceChat: React.FC<VoiceChatProps> = ({
  isVisible,
  onBackClick,
  isMaximized = false,
}) => {
  const [callbackMode, setCallbackMode] = useState<"now" | "schedule">("now");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const [formErrors, setFormErrors] = useState({
    phone: "",
    email: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScheduleSubmitting, setIsScheduleSubmitting] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isInfoIconActive, setIsInfoIconActive] = useState(false);

  const [scheduleData, setScheduleData] = useState({
    date: getCurrentDate(),
    time: getCurrentTime(),
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "phone") {
      if (value && !validatePhone(value)) {
        setFormErrors((prev) => ({
          ...prev,
          phone: "Please enter a valid phone number",
        }));
      } else {
        setFormErrors((prev) => ({
          ...prev,
          phone: "",
        }));
      }
    } else if (name === "email") {
      if (value && !validateEmail(value)) {
        setFormErrors((prev) => ({
          ...prev,
          email: "Please enter a valid email address",
        }));
      } else {
        setFormErrors((prev) => ({
          ...prev,
          email: "",
        }));
      }
    }
  };

  const handleScheduleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setScheduleData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleCallbackModeChange = (mode: "now" | "schedule") => {
    if (callbackMode === mode && mode === "schedule") {
      setCallbackMode("now");
    } else {
      setCallbackMode(mode);
    }
  };
  const mockApiCall = (data: any): Promise<any> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: "Request processed successfully" });
      }, 3000);
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let isValid = true;
    const errors = { phone: "", email: "" };
    if (!validatePhone(formData.phone)) {
      errors.phone = "Please enter a valid phone number";
      isValid = false;
    }
    if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }
    setFormErrors(errors);
    if (isValid) {
      try {
        setIsSubmitting(true);
        const response = await mockApiCall({
          ...formData,
          callbackMode: callbackMode,
        });
        toast.success("Your callback request has been submitted successfully!");
        console.log("Form submitted:", formData, "Mode:", callbackMode);
        console.log("API response:", response);
        setFormData({
          name: "",
          phone: "",
          email: "",
        });
      } catch (error) {
        toast.error("Failed to submit your request. Please try again.");
        console.error("Submission error:", error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.log("Form has validation errors");
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsScheduleSubmitting(true);
      const response = await mockApiCall({
        ...formData,
        scheduleData,
        callbackMode: "schedule",
      });
      toast.success(
        "Your scheduled callback request has been submitted successfully!"
      );
      console.log("Schedule form submitted:", scheduleData);
      console.log("API response:", response);
      setScheduleData({
        date: getCurrentDate(),
        time: getCurrentTime(),
      });
      setCallbackMode("now");
    } catch (error) {
      toast.error(
        "Failed to submit your scheduled callback request. Please try again."
      );
      console.error("Schedule submission error:", error);
    } finally {
      setIsScheduleSubmitting(false);
    }
  };

  if (!isVisible) return null;

  const toggleTooltip = () => {
    setShowTooltip(!showTooltip);
    setIsInfoIconActive(!isInfoIconActive);
  };

  const closeTooltip = () => {
    setShowTooltip(false);
    setIsInfoIconActive(false);
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
      <div className="voice-chat-header">
        <button className="back-button" onClick={onBackClick}>
          <img src={arrowBackIcon} alt="Back" className="back-arrow" /> Back
        </button>
      </div>
      <div
        className={`${
          isMaximized ? "voice-chat-container" : "voice-chat-container-normal"
        }`}
      >
        <div
          style={{ marginBottom: "10px", paddingTop: 0 }}
          className="welcome-container"
        >
          <h3 className="chat-title">Speak with city's AI Companion</h3>
        </div>
        <div className="voice-options-container">
          <div className="make-call-section">
            <div className="phone-button-container">
              <div className={`${isMaximized ? "phone-outer" : "phone-inner"}`}>
                <div className="phone-icon-circle multi-pulse">
                  <img src={phoneIcon} alt="Phone" className="phone-icon" />
                </div>
              </div>
              <button className="call-now-button">Call Now</button>
              <div className="phone-number">917-768-5767</div>
            </div>
          </div>
          <div
            className={`callback-section ${
              isMaximized ? "maximized-layout" : ""
            }`}
          >
            {isMaximized ? (
              <div className="callback-maximized-container">
                <div className="callback-section1">
                  <div
                    className={`${
                      isMaximized
                        ? "callback-receive"
                        : "callback-receive-normal"
                    }`}
                  >
                    <h3>Receive a callback</h3>
                    <div className="callbacks-button-wrapper">
                      <div
                        className={`chatbot-callbacks-popup tooltip-top ${
                          showTooltip
                            ? isMaximized
                              ? "show-tooltip"
                              : "show-tooltip-normal"
                            : ""
                        }`}
                      >
                        <p>
                          Your privacy is our top priority. We do not store,
                          share, or sell your personal information. Any data you
                          provide is used solely to generate personalized
                          responses and improve your experience with this tool.
                          <br />
                          If you choose to receive reports or updates via email,
                          your contact information will be used only for that
                          purpose and never shared with third parties. We are
                          committed to keeping your information secure and
                          confidential at all times.
                        </p>
                        <button
                          className="control-button closemodal-button"
                          onClick={closeTooltip}
                          title="Close disclaimer"
                        >
                          ×
                        </button>
                      </div>
                      <button
                        className={`disclaimer-button ${
                          isInfoIconActive ? "active-background" : ""
                        } ${isMaximized ? "" : "privacy"}`}
                        onClick={toggleTooltip}
                      >
                        <span
                          className="info-icon"
                          style={{
                            backgroundColor: isInfoIconActive ? "white" : "",
                            border: isInfoIconActive ? "1px solid #6138f5" : "",
                            borderRadius: isInfoIconActive ? "4px" : "",
                            transition: "all 0.2s ease",
                            marginLeft: "10px",
                          }}
                        ></span>
                        Privacy Disclaimer
                      </button>
                    </div>
                  </div>
                  <p className="callback-instruction">
                    Please provide all the following details to receive a
                    callback.
                  </p>
                  <form style={{ width: "100%" }} onSubmit={handleSubmit}>
                    <div style={{ display: "flex", gap: "15px" }}>
                      <div className="form-group">
                        <label htmlFor="name">Your Name*</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="phone">Your Phone Number*</label>
                        <div className="phone_number">
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              name="area"
                              placeholder="303"
                              maxLength={3}
                              className="w-12 px-2 py-3 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <input
                            type="text"
                            name="exchange"
                            placeholder="555"
                            maxLength={3}
                            className="w-16 px-2 py-3 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <input
                            type="text"
                            name="number"
                            placeholder="8888"
                            maxLength={4}
                            className="w-20 px-2 py-3 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        {formErrors.phone && (
                          <div className="error-message">
                            {formErrors.phone}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Your Email Address*</label>
                      <input
                        style={{ display: "flex", width: "48%" }}
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className={formErrors.email ? "input-error" : ""}
                      />
                      {formErrors.email && (
                        <div className="error-message">{formErrors.email}</div>
                      )}
                    </div>
                    <div className="callback-privacy">
                      <div className="callback-outer">
                        <div className="callback-options">
                          <button
                            type="submit"
                            className={`callback-option-button ${
                              callbackMode === "now" ? "active" : ""
                            }`}
                            onClick={() => handleCallbackModeChange("now")}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <div className="spinner"></div>
                                <span className="processing-text">
                                  Processing...
                                </span>
                              </>
                            ) : (
                              <>
                                <img
                                  src={phoneCallIcon}
                                  alt="Phone"
                                  className="phone-icon1"
                                />
                                <span
                                  style={{ color: "#6138f5", fontSize: "14px" }}
                                >
                                  Get a callback now
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
                <div className="callback-separator"></div>
                <div className="callback-section2">
                  <h3>Schedule a callback</h3>
                  <p className="callback-instruction">
                    Please provide the following details to receive a callback.
                  </p>
                  <form
                    style={{ width: "100%", marginTop: "10px" }}
                    onSubmit={handleScheduleSubmit}
                  >
                    <div style={{ display: "flex", gap: "15px" }}>
                      <div className="form-group">
                        <label htmlFor="date">Date</label>
                        <div style={{ position: "relative" }}>
                          <input
                            type="date"
                            id="date"
                            name="date"
                            value={scheduleData.date}
                            onChange={handleScheduleInputChange}
                            required
                            placeholder="Select date"
                            style={{
                              paddingRight: "35px",
                              colorScheme: "light",
                              appearance: "textfield",
                            }}
                            onClick={(e) => {
                              const input = e.target as HTMLInputElement;
                              input.showPicker();
                            }}
                          />
                          <img
                            src={calendarIcon}
                            alt="Calendar"
                            style={{
                              position: "absolute",
                              right: "10px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              width: "20px",
                              height: "20px",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              const dateInput = document.getElementById(
                                "date"
                              ) as HTMLInputElement;
                              dateInput.showPicker();
                            }}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="time">Time</label>
                        <div style={{ position: "relative" }}>
                          <input
                            type="time"
                            id="time"
                            name="time"
                            value={scheduleData.time}
                            onChange={handleScheduleInputChange}
                            required
                            placeholder="Select time"
                            style={{
                              paddingRight: "35px",
                              colorScheme: "light",
                              appearance: "textfield",
                            }}
                            onClick={(e) => {
                              const input = e.target as HTMLInputElement;
                              input.showPicker();
                            }}
                          />
                          <img
                            src={clockIcon}
                            alt="Clock"
                            style={{
                              position: "absolute",
                              right: "10px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              width: "20px",
                              height: "20px",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              const timeInput = document.getElementById(
                                "time"
                              ) as HTMLInputElement;
                              timeInput.showPicker();
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="callback-outer">
                      <div
                        style={{ marginTop: "0" }}
                        className="callback-options"
                      >
                        <button
                          type="submit"
                          className={`callback-option-button`}
                          disabled={isScheduleSubmitting}
                        >
                          {isScheduleSubmitting ? (
                            <>
                              <div className="spinner"></div>
                              <span className="processing-text">
                                Processing...
                              </span>
                            </>
                          ) : (
                            <>
                              <img
                                src={callAddIcon}
                                alt="Phone"
                                className="phone-icon1"
                              />
                              <span
                                style={{ color: "#6138f5", fontSize: "14px" }}
                              >
                                Schedule callback
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <>
                <div className="callback-section1">
                  <div
                    className={`${
                      isMaximized
                        ? "callback-receive"
                        : "callback-receive-normal"
                    }`}
                  >
                    <h3>Receive a callback</h3>
                    <div className="callbacks-button-wrapper">
                      <div
                        className={`chatbot-callbacks-popup tooltip-top ${
                          showTooltip
                            ? isMaximized
                              ? "show-tooltip"
                              : "show-tooltip-normal"
                            : ""
                        }`}
                      >
                        <p>
                          Your privacy is our top priority. We do not store,
                          share, or sell your personal information. Any data you
                          provide is used solely to generate personalized
                          responses and improve your experience with this tool.
                          <br />
                          If you choose to receive reports or updates via email,
                          your contact information will be used only for that
                          purpose and never shared with third parties. We are
                          committed to keeping your information secure and
                          confidential at all times.
                        </p>
                        <button
                          className="control-button closemodal-button"
                          onClick={closeTooltip}
                          title="Close disclaimer"
                        >
                          ×
                        </button>
                      </div>
                      <button
                        className={`disclaimer-button ${
                          isInfoIconActive ? "active-background" : ""
                        } ${isMaximized ? "" : "privacy"}`}
                        onClick={toggleTooltip}
                      >
                        <span
                          className="info-icon"
                          style={{
                            backgroundColor: isInfoIconActive ? "white" : "",
                            border: isInfoIconActive ? "1px solid #6138f5" : "",
                            borderRadius: isInfoIconActive ? "4px" : "",
                            transition: "all 0.2s ease",
                          }}
                        ></span>
                        Privacy Disclaimer
                      </button>
                    </div>
                  </div>

                  <p className="callback-instruction">
                    Please provide all the following details to receive a
                    callback.
                  </p>

                  <form style={{ width: "100%" }} onSubmit={handleSubmit}>
                    <div style={{ display: "flex", gap: "15px" }}>
                      <div className="form-group">
                        <label htmlFor="name">Your Name*</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="phone">Your Phone Number*</label>
                        <div className="phone_number">
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              name="area"
                              placeholder="303"
                              maxLength={3}
                              className="w-12 px-2 py-3 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <input
                            type="text"
                            name="exchange"
                            placeholder="555"
                            maxLength={3}
                            className="w-16 px-2 py-3 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <input
                            type="text"
                            name="number"
                            placeholder="8888"
                            maxLength={4}
                            className="w-20 px-2 py-3 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        {formErrors.phone && (
                          <div className="error-message">
                            {formErrors.phone}
                          </div>
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "15px",
                        alignItems: "flex-end",
                      }}
                    >
                      <div className="form-group">
                        <label htmlFor="email">Your Email Address*</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className={formErrors.email ? "input-error" : ""}
                        />
                        {formErrors.email && (
                          <div className="error-message">
                            {formErrors.email}
                          </div>
                        )}
                      </div>
                      <div className="form-group">
                        <div className="callback-inner">
                          <div
                            className={`${
                              isMaximized
                                ? "callback-outer"
                                : "callback-outer-normal"
                            }`}
                          >
                            <div className="callback-options">
                              <button
                                type="submit"
                                className={`callback-option-button ${
                                  callbackMode === "now" ? "active" : ""
                                }`}
                                onClick={() => handleCallbackModeChange("now")}
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? (
                                  <>
                                    <div className="spinner"></div>
                                    <span className="processing-text">
                                      Processing...
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <img
                                      src={phoneCallIcon}
                                      alt="Phone"
                                      className="phone-icon2"
                                    />
                                    <span
                                      style={{
                                        color: "#6138f5",
                                        fontSize: "14px",
                                      }}
                                    >
                                      Get a callback now
                                    </span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
                <div
                  className={`callback-option-button ${
                    callbackMode === "schedule" ? "active" : ""
                  }`}
                  onClick={() => handleCallbackModeChange("schedule")}
                  style={{
                    width: "41%",
                    marginTop: "25px",
                    backgroundColor: "transparent",
                    border: "none",
                    padding: 0,
                    gap: "10px",
                    justifyContent: "flex-start",
                    fontSize: "14px",
                    color: "#26272C",
                  }}
                >
                  <span
                    className={`purple-schedule-chevron ${
                      callbackMode === "schedule" ? "rotate" : ""
                    }`}
                  ></span>
                  Schedule callback
                </div>
                {callbackMode === "schedule" && (
                  <div className="callback-section2">
                    <h3> Schedule callback</h3>
                    <p className="callback-instruction">
                      Please provide all the following details to receive a
                      callback.
                    </p>

                    <form
                      style={{ width: "100%", marginTop: "10px" }}
                      onSubmit={handleScheduleSubmit}
                    >
                      <div style={{ display: "flex", gap: "15px" }}>
                        <div className="form-group">
                          <label htmlFor="date">Date</label>
                          <div style={{ position: "relative" }}>
                            <input
                              type="date"
                              id="date"
                              name="date"
                              value={scheduleData.date}
                              onChange={handleScheduleInputChange}
                              required
                              placeholder="Select date"
                              style={{
                                paddingRight: "35px",
                                colorScheme: "light",
                                appearance: "textfield",
                              }}
                              onClick={(e) => {
                                const input = e.target as HTMLInputElement;
                                input.showPicker();
                              }}
                            />
                            <img
                              src={calendarIcon}
                              alt="Calendar"
                              style={{
                                position: "absolute",
                                right: "10px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                width: "20px",
                                height: "20px",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                const dateInput = document.getElementById(
                                  "date"
                                ) as HTMLInputElement;
                                dateInput.showPicker();
                              }}
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label htmlFor="time">Time</label>
                          <div style={{ position: "relative" }}>
                            <input
                              type="time"
                              id="time"
                              name="time"
                              value={scheduleData.time}
                              onChange={handleScheduleInputChange}
                              required
                              placeholder="Select time"
                              style={{
                                paddingRight: "35px",
                                colorScheme: "light",
                                appearance: "textfield",
                              }}
                              onClick={(e) => {
                                const input = e.target as HTMLInputElement;
                                input.showPicker();
                              }}
                            />
                            <img
                              src={clockIcon}
                              alt="Clock"
                              style={{
                                position: "absolute",
                                right: "10px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                width: "20px",
                                height: "20px",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                const timeInput = document.getElementById(
                                  "time"
                                ) as HTMLInputElement;
                                timeInput.showPicker();
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="callback-outer">
                        <div
                          style={{ marginTop: "0" }}
                          className="callback-options"
                        >
                          <button
                            type="submit"
                            className={`callback-option-button`}
                            disabled={isScheduleSubmitting}
                          >
                            {isScheduleSubmitting ? (
                              <>
                                <div className="spinner"></div>
                                <span className="processing-text">
                                  Processing...
                                </span>
                              </>
                            ) : (
                              <>
                                <img
                                  src={callAddIcon}
                                  alt="Phone"
                                  className="phone-icon"
                                />
                                <span
                                  style={{ color: "#6138f5", fontSize: "14px" }}
                                >
                                  Schedule callback
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default VoiceChat;
