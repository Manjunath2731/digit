import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { submitFeedback } from '../../store/slices/feedbackSlice';
import { clearChatData } from '../../store/slices/chatSlice';
import { Message } from '../../types/chat';

interface FeedbackHandlerProps {
  userName: string | null;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setAddressConfirmed: React.Dispatch<React.SetStateAction<boolean>>;
  resetChat: () => void;
  onBackClick?: () => void;
}

export const useFeedbackHandler = () => {
  const dispatch = useAppDispatch();
  const { dayNight } = useAppSelector(state => state.chat);

  const handleFeedbackClick = (
    rating: number,
    {
      userName,
      setMessages,
      setAddressConfirmed,
      resetChat,
      onBackClick
    }: FeedbackHandlerProps
  ) => {
    dispatch(submitFeedback({
      name: userName || 'Anonymous',
      rating: rating
    }));
    
    setTimeout(() => {
      const isDayTime = dayNight !== 'night';
      const timeMessage = isDayTime ? 'Have a great day' : 'Have a good night';
      setMessages(prev => [...prev, {
        text: `Your feedback is greatly appreciated${userName ? ', ' + userName : ''}. Thank you.\n${timeMessage}!`,
        isUser: false
      }]);
      
      setTimeout(() => {
        setAddressConfirmed(false);
        resetChat();
        dispatch(clearChatData());
        if (onBackClick) onBackClick();
      }, 7000);
    }, 500);
  };

  return { handleFeedbackClick };
};