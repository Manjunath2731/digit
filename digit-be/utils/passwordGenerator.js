const crypto = require('crypto');

/**
 * Generate a random secure password
 * @param {number} length - Length of the password (default: 12)
 * @param {object} options - Options for password generation
 * @returns {string} Generated password
 */
const generatePassword = (length = 12, options = {}) => {
  const {
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true
  } = options;

  let charset = '';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (includeLowercase) charset += lowercase;
  if (includeUppercase) charset += uppercase;
  if (includeNumbers) charset += numbers;
  if (includeSymbols) charset += symbols;

  if (charset.length === 0) {
    throw new Error('At least one character set must be enabled');
  }

  let password = '';
  const randomBytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i] % charset.length;
    password += charset[randomIndex];
  }

  return password;
};

/**
 * Generate a simple alphanumeric password (easier to type)
 * @param {number} length - Length of the password (default: 10)
 * @returns {string} Generated password
 */
const generateSimplePassword = (length = 10) => {
  return generatePassword(length, {
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: false
  });
};

module.exports = {
  generatePassword,
  generateSimplePassword
};
