/**
 * Format a date string to a more readable format
 * @param dateString - ISO date string
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", options).format(date);
};

/**
 * Truncate a string to a specified length and add ellipsis
 * @param str - String to truncate
 * @param length - Maximum length
 * @returns Truncated string
 */
export const truncateString = (str: string, length: number): string => {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
};

/**
 * Generate a random ID
 * @param length - Length of the ID
 * @returns Random ID string
 */
export const generateId = (length: number = 8): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const baseOptions = [
  { text: "Does this site fall within the City Limit?", option: "CL" },
  { text: "What Zone does this site fall under?", option: "ZD" },
  { text: "Provide a Summary Report of the property.", option: "PD" },
  { text: "Check what is possible to build on a site.", option: "BP" },
  { text: "Can I build this specific development on this site?", option: "BT" },
];

export const optionPatterns = [
  {
    option: "Provide a Summary Report of the property.",
    code: "PD",
    pattern:
      /summary\s*report|property\s*summary|provide\s*summary|summary\s*of\s*(the)?\s*property|(get|show|find|display|give|provide)?\s*(information|info|data|details|report|summary)\s*(on|about|for|of)?\s*(a|the|this|my)?\s*(site|property|parcel|land|address|location)|site\s*information|info\s*on\s*site|property\s*info|parcel\s*info|tell\s*me\s*about\s*(the|this|my)?\s*(property|site|parcel|land|address|location)|what\s*(can|do)\s*you\s*tell\s*me\s*about\s*(this|the|my)?\s*(property|site|parcel|land|address|location)/i,
  },
  {
    option: "Can I build this specific development on this site?",
    code: "BT",
    pattern:
      /can\s*i\s*build\s*this|specific\s*development\s*on\s*this\s*site|build\s*specific\s*development|(check|verify|assess|evaluate|determine|analyze)\s*(feasibility|viability|possibility|potential|if\s*i\s*can\s*build)\s*(of|for|on)?\s*(a|the|this|my)?\s*(project|development|building|structure|construction|house|apartment|complex)\s*(on|at|in)?\s*(this|the|my)?\s*(site|property|parcel|land|address|location)|feasib(le|ility)|project\s*(feasibility|viability)|can\s*(i|we|you|one)?\s*build\s*(this|the|a|specific|particular|certain|my)?\s*(project|development|building|structure|construction|house|apartment|complex)\s*(on|at|in)?\s*(this|the|my)?\s*(site|property|parcel|land|address|location)/i,
  },
  {
    option: "Check what is possible to build on a site.",
    code: "BP",
    pattern:
      /build\s*on\s*a\s*site|build\s*on\s*site|(what|which|how|tell me)\s*(is|are|can be|could be|would be)?\s*(possible|allowed|permitted|feasible|can i|could i)?\s*(to)?\s*(build|construct|develop|put|place|development|building|construction)\s*(on|at|in)?\s*(a|the|this|my)?\s*(site|property|parcel|land|address|location)|build\s*(possibilities|options|potential)|possible\s*to\s*build|(check|verify|assess|evaluate|determine|analyze)\s*(what|which)\s*(is|are)?\s*(possible|allowed|permitted)\s*(to)?\s*(build|construct|develop)/i,
  },
  {
    option: "Does this site fall within the City Limit?",
    code: "CL",
    pattern:
      /(city\s*limit)|(under|within|inside|part\s*of)\s*(the|a)?\s*(city|municipal|town|mayorville)|(city|municipal|town|mayorville)\s*(boundary|boundaries|jurisdiction|limits?)|(am\s*i\s*(in|within)\s*(the)?\s*city\s*limit)|(is\s*(this|my|the)\s*(property|site|address|location)\s*(in|within)\s*(the)?\s*city\s*limit)/,
  },
  {
    option: "What Zone does this site fall under?",
    code: "ZD",
    pattern:
      /(zone|zoning|district|classification)|(what\s*zone)|(land\s*zone)|(property\s*zone)|(fall\s*under)|(zoned\s*as|for)|zoning\s*(info|information|details)/,
  },
  {
    option: "Change address",
    code: "CA",
    pattern:
      /(change|different|another|new|update|modify|switch|use)\s*(the|a|my)?\s*(address|location|property|site|parcel)/,
  },
  {
    option: "No",
    code: "NO",
    pattern:
      /^no$|^nope$|^end$|^finish$|^done$|^exit$|^quit$|^bye$|^goodbye$|^stop$|^thank\s*you$|^thanks$/,
  },
];

export const initialOptions = [
  { text: "Does this site fall within the City Limit?", option: "CL" },
  { text: "What Zone does this site fall under?", option: "ZD" },
  { text: "Provide a Summary Report of the property.", option: "PD" },
  { text: "Check what is possible to build on a site.", option: "BP" },
  { text: "Can I build this specific development on this site?", option: "BT" },
];

export const zoningOptions = [
  { text: "Does this site fall within the City Limit?", option: "CL" },
  { text: "What Zone does this site fall under?", option: "ZD" },
  { text: "Provide a Summary Report of the property.", option: "PD" },
  { text: "Check what is possible to build on a site.", option: "BP" },
  { text: "Can I build this specific development on this site?", option: "BT" },
];

export interface ChatConversationProps {
  isVisible: boolean;
  onBackClick: () => void;
  onTypingStateChange?: (isTyping: boolean) => void;
}

