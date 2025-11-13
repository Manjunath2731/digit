package org.egov.digit.util;

import java.security.SecureRandom;

public class PasswordGenerator {

    private static final String LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
    private static final String UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String NUMBERS = "0123456789";
    private static final String SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    private static final SecureRandom random = new SecureRandom();

    /**
     * Generate a simple alphanumeric password (default: 10 characters)
     */
    public static String generateSimplePassword() {
        return generateSimplePassword(10);
    }

    /**
     * Generate a simple alphanumeric password with specified length
     */
    public static String generateSimplePassword(int length) {
        String characters = LOWERCASE + UPPERCASE + NUMBERS;
        return generatePassword(length, characters);
    }

    /**
     * Generate a complex password with all character types
     */
    public static String generateComplexPassword(int length) {
        return generatePassword(length, true, true, true, true);
    }

    /**
     * Generate a password with custom character requirements
     */
    public static String generatePassword(int length, boolean includeUppercase, boolean includeLowercase,
                                          boolean includeNumbers, boolean includeSymbols) {
        StringBuilder charSet = new StringBuilder();

        if (includeLowercase) charSet.append(LOWERCASE);
        if (includeUppercase) charSet.append(UPPERCASE);
        if (includeNumbers) charSet.append(NUMBERS);
        if (includeSymbols) charSet.append(SYMBOLS);

        if (charSet.length() == 0) {
            charSet.append(LOWERCASE).append(NUMBERS);
        }

        return generatePassword(length, charSet.toString());
    }

    /**
     * Generate password from given character set
     */
    private static String generatePassword(int length, String characterSet) {
        if (length < 1) {
            throw new IllegalArgumentException("Password length must be at least 1");
        }

        StringBuilder password = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            int index = random.nextInt(characterSet.length());
            password.append(characterSet.charAt(index));
        }

        return password.toString();
    }
}
