export interface Message {
  text: string;
  isUser: boolean;
  isAddress?: boolean;
  isOption?: boolean;
  isAddressConfirmation?: boolean;
  showPdfOption?: boolean;
  showFollowUpButtons?: boolean;
  showFeedbackUI?: boolean;
}

export interface ChatState {
  userName: string | null;
  messages: Message[];
  addressConfirmed: boolean;
  currentOption: string;
  previousOption: string;
  selectedOptions: Set<string>;
  inputValue: string;
  isTyping: boolean;
  showFeedback: boolean;
  feedbackRating: number;
  showPdfOption: boolean;
  showFollowUpOptions: boolean;
  showZoningOptions: boolean;
  pdfMessageIndices: number[];
}