// import React, { useState, useEffect, useCallback } from "react";
// import "./ChatbotModal.css";
// import "./AnimationOverrides.css";
// import "./ChatHeader.css";
// import chatbotIcon from "../../assets/icons/chatbot.svg";
// import ChatConversation from "./ChatConversation";
// import MaximizedChatConversation from "./MaximizedChatConversation";
// import VoiceChat from "./VoiceChat";
// import instructionIcon from "../../assets/icons/instruct_btn.svg";
// import maximizeIcon from "../../assets/images/Icon.png";
// import InstructionalPanel from "./InstructionalPanel";
// import ChatModalFooter from "./ChatModalFooter";
// import { useChatState } from "./ChatState";
// import { baseOptions } from "../../utils/helpers";
// import { useAppDispatch } from "../../store";
// import { clearChatData } from "../../store/slices/chatSlice";
// import cross from "../../assets/images/cross.png";

// interface ChatbotModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onChatClick?: () => void;
//   onVoiceClick?: () => void;
//   onMapClick?: () => void;
// }

// const ChatbotModal: React.FC<ChatbotModalProps> = ({
//   isOpen,
//   onClose,
//   onChatClick,
//   onVoiceClick,
//   onMapClick,
// }) => {
//   const dispatch = useAppDispatch();
//   const [showDisclaimerInfo, setShowDisclaimerInfo] = useState(false);
//   const [showChatInterface, setShowChatInterface] = useState(false);
//   const [showVoiceInterface, setShowVoiceInterface] = useState(false);
//   const [showInstructionalPanel, setShowInstructionalPanel] = useState(false);
//   const [isAiTyping, setIsAiTyping] = useState<boolean>(false);
//   const [showAiTypingClass, setShowAiTypingClass] = useState<boolean>(false);
//   const [isMinimized, setIsMinimized] = useState(false);
//   const [isMaximized, setIsMaximized] = useState(true);
//   const sharedChatState = useChatState();
//   const [textSize, setTextSize] = useState(100);
//   const [showTextSizeIndicator, setShowTextSizeIndicator] = useState(false);
//   const textSizeLevels = [100, 110, 125, 150];
//   const toggleDisclaimerInfo = () => {
//     setShowDisclaimerInfo(!showDisclaimerInfo);
//   };
//   const handleChatClick = () => {
//     if (showChatInterface) {
//       setShowChatInterface(false);
//     } else {
//       setShowChatInterface(true);
//       if (showVoiceInterface) setShowVoiceInterface(false);
//       sharedChatState.resetChat();
//     }
//   };

//   const handleVoiceClick = () => {
//     setShowVoiceInterface(!showVoiceInterface);
//     if (showChatInterface) setShowChatInterface(false);
//   };

//   const handleMaximize = () => {
//     if (showChatInterface) {
//       const predefinedOptionTexts = baseOptions.map((option) => option.text);
//       const currentMessages = [...sharedChatState.messages];
//       const filteredMessages = currentMessages.filter((msg) => {
//         if (!msg.isUser && predefinedOptionTexts.includes(msg.text)) {
//           return false;
//         }
//         if (msg.isOption && predefinedOptionTexts.includes(msg.text)) {
//           const optionCount = currentMessages.filter(
//             (m) => m.text === msg.text && m.isOption
//           ).length;
//           if (optionCount > 1) {
//             const firstIndex = currentMessages.findIndex(
//               (m) => m.text === msg.text && m.isOption
//             );
//             const currentIndex = currentMessages.indexOf(msg);
//             return firstIndex === currentIndex;
//           }
//         }
//         return true;
//       });
//       sharedChatState.resetChat();
//       setTimeout(() => {
//         sharedChatState.setMessages(filteredMessages);
//         if (currentMessages.length > 0) {
//           sharedChatState.setShowFollowUpOptions(true);
//         }
//       }, 50);
//     }
//     setIsMaximized(!isMaximized);
//     setIsMinimized(false);
//   };

//   const handleRestore = () => {
//     setIsMinimized(false);
//     setIsMaximized(false);
//   };

//   const resetChat = () => {
//     sharedChatState.resetChat();
//     dispatch(clearChatData());
//   };

//   const handleClose = () => {
//     resetChat();
//     setShowChatInterface(false);
//     setShowVoiceInterface(false);
//     setIsMaximized(true);
//     setIsMinimized(false);
//     setShowInstructionalPanel(false);
//     setIsAiTyping(false);
//     onClose();
//   };

//   const showTextSizeIndicatorBriefly = useCallback(() => {
//     setShowTextSizeIndicator(true);
//     setTimeout(() => {
//       setShowTextSizeIndicator(false);
//     }, 1500);
//   }, []);
//   const handleTextSizeIncrease = useCallback(() => {
//     setTextSize((prevTextSize) => {
//       const currentIndex = textSizeLevels.indexOf(prevTextSize);
//       if (currentIndex < textSizeLevels.length - 1) {
//         const newSize = textSizeLevels[currentIndex + 1];
//         showTextSizeIndicatorBriefly();
//         return newSize;
//       }
//       return prevTextSize;
//     });
//   }, [textSizeLevels, showTextSizeIndicatorBriefly]);

//   const handleTextSizeDecrease = useCallback(() => {
//     setTextSize((prevTextSize) => {
//       const currentIndex = textSizeLevels.indexOf(prevTextSize);
//       if (currentIndex > 0) {
//         const newSize = textSizeLevels[currentIndex - 1];
//         showTextSizeIndicatorBriefly();
//         return newSize;
//       }
//       return prevTextSize;
//     });
//   }, [textSizeLevels, showTextSizeIndicatorBriefly]);

//   const handleTextSizeReset = useCallback(() => {
//     setTextSize(100);
//     showTextSizeIndicatorBriefly();
//   }, [showTextSizeIndicatorBriefly]);

//   const handleTextSizeClose = useCallback(() => {
//     onClose();
//   }, [onClose]);
//   useEffect(() => {
//     const handleKeyDown = (event: KeyboardEvent) => {
//       if (!isOpen) return;

//       if (event.ctrlKey || event.metaKey) {
//         switch (event.key) {
//           case "=":
//           case "+":
//             event.preventDefault();
//             handleTextSizeIncrease();
//             break;
//           case "-":
//             event.preventDefault();
//             handleTextSizeDecrease();
//             break;
//           case "0":
//             event.preventDefault();
//             handleTextSizeReset();
//             break;
//         }
//       }

//       if (event.key === "Escape") {
//         event.preventDefault();
//         handleTextSizeClose();
//       }
//     };

//     if (isOpen) {
//       document.addEventListener("keydown", handleKeyDown);
//     }

//     return () => {
//       document.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [
//     isOpen,
//     handleTextSizeIncrease,
//     handleTextSizeDecrease,
//     handleTextSizeReset,
//     handleTextSizeClose,
//   ]);

//   useEffect(() => {
//     if (sharedChatState) {
//       setIsAiTyping(sharedChatState.isTyping);
//       let typingTimeout: NodeJS.Timeout;
//       if (sharedChatState.isTyping) {
//         typingTimeout = setTimeout(() => {
//           setShowAiTypingClass(true);
//         }, 300);
//       } else {
//         setShowAiTypingClass(false);
//       }
//       return () => {
//         if (typingTimeout) clearTimeout(typingTimeout);
//       };
//     }
//   }, [sharedChatState]);

//   useEffect(() => {
//     if (!isOpen) {
//       setShowChatInterface(false);
//       setShowVoiceInterface(false);
//       setShowInstructionalPanel(false);
//       setIsMinimized(false);
//       setIsMaximized(false);
//       setTextSize(100);
//       setShowTextSizeIndicator(false);
//     }
//   }, [isOpen]);

//   useEffect(() => {
//     let openTimer: NodeJS.Timeout;
//     let closeTimer: NodeJS.Timeout;
//     if (showChatInterface && !isMinimized) {
//       if (!isMaximized) {
//         openTimer = setTimeout(() => {
//           setShowInstructionalPanel(true);
//           closeTimer = setTimeout(() => {
//             setShowInstructionalPanel(false);
//           }, 10000);
//         }, 3000);
//       } else {
//         setShowInstructionalPanel(false);
//       }
//     } else {
//       setShowInstructionalPanel(false);
//     }
//     const handleToggleInstructionalPanel = () => {
//       if (!isMaximized) {
//         setShowInstructionalPanel((prevState) => !prevState);
//       }
//     };
//     document.addEventListener(
//       "toggleInstructionalPanel",
//       handleToggleInstructionalPanel
//     );
//     return () => {
//       clearTimeout(openTimer);
//       clearTimeout(closeTimer);
//       document.removeEventListener(
//         "toggleInstructionalPanel",
//         handleToggleInstructionalPanel
//       );
//     };
//   }, [showChatInterface, isMinimized, isMaximized]);

//   if (!isOpen) return null;
//   if (isMinimized) {
//     return (
//       <div className="chatbot-minimized-container">
//         <button className="chatbot-minimized-icon" onClick={handleRestore}>
//           <img src={chatbotIcon} alt="Restore Koby AI" />
//           <div className="minimized-pulse"></div>
//         </button>
//       </div>
//     );
//   }
//   const getTextSizeClass = () => {
//     return `text-size-${textSize}`;
//   };
//   const shouldShowFooter = !showChatInterface;
//   return (
//     <div className={`chatbot-modal-overlay ${isMaximized ? "maximized" : ""}`}>
//         {!isMaximized && (
//         <InstructionalPanel
//           isOpen={showInstructionalPanel}
//           onClose={() => setShowInstructionalPanel(false)}
//         />
//       )}
//       {!showInstructionalPanel && !isMaximized && (
//         <button
//           className="instruction-toggle-button desktop-only"
//           onClick={() => setShowInstructionalPanel(true)}
//         >
//           <img
//             style={{ height: "44px" }}
//             src={instructionIcon}
//             alt="Instructional Panel"
//           />
//         </button>
//       )}
//       <div
//         className={`text-size-indicator ${showTextSizeIndicator ? "show" : ""}`}
//       >
//         Text: {textSize}%
//       </div>

//       <div
//         className={`chatbot-modal ${showAiTypingClass ? "ai-typing" : ""} ${
//           isMaximized ? "maximized-modal" : ""
//         } ${getTextSizeClass()}`}
//         data-interface={
//           showChatInterface ? "chat" : showVoiceInterface ? "voice" : "welcome"
//         }
//       >
//         <div className="modal-controls">
//           <button
//             className="control-button maximize-button"
//             onClick={handleMaximize}
//             title={isMaximized ? "Restore" : "Maximize"}
//           >  <div className="maximize-base">
//             <img src={maximizeIcon} alt="Maximize" className="maximize-icon" />
//               </div>
//           </button>
//           <button
//             className="control-button closemodal-button"
//             onClick={handleClose}
//             title="Close and reset chat"
//           >
//             <div className="maximize-base">
//                 <img src={cross} alt="Close"/>
//               </div>
//           </button>
//         </div>

//         <div className="chatbot-modal-content">
//           <div className="main-content">
//             {showChatInterface ? (
//               isMaximized ? (
//                 <MaximizedChatConversation
//                   isVisible={showChatInterface}
//                   onBackClick={handleChatClick}
//                   onTypingStateChange={setIsAiTyping}
//                    isMaximized={isMaximized}
//                   showInstructionalPanel={showInstructionalPanel}
//                   onToggleInstructionalPanel={() =>
//                     setShowInstructionalPanel(!showInstructionalPanel)
//                   }
//                   chatState={sharedChatState}
//                   textSize={textSize}
//                   onResetChat={resetChat}
//                 />
//               ) : (
//                 <ChatConversation
//                   isVisible={showChatInterface}
//                   onBackClick={handleChatClick}
//                   onTypingStateChange={setIsAiTyping}
//                   isMaximized={isMaximized}
//                   showInstructionalPanel={showInstructionalPanel}
//                   onToggleInstructionalPanel={() =>
//                     setShowInstructionalPanel(!showInstructionalPanel)
//                   }
//                   chatState={sharedChatState}
//                   textSize={textSize}
//                   onResetChat={resetChat}
//                 />
//               )
//             ) : showVoiceInterface ? (
//               <VoiceChat
//                 isVisible={showVoiceInterface}
//                 onBackClick={handleVoiceClick}
//                 isMaximized={isMaximized}
//               />
//             ) : (
//               <>
//                 <div className={`${
//                     isMaximized
//                       ? "chatbot-modal-avatar-container"
//                       : "chatbot-modal-avatar-container-normal"
//                   }`}>
//                   <div className="chatbot-modal-avatar">
//                     <img
//                       src={chatbotIcon}
//                       alt="Koby AI Chatbot"
//                       className="breathing"
//                     />
//                   </div>
//                 </div>
//                 <h2 style={{ fontSize: "26px" }}>
//                   <b >Hi, I'm Koby</b>
//                 </h2>
//                 <h3>City of Mayorville's AI Companion</h3>
//                 <p className={`${
//                     isMaximized
//                       ? "chatbot-description"
//                       : "chatbot-description-normal"
//                   }`}>
//                   I can help answer questions around Planning, Zoning, Land Use,
//                   and potential Development.
//                 </p>

//                 <div className="chatbot-options">
//                   <div className="option-button" onClick={handleVoiceClick}>
//                     <div className="option-outer">
//                       <div className="option-icon speak-icon"></div>
//                     </div>
//                     <span style={{ color: "#6138f5", fontSize: "14px" }}>
//                       <strong
//                         style={{fontSize: "18px" }}
//                       >
//                         Speak
//                       </strong>{" "}
//                       <br />
//                       with AI Companion{" "}
//                     </span>
//                   </div>

//                   <div className="option-button" onClick={handleChatClick}>
//                     <div className="option-outer">
//                       <div className="option-icon chat-icon"></div>
//                     </div>
//                     <span style={{ color: "#6138f5", fontSize: "14px" }}>
//                       {showChatInterface ? (
//                         "Hide chat"
//                       ) : (
//                         <strong
//                           style={{fontSize: "18px" }}
//                         >
//                           Chat
//                         </strong>
//                       )}{" "}
//                       <br />
//                       with AI Companion
//                     </span>
//                   </div>
//                 </div>
//                 <div
//                   className={`chatbotmodal-alternative ${
//                     showDisclaimerInfo ? "disclaimer-open" : ""
//                   } ${
//                     isMaximized
//                       ? "chatbotmodal-alternative"
//                       : "chatbotmodal-inner"
//                   }`}
//                 >
//                   <p>
//                     Alternatively, you may also check out the city's interactive
//                     GIS map
//                   </p>
//                   <div className="map-container">
//                     <div
//                       className={`${isMaximized ? "map-outer" : "map-inner"}`}
//                     >
//                       <button className="map-button" onClick={onMapClick}>
//                         <span className="map-icon"></span>
//                         <span style={{ color: "#6138f5", fontSize: "14px" }}>
//                           {" "}
//                           Open interactive map
//                         </span>
//                         <span className="external-link-icon"></span>
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>
//             <ChatModalFooter
//               textSize={textSize}
//               textSizeLevels={textSizeLevels}
//               onTextSizeIncrease={handleTextSizeIncrease}
//               onTextSizeDecrease={handleTextSizeDecrease}
//               isMaximized={isMaximized}
//             />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatbotModal;

import React, { useState, useEffect, useCallback } from "react";
import "./ChatbotModal.css";
import "./AnimationOverrides.css";
import "./ChatHeader.css";
import chatbotIcon from "../../assets/icons/chatbot.svg";
import ChatConversation from "./ChatConversation";
import MaximizedChatConversation from "./MaximizedChatConversation";
import VoiceChat from "./VoiceChat";
import instructionIcon from "../../assets/icons/instruct_btn.svg";
import maximizeIcon from "../../assets/images/Icon.png";
import InstructionalPanel from "./InstructionalPanel";
import ChatModalFooter from "./ChatModalFooter";
import { useChatState } from "./ChatState";
import { baseOptions } from "../../utils/helpers";
import { useAppDispatch } from "../../store";
import { clearChatData } from "../../store/slices/chatSlice";
import cross from "../../assets/images/big-cross.png";

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChatClick?: () => void;
  onVoiceClick?: () => void;
  onMapClick?: () => void;
}

const ChatbotModal: React.FC<ChatbotModalProps> = ({
  isOpen,
  onClose,
  onChatClick,
  onVoiceClick,
  onMapClick,
}) => {
  const dispatch = useAppDispatch();
  const [showDisclaimerInfo, setShowDisclaimerInfo] = useState(false);
  const [showChatInterface, setShowChatInterface] = useState(false);
  const [showVoiceInterface, setShowVoiceInterface] = useState(false);
  const [showInstructionalPanel, setShowInstructionalPanel] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);
  const [showAiTypingClass, setShowAiTypingClass] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(true);
  const sharedChatState = useChatState();
  const [textSize, setTextSize] = useState(100);
  const [showTextSizeIndicator, setShowTextSizeIndicator] = useState(false);
  const textSizeLevels = [100, 110, 125, 150];

  const toggleDisclaimerInfo = () => {
    setShowDisclaimerInfo(!showDisclaimerInfo);
  };

  const handleChatClick = () => {
    if (showChatInterface) {
      setShowChatInterface(false);
    } else {
      setShowChatInterface(true);
      if (showVoiceInterface) setShowVoiceInterface(false);
      sharedChatState.resetChat();
    }
  };

  const handleVoiceClick = () => {
    setShowVoiceInterface(!showVoiceInterface);
    if (showChatInterface) setShowChatInterface(false);
  };

  const handleMaximize = () => {
    if (showChatInterface) {
      const predefinedOptionTexts = baseOptions.map((option) => option.text);
      const currentMessages = [...sharedChatState.messages];
      const filteredMessages = currentMessages.filter((msg) => {
        if (!msg.isUser && predefinedOptionTexts.includes(msg.text)) {
          return false;
        }
        if (msg.isOption && predefinedOptionTexts.includes(msg.text)) {
          const optionCount = currentMessages.filter(
            (m) => m.text === msg.text && m.isOption
          ).length;
          if (optionCount > 1) {
            const firstIndex = currentMessages.findIndex(
              (m) => m.text === msg.text && m.isOption
            );
            const currentIndex = currentMessages.indexOf(msg);
            return firstIndex === currentIndex;
          }
        }
        return true;
      });
      sharedChatState.resetChat();
      setTimeout(() => {
        sharedChatState.setMessages(filteredMessages);
        if (currentMessages.length > 0) {
          sharedChatState.setShowFollowUpOptions(true);
        }
      }, 50);
    }
    setIsMaximized(!isMaximized);
    setIsMinimized(false);
  };

  const handleRestore = () => {
    setIsMinimized(false);
    setIsMaximized(false);
  };

  const resetChat = () => {
    sharedChatState.resetChat();
    dispatch(clearChatData());
  };

  const handleClose = () => {
    resetChat();
    setShowChatInterface(false);
    setShowVoiceInterface(false);
    setIsMaximized(true);
    setIsMinimized(false);
    setShowInstructionalPanel(false);
    setIsAiTyping(false);
    onClose();
  };

  const showTextSizeIndicatorBriefly = useCallback(() => {
    setShowTextSizeIndicator(true);
    setTimeout(() => {
      setShowTextSizeIndicator(false);
    }, 1500);
  }, []);

  const handleTextSizeIncrease = useCallback(() => {
    setTextSize((prevTextSize) => {
      const currentIndex = textSizeLevels.indexOf(prevTextSize);
      if (currentIndex < textSizeLevels.length - 1) {
        const newSize = textSizeLevels[currentIndex + 1];
        showTextSizeIndicatorBriefly();
        return newSize;
      }
      return prevTextSize;
    });
  }, [textSizeLevels, showTextSizeIndicatorBriefly]);

  const handleTextSizeDecrease = useCallback(() => {
    setTextSize((prevTextSize) => {
      const currentIndex = textSizeLevels.indexOf(prevTextSize);
      if (currentIndex > 0) {
        const newSize = textSizeLevels[currentIndex - 1];
        showTextSizeIndicatorBriefly();
        return newSize;
      }
      return prevTextSize;
    });
  }, [textSizeLevels, showTextSizeIndicatorBriefly]);

  const handleTextSizeReset = useCallback(() => {
    setTextSize(100);
    showTextSizeIndicatorBriefly();
  }, [showTextSizeIndicatorBriefly]);

  const handleTextSizeClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case "=":
          case "+":
            event.preventDefault();
            handleTextSizeIncrease();
            break;
          case "-":
            event.preventDefault();
            handleTextSizeDecrease();
            break;
          case "0":
            event.preventDefault();
            handleTextSizeReset();
            break;
        }
      }

      if (event.key === "Escape") {
        event.preventDefault();
        handleTextSizeClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    isOpen,
    handleTextSizeIncrease,
    handleTextSizeDecrease,
    handleTextSizeReset,
    handleTextSizeClose,
  ]);

  useEffect(() => {
    if (sharedChatState) {
      setIsAiTyping(sharedChatState.isTyping);
      let typingTimeout: NodeJS.Timeout;
      if (sharedChatState.isTyping) {
        typingTimeout = setTimeout(() => {
          setShowAiTypingClass(true);
        }, 300);
      } else {
        setShowAiTypingClass(false);
      }
      return () => {
        if (typingTimeout) clearTimeout(typingTimeout);
      };
    }
  }, [sharedChatState]);

  useEffect(() => {
    if (!isOpen) {
      setShowChatInterface(false);
      setShowVoiceInterface(false);
      setShowInstructionalPanel(false);
      setIsMinimized(false);
      setIsMaximized(false);
      setTextSize(100);
      setShowTextSizeIndicator(false);
    }
  }, [isOpen]);

  useEffect(() => {
    let openTimer: NodeJS.Timeout;
    let closeTimer: NodeJS.Timeout;
    if (showChatInterface && !isMinimized) {
      if (!isMaximized) {
        openTimer = setTimeout(() => {
          setShowInstructionalPanel(true);
          closeTimer = setTimeout(() => {
            setShowInstructionalPanel(false);
          }, 10000);
        }, 3000);
      } else {
        setShowInstructionalPanel(false);
      }
    } else {
      setShowInstructionalPanel(false);
    }
    const handleToggleInstructionalPanel = () => {
      if (!isMaximized) {
        setShowInstructionalPanel((prevState) => !prevState);
      }
    };
    document.addEventListener(
      "toggleInstructionalPanel",
      handleToggleInstructionalPanel
    );
    return () => {
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
      document.removeEventListener(
        "toggleInstructionalPanel",
        handleToggleInstructionalPanel
      );
    };
  }, [showChatInterface, isMinimized, isMaximized]);

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div className="chatbot-minimized-container">
        <button className="chatbot-minimized-icon" onClick={handleRestore}>
          <img src={chatbotIcon} alt="Restore Koby AI" />
          <div className="minimized-pulse"></div>
        </button>
      </div>
    );
  }

  const getTextSizeClass = () => {
    return `text-size-${textSize}`;
  };

  return (
    <div className={`chatbot-modal-overlay ${isMaximized ? "maximized" : ""}`}>
      {!isMaximized && (
        <InstructionalPanel
          isOpen={showInstructionalPanel}
          onClose={() => setShowInstructionalPanel(false)}
        />
      )}

      {!showInstructionalPanel && !isMaximized && (
        <button
          className="instruction-toggle-button desktop-only"
          onClick={() => setShowInstructionalPanel(true)}
        >
          <img
            style={{ height: "44px" }}
            src={instructionIcon}
            alt="Instructional Panel"
          />
        </button>
      )}

      <div
        className={`text-size-indicator ${showTextSizeIndicator ? "show" : ""}`}
      >
        Text: {textSize}%
      </div>

      <div
        className={`chatbot-modal ${showAiTypingClass ? "ai-typing" : ""} ${
          isMaximized ? "maximized-modal" : ""
        } ${getTextSizeClass()}`}
        data-interface={
          showChatInterface ? "chat" : showVoiceInterface ? "voice" : "welcome"
        }
      >
        {/* 1. HEADER DIV - Fixed at top */}
        <div className="modal-controls">
          <button
            className="control-button maximize-button"
            onClick={handleMaximize}
            title={isMaximized ? "Restore" : "Maximize"}
            aria-label={isMaximized ? "Restore window" : "Maximize window"}
          >
            <div className="maximize-base">
              <img src={maximizeIcon} alt="" className="maximize-icon" />
            </div>
          </button>
          <button
            className="control-button maximize-button"
            onClick={handleClose}
            title="Close and reset chat"
            aria-label="Close modal and reset chat"
          >
            <div className="maximize-base">
              <img src={cross} alt="" />
            </div>
          </button>
        </div>

        {/* 2. MIDDLE DIV - Flexible content area */}
        <div className="main-content">
          {showChatInterface ? (
            isMaximized ? (
              <MaximizedChatConversation
                isVisible={showChatInterface}
                onBackClick={handleChatClick}
                onTypingStateChange={setIsAiTyping}
                isMaximized={isMaximized}
                showInstructionalPanel={showInstructionalPanel}
                onToggleInstructionalPanel={() =>
                  setShowInstructionalPanel(!showInstructionalPanel)
                }
                chatState={sharedChatState}
                textSize={textSize}
                onResetChat={resetChat}
              />
            ) : (
              <ChatConversation
                isVisible={showChatInterface}
                onBackClick={handleChatClick}
                onTypingStateChange={setIsAiTyping}
                isMaximized={isMaximized}
                showInstructionalPanel={showInstructionalPanel}
                onToggleInstructionalPanel={() =>
                  setShowInstructionalPanel(!showInstructionalPanel)
                }
                chatState={sharedChatState}
                textSize={textSize}
                onResetChat={resetChat}
              />
            )
          ) : showVoiceInterface ? (
            <VoiceChat
              isVisible={showVoiceInterface}
              onBackClick={handleVoiceClick}
              isMaximized={isMaximized}
            />
          ) : (
            <>
              {/* <div className={`${
                  isMaximized
                    ? "chatbot-modal-avatar-container"
                    : "chatbot-modal-avatar-container-normal"
                }`}>
                <div className="chatbot-modal-avatar">
                  <img
                    src={chatbotIcon}
                    alt="Koby AI Chatbot"
                    className="breathing"
                  />
                </div>
              </div> */}
              <div className="chatbot-modal-img">
                <div className="big-circle"></div>
                <div className="small-circle"></div>
                <img
                  src={chatbotIcon}
                  alt="Koby AI Chatbot"
                  className="avatar-image breathing"
                />
              </div>
              <h2 style={{ fontSize: "26px" }}>
                <b>Hi, I'm Koby</b>
              </h2>
              <h3>City of Mayorville's AI Companion</h3>
              <p
                className={`${
                  isMaximized
                    ? "chatbot-description"
                    : "chatbot-description-normal"
                }`}
              >
                I can help answer questions around Planning, Zoning, Land Use,
                and potential Development.
              </p>

              {/* <div className="chatbot-options">
                <div className="option-button" onClick={handleVoiceClick}>
                  <div className="option-outer">
                    <div className="option-icon speak-icon"></div>
                  </div>
                  <span style={{ color: "#6138f5", fontSize: "14px" }}>
                    <strong style={{ fontSize: "18px" }}>Speak</strong> <br />
                    with AI Companion{" "}
                  </span>
                </div>

                <div className="option-button" onClick={handleChatClick}>
                  <div className="option-outer">
                    <div className="option-icon chat-icon"></div>
                  </div>
                  <span style={{ color: "#6138f5", fontSize: "14px" }}>
                    {showChatInterface ? (
                      "Hide chat"
                    ) : (
                      <strong style={{ fontSize: "18px" }}>Chat</strong>
                    )}{" "}
                    <br />
                    with AI Companion
                  </span>
                </div>
              </div> */}

           <div className="chatbot-options">
                <div className="option-button" onClick={handleVoiceClick}>
                  <div className="option-outer">
                    <div className="option-inner">
                      <div className="option-icon-container">
                        <div className="option-icon speak-icon"></div>
                      </div>
                    </div>
                  </div>
                  <div className="option-text-container">
                    <span>
                      <strong>Speak</strong> <br />
                       <span className="companion-text" style={{fontSize:"14px"}}>with AI Companion</span>
                    </span>
                  </div>
                </div>

                <div className="option-button" onClick={handleChatClick}>
                  <div className="option-outer">
                    <div className="option-inner">
                      <div className="option-icon-container">
                        <div className="option-icon chat-icon"></div>
                      </div>
                    </div>
                  </div>
                  <div className="option-text-container">
                    <span>
                      {showChatInterface ? (
                        "Hide chat"
                      ) : (
                        <>
                          <strong>Chat</strong> <br />
                         <span className="companion-text" style={{fontSize:"14px"}}>with AI Companion</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={`chatbotmodal-alternative ${
                  showDisclaimerInfo ? "disclaimer-open" : ""
                } ${
                  isMaximized
                    ? "chatbotmodal-alternative"
                    : "chatbotmodal-inner"
                }`}
              >
                <p>
                  Alternatively, you may also check out the city's interactive
                  GIS map
                </p>
                <div className="map-container">
                  <div className={`${isMaximized ? "map-outer" : "map-inner"}`}>
                    <button className="map-button" onClick={onMapClick}>
                      <span className="map-icon"></span>
                      <span  className="map-text">
                        {" "}
                        Open interactive map
                      </span>
                      <span className="external-link-icon"></span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 3. FOOTER DIV - Fixed at bottom, separate internal div */}
        <div className="modal-footer">
          <ChatModalFooter
            textSize={textSize}
            textSizeLevels={textSizeLevels}
            onTextSizeIncrease={handleTextSizeIncrease}
            onTextSizeDecrease={handleTextSizeDecrease}
            isMaximized={isMaximized}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatbotModal;
