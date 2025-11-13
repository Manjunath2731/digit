import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../src/store';
import { checkAddress } from '../../src/store/slices/chatSlice';
import { optionPatterns } from '../../src/utils/helpers';
import { Message } from '../types/chat';

export const useMessageHandlers = (
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  userName: string | null,
  setUserName: React.Dispatch<React.SetStateAction<string | null>>,
  currentOption: string,
  setCurrentOption: React.Dispatch<React.SetStateAction<string>>,
  previousOption: string,
  setPreviousOption: React.Dispatch<React.SetStateAction<string>>,
  selectedOptions: Set<string>,
  setSelectedOptions: React.Dispatch<React.SetStateAction<Set<string>>>,
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>,
  setAddressConfirmed: React.Dispatch<React.SetStateAction<boolean>>,
  setShowFollowUpOptions: React.Dispatch<React.SetStateAction<boolean>>,
  setShowFeedback: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const dispatch = useAppDispatch();
  const { propertyData } = useAppSelector(state => state.chat);

  const findAddressInMessages = (): string => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (message.isUser && /\d+\s+[\w\s]+/i.test(message.text)) {
        return message.text;
      }
    }
    return '';
  };

  const addToSelectedOptions = (text: string, code: string) => {
    const newSelectedOptions = new Set(selectedOptions);
    newSelectedOptions.add(text);
    if (code) newSelectedOptions.add(code);
    setSelectedOptions(newSelectedOptions);
  };

  const matchUserInputToOption = (input: string, isFirstMessage: boolean = false): string | null => {
    const userText = input.toLowerCase().trim();
    for (const { option, code, pattern } of optionPatterns) {
      if (isFirstMessage && code === 'NO') {
        continue;
      }
      if (pattern.test(userText)) {
        return option;
      }
    }
    return null;
  };

  const handleMatchedOption = (optionText: string) => {
    setIsTyping(true);
    
    // Handle options that require address
    if (['Provide a Summary Report of the property.', 'Check what is possible to build on a site.', 'Does this site fall within the City Limit?', 'What Zone does this site fall under?', 'Can I build this specific development on this site?'].includes(optionText)) {
      if (!propertyData) {
        const optionMap: { [key: string]: string } = {
          'Provide a Summary Report of the property.': 'PD',
          'Check what is possible to build on a site.': 'BP',
          'Does this site fall within the City Limit?': 'CL',
          'What Zone does this site fall under?': 'ZD',
          'Can I build this specific development on this site?': 'BT'
        };
        
        setCurrentOption(optionMap[optionText] || 'PD');
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, {
            text: 'Sure, could you help me with an address.',
            isUser: false,
            isAddress: true
          }]);
        }, 1500);
        return;
      }
    }

    // Handle different option types
    if (optionText === 'Can I build this specific development on this site?') {
      addToSelectedOptions(optionText, 'BT');
      setCurrentOption('BT');
      if (propertyData) {
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, {
            text: 'What do you want to build on this property?',
            isUser: false
          }]);
        }, 1500);
      } else {
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, {
            text: 'Sure, could you help me with an address.',
            isUser: false,
            isAddress: true
          }]);
        }, 1500);
      }
      return;
    }

    if (optionText === 'Change address') {
      addToSelectedOptions(optionText, 'CA');
      // Store current option as previous option before changing to CA
      // This ensures we can return to the correct context after address change
      setPreviousOption(currentOption);
      setCurrentOption('CA');
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          text: 'Sure, please provide the new address you would like to check.',
          isUser: false,
          isAddress: true
        }]);
      }, 1500);
      return;
    }

    if (optionText === 'No') {
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          text: `It was my pleasure assisting you today${userName ? ', <strong>' + userName + '</strong>' : ''}. The city of Mayorville would appreciate it if you could rate your experience.`,
          isUser: false,
          showFeedbackUI: true
        }]);
        setShowFeedback(true);
      }, 1500);
      return;
    }

    // Handle API options
    const apiOptionMap: { [key: string]: string } = {
      'Does this site fall within the City Limit?': 'CL',
      'What Zone does this site fall under?': 'ZD',
      'Check what is possible to build on a site.': 'BP',
      'Provide a Summary Report of the property.': 'PD'
    };

    const apiOption = apiOptionMap[optionText];
    
    if (apiOption && propertyData) {
      // Store the option code in both currentOption and as a backup in previousOption
      // This ensures we can properly return to this option after a "Change address" request
      setPreviousOption(apiOption);
      setCurrentOption(apiOption);
      addToSelectedOptions(optionText, apiOption);
      
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          text: 'Sure. Let me check this.',
          isUser: false
        }]);
        const address = findAddressInMessages();
        dispatch(checkAddress({
          address: address,
          option: apiOption
        }));
        setAddressConfirmed(true);
      }, 1500);
    }
  };

  return {
    handleMatchedOption,
    matchUserInputToOption,
    findAddressInMessages,
    addToSelectedOptions
  };
};