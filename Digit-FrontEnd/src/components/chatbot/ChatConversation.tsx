import React, { useRef, useEffect, useState } from "react";
import "./ChatbotModal.css";
import "./ChatResponsive.css";
import { useAppDispatch, useAppSelector } from "../../store";
import { checkAddress, clearChatData } from "../../store/slices/chatSlice";
import ChatMessageList from "./ChatMessageList";
import ChatHeader from "./ChatHeader";
// import ChatInput from "./ChatInput";
import { useChatState } from "./ChatState";
import { handleUserNameInput } from "./UserNameHandler";
import { useAddressHandler } from "./AddressHandler";
import { useFeedbackHandler } from "./FeedbackHandler";
import { useMessageHandlers } from "../../hooks/useMessageHandlers";
import ChatInputNormal from "./ChatInputNormal";

interface ChatConversationProps {
  isVisible: boolean;
  onBackClick: () => void;
  onTypingStateChange: (isTyping: boolean) => void;
  isMaximized?: boolean;
  showInstructionalPanel?: boolean;
  onToggleInstructionalPanel?: () => void;
  chatState?: ReturnType<typeof useChatState>;
  textSize?: number;
  onResetChat?: () => void;
}

const ChatConversation: React.FC<ChatConversationProps> = ({
  isVisible,
  onBackClick,
  onTypingStateChange,
  showInstructionalPanel = false,
  onToggleInstructionalPanel,
  chatState: externalChatState,
  textSize = 100,
  onResetChat,
}) => {
  const dispatch = useAppDispatch();
  const {
    responseMessage,
    loading,
    error,
    propertyData,
    dayNight,
    reportLink,
  } = useAppSelector((state) => state.chat);
  const localChatState = useChatState();
  const chatState = externalChatState || localChatState;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { handleAddressInput } = useAddressHandler();
  const { handleFeedbackClick } = useFeedbackHandler();
  const [hasAIResponded, setHasAIResponded] = useState(false);
  const [isActiveComponent, setIsActiveComponent] = useState(false);
  const [internalShowInstructionalPanel, setInternalShowInstructionalPanel] =
    useState(showInstructionalPanel || false);
  useEffect(() => {
    setInternalShowInstructionalPanel(showInstructionalPanel || false);
  }, [showInstructionalPanel]);
  const handleToggleInstructionalPanel = () => {
    if (onToggleInstructionalPanel) {
      onToggleInstructionalPanel();
    }
    setInternalShowInstructionalPanel(!internalShowInstructionalPanel);
  };
  const messageHandlers = useMessageHandlers(
    chatState.messages,
    chatState.setMessages,
    chatState.userName,
    chatState.setUserName,
    chatState.currentOption,
    chatState.setCurrentOption,
    chatState.previousOption,
    chatState.setPreviousOption,
    chatState.selectedOptions,
    chatState.setSelectedOptions,
    chatState.setIsTyping,
    chatState.setAddressConfirmed,
    chatState.setShowFollowUpOptions,
    chatState.setShowFeedback
  );

  useEffect(() => {
    if (onTypingStateChange) {
      onTypingStateChange(chatState.isTyping);
    }
  }, [chatState.isTyping, onTypingStateChange]);
  useEffect(() => {
    if (isVisible) {
      setIsActiveComponent(true);
    } else {
      setIsActiveComponent(false);
    }
  }, [isVisible]);
  useEffect(() => {
    let openTimer: NodeJS.Timeout;
    if (isVisible && !internalShowInstructionalPanel) {
      openTimer = setTimeout(() => {
        setInternalShowInstructionalPanel(true);
      }, 100);
    }

    return () => {
      clearTimeout(openTimer);
    };
  }, [isVisible]);

  const handleSendMessage = async () => {
    if (chatState.inputValue.trim()) {
      const userMessage = chatState.inputValue;
      chatState.setMessages((prev) => [
        ...prev,
        { text: userMessage, isUser: true },
      ]);
      chatState.setInputValue("");
      chatState.setIsTyping(true);
      const isFirstMessage =
        !chatState.userName && chatState.messages.length === 1;
      if (!chatState.userName && chatState.messages.length === 1) {
        const handled = handleUserNameInput({
          userMessage,
          messages: chatState.messages,
          setUserName: chatState.setUserName,
          setIsTyping: chatState.setIsTyping,
          setMessages: chatState.setMessages,
          setShowFollowUpOptions: chatState.setShowFollowUpOptions,
        });

        if (handled) return;
      }
      const matchedOption = messageHandlers.matchUserInputToOption(
        userMessage,
        isFirstMessage
      );
      if (matchedOption) {
        messageHandlers.handleMatchedOption(matchedOption);
        return;
      }
      const addressHandled = await handleAddressInput({
        userMessage,
        currentOption: chatState.currentOption,
        previousOption: chatState.previousOption,
        setCurrentOption: chatState.setCurrentOption,
        setIsTyping: chatState.setIsTyping,
        setMessages: chatState.setMessages,
        setAddressConfirmed: chatState.setAddressConfirmed,
      });
      if (addressHandled) return;
      if (userMessage.toLowerCase().includes("address")) {
        chatState.setIsTyping(false);
        chatState.setMessages((prev) => [
          ...prev,
          {
            text: "Sure, could you help me with an address.",
            isUser: false,
            isAddress: true,
          },
        ]);
      } else if (
        chatState.addressConfirmed ||
        chatState.messages.some((msg) => msg.isAddress)
      ) {
        const lastAIMessage = [...chatState.messages]
          .reverse()
          .find((msg) => !msg.isUser);

        if (
          lastAIMessage &&
          lastAIMessage.text ===
            "What do you want to build on this property?" &&
          chatState.currentOption === "BT"
        ) {
          const address = messageHandlers.findAddressInMessages();
          dispatch(
            checkAddress({
              address: address,
              option: "BT",
              buildingType: userMessage,
            })
          );
          chatState.setAddressConfirmed(true);
          return;
        }
        if (
          userMessage.trim().toLowerCase() === "no" &&
          chatState.userName !== null &&
          chatState.messages.length > 1
        ) {
          chatState.setCurrentOption("NO");
          setTimeout(() => {
            chatState.setIsTyping(false);
            chatState.setMessages((prev) => [
              ...prev,
              {
                text: `It was my pleasure assisting you today${
                  chatState.userName
                    ? ", <strong>" + chatState.userName + "</strong>"
                    : ""
                }. The city of Mayorville would appreciate it if you could rate your experience.`,
                isUser: false,
              },
            ]);
            chatState.setShowFeedback(true);
          }, 1500);
          return;
        } else {
          setTimeout(() => {
            chatState.setIsTyping(false);
            chatState.setMessages((prev) => [
              ...prev,
              {
                text: "I am not trained to understand this prompt.",
                isUser: false,
              },
            ]);
          }, 1500);
        }
      } else if (chatState.userName) {
        setTimeout(() => {
          chatState.setMessages((prev) => [
            ...prev,
            {
              text: "I am not trained to understand this prompt.",
              isUser: false,
            },
          ]);
          chatState.setIsTyping(false);
        }, 1000);
      }
    }
  };
  const handleOptionClick = (optionText: string) => {
    if (optionText === "Change address") {
      chatState.setPreviousOption(chatState.currentOption);
    }
    chatState.setCurrentOption(optionText);
    chatState.setMessages((prev) => [
      ...prev,
      { text: optionText, isUser: true, isOption: true },
    ]);
    messageHandlers.handleMatchedOption(optionText);
  };

  const handleFeedbackSubmit = (rating: number) => {
    handleFeedbackClick(rating, {
      userName: chatState.userName,
      setMessages: chatState.setMessages,
      setAddressConfirmed: chatState.setAddressConfirmed,
      resetChat: chatState.resetChat,
      onBackClick,
    });
  };
  const resetChatState = () => {
    if (onResetChat) {
      onResetChat();
    } else {
      chatState.resetChat();
    }
    dispatch(clearChatData());
  };

  const scrollToBottom = () => {
    try {
      const scrollAnchor = document.getElementById("chat-scroll-anchor");
      if (scrollAnchor) {
        scrollAnchor.scrollIntoView({ behavior: "smooth" });
        return;
      }
      const chatMessages = document.querySelector(".chat-messages");
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return;
      }
      const chatInstructions = document.querySelector(
        ".chat-message-instructions"
      );
      if (chatInstructions) {
        chatInstructions.scrollTop = chatInstructions.scrollHeight;
      }
    } catch (error) {
      console.error("Error scrolling to bottom:", error);
    }
  };
  const [lastProcessedResponse, setLastProcessedResponse] = useState<
    string | null
  >(null);
  const [followUpMessageAdded, setFollowUpMessageAdded] =
    useState<boolean>(false);
  const [processedPdfIndices, setProcessedPdfIndices] = useState<number[]>([]);
  useEffect(() => {
    const lastMessage = chatState.messages[chatState.messages.length - 1];
    if (lastMessage && lastMessage.isUser) {
      setFollowUpMessageAdded(false);
    }
  }, [chatState.messages]);
  useEffect(() => {
    if (isVisible) {
      if (chatState.pdfMessageIndices.length === 0) {
        chatState.setPdfMessageIndices([]);
      }
      if (chatState.messages.length === 0) {
        chatState.setShowPdfOption(false);
      }
    }
  }, [isVisible]);

  useEffect(() => {
    if (!isActiveComponent) return;
    if (chatState.addressConfirmed && !loading) {
      chatState.setIsTyping(false);
      chatState.setAddressConfirmed(false);
      if (error) {
        chatState.setMessages((prev) => [
          ...prev,
          { text: error, isUser: false },
        ]);
        setTimeout(() => {
          chatState.setSelectedOptions(new Set());
          chatState.setShowFollowUpOptions(true);
          chatState.setMessages((prev) => [
            ...prev,
            {
              text: `Below are additional questions that you could answer or type <strong>No</strong> to end this conversation`,
              isUser: false,
              showFollowUpButtons: true,
              isFollowUpMessage: true, 
            },
          ]);
        }, 1000);
      } else if (responseMessage && propertyData) {
        setLastProcessedResponse(responseMessage);
        chatState.setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.text === "Sure. Let me check this.") {
            newMessages[newMessages.length - 1] = {
              text: responseMessage,
              isUser: false,
            };
            setTimeout(() => {
              if (chatState.setPdfMessageIndices) {
                chatState.setPdfMessageIndices((prev) => [
                  ...prev,
                  newMessages.length - 1,
                ]);
              }
            }, 100);

            return newMessages;
          } else {
            setTimeout(() => {
              if (chatState.setPdfMessageIndices) {
                chatState.setPdfMessageIndices((prev) => [
                  ...prev,
                  prev.length,
                ]);
              }
            }, 100);

            return [...prev, { text: responseMessage, isUser: false }];
          }
        });

        chatState.setShowPdfOption(true);
        chatState.setIsTyping(false);
        if (!followUpMessageAdded) {
          setTimeout(() => {
            if (isActiveComponent) {
              chatState.setMessages((prev) => [
                ...prev,
                {
                  text: `Below are additional questions that you could answer or type <strong>No</strong> to end this conversation`,
                  isUser: false,
                  showFollowUpButtons: true,
                  isFollowUpMessage: true, // Add this flag
                },
              ]);
              chatState.setShowFollowUpOptions(true);
            }
            setFollowUpMessageAdded(true);
          }, 1000);
        }
      } else if (chatState.addressConfirmed && loading) {
        chatState.setIsTyping(true);
      }
    }
  }, [
    loading,
    error,
    responseMessage,
    propertyData,
    chatState.addressConfirmed,
    isActiveComponent,
    followUpMessageAdded,
    lastProcessedResponse,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [chatState.messages, chatState.isTyping]);

   useEffect(() => {
   const setContainerHeightByZoom = () => {
     try {
       const zoomLevel1 = Math.round(window.devicePixelRatio * 100);
       const zoomLevel2 = Math.round((window.outerWidth / window.innerWidth) * 100);
       const zoomLevel = zoomLevel1; // Use devicePixelRatio as primary method
       console.log('Container zoom detection - devicePixelRatio:', zoomLevel1, 'outerWidth/innerWidth:', zoomLevel2);
       const chatContainer = document.querySelector('.chat-conversation-container.maximized') as HTMLElement;
     } catch (error) {
       console.error('Error in setContainerHeightByZoom:', error);
     }
   };
   const initialTimer = setTimeout(() => {
     setContainerHeightByZoom();
   }, 100);
   
   window.addEventListener('resize', setContainerHeightByZoom);
   window.addEventListener('orientationchange', setContainerHeightByZoom);
   if (window.visualViewport) {
     window.visualViewport.addEventListener('resize', setContainerHeightByZoom);
   }
   return () => {
     clearTimeout(initialTimer);
     window.removeEventListener('resize', setContainerHeightByZoom);
     window.removeEventListener('orientationchange', setContainerHeightByZoom);
     if (window.visualViewport) {
       window.visualViewport.removeEventListener('resize', setContainerHeightByZoom);
     }
   };
 }, [isVisible, internalShowInstructionalPanel]);
  useEffect(() => {
    const hasAIMessages = chatState.messages.some((message) => !message.isUser);
    if (hasAIMessages) {
      setHasAIResponded(true);
    }
  }, [chatState.messages]);

  if (!isVisible) return null;

  return (
    <div style={{ borderRadius: "8px", width: "100%" }}>
      <div
        style={{
          backgroundColor: "white",
          // marginTop: "60px",
          borderRadius: "8px",
        }}
        className={`chat-conversation-container maximized text-size-${textSize}`}
      >
        <ChatHeader
          onBackClick={onBackClick}
          onResetChat={resetChatState}
          onToggleInstructionalPanel={handleToggleInstructionalPanel}
          isMaximized={false}
          title="Chat with Mayorville's AI Companion"
        />
        <div className="chat-main-content-normal with-sidebar">
          <div className="chat-messages-section">
            <div
              className="chat-messages-container"
              style={{
                flex: 1,
                overflowY: "auto",
              }}
            >
              <div
                className={`chat-message-instructions ${
                  !internalShowInstructionalPanel ? "no-panel" : ""
                }`}
                ref={chatContainerRef}
              >
                <div style={{ marginTop: "15px" }}>
                  <ChatMessageList
                    messages={chatState.messages}
                    userName={chatState.userName}
                    feedbackRating={chatState.feedbackRating}
                    showPdfOption={chatState.showPdfOption}
                    showFollowUpOptions={chatState.showFollowUpOptions}
                    showZoningOptions={chatState.showZoningOptions}
                    pdfMessageIndices={chatState.pdfMessageIndices}
                    currentOption={chatState.currentOption}
                    reportLink={reportLink}
                    propertyData={propertyData}
                    selectedOptions={chatState.selectedOptions}
                    dayNight={dayNight || "day"}
                    isTyping={chatState.isTyping}
                    followUpMessageAdded={followUpMessageAdded} // Pass the flag
                    onOptionClick={handleOptionClick}
                    onFeedbackClick={handleFeedbackSubmit}
                    onBackClick={onBackClick}
                  />
                  <div
                    ref={messagesEndRef}
                    style={{ height: "1px", width: "100%" }}
                  />
                </div>
              </div>
            </div>
            <div
              className="chat-footer"
              style={{
                position: "sticky",
                bottom: 0,
                backgroundColor: "white",
                borderTop: "1px solid #e0e0e0",
                marginTop: "auto",
              }}
            >
              <ChatInputNormal
                inputValue={chatState.inputValue}
                setInputValue={chatState.setInputValue}
                onSendMessage={handleSendMessage}
                showFeedback={chatState.showFeedback}
                isVisible={isVisible}
                isMaximized={true}
                onOptionClick={handleOptionClick}
                hasAIResponded={hasAIResponded}
                textSize={textSize}
                propertyData={propertyData}
                isInstructionalPanelOpen={internalShowInstructionalPanel}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatConversation;