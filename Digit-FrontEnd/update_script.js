const fs = require('fs');
const path = require('path');

// Path to the file
const filePath = path.join(__dirname, 'src/components/chatbot/ChatConversation.tsx');

// Read the file content
let content = fs.readFileSync(filePath, 'utf8');

// Pattern to match the setTimeout blocks that add follow-up messages
const pattern = /setTimeout\(\(\) => \{\s*chatState\.setSelectedOptions\(new Set\(\)\);\s*chatState\.setShowFollowUpOptions\(true\);\s*chatState\.setMessages\(\(prev\) => \[\s*\.\.\.prev,\s*\{\s*text: `Below are additional questions that you could answer or type <strong>No<\/strong> to end this conversation`,\s*isUser: false,\s*showFollowUpButtons: true,\s*\},\s*\]\);\s*\}, 1000\);/g;

// Replace with the utility function call
const replacement = '// Use the shared utility function to add follow-up message if needed\n        addFollowUpMessageIfNeeded(chatState);';

// Replace all occurrences
const updatedContent = content.replace(pattern, replacement);

// Write the updated content back to the file
fs.writeFileSync(filePath, updatedContent, 'utf8');

console.log('File updated successfully!');
