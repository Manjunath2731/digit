import React from 'react';
import ChatMessage from './ChatMessage';

interface MessageType {
  text: string;
  isUser: boolean;
  isAddress?: boolean;
  isOption?: boolean;
  isAddressConfirmation?: boolean;
  showPdfOption?: boolean;
  showFollowUpButtons?: boolean;
  showFeedbackUI?: boolean;
  isFollowUpMessage?: boolean; 
}

interface MessageGroup {
  messages: MessageType[];
  isAI: boolean;
}

interface ChatMessageListProps {
  messages: MessageType[];
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
  isTyping: boolean;
  followUpMessageAdded?: boolean; 
  onOptionClick: (optionText: string) => void;
  onFeedbackClick: (rating: number) => void;
  onBackClick?: () => void;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
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
  isTyping,
  followUpMessageAdded = false, 
  onOptionClick,
  onFeedbackClick,
  onBackClick
}) => {
  const groupedMessages: MessageGroup[] = [];
  let currentGroup: MessageType[] = [];
  let isCurrentGroupAI = false;

  messages.forEach((message) => {
    const isAI = !message.isUser;
    if ((isAI !== isCurrentGroupAI) || currentGroup.length === 0) {
      if (currentGroup.length > 0) {
        groupedMessages.push({
          messages: [...currentGroup],
          isAI: isCurrentGroupAI
        });
      }
      currentGroup = [message];
      isCurrentGroupAI = isAI;
    } else {
      currentGroup.push(message);
    }
  });

  if (currentGroup.length > 0) {
    groupedMessages.push({
      messages: [...currentGroup],
      isAI: isCurrentGroupAI
    });
  }

  return (
    <div className="chat-messages">
      {groupedMessages.map((group, groupIndex) => {
        if (group.isAI) {
          return (
            <div key={`group-${groupIndex}`} className="ai-message-group">
              {group.messages.map((message, messageIndex) => {
                const index = messages.indexOf(message);
                return (
                  <ChatMessage
                    key={`message-${index}`}
                    message={message}
                    index={index}
                    userName={userName}
                    feedbackRating={feedbackRating}
                    showPdfOption={showPdfOption}
                    showFollowUpOptions={showFollowUpOptions}
                    showZoningOptions={showZoningOptions}
                    pdfMessageIndices={pdfMessageIndices}
                    currentOption={currentOption}
                    reportLink={reportLink}
                    propertyData={propertyData}
                    selectedOptions={selectedOptions}
                    dayNight={dayNight}
                    followUpMessageAdded={followUpMessageAdded}
                    onOptionClick={onOptionClick}
                    onFeedbackClick={onFeedbackClick}
                    onBackClick={onBackClick}
                  />
                );
              })}
            </div>
          );
        } else {
          return group.messages.map((message, messageIndex) => {
            const index = messages.indexOf(message);
            return (
              <ChatMessage
                key={`message-${index}`}
                message={message}
                index={index}
                userName={userName}
                feedbackRating={feedbackRating}
                showPdfOption={showPdfOption}
                showFollowUpOptions={showFollowUpOptions}
                showZoningOptions={showZoningOptions}
                pdfMessageIndices={pdfMessageIndices}
                currentOption={currentOption}
                reportLink={reportLink}
                propertyData={propertyData}
                selectedOptions={selectedOptions}
                dayNight={dayNight}
                followUpMessageAdded={followUpMessageAdded}
                onOptionClick={onOptionClick}
                onFeedbackClick={onFeedbackClick}
                onBackClick={onBackClick}
              />
            );
          });
        }
      })}

      {isTyping && (
        <div className="ai-message typing-animation">
          <div className="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}
      <div id="chat-scroll-anchor" style={{ height: '1px', width: '50%' }} />
    </div>
  );
};

export default ChatMessageList;