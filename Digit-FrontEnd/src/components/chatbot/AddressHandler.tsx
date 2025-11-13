import React from 'react';
import { useAppDispatch } from '../../store';
import { checkAddress } from '../../store/slices/chatSlice';
import { Message } from '../../types/chat';

interface AddressHandlerProps {
  userMessage: string;
  currentOption: string;
  previousOption: string;
  setCurrentOption: React.Dispatch<React.SetStateAction<string>>;
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setAddressConfirmed: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useAddressHandler = () => {
  const dispatch = useAppDispatch();

  const handleAddressInput = ({
    userMessage,
    currentOption,
    previousOption,
    setCurrentOption,
    setIsTyping,
    setMessages,
    setAddressConfirmed
  }: AddressHandlerProps): boolean => {
    if (!/\d+\s+[\w\s]+/i.test(userMessage)) return false;

    setIsTyping(true);
    const isChangeAddress = currentOption === 'CA';
    
    if (currentOption === 'BT') {
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          text: 'What do you want to build on this property?',
          isUser: false
        }]);
      }, 1000);
      return true;
    }
    
    dispatch(checkAddress({
      address: userMessage,
      option: isChangeAddress ? previousOption : currentOption
    }));
    
    if (isChangeAddress) {
      setCurrentOption(previousOption);
    }
    
    setAddressConfirmed(true);
    return true;
  };

  return { handleAddressInput };
};