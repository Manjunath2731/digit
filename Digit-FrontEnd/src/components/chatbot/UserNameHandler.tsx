import React from 'react';
import { Message } from '../../types/chat';

interface UserNameHandlerProps {
  userMessage: string;
  messages: Message[];
  setUserName: React.Dispatch<React.SetStateAction<string | null>>;
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setShowFollowUpOptions: React.Dispatch<React.SetStateAction<boolean>>;
}

export const handleUserNameInput = ({
  userMessage,
  messages,
  setUserName,
  setIsTyping,
  setMessages,
  setShowFollowUpOptions
}: UserNameHandlerProps): boolean => {
  if (messages.length !== 1) return false;

  const lowerCaseMessage = userMessage.toLowerCase().trim();
  const noNameResponses = ["no", "nope", "i don't want to", "don't want", "skip", "pass", "anonymous", "not telling", "no thanks"];
  
  if (noNameResponses.some(response => lowerCaseMessage.includes(response))) {
    setUserName(null);
    setShowFollowUpOptions(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        text: `I understand.<br/>I am trained to help you answer the following questions about a property or site.`,
        isUser: false,
        showFollowUpButtons: true
      }]);
    }, 1500);
    return true;
  }
  
  const name = userMessage.trim().split(' ')[0];
  setUserName(name);
  setShowFollowUpOptions(true);
  setTimeout(() => {
    setIsTyping(false);
    setMessages(prev => [...prev, {
      text: `Hello <strong>${name}</strong>.<br/>It is my pleasure talking to you today. <br/><br/>I am trained to help you answer the following questions about a property or site.`,
      isUser: false,
      showFollowUpButtons: true
    }]);
  }, 1500);
  return true;
};