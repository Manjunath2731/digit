import React, { useState, useEffect } from 'react';
import { Message, ChatState } from '../../types/chat';

export const useChatState = (): ChatState & {
  setUserName: React.Dispatch<React.SetStateAction<string | null>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setAddressConfirmed: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentOption: React.Dispatch<React.SetStateAction<string>>;
  setPreviousOption: React.Dispatch<React.SetStateAction<string>>;
  setSelectedOptions: React.Dispatch<React.SetStateAction<Set<string>>>;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
  setShowFeedback: React.Dispatch<React.SetStateAction<boolean>>;
  setFeedbackRating: React.Dispatch<React.SetStateAction<number>>;
  setShowPdfOption: React.Dispatch<React.SetStateAction<boolean>>;
  setShowFollowUpOptions: React.Dispatch<React.SetStateAction<boolean>>;
  setShowZoningOptions: React.Dispatch<React.SetStateAction<boolean>>;
  setPdfMessageIndices: React.Dispatch<React.SetStateAction<number[]>>;
  resetChat: () => void;
} => {
  const [userName, setUserName] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([{
    text: `Welcome to the <strong>City of Mayorville</strong>.<br/>I am <strong>Koby</strong> - the city's new AI companion.<br/><br/><strong>What is your name?</strong> I can personalize your experience chatting with me.`,
    isUser: false
  }]);
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [currentOption, setCurrentOption] = useState<string>('PD');
  const [previousOption, setPreviousOption] = useState<string>('PD');
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [showPdfOption, setShowPdfOption] = useState(false);
  const [showFollowUpOptions, setShowFollowUpOptions] = useState(false);
  const [showZoningOptions, setShowZoningOptions] = useState(false);
  const [pdfMessageIndices, setPdfMessageIndices] = useState<number[]>([]);

  const resetChat = () => {
    setMessages([{
      text: "Welcome to the <strong>City of Mayorville</strong>.<br/>I am <strong>Koby</strong> - the city's new AI companion.<br/><br/><strong>What is your name?</strong> I can personalize your experience chatting with me.",
      isUser: false
    }]);
    setUserName(null);
    setInputValue('');
    setIsTyping(false);
    setAddressConfirmed(false);
    setCurrentOption('PD');
    setSelectedOptions(new Set());
    setShowPdfOption(false);
    setShowFollowUpOptions(false);
    setShowZoningOptions(false);
    setPdfMessageIndices([]);
    setShowFeedback(false);
    setFeedbackRating(0);
  };

  return {
    userName,
    messages,
    addressConfirmed,
    currentOption,
    previousOption,
    selectedOptions,
    inputValue,
    isTyping,
    showFeedback,
    feedbackRating,
    showPdfOption,
    showFollowUpOptions,
    showZoningOptions,
    pdfMessageIndices,
    setUserName,
    setMessages,
    setAddressConfirmed,
    setCurrentOption,
    setPreviousOption,
    setSelectedOptions,
    setInputValue,
    setIsTyping,
    setShowFeedback,
    setFeedbackRating,
    setShowPdfOption,
    setShowFollowUpOptions,
    setShowZoningOptions,
    setPdfMessageIndices,
    resetChat
  };
};